'use client';

import { useState, useEffect } from 'react';
import { Filament, FilamentWithScore } from '@/types/Filament';
import {
  Container,
  Button,
  Box,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import SearchBar from '@/components/search/SearchBar';
import SearchResultsPanel from '@/components/search/SearchResultsPanel';
import { fuzzySearchEX } from '@/lib/fuzzySearchEX';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import FilamentTable from '@/components/dashboard/FilamentTable';
import FilamentGrid from '@/components/dashboard/FilamentGrid';
import DeleteConfirmationDialog from '@/components/dashboard/DeleteConfirmationDialog';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import FilamentModal from '@/components/dashboard/FilamentModal';

type LoadingStates = {
  [key: string]: boolean;
};

type ModalState = {
  open: boolean;
  mode: 'view' | 'edit' | 'add';
  filament: Filament | null;
};

type ViewMode = 'table' | 'grid';

export default function DashboardClient() {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    initial: true,
    dialog: false,
  });
  
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  
  // Simplified modal state
  const [modalState, setModalState] = useState<ModalState>({
    open: false,
    mode: 'view',
    filament: null,
  });
  
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [filamentToDelete, setFilamentToDelete] = useState<Filament | null>(null);

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

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
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

      const isEditing = modalState.mode === 'edit';
      const url = isEditing && modalState.filament
        ? `/api/filaments/${modalState.filament.id}`
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

      if (isEditing && modalState.filament) {
        const updatedFilament = await response.json();
        setFilaments(prev => prev.map(f =>
          f.id === modalState.filament!.id ? updatedFilament : f
        ));
        // Update modal state with new data
        setModalState(prev => ({ ...prev, filament: updatedFilament, mode: 'view' }));
      } else {
        const newFilamentData = await response.json();
        setFilaments(prev => [...prev, newFilamentData]);
        closeModal();
      }
    } catch (error) {
      console.error(`Error ${modalState.mode === 'edit' ? 'updating' : 'adding'} filament:`, error);
    } finally {
      setLoadingStates(prev => ({ ...prev, dialog: false }));
    }
  };

  const handleViewFilament = (filament: Filament) => {
    setModalState({
      open: true,
      mode: 'view',
      filament,
    });
  };

  const handleEditFilament = (filament: Filament) => {
    setModalState({
      open: true,
      mode: 'edit',
      filament,
    });
  };

  const handleAddNew = () => {
    setModalState({
      open: true,
      mode: 'add',
      filament: null,
    });
  };

  const closeModal = () => {
    setModalState({
      open: false,
      mode: 'view',
      filament: null,
    });
  };

  const handleDeleteClick = (filament: Filament) => {
    setFilamentToDelete(filament);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!filamentToDelete) return;

    try {
      setLoadingStates(prev => ({ ...prev, dialog: true }));

      const response = await fetch(`/api/filaments/${filamentToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete filament');
      }

      setFilaments(prev => prev.filter(f => f.id !== filamentToDelete.id));
      setOpenDeleteDialog(false);
      setFilamentToDelete(null);
      
      // Close modal if we're viewing the deleted filament
      if (modalState.filament?.id === filamentToDelete.id) {
        closeModal();
      }
    } catch (error) {
      console.error('Error deleting filament:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, dialog: false }));
    }
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
            onSelectFilament={handleViewFilament}
            query={searchQuery}
          />
        ) : (
          <>
            {/* View Toggle and Add Button Row */}
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center" 
              mb={2}
              sx={{ mt: 2 }}
            >
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                aria-label="view mode"
                size="small"
              >
                <ToggleButton value="table" aria-label="table view">
                  <ViewListIcon />
                </ToggleButton>
                <ToggleButton value="grid" aria-label="grid view">
                  <ViewModuleIcon />
                </ToggleButton>
              </ToggleButtonGroup>

              <Button variant="contained" onClick={handleAddNew}>
                Add New Filament
              </Button>
            </Box>

            {/* Conditional View Rendering */}
            {viewMode === 'table' ? (
              <FilamentTable
                filaments={filaments}
                loadingStates={loadingStates}
                onEdit={handleEditFilament}
                onDelete={handleDeleteClick}
                onView={handleViewFilament}
              />
            ) : (
              <FilamentGrid
                filaments={filaments}
                loadingStates={loadingStates}
                onEdit={handleEditFilament}
                onDelete={handleDeleteClick}
                onView={handleViewFilament}
              />
            )}
          </>
        )}

        <FilamentModal
          open={modalState.open}
          filament={modalState.filament}
          mode={modalState.mode}
          onClose={closeModal}
          onSave={handleSaveFilament}
          onDelete={handleDeleteClick}
          isLoading={loadingStates.dialog}
        />

        <DeleteConfirmationDialog
          open={openDeleteDialog}
          filament={filamentToDelete}
          isLoading={loadingStates.dialog}
          onClose={() => setOpenDeleteDialog(false)}
          onConfirm={handleDelete}
        />
      </Container>
    </Box>
  );
}