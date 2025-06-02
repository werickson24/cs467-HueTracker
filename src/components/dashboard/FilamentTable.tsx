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
  TableSortLabel,
  Box,
} from '@mui/material';
import { useState, useMemo } from 'react';
import FilamentTableRow from '@/components/dashboard/FilamentTableRow';

interface FilamentTableProps {
  filaments: Filament[];
  loadingStates: { [key: string]: boolean };
  onEdit: (filament: Filament) => void;
  onDelete: (filament: Filament) => void;
  onView?: (filament: Filament) => void;
}

type SortField = 'name' | 'materialType' | 'brand' | 'color' | 'weightRemaining' | 'spoolWeight' | 'notes' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

export default function FilamentTable({
  filaments,
  loadingStates,
  onEdit,
  onDelete,
  onView
}: FilamentTableProps) {
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortField('updatedAt');
        setSortOrder('desc');
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedFilaments = useMemo(() => {
    const sorted = [...filaments].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'materialType':
          aValue = a.materialType.toLowerCase();
          bValue = b.materialType.toLowerCase();
          break;
        case 'brand':
          aValue = a.brand.toLowerCase();
          bValue = b.brand.toLowerCase();
          break;
        case 'color':
          aValue = a.color;
          bValue = b.color;
          break;
        case 'weightRemaining':
          aValue = a.weightRemaining;
          bValue = b.weightRemaining;
          break;
        case 'spoolWeight':
          aValue = a.spoolWeight;
          bValue = b.spoolWeight;
          break;
        case 'notes':
          aValue = a.notes?.toLowerCase() ?? "";
          bValue = b.notes?.toLowerCase() ?? "";
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [filaments, sortField, sortOrder]);

  const createSortHandler = (field: SortField) => () => {
    handleSort(field);
  };

  return (
    <TableContainer component={Paper} elevation={2} sx={{borderRadius: 2}}>
      <Table>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: 'background.paper',
              '& .MuiTableCell-head': {
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'text.primary',
                borderBottom: '2px solid',
                borderBottomColor: 'divider',
                paddingY: 2,
              }
            }}
          >
            <TableCell sx={{ width: 60 }}></TableCell>

            <TableCell>
              <TableSortLabel
                active={sortField === 'name'}
                direction={sortField === 'name' ? sortOrder : 'asc'}
                onClick={createSortHandler('name')}
              >
                Name
              </TableSortLabel>
            </TableCell>

            <TableCell>
              <TableSortLabel
                active={sortField === 'materialType'}
                direction={sortField === 'materialType' ? sortOrder : 'asc'}
                onClick={createSortHandler('materialType')}
              >
                Material
              </TableSortLabel>
            </TableCell>

            <TableCell>
              <TableSortLabel
                active={sortField === 'brand'}
                direction={sortField === 'brand' ? sortOrder : 'asc'}
                onClick={createSortHandler('brand')}
              >
                Brand
              </TableSortLabel>
            </TableCell>

            <TableCell>
              <TableSortLabel
                active={sortField === 'color'}
                direction={sortField === 'color' ? sortOrder : 'asc'}
                onClick={createSortHandler('color')}

              >
                Color
              </TableSortLabel>

            </TableCell>

            <TableCell>
              <TableSortLabel
                active={sortField === 'weightRemaining'}
                direction={sortField === 'weightRemaining' ? sortOrder : 'asc'}
                onClick={createSortHandler('weightRemaining')}
              >
                Weight
              </TableSortLabel>
            </TableCell>

            <TableCell>
              <TableSortLabel
                active={sortField === 'spoolWeight'}
                direction={sortField === 'spoolWeight' ? sortOrder : 'asc'}
                onClick={createSortHandler('spoolWeight')}

              >
                Spool Weight
              </TableSortLabel>
            </TableCell>

            <TableCell>

              <TableSortLabel
                active={sortField === 'notes'}
                direction={sortField === 'notes' ? sortOrder : 'asc'}
                onClick={createSortHandler('notes')}

              >
                Notes
              </TableSortLabel>
            </TableCell>
            <TableCell align='center'>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedFilaments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center">
                No filaments found. Add one!
              </TableCell>
            </TableRow>
          ) : (
            sortedFilaments.map((filament) => (
              <FilamentTableRow
                key={filament.id}
                filament={filament}
                isLoading={loadingStates[filament.id] || false}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
              />
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}