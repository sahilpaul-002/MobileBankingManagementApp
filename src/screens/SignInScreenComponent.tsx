import { router } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function SignInScreenComponent() {
  return (
    <View className='w-full h-full'>
      <Text className='text-gray-400'>
        Sign In
      </Text>

      <Button
        title="Dashboard"
        onPress={() => router.push('/dashboard')}
      />
    </View>
  );
}