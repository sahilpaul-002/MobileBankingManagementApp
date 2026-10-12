import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { Slot } from 'expo-router';

export default function AppLayout() {
    const colorScheme = useColorScheme();
    return (
        <>
            <AnimatedSplashOverlay />
            <Slot />
            <AppTabs />
        </>
    );
}