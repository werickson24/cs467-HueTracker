'use client';

import { Filament } from '@/types/Filament';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import FilamentTableRow from '@/components/dashboard/FilamentTableRow';

interface FilamentTableProps {
  filaments: Filament[];
  loadingStates: { [key: string]: boolean };
  onEdit: (filament: Filament) => void;
  onDelete: (filament: Filament) => void;
}

export default function FilamentTable({ 
  filaments, 
  loadingStates, 
  onEdit, 
  onDelete 
}: FilamentTableProps) {
  return (
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
            <TableCell align='center'>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filaments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center">
                No filaments found. Add one!
              </TableCell>
            </TableRow>
          ) : (
            filaments.map((filament) => (
              <FilamentTableRow
                key={filament.id}
                filament={filament}
                isLoading={loadingStates[filament.id] || false}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}