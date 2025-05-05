'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Filament } from '@/types/Filament';
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
  CircularProgress
} from '@mui/material';

const materialTypes = ['PLA', 'PETG', 'ABS', 'TPU', 'NYLON', 'OTHER'];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newFilament, setNewFilament] = useState<Partial<Filament>>({});

  // Protect the dashboard route
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchFilaments();
    }
  }, [session]);

  const fetchFilaments = async () => {
    try {
      const response = await fetch('/api/filaments');
      if (!response.ok) throw new Error('Failed to fetch filaments');
      const data = await response.json();
      setFilaments(data);
    } catch (error) {
      console.error('Error fetching filaments:', error);
      // Add error handling UI here if needed
    }
  };

  const handleAddFilament = async () => {
    try {
      const response = await fetch('/api/filaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFilament),
      });
      
      if (!response.ok) throw new Error('Failed to add filament');
      
      setOpenDialog(false);
      setNewFilament({});
      fetchFilaments();
    } catch (error) {
      console.error('Error adding filament:', error);
      // Add error handling UI here if needed
    }
  };

  // Show loading state
  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Show content only if authenticated
  if (!session) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
      <Typography variant="h4">Filament Library</Typography>
      <Button 
        variant="contained" 
        onClick={() => setOpenDialog(true)}
      >
        Add New Filament
      </Button>
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
          </TableRow>
        </TableHead>
        <TableBody>
          {filaments.map((filament) => (
            <TableRow key={filament.id}>
              <TableCell>{filament.name}</TableCell>
              <TableCell>{filament.materialType}</TableCell>
              <TableCell>{filament.brand}</TableCell>
              <TableCell>{filament.color}</TableCell>
              <TableCell>{filament.weightRemaining}g</TableCell>
              <TableCell>{filament.spoolWeight}g</TableCell>
              <TableCell>{filament.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
      <DialogTitle>Add New Filament</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Name"
            value={newFilament.name || ''}
            onChange={(e) => setNewFilament({ ...newFilament, name: e.target.value })}
          />
          <TextField
            select
            label="Material Type"
            value={newFilament.materialType || ''}
            onChange={(e) => setNewFilament({ ...newFilament, materialType: e.target.value })}
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
            onChange={(e) => setNewFilament({ ...newFilament, brand: e.target.value })}
          />
          <TextField
            label="Color"
            value={newFilament.color || ''}
            onChange={(e) => setNewFilament({ ...newFilament, color: e.target.value })}
          />
          <TextField
            label="Weight Remaining (g)"
            type="number"
            value={newFilament.weightRemaining || ''}
            onChange={(e) => setNewFilament({ ...newFilament, weightRemaining: Number(e.target.value) })}
          />
          <TextField
            label="Spool Weight (g)"
            type="number"
            value={newFilament.spoolWeight || ''}
            onChange={(e) => setNewFilament({ ...newFilament, spoolWeight: Number(e.target.value) })}
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
      <DialogActions>
        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
        <Button onClick={handleAddFilament} variant="contained">Add</Button>
      </DialogActions>
    </Dialog>
  </Container>
  );
}


/*'use client';

import { useState, useEffect } from 'react';
import { Filament } from '@/types/Filament';
//import { useSession } from 'next-auth/react';
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
  MenuItem
} from '@mui/material';

/*type Filament = {
  id: string;
  name: string;
  materialType: string;
  brand: string;
  color: string;
  weightRemaining: number;
  spoolWeight: number;
  notes?: string;
};

const materialTypes = ['PLA', 'PETG', 'ABS', 'TPU', 'NYLON', 'OTHER'];

export default function Dashboard() {
  //const { data: session } = useSession();
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newFilament, setNewFilament] = useState<Partial<Filament>>({});

  useEffect(() => {
    // Fetch filaments
    fetchFilaments();
  }, []);

  const fetchFilaments = async () => {
    const response = await fetch('/api/filaments');
    const data = await response.json();
    setFilaments(data);
  };

  const handleAddFilament = async () => {
    await fetch('/api/filaments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newFilament),
    });
    setOpenDialog(false);
    setNewFilament({});
    fetchFilaments();
  };

  return (
  );
}*/