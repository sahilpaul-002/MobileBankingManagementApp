import { useColorScheme } from 'react-native';

import { Slot } from 'expo-router';

export default function AppLayout() {
    const colorScheme = useColorScheme();
    return (
        <>
            <Slot />
        </>
    );
}