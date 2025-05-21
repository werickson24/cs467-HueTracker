// A strongly-typed fuzzy search implementation
import { Filament, FilamentWithScore } from '@/types/Filament';

// Define allowed keys for searching (must exist in Filament type)
type SearchableFilamentKey = keyof Pick<Filament, 'name' | 'materialType' | 'brand' | 'color' | 'notes'>;

export function fuzzySearch(
  items: Filament[], 
  searchText: string, 
  keysToSearch: SearchableFilamentKey[]
): FilamentWithScore[] {
  if (!searchText || searchText.trim() === '') return items.map(item => ({ ...item, _matchScore: 0 }));
  
  const searchLower = searchText.toLowerCase().trim();
  const searchTerms = searchLower.split(/\s+/);
  
  return items.map(item => {
    const matchScore = calculateMatchScore(item, searchTerms, keysToSearch);
    return { ...item, _matchScore: matchScore };
  })
  .filter(item => item._matchScore > 0)
  .sort((a, b) => b._matchScore - a._matchScore);
}

function calculateMatchScore(
  item: Filament, 
  searchTerms: string[], 
  keysToSearch: SearchableFilamentKey[]
): number {
  let score = 0;
  
  for (const key of keysToSearch) {
    // Skip if field is null/undefined
    if (item[key] == null) continue;
    
    // Convert field value to string and lowercase
    const itemValue = String(item[key]).toLowerCase();
    
    // Exact match bonus
    if (searchTerms.some(term => itemValue === term)) {
      score += 10;
    }
    
    // Contains bonus
    for (const term of searchTerms) {
      if (itemValue.includes(term)) {
        score += 5;
      }
      
      // Substring partial match
      if (term.length > 2) {
        for (let i = 0; i < term.length - 2; i++) {
          const subTerm = term.substring(i, i + 3);
          if (itemValue.includes(subTerm)) {
            score += 1;
          }
        }
      }
    }
  }
  
  return score;
}

export function categorizeResults(results: FilamentWithScore[]): { 
  bestMatches: FilamentWithScore[], 
  notEnough: FilamentWithScore[], 
  closeMatches: FilamentWithScore[] 
} {
  // This categorization is simplified - you can adjust thresholds as needed
  const bestMatches = results.filter(item => item._matchScore >= 10);
  const notEnough = results.filter(item => item._matchScore >= 5 && item._matchScore < 10);
  const closeMatches = results.filter(item => item._matchScore > 0 && item._matchScore < 5);
  
  return { bestMatches, notEnough, closeMatches };
}