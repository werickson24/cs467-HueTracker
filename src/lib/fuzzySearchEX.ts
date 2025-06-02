import { Filament, FilamentWithScore } from '@/types/Filament';
import uFuzzy from '@leeoniya/ufuzzy';
import chroma from 'chroma-js';
import { materialTypes } from '@/types/Filament';

// Enhanced search result with explanation
export interface EnhancedFilamentResult extends FilamentWithScore {
  matchReason: string[];
  colorSimilarity?: number;
  quantityMatch?: boolean;
  metMaterialCriteria?: boolean; // New flag for material match status
  metWeightCriteria?: boolean; // New flag for weight match status
  metColorCriteria?: boolean;
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

class ColorMatcher {
  static getColorSimilarity(queryColor: string, filamentColor: string): number {
    try {
      const c1 = chroma(queryColor);
      const c2 = chroma(filamentColor);

      // Get LCH values to check for neutrality
      const [l1, c1_chroma, h1] = c1.lch();
      const [l2, c2_chroma, h2] = c2.lch();

      const CHROMA_THRESHOLD = 15; // Adjust this value as needed

      let kL = 1;
      let kC = 1.5;
      let kH = 2;

      let bonus = 0;

      const isC1Neutral = c1_chroma < CHROMA_THRESHOLD;
      const isC2Neutral = c2_chroma < CHROMA_THRESHOLD;

      if (isC1Neutral && isC2Neutral) {
        // Both are desaturated (e.g., silver, grey, black)
        // Emphasize lightness, de-emphasize chroma and hue
        kC = 0.3; // Reduce chroma impact
        kH = 0.3; // Reduce hue impact
        bonus = 15;
      } else if (isC1Neutral || isC2Neutral) {
        bonus = -15;
        // One is desaturated, the other is a true color (e.g., grey vs. light purple)
        // Emphasize chroma and hue to make them less similar
        kC = 8; // Increase chroma impact
        kH = 12; // Increase hue impact
      }


      const deltaE = chroma.deltaE(c1, c2, kL, kC, kH) - bonus;
      return Math.max(0, Math.min(100, 100 - deltaE));

    } catch {
      // String fallback
      const query = queryColor.toLowerCase();
      const filament = filamentColor.toLowerCase();

      if (filament.includes(query) || query.includes(filament)) {
        return 50;
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
      brands: [], // You don't have brand parsing, consider adding it
      minWeight: undefined, // Initialize as undefined
      maxWeight: undefined, // Initialize as undefined
      textSearch: [],
      hasQuantityQuery: false,
      operators: { weight: null }
    };

    let remainingQuery = query.toLowerCase(); // Use a mutable copy for removal

    // --- Weight parsing ---
    const weightPattern = /(\d+)\s*(g|grams?|kg|kilograms?)/gi;
    const operatorPattern = /(>|<|>=|<=|at least|more than|less than|greater than|minimum|min|maximum|max|above|below|over|under)/gi;

    const numbers = remainingQuery.match(/\d+/g);
    const weightMatch = remainingQuery.match(weightPattern);
    const operatorMatch = remainingQuery.match(operatorPattern);

    if (weightMatch || operatorMatch || /\b(weight|gram|kg|left|remaining|enough|material)\b/i.test(remainingQuery)) {
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
      // Remove weight related terms from remainingQuery
      remainingQuery = remainingQuery
        .replace(weightPattern, '')
        .replace(operatorPattern, '')
        .replace(/\b(weight|gram|kg|left|remaining|enough|material)\b/gi, '')
        .trim();
    }


    // --- Extract materials ---
    materialTypes.forEach(material => {
      const materialRegex = new RegExp(`\\b${material}\\b`, 'gi'); // Use word boundaries
      if (remainingQuery.match(materialRegex)) {
        result.materials.push(material.toLowerCase());
        remainingQuery = remainingQuery.replace(materialRegex, '').trim(); // Remove material from query
      }
    });

    // --- Color detection ---
    // Make sure we have a clean copy of the current remainingQuery for word splitting
    let currentWordsForColors = remainingQuery.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const detectedColors = new Set<string>();
    const usedWordIndices = new Set<number>(); // To track indices of words used by color detection

    // Check two-word combinations first
    for (let i = 0; i < currentWordsForColors.length - 1; i++) {
      if (usedWordIndices.has(i) || usedWordIndices.has(i + 1)) continue; // Skip if words already used

      const twoWord = `${currentWordsForColors[i]} ${currentWordsForColors[i + 1]}`;
      const twoWordNoSpace = `${currentWordsForColors[i]}${currentWordsForColors[i + 1]}`;

      if (chroma.valid(twoWordNoSpace)) {
        detectedColors.add(twoWordNoSpace);
        usedWordIndices.add(i);
        usedWordIndices.add(i + 1);
      } else if (chroma.valid(twoWord)) {
        detectedColors.add(twoWord);
        usedWordIndices.add(i);
        usedWordIndices.add(i + 1);
      }
    }

    // Check single words
    currentWordsForColors.forEach((word, index) => {
      if (usedWordIndices.has(index)) return; // Skip if word already used
      if (word && chroma.valid(word)) {
        detectedColors.add(word);
        usedWordIndices.add(index);
      }
    });

    result.colors = Array.from(detectedColors);

    // --- Prepare for text search: filter out words that were detected as colors ---
    let queryForTextSearch = query.toLowerCase(); // Start with the original query for the text search
    result.colors.forEach(color => {
      // Create a regex for the exact color name, escaping special characters
      const colorRegex = new RegExp(`\\b${color.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'g');
      queryForTextSearch = queryForTextSearch.replace(colorRegex, '').trim();
    });
    result.materials.forEach(material => { // Also remove materials
      const materialRegex = new RegExp(`\\b${material.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'g');
      queryForTextSearch = queryForTextSearch.replace(materialRegex, '').trim();
    });
    // Add similar logic for brands and weights if they are properly extracted and removed
    // from the general text search pool.

    // Finally, populate textSearch with remaining significant words
    // Filter out empty strings that might result from multiple spaces or replacements
    result.textSearch = queryForTextSearch.split(/\s+/).filter(term => term.length > 1);

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
      // We only add to results if _matchScore > 0, which is good.
      // Further filtering/categorization will happen after sorting.
      if (result._matchScore > 0) {
        results.push(result);
      }
    }

    const sortedResults = results.sort((a, b) => b._matchScore - a._matchScore);
    const categories = this.categorizeResults(sortedResults, parsedQuery); // Pass parsedQuery here

    return { results: sortedResults, categories, parsedQuery };
  }

  private scoreFilament(filament: Filament, parsedQuery: ParsedQuery, originalQuery: string): EnhancedFilamentResult {
    let score = 0;
    const matchReasons: string[] = [];
    let colorSimilarity = 0;
    let quantityMatch = true; // Assume true initially for quantity
    let metMaterialCriteria = false;
    let metWeightCriteria = true; // Assume true if no weight query, will be set to false if query exists and fails
    let metColorCriteria = true;

    // --- Weight matching ---
    // Only proceed if a weight query was made. Otherwise, metWeightCriteria remains true.
    if (parsedQuery.minWeight !== undefined || parsedQuery.maxWeight !== undefined) {
        const weight = filament.weightRemaining;

        // Initialize metWeightCriteria to false if a query was made. It will only become true if all conditions pass.
        metWeightCriteria = true; // Start optimistic, will set to false if any condition fails

        // Check minimum weight condition
        if (parsedQuery.minWeight !== undefined) {
            if (weight < parsedQuery.minWeight) {
                quantityMatch = false; // Fails min weight, not enough quantity
                metWeightCriteria = false; // Does not meet overall weight criteria
                matchReasons.push(`Low quantity: ${weight}g (need ≥${parsedQuery.minWeight}g)`);
            } else {
                // If minWeight was specified and met, we can add a reason, but no score here directly.
                matchReasons.push(`Sufficient quantity: ${weight}g (≥${parsedQuery.minWeight}g)`);
            }
        }

        // Check maximum weight condition
        if (parsedQuery.maxWeight !== undefined) {
            if (weight > parsedQuery.maxWeight) {
                quantityMatch = false; // Fails max weight, "too much" for the query
                metWeightCriteria = false; // Does not meet overall weight criteria
                matchReasons.push(`Too much quantity: ${weight}g (need ≤${parsedQuery.maxWeight}g)`);
            } else {
                // If maxWeight was specified and met, add a reason.
                matchReasons.push(`Within max quantity: ${weight}g (≤${parsedQuery.maxWeight}g)`);
            }
        }
    }


    // Color matching
    if (parsedQuery.colors.length > 0) {
      let maxSimilarity = 0;
      for (const queryColor of parsedQuery.colors) {
        const similarity = ColorMatcher.getColorSimilarity(queryColor, filament.color);
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }
      colorSimilarity = maxSimilarity; // Store the highest similarity found

      // Add score based on the highest similarity
      score += colorSimilarity / 2;

      // NEW: Set metColorCriteria based on a threshold
      const COLOR_MATCH_THRESHOLD = 10; // Adjust this value (e.g., 20, 40, 60)
      if (colorSimilarity < COLOR_MATCH_THRESHOLD) {
        metColorCriteria = false;
        matchReasons.push(`Weak color match (${Math.round(colorSimilarity)}%)`); // Add a reason if it's weak
      } else {
        matchReasons.push(`Color: ${filament.color} (${Math.round(colorSimilarity)}%)`);
      }

    } else {
      // If no color was specified in the query, then any color is "acceptable"
      metColorCriteria = true;
    }

    // Material matching
    if (parsedQuery.materials.length > 0) {
      let filamentHasMatchingMaterial = false;
      for (const queryMaterial of parsedQuery.materials) {
        if (filament.materialType.toLowerCase().includes(queryMaterial)) {
          score += 50; // Significant score for material match
          matchReasons.push(`Material: ${queryMaterial.toUpperCase()}`);
          filamentHasMatchingMaterial = true;
          break; // Found a match, no need to check other query materials
        }
      }
      metMaterialCriteria = filamentHasMatchingMaterial; // Set the flag
    } else {
      // If no material was specified in the query, then any material is "acceptable"
      metMaterialCriteria = true;
    }


    // uFuzzy text search on the full query (use parsedQuery.textSearch for specific terms)
    // The original query is better for fuzzy matching across the whole string
    const searchText = [filament.name, filament.brand, filament.color, filament.materialType, filament.notes || ''].join(' ').toLowerCase();
    const haystack = [searchText];
    const idxs = this.uf.filter(haystack, originalQuery.toLowerCase()); // Use originalQuery for general fuzzy search

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
      quantityMatch, // This indicates if it *has enough* material based on minWeight
      metMaterialCriteria, // New flag
      metWeightCriteria, // New flag
      metColorCriteria,
    };
  }

  private categorizeResults(results: EnhancedFilamentResult[], parsedQuery: ParsedQuery): {
    perfectMatches: EnhancedFilamentResult[];
    goodMatches: EnhancedFilamentResult[];
    lowQuantityMatches: EnhancedFilamentResult[];
    fuzzyMatches: EnhancedFilamentResult[];
  } {
    const perfectMatches: EnhancedFilamentResult[] = [];
    const goodMatches: EnhancedFilamentResult[] = [];
    const lowQuantityMatches: EnhancedFilamentResult[] = [];
    const fuzzyMatches: EnhancedFilamentResult[] = [];

    const hasMaterialQuery = parsedQuery.materials.length > 0;
    const hasMinWeightQuery = parsedQuery.minWeight !== undefined;
    const hasMaxWeightQuery = parsedQuery.maxWeight !== undefined;
    const hasColorQuery = parsedQuery.colors.length > 0; 

    for (const r of results) {
      // Condition 1: If specified material is not matched, it cannot be a perfect/good match
      if (hasMaterialQuery && !r.metMaterialCriteria) {
        fuzzyMatches.push(r);
        continue; // Move to the next result
      }

      if (hasColorQuery && !r.metColorCriteria) {
        fuzzyMatches.push(r);
        continue;
      }

      // Condition 2: If it's a best match candidate but doesn't have enough quantity
      if (hasMinWeightQuery && !r.quantityMatch && r._matchScore >= 15) { // If it would normally be good/perfect
        lowQuantityMatches.push(r);
        continue; // Move to the next result
      }else if (hasMaxWeightQuery && !r.quantityMatch && r._matchScore >= 15) { // If it would normally be good/perfect
        lowQuantityMatches.push(r);
        continue; // Move to the next result
      }

      // Now categorize based on score, with the above filtering applied
      if (r._matchScore >= 30) {
        perfectMatches.push(r);
      } else if (r._matchScore >= 15) {
        goodMatches.push(r);
      } else {
        fuzzyMatches.push(r);
      }
    }

    // Sort the final categories internally by score
    perfectMatches.sort((a, b) => b._matchScore - a._matchScore);
    goodMatches.sort((a, b) => b._matchScore - a._matchScore);
    lowQuantityMatches.sort((a, b) => b._matchScore - a._matchScore);
    fuzzyMatches.sort((a, b) => b._matchScore - a._matchScore);


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