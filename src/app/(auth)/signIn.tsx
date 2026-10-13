import { router } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function SignIn() {
  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        backgroundColor: '#0C1830',
      }}
    >
      <Text style={{ color: '#FFFFFF' }}>
        Sign In
      </Text>

      <Button
        title="Dashboard"
        onPress={() => router.push('/dashboard')}
      />
    </View>
  );
}