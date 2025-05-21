'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ResultGroup from './ResultGroup';
import { Filament, FilamentWithScore } from '@/types/Filament';

interface SearchResultsPanelProps {
  results: {
    bestMatches: FilamentWithScore[];
    notEnough: FilamentWithScore[];
    closeMatches: FilamentWithScore[];
  };
  onSelectFilament: (filament: Filament) => void;
  query: string;
}

const SearchResultsPanel: React.FC<SearchResultsPanelProps> = ({ 
  results, 
  onSelectFilament 
}) => {
  const { bestMatches, notEnough, closeMatches } = results;
  const totalResults = bestMatches.length + notEnough.length + closeMatches.length;

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
      />
      <ResultGroup 
        title="Not enough" 
        results={notEnough} 
        onSelectFilament={onSelectFilament} 
      />
      <ResultGroup 
        title="Close matches" 
        results={closeMatches} 
        onSelectFilament={onSelectFilament} 
      />
    </Box>
  );
};

export default SearchResultsPanel;