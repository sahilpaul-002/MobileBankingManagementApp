import ApplicationLoaderSplashScreenComponent from '@/components/common/loaders/ApplicationLoaderSplashScreenComponent';
import ToastMessagesComponent from '@/components/common/ToastMessagesComponent';
import { setAxiosDispatch, setAxiosReduxAccess } from '@/configs/axiosConfig';
import AppLayout from '@/layouts/AppLayout';
import { store, storeDispatch } from '@/redux/sotre';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  usePathname,
  useSegments,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Activity, useEffect, useState } from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import '../global.css';

void SplashScreen.preventAutoHideAsync();

export default function AppRootLayout() {
  // Set Global Redux Access
  setAxiosReduxAccess({
    getState: store.getState,
    dispatch: store.dispatch,
  });
  // Set Global Store Dispatch
  setAxiosDispatch(storeDispatch);

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
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <View className="w-full flex-1 bg-[var(--color-app)]">
            {/* {!showAppLayout && (
              <View
                pointerEvents="none"
                className="absolute inset-0 z-0 bg-[#0C1830]"
              />
            )} */}

            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

            {/* Render Animated Splash Screen */}
            <Activity mode={!showAppLayout ? "visible" : "hidden"}>
              <ApplicationLoaderSplashScreenComponent
                onAnimationComplete={() => setShowAppLayout(true)}
              />
            </Activity>

            <AppLayout />

            {/* Toast Message to be rendered above all */}
            <ToastMessagesComponent />
          </View>
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}