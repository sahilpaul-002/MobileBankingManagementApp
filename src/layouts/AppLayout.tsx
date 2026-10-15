import { View } from 'react-native';

import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppLayout() {
    const insets = useSafeAreaInsets();

    useEffect(() => {
        console.log('Safe area insets:', insets);
    }, [insets]);

    return (
        <SafeAreaView
            style={{ flex: 1 }}
            edges={['top', 'left', 'right']}
        >
            {/* <View className="absolute left-2 bottom-2 z-50 rounded bg-black p-2">
                <Text className="text-white">
                    Top: {insets.top} | Bottom: {insets.bottom}
                </Text>
            </View> */}

            <View className='w-full h-full'>
                {/* <Text className="text-black">Safe area content</Text> */}
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