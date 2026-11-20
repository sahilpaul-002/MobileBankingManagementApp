import { View } from 'react-native';
import { CircleFade } from 'react-native-animated-spinkit';

interface CircleFadeLoaderComponentProps {
    size?: number;
    color?: string;
    containerClassName?: string;
}

export default function CircleFadeLoaderComponent({
    size = 36,
    color = '#d49a4d',
    containerClassName = 'w-full py-8 items-center justify-center',
}: CircleFadeLoaderComponentProps) {
    return (
        <View className={containerClassName}>
            <CircleFade size={size} color={color} />
        </View>
    );
}
