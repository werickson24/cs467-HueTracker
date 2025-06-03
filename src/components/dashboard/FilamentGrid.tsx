'use client';

import { Filament } from '@/types/Filament';
import {
  Box,
  Grid,
  Typography,
} from '@mui/material';
import FilamentGridItem from '@/components/dashboard/FilamentGridItem';

interface FilamentGridProps {
  filaments: Filament[];
  loadingStates: { [key: string]: boolean };
  onEdit: (filament: Filament) => void;
  onDelete: (filament: Filament) => void;
  onView?: (filament: Filament) => void;
}

export default function FilamentGrid({
  filaments,
  loadingStates,
  onEdit,
  onDelete,
  onView
}: FilamentGridProps) {
  if (filaments.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No filaments found. Add one!
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {filaments.map((filament) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={filament.id}>
          <FilamentGridItem
            filament={filament}
            isLoading={loadingStates[filament.id] || false}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            showActions={true}
          />
        </Grid>
      ))}
    </Grid>
  );
}