'use client';

import { useState, useEffect, useRef } from 'react';
import { Filament, materialTypes } from '@/types/Filament';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  IconButton,
  Grid,
  Paper,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import AngledSpoolIcon from '@/components/spoolIcon';
import ColorPicker from '@/components/ColorPicker';

type ValidationErrors = {
  [key: string]: string;
};

interface FilamentModalProps {
  open: boolean;
  filament: Filament | null;
  mode: 'view' | 'edit' | 'add';
  onClose: () => void;
  onSave: (filament: Partial<Filament>) => void;
  onDelete?: (filament: Filament) => void;
  isLoading?: boolean;
}

export default function FilamentModal({
  open,
  filament,
  mode,
  onClose,
  onSave,
  onDelete,
  isLoading = false,
}: FilamentModalProps) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Filament>>({});
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});

  // Preserve filament data during closing animation
  const preservedFilamentRef = useRef<Filament | null>(null);

  useEffect(() => {
    if (open) {
      setEditMode(mode === 'edit' || mode === 'add');
      setFormData(filament ? { ...filament } : {});
      setFormErrors({});
      // Update preserved data when modal opens
      if (filament) {
        preservedFilamentRef.current = filament;
      }
    }
    // Don't clear preserved data when modal closes - let the animation complete
  }, [open, filament, mode]);

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

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    if (mode === 'add') {
      onClose();
    } else {
      setEditMode(false);
      setFormData(filament ? { ...filament } : {});
      setFormErrors({});
    }
  };

  const handleDelete = () => {
    const targetFilament = filament || preservedFilamentRef.current;
    if (targetFilament && onDelete) {
      onDelete(targetFilament);
    }
  };

  const updateField = (field: keyof Filament, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isViewMode = !editMode && mode !== 'add';
  const isAddMode = mode === 'add';

  // Use current filament or preserved data for display
  const displayFilament = filament || preservedFilamentRef.current;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        transition: {
          timeout: 300,
          onExited: () => {
            // Clear preserved data only after animation completes
            preservedFilamentRef.current = null;
          }
        },
        paper: {
          sx: {
            borderRadius: 3,
            maxHeight: '90vh',
            minHeight: '500px',
            display: 'flex',
            flexDirection: 'column',
          }
        }

      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 1,
        flexShrink: 0,
      }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          {isAddMode ? 'Add New Filament' :
            isViewMode ? (formData.name || 'Filament Details') :
              'Edit Filament'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{
        pt: 1,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'auto',
      }}>
        {isViewMode ? (
          // View Mode Layout
          <Grid container spacing={3} sx={{ flex: 1 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: '#f8f9fa',
                  borderRadius: 2,
                  height: 'fit-content',
                }}
              >
                <AngledSpoolIcon
                  fillColor={formData.color || '#000000'}
                  sx={{
                    width: 150,
                    height: 150,
                    mb: 2,
                  }}
                />
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: formData.color,
                    border: '2px solid #ddd',
                    boxShadow: 1,
                  }}
                />
                <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
                  Color: {formData.color}
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    Basic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Material Type</Typography>
                      <Chip label={formData.materialType} color="primary" variant="outlined" sx={{ fontWeight: 'bold' }} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Brand</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{formData.brand}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    Weight Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Weight Remaining</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {formData.weightRemaining}g
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Spool Weight</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {formData.spoolWeight}g
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {formData.notes && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        Notes
                      </Typography>
                      <Paper elevation={1} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {formData.notes}
                        </Typography>
                      </Paper>
                    </Box>
                  </>
                )}

                {/* Always render metadata section if we have display data */}
                {displayFilament && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        Metadata
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2" color="text.secondary">Created</Typography>
                          <Typography variant="body2">{formatDate(displayFilament.createdAt)}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                          <Typography variant="body2">{formatDate(displayFilament.updatedAt)}</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        ) : (
          // Edit/Add Mode Layout
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 2,
            minHeight: '400px',
          }}>
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
        )}
      </DialogContent>

      <DialogActions sx={{
        p: 3,
        pt: 1,
        flexShrink: 0,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}>
        {isViewMode ? (
          // View Mode Actions
          <>
            <Button onClick={onClose} variant="outlined">
              Close
            </Button>
            {onDelete && (
              <Button
                onClick={handleDelete}
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                disabled={isLoading}
              >
                Delete
              </Button>
            )}
            <Button
              onClick={handleEdit}
              variant="contained"
              startIcon={<EditIcon />}
              disabled={isLoading}
            >
              Edit
            </Button>
          </>
        ) : (
          // Edit/Add Mode Actions
          <>
            <Button onClick={handleCancelEdit} disabled={isLoading} startIcon={<CancelIcon />}>
              Cancel
            </Button>
            <Button onClick={handleSave} variant="contained" disabled={isLoading} startIcon={<SaveIcon />}>
              {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  {isAddMode ? 'Adding...' : 'Saving...'}
                </Box>
              ) : (
                isAddMode ? 'Add' : 'Save Changes'
              )}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}