'use client';

import { useState, useEffect } from 'react';
import { Filament, materialTypes } from '@/types/Filament';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import ColorPicker from '@/components/ColorPicker';

type ValidationErrors = {
  [key: string]: string;
};

interface FilamentDialogProps {
  open: boolean;
  filament: Filament | null;
  isEditing: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSave: (filament: Partial<Filament>) => void;
}

export default function FilamentDialog({
  open,
  filament,
  isEditing,
  isLoading,
  onClose,
  onSave,
}: FilamentDialogProps) {
  const [formData, setFormData] = useState<Partial<Filament>>({});
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (open) {
      setFormData(filament ? { ...filament } : {});
      setFormErrors({});
    }
  }, [open, filament]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.materialType?.trim()) {
      errors.materialType = 'Material type is required';
    }
    if (!formData.brand?.trim()) {
      errors.brand = 'Brand is required';
    }
    if (!formData.color?.trim()) {
      errors.color = 'Color is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    onSave(formData);
  };

  const updateField = (field: keyof Filament, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontSize: 26 }}>
        {isEditing ? 'Edit Filament' : 'Add New Filament'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Name"
            value={formData.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            required
            error={!!formErrors.name}
            helperText={formErrors.name}
          />
          <TextField
            select
            label="Material Type"
            value={formData.materialType || ''}
            onChange={(e) => updateField('materialType', e.target.value)}
            required
            error={!!formErrors.materialType}
            helperText={formErrors.materialType}
          >
            {materialTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Brand"
            value={formData.brand || ''}
            onChange={(e) => updateField('brand', e.target.value)}
            required
            error={!!formErrors.brand}
            helperText={formErrors.brand}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <TextField
              label="Color"
              value={formData.color || ''}
              onChange={(e) => updateField('color', e.target.value)}
              required
              error={!!formErrors.color}
              helperText={formErrors.color}
              sx={{ flex: 1 }}
            />
            <Box sx={{ mt: 1 }}>
              <ColorPicker
                value={formData.color || '#000000'}
                onChange={(color) => updateField('color', color)}
                size={40}
              />
            </Box>
          </Box>
          
          <TextField
            label="Weight Remaining (g)"
            type="number"
            value={formData.weightRemaining ?? ''}
            onChange={(e) => updateField('weightRemaining', Number(e.target.value))}
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Spool Weight (g)"
            type="number"
            value={formData.spoolWeight ?? ''}
            onChange={(e) => updateField('spoolWeight', Number(e.target.value))}
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Notes"
            multiline
            rows={3}
            value={formData.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ mb: 2, mr: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isLoading}>
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              {isEditing ? 'Saving...' : 'Adding...'}
            </Box>
          ) : (
            isEditing ? 'Save Changes' : 'Add'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}