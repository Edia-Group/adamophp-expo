import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    card: '#f5f5f5',
    destructive: '#ff6b6b',
    destructiveText: '#fff',
    inputBackground: '#f5f5f5',
    inputBorder: '#ddd',
    inputText: '#000',
    placeholder: '#888',
    messageBackground: '#f0f0f0',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    card: '#333',
    destructive: '#ff6b6b',
    destructiveText: '#fff',
    inputBackground: '#333',
    inputBorder: '#555',
    inputText: '#fff',
    placeholder: '#aaa',
    messageBackground: '#333',
  },
};

export const LightTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: Colors.light.tint,
    background: Colors.light.background,
    card: Colors.light.background,
    text: Colors.light.text,
    border: Colors.light.icon,
    notification: Colors.light.tint,
  },
};

export const DarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: Colors.dark.tint,
    background: Colors.dark.background,
    card: Colors.dark.background,
    text: Colors.dark.text,
    border: Colors.dark.icon,
    notification: Colors.dark.tint,
  },
};