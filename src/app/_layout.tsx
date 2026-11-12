import ApplicationLoaderSplashScreenComponent from '@/components/common/loaders/ApplicationLoaderSplashScreenComponent';
import ToastMessagesComponent from '@/components/common/ToastMessagesComponent';
import { setAxiosDispatch, setAxiosReduxAccess } from '@/configs/axiosConfig';
import AppLayout from '@/layouts/AppLayout';
import { store, storeDispatch } from '@/redux/sotre';
import { authenticateDevice } from '@/utils/authenticateDevice';
import { DarkTheme, DefaultTheme, ThemeProvider, usePathname, useSegments, } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Activity, useCallback, useEffect, useState } from 'react';
import { Pressable, StatusBar, Text, useColorScheme, View } from 'react-native';
import { install } from 'react-native-quick-crypto';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import '../global.css';

install();  // Global install of react-native-quick-crypto modules like crypto and Buffer

// Prevent native splash from hiding automatically
void SplashScreen.preventAutoHideAsync();

// Configure global Redux access for Axios
setAxiosReduxAccess({
  getState: store.getState,
  dispatch: store.dispatch,
});

// Set Global Store Dispatch
setAxiosDispatch(storeDispatch);

type ApplicationBootState = 'AUTHENTICATING' | 'INITIALIZING' | 'READY' | 'FAILED';

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

  // ------------------------------------- Device Authentication ------------------------------------- \\ 
  const [bootState, setBootState] = useState<ApplicationBootState>('AUTHENTICATING');

  const [bootError, setBootError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const initializeApplication = useCallback(async () => {
    try {
      setBootError(null);
      setBootState('AUTHENTICATING');

      // Authenticate device
      const authenticationResult = await authenticateDevice();

      if (!authenticationResult.success) {
        setBootError(
          'Device authentication failed. Please authenticate to continue.',
        );

        setBootState('FAILED');
        return;
      }

      // Device authentication successful
      setBootState('INITIALIZING');

      // Application initialization successful
      setBootState('READY');

    } catch (error) {
      console.error('Application initialization failed:', error);

      setBootError('Unable to initialize the application. Please try again.');
      setBootState('FAILED');
    }
  }, []);

  useEffect(() => {
    void initializeApplication();
  }, [initializeApplication, retryKey]);

  const handleRetry = () => {
    setRetryKey((previous) => previous + 1);
  };
  // ------------------------------------------- XXXXXXXXXXXXXXXXXXXXXXX ------------------------------------------- \\ 

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <View className="w-full flex-1 bg-[var(--color-app)]">
            <StatusBar
              barStyle={
                colorScheme === 'dark'
                  ? 'light-content'
                  : 'dark-content'
              }
            />

            {/* Application starts only after successful initialization */}
            <Activity mode={bootState === 'READY' ? 'visible' : 'hidden'}>
              <>
                <AppLayout />
                <ToastMessagesComponent />
              </>
            </Activity>

            {/* Startup Loader */}
            <Activity mode={bootState !== 'FAILED' && !showAppLayout ? 'visible' : 'hidden'}>
              <ApplicationLoaderSplashScreenComponent
                isReady={bootState === 'READY'}
                onAnimationComplete={() => {
                  setShowAppLayout(true);
                }}
              />
            </Activity>

            {/* Failure screen */}
            <Activity mode={bootState === 'FAILED' ? 'visible' : 'hidden'}>
              <View className="absolute inset-0 z-50 items-center justify-center bg-[#0C1830] px-6">
                <Text className="mb-3 text-center text-xl font-bold text-white">
                  Authentication Required
                </Text>

                <Text className="mb-6 text-center text-sm text-gray-300">
                  {bootError}
                </Text>

                <Pressable
                  onPress={handleRetry}
                  className="rounded-lg bg-[#D49A4D] px-8 py-3"
                >
                  <Text className="font-semibold text-[#0C1830]">
                    Try Again
                  </Text>
                </Pressable>
              </View>
            </Activity>
          </View>
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}