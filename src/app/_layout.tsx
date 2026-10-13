import AnimatedSplashOverlayComponent from '@/components/common/AnimatedSplashOverlayComponent';
import AppLayout from '@/layouts/AppLayout';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Activity, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import '../global.css';

SplashScreen.preventAutoHideAsync();

export default function AppRootLayout() {
  const [showAppLayout, setShowAppLayout] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      setShowAppLayout(true)
    }, 6000)
  })
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlayComponent />

      <Activity mode={showAppLayout ? "visible" : "hidden"}>
        <AppLayout />
      </Activity>
    </ThemeProvider>
  );
}