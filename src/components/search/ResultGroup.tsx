'use client';

import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import ResultCard from './ResultCard';
import { Filament, FilamentWithScore } from '@/types/Filament';


interface ResultGroupProps {
  title: string;
  results: FilamentWithScore[];
  onSelectFilament: (filament: Filament) => void;
}

const ResultGroup: React.FC<ResultGroupProps> = ({ title, results, onSelectFilament }) => {
  const theme = useTheme();
  
  if (results.length === 0) {
    return null;
  }
  
  return (
    <Box sx={{ mb: 3 }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 1, 
          fontWeight: 'bold',
          color: theme.palette.mode === 'dark' ? theme.palette.grey[100] : theme.palette.grey[800]
        }}
      >
        {title}
      </Typography>
      <Box 
        sx={{ 
          display: 'flex',
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': {
            height: 6,
            backgroundColor: theme.palette.background.paper,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300],
            borderRadius: 3,
          },
        }}
      >
        {results.map((filament) => (
          <ResultCard 
            key={filament.id}
            filament={filament}
            onClick={onSelectFilament}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ResultGroup;