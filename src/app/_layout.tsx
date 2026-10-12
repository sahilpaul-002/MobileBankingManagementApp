import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import '../global.css';

import AppLayout from '@/layouts/AppLayout';

SplashScreen.preventAutoHideAsync();

export default function AppRootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppLayout />
    </ThemeProvider>
  );
}