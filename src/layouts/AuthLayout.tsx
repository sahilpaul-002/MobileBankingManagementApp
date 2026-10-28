
import ApplicationLoaderComponent from '@/components/common/loaders/ApplicationLoaderComponent';
import { useLazyGetDnsConfigQuery } from '@/redux/features/config/configApi';
import { useAppSelector } from '@/redux/hooks/reduxHooks';
import { selectDnsConfigDetails } from '@/redux/slice/config/configSlice';
import ShowInConsole from '@/utils/ShowInConsole';
import { Slot, useRouter } from 'expo-router';
import { Activity, useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

const APP_LOADER_DURATION = 3000;

export default function AuthLayout() {
  const router = useRouter();
  const dnsData = useAppSelector(selectDnsConfigDetails);

  const domainName = process.env.EXPO_PUBLIC_DOMAIN_NAME as string;

  const [triggerDnsConfig, { isFetching, isLoading, isSuccess, isError, data }] = useLazyGetDnsConfigQuery();

  const [displayPageLoader, setDisplayPageLoader] = useState(true);
  const loaderCompletedRef = useRef(false);

  // ----------------------------------------
  // Fetch DNS configuration
  // ----------------------------------------
  useEffect(() => {
    if (!dnsData && !isError) {
      triggerDnsConfig({ domainName });
    }
  }, [dnsData, isError, triggerDnsConfig, domainName]);

  // ----------------------------------------
  // Complete loader
  // ----------------------------------------
  const completeLoader = useCallback(() => {
    if (loaderCompletedRef.current) return;

    loaderCompletedRef.current = true;
    setDisplayPageLoader(false);
  }, []);

  // ----------------------------------------
  // Hide loader after 3 seconds maximum,
  // or immediately when DNS data succeeds
  // ----------------------------------------
  useEffect(() => {
    if (!displayPageLoader) return;

    if (isSuccess && data && Object.keys(data).length > 0) {
      completeLoader();
      return;
    }

    const timer = setTimeout(() => {
      completeLoader();
    }, APP_LOADER_DURATION);

    return () => clearTimeout(timer);
  }, [displayPageLoader, isSuccess, data, completeLoader]);

  // ----------------------------------------
  // Handle DNS response and errors
  // ----------------------------------------
  useEffect(() => {
    if (__DEV__ && !isLoading && !isFetching && isSuccess) {
      ShowInConsole('DNS configuration:', data);
    }

    if (!isLoading && !isFetching && isError) {
      router.replace('/service-unavailable');
    }
  }, [isLoading, isFetching, isSuccess, isError, data, router]);

  // ----------------------------------------
  // Render
  // ----------------------------------------
  // return (
  //   <View style={{ flex: 1 }}>
  //     {/* Display Application Loader */}
  //     <Activity mode={displayPageLoader ? 'visible' : 'hidden'}>
  //       <ApplicationLoaderComponent />
  //     </Activity>

  //     {/* Display Auth Screens */}
  //     <Activity mode={!displayPageLoader ? 'visible' : 'hidden'}>
  //       <Slot />
  //     </Activity>
  //     {/* {!displayPageLoader && <Slot />} */}
  //   </View>
  // );
  return (
    <View className="flex-1 bg-[#0C1830]">
      <Activity mode={displayPageLoader ? "visible" : "hidden"}>
        <Animated.View
          key="application-loader"
          entering={FadeIn.duration(350)}
          exiting={FadeOut.duration(350)}
          className="absolute inset-0 z-[1000]"
        >
          <ApplicationLoaderComponent />
        </Animated.View>
      </Activity>

      <Activity mode={!displayPageLoader ? "visible" : "hidden"}>
        <Animated.View
          key="auth-screens"
          entering={FadeIn.duration(350)}
          className="flex-1 bg-[#f4f6fa]"
        >
          <Slot />
        </Animated.View>
      </Activity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C1830',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#f4f6fa',
  },
});