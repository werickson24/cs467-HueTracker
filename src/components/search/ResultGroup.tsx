'use client';

import React from 'react';
import { Box, Typography, useTheme, Grid } from '@mui/material';
import FilamentGridItem from '@/components/dashboard/FilamentGridItem';
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
    <Box sx={{ mb: 4 }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 2, 
          fontWeight: 'bold',
          color: theme.palette.mode === 'dark' ? theme.palette.grey[100] : theme.palette.grey[800]
        }}
      >
        {title}
      </Typography>
      <Grid container spacing={3}>
        {results.map((filament) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={filament.id}>
            <FilamentGridItem 
              filament={filament}
              onView={onSelectFilament}
              showActions={false}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ResultGroup;