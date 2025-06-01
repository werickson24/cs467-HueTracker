import { Filament, FilamentWithScore } from '@/types/Filament';
import uFuzzy from '@leeoniya/ufuzzy';
import nlp from 'compromise';
import chroma from 'chroma-js';

// Enhanced search result with explanation
export interface EnhancedFilamentResult extends FilamentWithScore {
  matchReason: string[];
  colorSimilarity?: number;
  quantityMatch?: boolean;
}

// Query structure after NLP parsing
interface ParsedQuery {
  colors: string[];
  materials: string[];
  brands: string[];
  minWeight?: number;
  maxWeight?: number;
  textSearch: string[];
  operators: {
    weight: 'greater' | 'less' | 'equal' | 'between' | null;
  };
}

// Color similarity using chroma-js
class ColorMatcher {
  private static colorMap: Record<string, string> = {
    'blue': '#1a77c9',
    'red': '#d32f2f',
    'green': '#2e7d32',
    'yellow': '#ffc107',
    'orange': '#ff9800',
    'black': '#263238',
    'white': '#f5f5f5',
    'purple': '#9c27b0',
    'pink': '#e91e63',
    'brown': '#795548',
    'grey': '#9e9e9e',
    'gray': '#9e9e9e',
    'cyan': '#00bcd4',
    'teal': '#009688',
    'lime': '#cddc39',
    'transparent': 'rgba(176, 182, 195, 0.7)',
    'clear': 'rgba(255,255,255,0.7)',
  };

  static getColorSimilarity(color1: string, color2: string): number {
    try {
      // Normalize colors
      const normalizedColor1 = this.normalizeColor(color1);
      const normalizedColor2 = this.normalizeColor(color2);
      
      if (!normalizedColor1 || !normalizedColor2) return 0;
      
      // Calculate distance using chroma-js
      const c1 = chroma(normalizedColor1);
      const c2 = chroma(normalizedColor2);
      
      // Delta-E distance (lower is more similar)
      const deltaE = chroma.deltaE(c1, c2);
      
      // Convert to similarity score (0-100, higher is more similar)
      return Math.max(0, 100 - deltaE);
    } catch {
      return 0;
    }
  }

  private static normalizeColor(color: string): string | null {
    const lowerColor = color.toLowerCase();
    
    // Check our predefined map first
    for (const [key, value] of Object.entries(this.colorMap)) {
      if (lowerColor.includes(key)) {
        return value;
      }
    }
    
    // Try to parse as hex, rgb, etc.
    try {
      return chroma(color).hex();
    } catch {
      return null;
    }
  }
}

// NLP Query Parser
class QueryParser {
  private static materialKeywords = ['pla', 'abs', 'petg', 'tpu', 'wood', 'metal', 'silk'];
  private static colorKeywords = Object.keys(ColorMatcher['colorMap']);
  
  static parseQuery(query: string): ParsedQuery {
    const doc = nlp(query.toLowerCase());
    
    const result: ParsedQuery = {
      colors: [],
      materials: [],
      brands: [],
      textSearch: [],
      operators: { weight: null }
    };

    // Extract numbers and weight operators
    const numbers = doc.match('#Value').out('array');
    const weightPattern = /(\d+)\s*(g|grams?|kg|kilograms?)/gi;
    const operatorPattern = /(>|<|>=|<=|at least|more than|less than|greater than|minimum|min|maximum|max)/gi;
    
    let weightMatch = query.match(weightPattern);
    let operatorMatch = query.match(operatorPattern);
    
    if (weightMatch && numbers.length > 0) {
      const weight = parseInt(numbers[0]);
      if (operatorMatch) {
        const op = operatorMatch[0].toLowerCase();
        if (op.includes('>') || op.includes('more') || op.includes('greater') || op.includes('least') || op.includes('min')) {
          result.operators.weight = 'greater';
          result.minWeight = weight;
        } else if (op.includes('<') || op.includes('less') || op.includes('max')) {
          result.operators.weight = 'less';
          result.maxWeight = weight;
        }
      }
    }

    // Extract colors
    this.colorKeywords.forEach(color => {
      if (query.toLowerCase().includes(color)) {
        result.colors.push(color);
      }
    });

    // Extract materials
    this.materialKeywords.forEach(material => {
      if (query.toLowerCase().includes(material)) {
        result.materials.push(material);
      }
    });

    // Extract remaining text for fuzzy search
    let remainingText = query;
    [...result.colors, ...result.materials].forEach(term => {
      remainingText = remainingText.replace(new RegExp(term, 'gi'), '');
    });
    
    // Remove weight expressions and operators
    remainingText = remainingText.replace(weightPattern, '');
    remainingText = remainingText.replace(operatorPattern, '');
    remainingText = remainingText.replace(/\b(with|left|remaining|grams?|kg|kilograms?)\b/gi, '');
    
    const cleanTerms = remainingText.trim().split(/\s+/).filter(term => term.length > 1);
    result.textSearch = cleanTerms;

    return result;
  }
}

// Enhanced Fuzzy Search System
export class FuzzySearchEX {
  private uf: any;
  
  constructor() {
    this.uf = new uFuzzy({
      intraMode: 1,
      intraIns: 1,
      intraSub: 1,
      intraTrn: 1,
      intraDel: 1
    });
  }

  search(filaments: Filament[], query: string): EnhancedFilamentResult[] {
    const parsedQuery = QueryParser.parseQuery(query);
    const results: EnhancedFilamentResult[] = [];

    for (const filament of filaments) {
      const result = this.scoreFilament(filament, parsedQuery, query);
      if (result._matchScore > 0) {
        results.push(result);
      }
    }

    return results.sort((a, b) => b._matchScore - a._matchScore);
  }

  private scoreFilament(filament: Filament, parsedQuery: ParsedQuery, originalQuery: string): EnhancedFilamentResult {
    let score = 0;
    const matchReasons: string[] = [];
    let colorSimilarity = 0;
    let quantityMatch = false;

    // Weight/quantity matching
    if (parsedQuery.minWeight !== undefined || parsedQuery.maxWeight !== undefined) {
      const weight = filament.weightRemaining;
      if (parsedQuery.minWeight !== undefined && weight >= parsedQuery.minWeight) {
        score += 20;
        quantityMatch = true;
        matchReasons.push(`Has ${weight}g (≥${parsedQuery.minWeight}g)`);
      }
      if (parsedQuery.maxWeight !== undefined && weight <= parsedQuery.maxWeight) {
        score += 20;
        quantityMatch = true;
        matchReasons.push(`Has ${weight}g (≤${parsedQuery.maxWeight}g)`);
      }
    }

    // Color matching
    if (parsedQuery.colors.length > 0) {
      for (const queryColor of parsedQuery.colors) {
        const similarity = ColorMatcher.getColorSimilarity(queryColor, filament.color);
        if (similarity > 50) {
          score += Math.round(similarity / 5); // Scale down
          colorSimilarity = Math.max(colorSimilarity, similarity);
          matchReasons.push(`Color similar to ${queryColor} (${Math.round(similarity)}%)`);
        }
      }
    }

    // Material matching
    if (parsedQuery.materials.length > 0) {
      for (const material of parsedQuery.materials) {
        if (filament.materialType.toLowerCase().includes(material)) {
          score += 15;
          matchReasons.push(`Material: ${material.toUpperCase()}`);
        }
      }
    }

    // Fuzzy text search
    if (parsedQuery.textSearch.length > 0) {
      const searchFields = [filament.name, filament.brand, filament.notes || ''];
      const searchText = searchFields.join(' ').toLowerCase();
      
      for (const term of parsedQuery.textSearch) {
        // Exact match
        if (searchText.includes(term.toLowerCase())) {
          score += 10;
          matchReasons.push(`Contains "${term}"`);
        } else {
          // Fuzzy match using uFuzzy
          const haystack = [searchText];
          const idxs = this.uf.filter(haystack, term);
          if (idxs && idxs.length > 0) {
            score += 5;
            matchReasons.push(`Fuzzy match: "${term}"`);
          }
        }
      }
    }

    // Fallback fuzzy search if no specific criteria matched
    if (score === 0 && parsedQuery.textSearch.length === 0) {
      const searchText = [filament.name, filament.brand, filament.color, filament.materialType].join(' ').toLowerCase();
      const haystack = [searchText];
      const idxs = this.uf.filter(haystack, originalQuery.toLowerCase());
      if (idxs && idxs.length > 0) {
        score += 3;
        matchReasons.push('General fuzzy match');
      }
    }

    return {
      ...filament,
      _matchScore: score,
      matchReason: matchReasons,
      colorSimilarity,
      quantityMatch
    };
  }

  // Categorize results with enhanced logic
  categorizeResults(results: EnhancedFilamentResult[]): {
    perfectMatches: EnhancedFilamentResult[];
    goodMatches: EnhancedFilamentResult[];
    colorMatches: EnhancedFilamentResult[];
    fuzzyMatches: EnhancedFilamentResult[];
  } {
    return {
      perfectMatches: results.filter(r => r._matchScore >= 30),
      goodMatches: results.filter(r => r._matchScore >= 15 && r._matchScore < 30),
      colorMatches: results.filter(r => r.colorSimilarity && r.colorSimilarity > 70 && r._matchScore < 15),
      fuzzyMatches: results.filter(r => r._matchScore > 0 && r._matchScore < 15 && (!r.colorSimilarity || r.colorSimilarity <= 70))
    };
  }
}

// Export the enhanced search function
export function fuzzySearchEX(
  filaments: Filament[],
  query: string
): {
  results: EnhancedFilamentResult[];
  categories: ReturnType<FuzzySearchEX['categorizeResults']>;
  parsedQuery: ParsedQuery;
} {
  const searcher = new FuzzySearchEX();
  const results = searcher.search(filaments, query);
  const categories = searcher.categorizeResults(results);
  const parsedQuery = QueryParser.parseQuery(query);

  return { results, categories, parsedQuery };
}