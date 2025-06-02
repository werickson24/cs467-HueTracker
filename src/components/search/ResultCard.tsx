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

    const tooltipContent = Object.entries(filament)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

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
      title={tooltipContent}
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
        variant='caption'
        noWrap
        >
            {filament.brand || 'N/A'}
        </Typography>
        <Typography
          variant="subtitle1"
          noWrap
          sx={{fontWeight: 'bold', textTransform: 'capitalize'}}
        >
          {filament.name|| 'Unnamed'}
        </Typography>
        <Typography
          variant="caption"
          noWrap
        >
          {filament.materialType || 'N/A'} • {`${filament.weightRemaining}g` || 'N/A'}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ResultCard;