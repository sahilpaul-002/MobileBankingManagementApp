import { router } from 'expo-router';
import { Text, View } from 'react-native';
import CustomButtonComponent from '@/components/common/CustomButtonComponent';

export default function SignInScreenComponent() {
  return (
    <View className='w-full h-full'>
      <Text className='text-gray-400'>
        Sign In
      </Text>

      <View className="mt-4 gap-3 px-4">
        <CustomButtonComponent
          id="signIn-dashboard-button"
          label="Dashboard"
          variant="navy"
          onPress={() => router.push('/dashboard')}
        />

        <CustomButtonComponent
          id="signIn-privacyPolicy-button"
          label="Privacy Policy"
          variant="outline"
          onPress={() => router.push('/privacy-policy')}
        />

        <CustomButtonComponent
          id="signIn-serviceUnavailable-button"
          label="Service Unavailable"
          variant="destructive"
          onPress={() => router.push('/service-unavailable')}
        />
      </View>
    </View>
  );
}