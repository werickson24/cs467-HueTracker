'use client';

import React, { useState, useRef } from 'react';
import { Box, Popover } from '@mui/material';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  size?: number;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  value, 
  onChange, 
  size = 1100 
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const getCurrentColor = () => {
    return value || '#ffffff';
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorChange = (color: string) => {
    onChange(color);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      {/* Color square trigger */}
      <Box
        ref={buttonRef}
        onClick={handleClick}
        sx={{
          width: size,
          height: size,
          borderRadius: 1,
          border: '2px solid',
          borderColor: open ? 'primary.main' : 'divider',
          backgroundColor: getCurrentColor(),
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      />

      {/* Color picker popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        sx={{
          '& .MuiPopover-paper': {
            p: 2,
            borderRadius: 2,
            backgroundColor: '#2a2a2a',
            border: '1px solid #444',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }
        }}
      >
        <HexColorPicker 
          color={getCurrentColor()} 
          onChange={handleColorChange}
        />
      </Popover>
    </>
  );
};

export default ColorPicker;