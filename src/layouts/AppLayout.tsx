import { useColorScheme, View } from 'react-native';

import ToastMessagesComponent from '@/components/common/ToastMessagesComponent';
import { Slot } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AppLayout() {
    const colorScheme = useColorScheme();
    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: '#F4F6FA' }}
            edges={['top', 'left', 'right']}
        >
            <View style={{ flex: 1, backgroundColor: '#F4F6FA' }}>
                <ToastMessagesComponent />
                <Slot />
                {/* <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            /> */}
            </View>
        </SafeAreaView>
    );
}