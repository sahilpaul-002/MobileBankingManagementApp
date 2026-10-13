import AnimatedSplashOverlayComponent from '@/components/common/AnimatedSplashOverlayComponent';
import AppLayout from '@/layouts/AppLayout';
import { DarkTheme, DefaultTheme, ThemeProvider, usePathname, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Activity, useEffect, useState } from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

SplashScreen.preventAutoHideAsync();

export default function AppRootLayout() {
  const [showAppLayout, setShowAppLayout] = useState(false)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowAppLayout(true);
    }, 6000);

    return () => clearTimeout(timeoutId);
  }, []);

  const colorScheme = useColorScheme();

  // Log Current Path Name
  const pathname = usePathname();

  useEffect(() => {
    console.log('Navigated to:', pathname);
  }, [pathname]);

  // Log Current Path Segment
  const segments = useSegments();

  useEffect(() => {
    console.log('Current route segments:', segments);
  }, [segments]);

  return (
    <SafeAreaProvider>
      <ThemeProvider
        value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
      >
        <View style={{ flex: 1, backgroundColor: '#F4F6FA' }}>
          <StatusBar barStyle="dark-content" />

          <Activity mode={showAppLayout ? 'visible' : 'hidden'}>
            <AppLayout />
          </Activity>

          <AnimatedSplashOverlayComponent />
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}