'use client';

import { Filament } from '@/types/Filament';
import {
  TableCell,
  TableRow,
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AngledSpoolIcon from '@/components/spoolIcon';

interface FilamentTableRowProps {
  filament: Filament;
  isLoading: boolean;
  onEdit: (filament: Filament) => void;
  onDelete: (filament: Filament) => void;
}

export default function FilamentTableRow({ 
  filament, 
  isLoading, 
  onEdit, 
  onDelete 
}: FilamentTableRowProps) {
  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={9}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress size={20} />
            <Typography variant="body2" sx={{ ml: 1 }}>Updating...</Typography>
          </Box>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell sx={{ width: 'auto' }}>
        <AngledSpoolIcon 
          fillColor={filament.color} 
          sx={{
            width: 50,
            height: 50,
            display: 'block'
          }}
        />
      </TableCell>
      <TableCell>{filament.name}</TableCell>
      <TableCell>{filament.materialType}</TableCell>
      <TableCell>{filament.brand}</TableCell>
      <TableCell>{filament.color}</TableCell>
      <TableCell>{filament.weightRemaining}g</TableCell>
      <TableCell>{filament.spoolWeight}g</TableCell>
      <TableCell>{filament.notes}</TableCell>
      <TableCell>
        <Tooltip title="Edit">
          <IconButton onClick={() => onEdit(filament)} size="small">
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton onClick={() => onDelete(filament)} size="small" color="error">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}