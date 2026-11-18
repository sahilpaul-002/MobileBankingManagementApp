// import type { ComponentProps } from 'react';
// import Toast from 'react-native-toast-message';

// type ToastComponentProps = Partial<ComponentProps<typeof Toast>>;

// type ToastShowOptions = NonNullable<Parameters<typeof Toast.show>[0]>;

// const DEFAULT_TOAST_CONFIG = {
//     type: 'success',
//     position: 'bottom',
//     visibilityTime: 4000,
//     autoHide: true,
//     swipeable: true,
//     topOffset: 40,
//     bottomOffset: 40,
//     keyboardOffset: 10,
//     animationConfig: {
//         type: 'spring',
//         friction: 8,
//     },
// } satisfies ToastComponentProps;

// const DEFAULT_TOAST_TITLES: Record<string, string> = {
//     success: 'Success',
//     error: 'Error',
//     info: 'Info',
// };

// export default function ToastMessagesComponent(
//     props: ToastComponentProps,
// ) {
//     return (
//         <Toast
//             {...DEFAULT_TOAST_CONFIG}
//             {...props}
//         />
//     );
// }

// export function showToastMessage(options: ToastShowOptions = {}) {
//     const type = options.type ?? 'success';

//     const defaultText1 = DEFAULT_TOAST_TITLES[type] ?? `${type.charAt(0).toUpperCase()}${type.slice(1)}`;

//     Toast.show({
//         ...options,
//         type,
//         text1: options.text1 ?? defaultText1,
//         position: options.position ?? 'top',
//         visibilityTime: options.visibilityTime ?? 4000,
//         autoHide: options.autoHide ?? true,
//         topOffset: options.topOffset ?? 40,
//         bottomOffset: options.bottomOffset ?? 40,
//         keyboardOffset: options.keyboardOffset ?? 10,
//         animationConfig: options.animationConfig ?? {
//             type: 'spring',
//             friction: 8,
//         },
//     });
// }

// export function hideToastMessage() {
//     Toast.hide();
// }



import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';
import Toast, {
    type ToastConfig,
} from 'react-native-toast-message';

type ToastComponentProps = Partial<ComponentProps<typeof Toast>>;

type ToastShowOptions = NonNullable<Parameters<typeof Toast.show>[0]>;

const DEFAULT_TOAST_CONFIG = {
    type: 'success',
    position: 'bottom',
    visibilityTime: 6000,
    autoHide: true,
    swipeable: true,
    topOffset: 40,
    bottomOffset: 40,
    keyboardOffset: 10,
    animationConfig: {
        type: 'spring',
        friction: 8,
    },
} satisfies ToastComponentProps;

const DEFAULT_TOAST_TITLES: Record<string, string> = {
    success: 'Success',
    error: 'Error',
    info: 'Info',
};

const toastConfig: ToastConfig = {
    success: ({ text1, text2 }) => (
        <View className="w-[92%] rounded-xl border border-emerald-300 bg-[#D1FAE5] p-4 shadow-md">
            {!!text1 && (
                <Text className="text-base font-bold text-emerald-950">
                    {text1}
                </Text>
            )}
            {!!text2 && (
                <Text className="mt-1 text-sm leading-5 text-emerald-900">
                    {text2}
                </Text>
            )}
        </View>
    ),

    error: ({ text1, text2 }) => (
        <View className="w-[92%] rounded-xl border border-rose-300 bg-[#FFE4E6] p-4 shadow-md">
            {!!text1 && (
                <Text className="text-base font-bold text-rose-950">
                    {text1}
                </Text>
            )}
            {!!text2 && (
                <Text className="mt-1 text-sm leading-5 text-rose-900">
                    {text2}
                </Text>
            )}
        </View>
    ),

    info: ({ text1, text2 }) => (
        <View className="w-[92%] rounded-xl border border-sky-300 bg-[#DBEAFE] p-4 shadow-md">
            {!!text1 && (
                <Text className="text-base font-bold text-sky-950">
                    {text1}
                </Text>
            )}
            {!!text2 && (
                <Text className="mt-1 text-sm leading-5 text-sky-900">
                    {text2}
                </Text>
            )}
        </View>
    ),
};

export default function ToastMessagesComponent(
    props: ToastComponentProps,
) {
    return (
        <Toast
            {...DEFAULT_TOAST_CONFIG}
            {...props}
            config={toastConfig}
        />
    );
}

export function showToastMessage(options: ToastShowOptions = {}) {
    const type = options.type ?? 'success';

    const defaultText1 =
        DEFAULT_TOAST_TITLES[type] ??
        `${type.charAt(0).toUpperCase()}${type.slice(1)}`;

    Toast.show({
        ...options,
        type,
        text1: options.text1 ?? defaultText1,
        position: options.position ?? 'top',
        visibilityTime: options.visibilityTime ?? 6000,
        autoHide: options.autoHide ?? true,
        topOffset: options.topOffset ?? 40,
        bottomOffset: options.bottomOffset ?? 40,
        keyboardOffset: options.keyboardOffset ?? 10,
        animationConfig: options.animationConfig ?? {
            type: 'spring',
            friction: 8,
        },
    });
}

export function hideToastMessage() {
    Toast.hide();
}
