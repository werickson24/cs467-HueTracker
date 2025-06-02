'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ResultGroup from '@/components/search/ResultGroup';
import { Filament, FilamentWithScore } from '@/types/Filament';

interface SearchResultsPanelProps {
  results: {
    bestMatches: FilamentWithScore[];
    closeMatches: FilamentWithScore[];
    notEnough: FilamentWithScore[];
    otherMatches: FilamentWithScore[];
  };
  onSelectFilament: (filament: Filament) => void;
  onEditFilament?: (filament: Filament) => void;
  onDeleteFilament?: (filament: Filament) => void;
  query: string;
}

const SearchResultsPanel: React.FC<SearchResultsPanelProps> = ({ 
  results, 
  onSelectFilament,
  onEditFilament,
  onDeleteFilament
}) => {
  const { bestMatches, closeMatches, notEnough, otherMatches } = results;
  const totalResults = bestMatches.length + notEnough.length + closeMatches.length + otherMatches.length;

  if (totalResults === 0) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
          borderRadius: 2,
        }}
      >
        <Typography variant="h3" sx={{ mb: 1, textAlign: 'center' }}>
          No matches found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
          Try adjusting your search terms
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <ResultGroup 
        title="Best Matches" 
        results={bestMatches} 
        onSelectFilament={onSelectFilament}
        onEditFilament={onEditFilament}
        onDeleteFilament={onDeleteFilament}
      />
      <ResultGroup 
        title="Close matches" 
        results={closeMatches} 
        onSelectFilament={onSelectFilament}
        onEditFilament={onEditFilament}
        onDeleteFilament={onDeleteFilament}
      />
      <ResultGroup 
        title="Wrong amount" 
        results={notEnough} 
        onSelectFilament={onSelectFilament}
        onEditFilament={onEditFilament}
        onDeleteFilament={onDeleteFilament}
      />
      <ResultGroup 
        title="Other matches" 
        results={otherMatches} 
        onSelectFilament={onSelectFilament}
        onEditFilament={onEditFilament}
        onDeleteFilament={onDeleteFilament}
      />
    </Box>
  );
};

export default SearchResultsPanel;