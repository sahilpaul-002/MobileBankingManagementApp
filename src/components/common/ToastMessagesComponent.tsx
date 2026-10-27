import type { ComponentProps } from 'react';
import Toast from 'react-native-toast-message';

type ToastComponentProps = Partial<ComponentProps<typeof Toast>>;

type ToastShowOptions = NonNullable<Parameters<typeof Toast.show>[0]>;

const DEFAULT_TOAST_CONFIG = {
    type: 'success',
    position: 'bottom',
    visibilityTime: 4000,
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

export default function ToastMessagesComponent(
    props: ToastComponentProps,
) {
    return (
        <Toast
            {...DEFAULT_TOAST_CONFIG}
            {...props}
        />
    );
}

export function showToastMessage(options: ToastShowOptions = {}) {
    const type = options.type ?? 'success';

    const defaultText1 = DEFAULT_TOAST_TITLES[type] ?? `${type.charAt(0).toUpperCase()}${type.slice(1)}`;

    Toast.show({
        ...options,
        type,
        text1: options.text1 ?? defaultText1,
        position: options.position ?? 'top',
        visibilityTime: options.visibilityTime ?? 4000,
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