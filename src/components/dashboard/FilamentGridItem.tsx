'use client';

import { Filament } from '@/types/Filament';
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AngledSpoolIcon from '@/components/spoolIcon';

interface FilamentGridItemProps {
  filament: Filament;
  isLoading?: boolean;
  onEdit?: (filament: Filament) => void;
  onDelete?: (filament: Filament) => void;
  onView?: (filament: Filament) => void;
  showActions?: boolean;
}

export default function FilamentGridItem({
  filament,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
  showActions = true,
}: FilamentGridItemProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    onEdit?.(filament);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    onDelete?.(filament);
  };

  const handleCardClick = () => {
    if (onView) {
      onView(filament);
    }
  };

  return (
    <Card
      sx={{
        height: 280,
        cursor: onView ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': onView ? {
          transform: 'scale(1.02)',
          boxShadow: 6,
        } : {},
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        opacity: isLoading ? 0.7 : 1,
      }}
      onClick={handleCardClick}
      elevation={3}
    >
      {/* Actions Menu Button - Only show if showActions is true and we have edit/delete handlers */}
      {showActions && (onEdit || onDelete) && (
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
          <Tooltip title="Actions">
            <IconButton
              size="small"
              onClick={handleMenuClick}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {onEdit && (
              <MenuItem onClick={handleEdit}>
                <EditIcon sx={{ mr: 1, fontSize: 20 }} />
                Edit
              </MenuItem>
            )}
            {onDelete && (
              <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
                Delete
              </MenuItem>
            )}
          </Menu>
        </Box>
      )}

      <CardMedia
        sx={{
          height: '60%',
          bgcolor: '#333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AngledSpoolIcon
          fillColor={filament.color}
          sx={{ width: '80%', height: '80%' }}
        />
      </CardMedia>

      <CardContent
        sx={{
          p: 2,
          pb: '16px !important',
          height: '40%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'normal',
        }}
      >
        <Box>
          <Typography variant='caption' color="text.secondary" noWrap>
            {filament.brand || 'Unknown Brand'}
          </Typography>
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 'bold',
              textTransform: 'capitalize',
              fontSize: '1.1rem',
              lineHeight: 1.2,
            }}
          >
            {filament.name || 'Unnamed'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
            {filament.materialType || 'Unknown'} • {filament.weightRemaining}g remaining
          </Typography>
        </Box>
        
        {filament.notes && (
          <Box>
            <Typography variant="body2" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {filament.notes}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}