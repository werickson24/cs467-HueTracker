'use client';

import { useState, useEffect } from 'react';
import { Filament } from '@/types/Filament';
import Image from 'next/image';
import {
  Container,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  IconButton,
  // Add these new imports
  Tooltip,
  DialogContentText,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SignOutButton from '@/components/auth/signout-button';

const materialTypes = ['PLA', 'PETG', 'ABS', 'TPU', 'NYLON', 'OTHER'];

// Add this new type for form validation
type ValidationErrors = {
  [key: string]: string;
};

export default function DashboardClient() {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedFilament, setSelectedFilament] = useState<Filament | null>(null);
  const [newFilament, setNewFilament] = useState<Partial<Filament>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchFilaments();
  }, []);

  const fetchFilaments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/filaments');
      if (!response.ok) throw new Error('Failed to fetch filaments');
      const data = await response.json();
      setFilaments(data);
    } catch (error) {
      console.error('Error fetching filaments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [formErrors, setFormErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!newFilament.name?.trim()) {
      errors.name = 'Name is required';
    }
    if (!newFilament.materialType?.trim()) {
      errors.materialType = 'Material type is required';
    }
    if (!newFilament.brand?.trim()) {
      errors.brand = 'Brand is required';
    }
    if (!newFilament.color?.trim()) {
      errors.color = 'Color is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddOrUpdateFilament = async () => {
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    try {
      const filamentDataToSend = {
        ...newFilament,
        weightRemaining: Number(newFilament.weightRemaining) || 0,
        spoolWeight: Number(newFilament.spoolWeight) || 0,
      };

      const url = isEditing && selectedFilament
        ? `/api/filaments/${selectedFilament.id}`
        : '/api/filaments';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filamentDataToSend),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to ${isEditing ? 'update' : 'add'} filament: ${response.status} - ${errorBody}`);
      }

      setOpenDialog(false);
      setNewFilament({});
      setSelectedFilament(null);
      setIsEditing(false);
      fetchFilaments();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} filament:`, error);
    }
  };

  const handleEditClick = (filament: Filament) => {
    setSelectedFilament(filament);
    setNewFilament({ ...filament });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleDeleteClick = (filament: Filament) => {
    setSelectedFilament(filament);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedFilament) return;

    try {
      const response = await fetch(`/api/filaments/${selectedFilament.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete filament');
      }

      setOpenDeleteDialog(false);
      setSelectedFilament(null);
      fetchFilaments();
    } catch (error) {
      console.error('Error deleting filament:', error);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewFilament({});
    setSelectedFilament(null);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Filaments...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="bottom" mb={4}>
          <Image
              src="/HueTracker_Logo_grey.png"
              alt="Logo"
              width={150}
              height={100}
            />
        <SignOutButton />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Material Type</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Weight Remaining</TableCell>
              <TableCell>Spool Weight</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filaments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No filaments found. Add one!
                </TableCell>
              </TableRow>
            ) : (
              filaments.map((filament) => (
                <TableRow key={filament.id}>
                  <TableCell>{filament.name}</TableCell>
                  <TableCell>{filament.materialType}</TableCell>
                  <TableCell>{filament.brand}</TableCell>
                  <TableCell>{filament.color}</TableCell>
                  <TableCell>{filament.weightRemaining}g</TableCell>
                  <TableCell>{filament.spoolWeight}g</TableCell>
                  <TableCell>{filament.notes}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditClick(filament)} size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDeleteClick(filament)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="end" alignItems="center" mb={1} sx={{mt: 2}}>
        <Button 
          variant="contained"
          onClick={() => {
            setIsEditing(false);
            setNewFilament({});
            setOpenDialog(true);
          }}
        >
          Add New Filament
        </Button>
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="xs" fullWidth={true}>
        <DialogTitle sx={{ fontSize: 26 }}>{isEditing ? 'Edit Filament' : 'Add New Filament'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              value={newFilament.name || ''}
              onChange={(e) => {
                setNewFilament({ ...newFilament, name: e.target.value });
                setFormErrors({ ...formErrors, name: '' }); // Clear error when user types
              }}
              required
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
            <TextField
              select
              label="Material Type"
              value={newFilament.materialType || ''}
              onChange={(e) => {
                setNewFilament({ ...newFilament, materialType: e.target.value });
                setFormErrors({ ...formErrors, materialType: '' });
              }}
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
              value={newFilament.brand || ''}
              onChange={(e) => {
                setNewFilament({ ...newFilament, brand: e.target.value });
                setFormErrors({ ...formErrors, brand: '' });
              }}
              required
              error={!!formErrors.brand}
              helperText={formErrors.brand}
            />
            <TextField
              label="Color"
              value={newFilament.color || ''}
              onChange={(e) => {
                setNewFilament({ ...newFilament, color: e.target.value });
                setFormErrors({ ...formErrors, color: '' });
              }}
              required
              error={!!formErrors.color}
              helperText={formErrors.color}
            />
            <TextField
              label="Weight Remaining (g)"
              type="number"
              value={newFilament.weightRemaining ?? ''}
              onChange={(e) => setNewFilament({ ...newFilament, weightRemaining: Number(e.target.value) })}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Spool Weight (g)"
              type="number"
              value={newFilament.spoolWeight ?? ''}
              onChange={(e) => setNewFilament({ ...newFilament, spoolWeight: Number(e.target.value) })}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Notes"
              multiline
              rows={3}
              value={newFilament.notes || ''}
              onChange={(e) => setNewFilament({ ...newFilament, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ mb:2, mr:2 }}>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleAddOrUpdateFilament} variant="contained">
            {isEditing ? 'Save Changes' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Filament</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedFilament?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}