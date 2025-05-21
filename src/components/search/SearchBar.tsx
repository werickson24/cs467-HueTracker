'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TextField, InputAdornment, IconButton, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

interface SearchBarProps {
  query: string;
  onChange: (query: string) => void;
  onFocus?: () => void;
  placeholder?: string;
  debounceTime?: number; // Time in ms to wait before triggering search
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  query, 
  onChange, 
  onFocus, 
  placeholder = "Search filaments...",
  debounceTime = 500
}) => {
  const [focused, setFocused] = useState(false);
  const [internalQuery, setInternalQuery] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update internal state when external query changes
  useEffect(() => {
    setInternalQuery(query);
  }, [query]);

  // Debounced onChange handler
  const debouncedOnChange = useCallback(
    (value: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        onChange(value);
      }, debounceTime);
    },
    [onChange, debounceTime]
  );

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalQuery(newValue);
    debouncedOnChange(newValue);
  };
  
  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleClear = () => {
    setInternalQuery('');
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <Paper
      elevation={focused ? 3 : 1}
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        borderRadius: 2,
        bgcolor: 'background.paper',
        transition: 'box-shadow 0.3s',
        mb: 2,
      }}
    >
      <InputAdornment position="start" sx={{ pl: 1 }}>
        <SearchIcon color="action" />
      </InputAdornment>
      <TextField
        inputRef={inputRef}
        fullWidth
        placeholder={placeholder}
        value={internalQuery}
        onChange={handleChange}
        onFocus={() => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={() => setFocused(false)}
        variant="standard"
        InputProps={{
          disableUnderline: true,
          sx: {
            p: 1,
            fontSize: '1.1rem',
            '& input': {
              p: 0,
            },
          },
        }}
      />
      {internalQuery && (
        <IconButton size="small" onClick={handleClear} sx={{ mr: 1 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </Paper>
  );
};

export default SearchBar;