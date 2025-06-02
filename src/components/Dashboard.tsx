'use client';

import { useState, useEffect } from 'react';
import { Filament, FilamentWithScore } from '@/types/Filament';
import {
  Container,
  Button,
  Box,
} from '@mui/material';
import SearchBar from '@/components/search/SearchBar';
import SearchResultsPanel from '@/components/search/SearchResultsPanel';
import { fuzzySearchEX } from '@/lib/fuzzySearchEX';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import FilamentTable from '@/components/dashboard/FilamentTable';
import FilamentDialog from '@/components/dashboard/FilamentDialog';
import DeleteConfirmationDialog from '@/components/dashboard/DeleteConfirmationDialog';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';

type LoadingStates = {
  [key: string]: boolean;
};

export default function DashboardClient() {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    initial: true,
    add: false,
    dialog: false,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedFilament, setSelectedFilament] = useState<Filament | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Search functionality state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    bestMatches: FilamentWithScore[];
    closeMatches: FilamentWithScore[];
    notEnough: FilamentWithScore[];
    otherMatches: FilamentWithScore[];
  }>({
    bestMatches: [],
    closeMatches: [],
    notEnough: [],
    otherMatches: []
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
    
    const { categories } = fuzzySearchEX(filaments, searchQuery);
    
    setSearchResults({
      bestMatches: categories.perfectMatches,
      closeMatches: categories.goodMatches,
      notEnough: categories.lowQuantityMatches,
      otherMatches: categories.fuzzyMatches
    });
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

  const handleSaveFilament = async (filamentData: Partial<Filament>) => {
    try {
      setLoadingStates(prev => ({ ...prev, dialog: true }));

      const filamentDataToSend = {
        ...filamentData,
        weightRemaining: Number(filamentData.weightRemaining) || 0,
        spoolWeight: Number(filamentData.spoolWeight) || 0,
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

      if (isEditing && selectedFilament) {
        const updatedFilament = await response.json();
        setFilaments(prev => prev.map(f =>
          f.id === selectedFilament.id ? updatedFilament : f
        ));
      } else {
        const newFilamentData = await response.json();
        setFilaments(prev => [...prev, newFilamentData]);
      }

      handleDialogClose();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} filament:`, error);
    } finally {
      setLoadingStates(prev => ({ ...prev, dialog: false }));
    }
  };

  const handleEditClick = (filament: Filament) => {
    setSelectedFilament(filament);
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
      setLoadingStates(prev => ({ ...prev, dialog: true }));

      const response = await fetch(`/api/filaments/${selectedFilament.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete filament');
      }

      setFilaments(prev => prev.filter(f => f.id !== selectedFilament.id));
      setOpenDeleteDialog(false);
      setSelectedFilament(null);
    } catch (error) {
      console.error('Error deleting filament:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, dialog: false }));
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedFilament(null);
    setIsEditing(false);
  };
  
  const handleFilamentSelect = (filament: Filament) => {
    setSearchQuery('');
    handleEditClick(filament);
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setSelectedFilament(null);
    setOpenDialog(true);
  };

  if (loadingStates.initial) {
    return <LoadingSpinner message="Loading Filaments..." />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <DashboardHeader />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <SearchBar query={searchQuery} onChange={setSearchQuery} />

        {searchActive ? (
          <SearchResultsPanel 
            results={searchResults} 
            onSelectFilament={handleFilamentSelect} 
            query={searchQuery}
          />
        ) : (
          <>
            <FilamentTable
              filaments={filaments}
              loadingStates={loadingStates}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
            <Box display="flex" justifyContent="end" alignItems="center" mb={1} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={handleAddNew}>
                Add New Filament
              </Button>
            </Box>
          </>
        )}

        <FilamentDialog
          open={openDialog}
          filament={selectedFilament}
          isEditing={isEditing}
          isLoading={loadingStates.dialog}
          onClose={handleDialogClose}
          onSave={handleSaveFilament}
        />

        <DeleteConfirmationDialog
          open={openDeleteDialog}
          filament={selectedFilament}
          isLoading={loadingStates.dialog}
          onClose={() => setOpenDeleteDialog(false)}
          onConfirm={handleDelete}
        />
      </Container>
    </Box>
  );
}