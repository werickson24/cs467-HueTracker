'use client';

import { useState, useEffect } from 'react';
import { Filament, FilamentWithScore } from '@/types/Filament';
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
  Tooltip,
  DialogContentText,
  AppBar,
  Toolbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SignOutButton from '@/components/auth/signout-button';
import SearchBar from '@/components/search/SearchBar';
import SearchResultsPanel from '@/components/search/SearchResultsPanel';
import { fuzzySearch, categorizeResults } from '@/lib/fuzzySearch';
import AngledSpoolIcon from '@/components/spoolIcon';

const materialTypes = ['PLA', 'PETG', 'ABS', 'TPU', 'NYLON', 'OTHER'];

// Add this new type for form validation
type ValidationErrors = {
  [key: string]: string;
};

type LoadingStates = {
  [key: string]: boolean;
};

export default function DashboardClient() {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    initial: true,     // For initial load
    add: false,        // For adding new filament
    dialog: false,     // For dialog operations
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedFilament, setSelectedFilament] = useState<Filament | null>(null);
  const [newFilament, setNewFilament] = useState<Partial<Filament>>({});
  const [isEditing, setIsEditing] = useState(false);
  
  // New state for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    bestMatches: FilamentWithScore[];
    notEnough: FilamentWithScore[];
    closeMatches: FilamentWithScore[];
  }>({
    bestMatches: [],
    notEnough: [],
    closeMatches: []
  });

  useEffect(() => {
    fetchFilaments();
  }, []);
  
  // Effect to handle search updates
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchActive(false);
      return;
    }
    
    setSearchActive(true);
    
    // Define specific keys to search
    const searchFields: (keyof Pick<Filament, 'name' | 'materialType' | 'brand' | 'color' | 'notes'>)[] = 
      ['name', 'materialType', 'brand', 'color', 'notes'];
    
    const results = fuzzySearch(filaments, searchQuery, searchFields);
    const categorized = categorizeResults(results);
    
    setSearchResults(categorized);
  }, [searchQuery, filaments]);

  const fetchFilaments = async () => {
    setLoadingStates(prev => ({ ...prev, initial: true }));
    try {
      const response = await fetch('/api/filaments');
      if (!response.ok) throw new Error('Failed to fetch filaments');
      const data = await response.json();
      setFilaments(data);
    } catch (error) {
      console.error('Error fetching filaments:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, initial: false }));
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
      return;
    }

    try {
      // Set dialog loading state instead of row loading state
      setLoadingStates(prev => ({
        ...prev,
        dialog: true
      }));

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

      // Update the data first
      if (isEditing && selectedFilament) {
        const updatedFilament = await response.json();
        setFilaments(prev => prev.map(f =>
          f.id === selectedFilament.id ? updatedFilament : f
        ));
      } else {
        const newFilamentData = await response.json();
        setFilaments(prev => [...prev, newFilamentData]);
      }

      // Then close the dialog
      handleDialogClose();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} filament:`, error);
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        dialog: false
      }));
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
      setLoadingStates(prev => ({
        ...prev,
        dialog: true
      }));

      const response = await fetch(`/api/filaments/${selectedFilament.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete filament');
      }

      // Remove the deleted filament from the state
      setFilaments(prev => prev.filter(f => f.id !== selectedFilament.id));
      setOpenDeleteDialog(false);
      setSelectedFilament(null);
    } catch (error) {
      console.error('Error deleting filament:', error);
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        dialog: false
      }));
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewFilament({});
    setSelectedFilament(null);
    setIsEditing(false);
  };
  
  // New handler for when a filament is selected from search results
  const handleFilamentSelect = (filament: Filament) => {
    setSearchQuery(''); // Clear search
    handleEditClick(filament); // Open the edit dialog for this filament
  };

  if (loadingStates.initial) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Filaments...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Image
            src="/HueTracker_Logo_grey.png"
            alt="Logo"
            width={150}
            height={100}
            style={{ marginTop: '8px', marginBottom: '8px' }}
          />
          <SignOutButton />
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {/* Search Bar */}
        <SearchBar 
          query={searchQuery} 
          onChange={setSearchQuery}
        />

        {/* Search Results or Table */}
        {searchActive ? (
          <SearchResultsPanel 
            results={searchResults} 
            onSelectFilament={handleFilamentSelect} 
            query={searchQuery}
          />
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
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
                        {loadingStates[filament.id] ? (
                          <TableCell colSpan={8}>
                            <Box display="flex" justifyContent="center" alignItems="center">
                              <CircularProgress size={20} />
                              <Typography variant="body2" sx={{ ml: 1 }}>Updating...</Typography>
                            </Box>
                          </TableCell>
                        ) : (
                          <>
                            <TableCell sx={{
                              width: 'auto'}}><AngledSpoolIcon fillColor={filament.color} sx={{
                                width: 50,  // Example fixed width
                                height: 50, // Example fixed height
                                display: 'block' // Ensures proper block-level rendering for centering
                              }}/></TableCell>
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
                          </>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box display="flex" justifyContent="end" alignItems="center" mb={1} sx={{ mt: 2 }}>
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
          </>
        )}

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
          <DialogActions sx={{ mb: 2, mr: 2 }}>
            <Button
              onClick={handleDialogClose}
              disabled={loadingStates.dialog}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddOrUpdateFilament}
              variant="contained"
              disabled={loadingStates.dialog}
            >
              {loadingStates.dialog ? (
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Delete Filament</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {`Are you sure you want to delete "${selectedFilament?.name}"? This action cannot be undone.`}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenDeleteDialog(false)}
              disabled={loadingStates.dialog}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              color="error"
              variant="contained"
              disabled={loadingStates.dialog}
            >
              {loadingStates.dialog ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Deleting...
                </Box>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}