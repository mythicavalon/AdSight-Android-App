import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1a1a2e',
    accent: '#1d2747',
    background: '#0b0b16',
    surface: '#151528',
    error: '#ff3b30',
    text: '#ffffff',
    onSurface: '#ffffff',
    disabled: '#8a8a8a',
    placeholder: '#b0b0b0',
    backdrop: 'rgba(0, 0, 0, 0.6)',
    // Custom colors for AdSight
    secondary: '#16213e',
    success: '#34c759',
    warning: '#ffcc00',
    info: '#2196f3',
    cardBackground: '#1a1a2e',
    borderColor: '#2a2a3d',
  },
  roundness: 8,
};

export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1a1a2e',
    accent: '#16213e',
    background: '#f5f5f5',
    surface: '#ffffff',
    error: '#ff3b30',
    text: '#0b0b0b',
    onSurface: '#0b0b0b',
    disabled: '#9e9e9e',
    placeholder: '#666666',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    // Custom colors for light mode
    secondary: '#16213e',
    success: '#34c759',
    warning: '#ffcc00',
    info: '#2196f3',
    cardBackground: '#ffffff',
    borderColor: '#e0e0e0',
  },
  roundness: 8,
};