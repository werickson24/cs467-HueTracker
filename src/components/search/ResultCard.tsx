'use client';

import React from 'react';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import { Filament } from '@/types/Filament';
import AngledSpoolIcon from '@/components/spoolIcon';

interface ResultCardProps {
  filament: Filament;
  onClick: (filament: Filament) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ filament, onClick }) => {


  return (
    <Card
      sx={{
        width: 200, // Slightly wider for better display of angled spool
        height: 250,
        m: 1,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: 6,
        },
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
      }}
      onClick={() => onClick(filament)}
      elevation={3}
    >
      <CardMedia
        sx={{
          height: '65%',
          bgcolor: '#333', // Dark background like in your image
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
      <AngledSpoolIcon fillColor={filament.color} sx={{ width: '100%', height: '100%' }} />
      </CardMedia>
      <CardContent
        sx={{
          p: 1,
          pb: '8px !important', // Override default padding bottom
          height: '35%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          noWrap
          sx={{
            fontWeight: 'bold',
            lineHeight: 1.2,
            fontSize: '0.75rem',
          }}
        >
          {filament.name || 'Unnamed'}
        </Typography>
        <Typography
          variant="caption"
          noWrap
          sx={{
            lineHeight: 1.2,
            fontSize: '0.7rem',
          }}
        >
          {filament.materialType || 'N/A'} • {filament.brand || 'N/A'}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ResultCard;