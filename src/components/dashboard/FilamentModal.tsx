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

    // Create a clean copy of formData without metadata fields
    const { id, createdAt, updatedAt, ...cleanFormData } = formData;

    onSave(cleanFormData);
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
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            position: 'relative', // For absolute positioning of spool
          }
        }
      }}
    >
      {/* Fixed Spool Icon Overlay */}
      <Box
        sx={{
          position: 'absolute',
          left: '7%', // Positioned to match the left column
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1,
          pointerEvents: 'none', // Allow clicks to pass through
          display: { xs: 'none', md: 'block' }, // Hide on mobile
        }}
      >
        <AngledSpoolIcon
          fillColor={formData.color || '#000000'}
          sx={{
            width: 200,
            height: 200,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
          }}
        />
      </Box>

      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 1,
        flexShrink: 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
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
        pt: 2,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'auto', // Allow scrolling
      }}>
        {/* Grid Layout - Left column is now transparent spacer */}
        <Grid container spacing={2} sx={{ flex: 1 }}>
          {/* Left Column - Transparent Spacer for Spool Icon */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Empty space that the absolute positioned spool occupies */}
            <Box sx={{
              height: '200px',
              display: { xs: 'flex', md: 'none' }, // Show spool on mobile in normal flow
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <AngledSpoolIcon
                fillColor={formData.color || '#000000'}
                sx={{
                  width: 120,
                  height: 120,
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                }}
              />
            </Box>
          </Grid>

          {/* Right Column - Form/Details */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              minHeight: '400px', // Ensure minimum height
            }}>

              {/* Basic Information Section */}
              <Box>
                <Typography variant="h5" gutterBottom sx={{
                  color: 'primary.main',
                  fontWeight: 'bold',
                  mt: 3,
                }}>
                  Basic Information
                </Typography>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12 }}>
                    {isViewMode ? (
                      <>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Name
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
                          {formData.name}
                        </Typography>
                      </>
                    ) : (
                      <TextField
                        fullWidth
                        label="Name"
                        value={formData.name || ''}
                        onChange={(e) => updateField('name', e.target.value)}
                        required
                        error={!!formErrors.name}
                        helperText={formErrors.name}
                        size="small"
                      />
                    )}
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    {isViewMode ? (
                      <>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Material Type
                        </Typography>
                        <Chip
                          label={formData.materialType}
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </>
                    ) : (
                      <TextField
                        fullWidth
                        select
                        label="Material Type"
                        value={formData.materialType || ''}
                        onChange={(e) => updateField('materialType', e.target.value)}
                        required
                        error={!!formErrors.materialType}
                        helperText={formErrors.materialType}
                        size="small"
                      >
                        {materialTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    {isViewMode ? (
                      <>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Brand
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {formData.brand}
                        </Typography>
                      </>
                    ) : (
                      <TextField
                        fullWidth
                        label="Brand"
                        value={formData.brand || ''}
                        onChange={(e) => updateField('brand', e.target.value)}
                        required
                        error={!!formErrors.brand}
                        helperText={formErrors.brand}
                        size="small"
                      />
                    )}
                  </Grid>

                  {/* Color Section */}
                  <Grid size={{ xs: 12 }}>
                    {isViewMode ? (
                      <>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Color
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              backgroundColor: formData.color,
                              border: '2px solid',
                              borderColor: 'divider',
                              boxShadow: 1,
                              flexShrink: 0,
                            }}
                          />
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {formData.color}
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <TextField
                          label="Color"
                          value={formData.color || ''}
                          onChange={(e) => updateField('color', e.target.value)}
                          required
                          error={!!formErrors.color}
                          helperText={formErrors.color}
                          sx={{ flex: 1 }}
                          size="small"
                        />
                        <Box sx={{ mt: 0.5 }}>
                          <ColorPicker
                            value={formData.color || '#000000'}
                            onChange={(color) => updateField('color', color)}
                            size={32}
                          />
                        </Box>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 0.5 }} />

              {/* Weight Information Section */}
              <Box>
                <Typography variant="h5" gutterBottom sx={{
                  color: 'primary.main',
                  fontWeight: 'bold',
                  mb: 1,
                }}>
                  Weight Information
                </Typography>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    {isViewMode ? (
                      <>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Weight Remaining
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          {formData.weightRemaining}g
                        </Typography>
                      </>
                    ) : (
                      <TextField
                        fullWidth
                        label="Weight Remaining (g)"
                        type="number"
                        value={formData.weightRemaining ?? ''}
                        onChange={(e) => updateField('weightRemaining', Number(e.target.value))}
                        inputProps={{ min: 0 }}
                        size="small"
                      />
                    )}
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    {isViewMode ? (
                      <>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Spool Weight
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {formData.spoolWeight}g
                        </Typography>
                      </>
                    ) : (
                      <TextField
                        fullWidth
                        label="Spool Weight (g)"
                        type="number"
                        value={formData.spoolWeight ?? ''}
                        onChange={(e) => updateField('spoolWeight', Number(e.target.value))}
                        inputProps={{ min: 0 }}
                        size="small"
                      />
                    )}
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 0.5 }} />

              {/* Notes Section */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" gutterBottom sx={{
                  color: 'primary.main',
                  fontWeight: 'bold',
                  mb: 1,
                }}>
                  Notes
                </Typography>

                {isViewMode ? (
                  formData.notes ? (
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        minHeight: '60px',
                        maxHeight: '200px',
                        overflow: 'auto',
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {formData.notes}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No notes available
                    </Typography>
                  )
                ) : (
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    minRows={3}
                    maxRows={8}
                    value={formData.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder="Add any notes about this filament..."
                    size="small"
                  />
                )}
              </Box>

              {/* Metadata Section - Only show in view mode and if we have data */}
              {isViewMode && displayFilament && (
                <>
                  <Divider sx={{ my: 0.5 }} />
                  <Box>


                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Created:
                          <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                            {formatDate(displayFilament.createdAt)}
                          </Typography>
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Last Updated:
                          <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                            {formatDate(displayFilament.updatedAt)}
                          </Typography>
                        </Typography>

                      </Grid>
                    </Grid>
                  </Box>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{
        p: 2,
        pt: 1.5,
        flexShrink: 0,
        borderTop: '1px solid',
        borderColor: 'divider',
        gap: 1,
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