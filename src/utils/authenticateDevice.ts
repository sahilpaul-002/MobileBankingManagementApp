
import * as LocalAuthentication from 'expo-local-authentication';

export async function authenticateDevice() {
    try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const enrolledLevel = await LocalAuthentication.getEnrolledLevelAsync();
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

        // ShowInConsole('DEVICE AUTHENTICATION CHECK:', {
        //     hasHardware,
        //     isEnrolled,
        //     enrolledLevel,
        //     supportedTypes,
        // });

        // Allow the native authentication API to determine whether device credential authentication is available.
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Unlock Banking Management',
            cancelLabel: 'Cancel',
            disableDeviceFallback: false,
        });

        return {
            success: result.success,
            reason: result.success ? null : result.error,
        };
    } catch (error) {
        // console.error('DEVICE AUTHENTICATION ERROR:', error);

        return {
            success: false,
            reason: 'UNKNOWN_ERROR',
        };
    }
}
