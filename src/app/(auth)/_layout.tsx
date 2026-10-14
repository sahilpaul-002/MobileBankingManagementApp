import AuthLayout from '@/layouts/AuthLayout'
import { View } from 'react-native'

export default function AuthRootLayout() {
  return (
    <View className='w-full h-full'>
      <AuthLayout />
    </View>
  )
}