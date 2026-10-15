import AnimatedSplashOverlayComponent from '@/components/common/AnimatedSplashOverlayComponent';
import ToastMessagesComponent from '@/components/common/ToastMessagesComponent';
import AppLayout from '@/layouts/AppLayout';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  usePathname,
  useSegments,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

SplashScreen.preventAutoHideAsync();

export default function AppRootLayout() {
  const [showAppLayout, setShowAppLayout] = useState(false);
  const colorScheme = useColorScheme();

  const pathname = usePathname();
  const segments = useSegments();

  useEffect(() => {
    console.log('Navigated to:', pathname);
  }, [pathname]);

  useEffect(() => {
    console.log('Current route segments:', segments);
  }, [segments]);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* <View className="w-full flex-1 bg-[var(--color-app)]"> */}
        <View className="w-full flex-1">
          {/* <StatusBar barStyle="dark-content" /> */}
          <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

          <View className="w-full flex-1 bg-[var(--color-app)]">
            <ToastMessagesComponent />
            <AppLayout />
          </View>

          {!showAppLayout && (
            <AnimatedSplashOverlayComponent
              onAnimationComplete={() => setShowAppLayout(true)}
            />
          )}
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}