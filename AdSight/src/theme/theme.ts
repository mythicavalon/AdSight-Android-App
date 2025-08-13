import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1a1a2e',
    accent: '#16213e',
    background: '#0f0f1e',
    surface: '#1a1a2e',
    error: '#f44336',
    text: '#ffffff',
    onSurface: '#ffffff',
    disabled: '#666666',
    placeholder: '#999999',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    // Custom colors for AdSight
    secondary: '#16213e',
    success: '#4caf50',
    warning: '#ff9800',
    info: '#2196f3',
    cardBackground: '#16213e',
    borderColor: '#333333',
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
    error: '#f44336',
    text: '#000000',
    onSurface: '#000000',
    disabled: '#cccccc',
    placeholder: '#666666',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    // Custom colors for light mode
    secondary: '#16213e',
    success: '#4caf50',
    warning: '#ff9800',
    info: '#2196f3',
    cardBackground: '#ffffff',
    borderColor: '#e0e0e0',
  },
  roundness: 8,
};