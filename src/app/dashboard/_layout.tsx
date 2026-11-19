import DashboardLayout from '@/layouts/DashboardLayout';
import { View } from 'react-native';

export default function DashBoardRootLayout() {
  return (
    <View className='flex-1'>
      <DashboardLayout />
    </View>
  );
}
