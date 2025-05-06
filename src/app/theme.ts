'use client';
import { createTheme } from '@mui/material/styles';

// Define custom colors
const accentOrange = '#d73f09';
const backgroundDark = '#1e1e1e';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: accentOrange,
      light: '#ff6937', // Lighter shade of accent
      dark: '#a02c00', // Darker shade of accent
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#757575',
      light: '#9e9e9e',
      dark: '#616161',
      contrastText: '#ffffff',
    },
    background: {
      default: backgroundDark,
      paper: '#252525', // Slightly lighter than background for cards/surfaces
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
      disabled: '#6b6b6b',
    },
    grey: {
      50: '#f8f8f8',
      100: '#ebebeb',
      200: '#d6d6d6',
      300: '#b0b0b0',
      400: '#8d8d8d',
      500: '#6b6b6b',
      600: '#4d4d4d',
      700: '#363636',
      800: '#252525',
      900: '#1e1e1e',
    },
    error: {
      main: '#f44336',
      light: '#ff7961',
      dark: '#ba000d',
    },
    warning: {
      main: '#ffa726',
      light: '#ffd95b',
      dark: '#c77800',
    },
    info: {
      main: '#29b6f6',
      light: '#4fc3f7',
      dark: '#0288d1',
    },
    success: {
      main: '#66bb6a',
      light: '#81c784',
      dark: '#388e3c',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#252525',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#252525',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
  },
  shape: {
    borderRadius: 4,
  },
});

export default theme;