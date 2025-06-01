import { Filament, FilamentWithScore } from '@/types/Filament';
import uFuzzy from '@leeoniya/ufuzzy';
import chroma from 'chroma-js';
import { materialTypes } from '@/types/Filament';

// Enhanced search result with explanation
export interface EnhancedFilamentResult extends FilamentWithScore {
  matchReason: string[];
  colorSimilarity?: number;
  quantityMatch?: boolean;
}

// Query structure after parsing
interface ParsedQuery {
  colors: string[];
  materials: string[];
  brands: string[];
  minWeight?: number;
  maxWeight?: number;
  textSearch: string[];
  hasQuantityQuery: boolean;
  operators: {
    weight: 'greater' | 'less' | 'equal' | 'between' | null;
  };
}

// Simple Color matching using chroma-js
class ColorMatcher {
  static getColorSimilarity(queryColor: string, filamentColor: string): number {
    try {
      const c1 = chroma(queryColor);
      const c2 = chroma(filamentColor);
      
      const deltaE = chroma.deltaE(c1, c2);
      return Math.max(0, 100 - (deltaE * 2.5));
    } catch {
      // String fallback
      const query = queryColor.toLowerCase();
      const filament = filamentColor.toLowerCase();
      
      if (filament.includes(query) || query.includes(filament)) {
        return 75;
      }
      return 0;
    }
  }
}

// Simplified Query Parser
class QueryParser {
  static parseQuery(query: string): ParsedQuery {
    const result: ParsedQuery = {
      colors: [],
      materials: [],
      brands: [],
      textSearch: [],
      hasQuantityQuery: false,
      operators: { weight: null }
    };

    // Weight parsing
    const weightPattern = /(\d+)\s*(g|grams?|kg|kilograms?)/gi;
    const operatorPattern = /(>|<|>=|<=|at least|more than|less than|greater than|minimum|min|maximum|max|above|below|over|under)/gi;
    
    const numbers = query.match(/\d+/g);
    const weightMatch = query.match(weightPattern);
    const operatorMatch = query.match(operatorPattern);
    
    if (weightMatch || operatorMatch || /\b(weight|gram|kg|left|remaining|enough|material)\b/i.test(query)) {
      result.hasQuantityQuery = true;
    }
    
    if (weightMatch && numbers) {
      const weight = parseInt(numbers[0]);
      if (operatorMatch) {
        const op = operatorMatch[0].toLowerCase();
        if (op.includes('>') || op.includes('more') || op.includes('greater') || 
            op.includes('least') || op.includes('min') || op.includes('above') || op.includes('over')) {
          result.operators.weight = 'greater';
          result.minWeight = weight;
        } else if (op.includes('<') || op.includes('less') || op.includes('max') || 
                   op.includes('below') || op.includes('under')) {
          result.operators.weight = 'less';
          result.maxWeight = weight;
        }
      }
    }

    // Extract materials
    materialTypes.forEach(material => {
      if (query.toLowerCase().includes(material)) {
        result.materials.push(material);
      }
    });

    // Simple color detection using chroma.valid()
    const words = query.toLowerCase().split(/\s+/);
    
    // Check two-word combinations first
    for (let i = 0; i < words.length - 1; i++) {
      const twoWord = `${words[i]} ${words[i + 1]}`;
      const twoWordNoSpace = `${words[i]}${words[i + 1]}`;
      
      if (chroma.valid(twoWord) || chroma.valid(twoWordNoSpace)) {
        result.colors.push(twoWord);
        words[i] = ''; // Mark as used
        words[i + 1] = ''; // Mark as used
      }
    }
    
    // Check single words
    words.forEach(word => {
      if (word && chroma.valid(word)) {
        result.colors.push(word);
      }
    });

    // Everything else goes to text search
    const cleanTerms = query.trim().split(/\s+/).filter(term => term.length > 1);
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

  search(filaments: Filament[], query: string): {
    results: EnhancedFilamentResult[];
    categories: {
      perfectMatches: EnhancedFilamentResult[];
      goodMatches: EnhancedFilamentResult[];
      lowQuantityMatches: EnhancedFilamentResult[];
      fuzzyMatches: EnhancedFilamentResult[];
    };
    parsedQuery: ParsedQuery;
  } {
    const parsedQuery = QueryParser.parseQuery(query);
    const results: EnhancedFilamentResult[] = [];

    for (const filament of filaments) {
      const result = this.scoreFilament(filament, parsedQuery, query);
      if (result._matchScore > 0) {
        results.push(result);
      }
    }

    const sortedResults = results.sort((a, b) => b._matchScore - a._matchScore);
    const categories = this.categorizeResults(sortedResults, parsedQuery.hasQuantityQuery);

    return { results: sortedResults, categories, parsedQuery };
  }

  private scoreFilament(filament: Filament, parsedQuery: ParsedQuery, originalQuery: string): EnhancedFilamentResult {
    let score = 0;
    const matchReasons: string[] = [];
    let colorSimilarity = 0;
    let quantityMatch = false;

    // Weight matching
    if (parsedQuery.minWeight !== undefined || parsedQuery.maxWeight !== undefined) {
      const weight = filament.weightRemaining;
      if (parsedQuery.minWeight !== undefined && weight >= parsedQuery.minWeight) {
        score += 25;
        quantityMatch = true;
        matchReasons.push(`Has ${weight}g (≥${parsedQuery.minWeight}g)`);
      }
      if (parsedQuery.maxWeight !== undefined && weight <= parsedQuery.maxWeight) {
        score += 25;
        quantityMatch = true;
        matchReasons.push(`Has ${weight}g (≤${parsedQuery.maxWeight}g)`);
      }
      
      if (parsedQuery.minWeight !== undefined && weight < parsedQuery.minWeight) {
        score -= 15;
        matchReasons.push(`Low quantity: ${weight}g (need ${parsedQuery.minWeight}g)`);
      }
    }

    // Color matching
    if (parsedQuery.colors.length > 0) {
      for (const queryColor of parsedQuery.colors) {
        const similarity = ColorMatcher.getColorSimilarity(queryColor, filament.color);
        
        if (similarity > 80) {
          score += 40;
          matchReasons.push(`Excellent color: ${queryColor} → ${filament.color} (${Math.round(similarity)}%)`);
        } else if (similarity > 60) {
          score += 25;
          matchReasons.push(`Good color: ${queryColor} → ${filament.color} (${Math.round(similarity)}%)`);
        } else if (similarity > 40) {
          score += 12;
          matchReasons.push(`Fair color: ${queryColor} → ${filament.color} (${Math.round(similarity)}%)`);
        } else if (similarity > 20) {
          score += 5;
          matchReasons.push(`Weak color: ${queryColor} → ${filament.color} (${Math.round(similarity)}%)`);
        }
        
        colorSimilarity = Math.max(colorSimilarity, similarity);
      }
    }

    // Material matching
    if (parsedQuery.materials.length > 0) {
      for (const material of parsedQuery.materials) {
        if (filament.materialType.toLowerCase().includes(material)) {
          score += 20;
          matchReasons.push(`Material: ${material.toUpperCase()}`);
        }
      }
    }

    // uFuzzy text search on the full query
    const searchText = [filament.name, filament.brand, filament.color, filament.materialType, filament.notes || ''].join(' ').toLowerCase();
    const haystack = [searchText];
    const idxs = this.uf.filter(haystack, originalQuery.toLowerCase());
    
    if (idxs && idxs.length > 0) {
      const info = this.uf.info(idxs, haystack, originalQuery.toLowerCase());
      if (info && info.ranges) {
        // Score based on match quality (fewer ranges = better match)
        const fuzzyScore = Math.max(5, 15 - info.ranges.length);
        score += fuzzyScore;
        matchReasons.push(`Fuzzy text match`);
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

  private categorizeResults(results: EnhancedFilamentResult[], hasQuantityQuery: boolean): {
    perfectMatches: EnhancedFilamentResult[];
    goodMatches: EnhancedFilamentResult[];
    lowQuantityMatches: EnhancedFilamentResult[];
    fuzzyMatches: EnhancedFilamentResult[];
  } {
    const perfectMatches = results.filter(r => r._matchScore >= 30);
    const goodMatches = results.filter(r => r._matchScore >= 15 && r._matchScore < 30);
    
    const lowQuantityMatches = hasQuantityQuery 
      ? results.filter(r => 
          r._matchScore > 0 && 
          r._matchScore < 15 && 
          r.matchReason.some(reason => reason.includes('Low quantity'))
        )
      : [];
      
    const fuzzyMatches = results.filter(r => 
      r._matchScore > 0 && 
      r._matchScore < 15 &&
      !lowQuantityMatches.includes(r)
    );

    return {
      perfectMatches,
      goodMatches,
      lowQuantityMatches,
      fuzzyMatches
    };
  }
}

// Export the enhanced search function
export function fuzzySearchEX(filaments: Filament[], query: string) {
  const searcher = new FuzzySearchEX();
  return searcher.search(filaments, query);
}