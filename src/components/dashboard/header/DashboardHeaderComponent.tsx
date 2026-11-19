import CustomButtonComponent from '@/components/common/CustomButtonComponent';
import { ROUTE_NAMES } from '@/routes/routeNames';
import { useRouter } from 'expo-router';
import { ArrowLeftRight, Send } from 'lucide-react-native';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

interface DashboardHeaderComponentProps {
  canAccessAdminFeatures?: boolean;
}

export default function DashboardHeaderComponent({
  canAccessAdminFeatures = false,
}: DashboardHeaderComponentProps) {
  const router = useRouter();

  // Dynamic greeting based on current local hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    }

    if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    }

    if (hour >= 17 && hour < 21) {
      return 'Good evening';
    }

    return 'Good night';
  }, []);

  return (
    <View className="mb-5 w-full flex-col gap-3">
      {/* Greeting and subtext */}
      <View className="w-full">
        <Text className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">
          {greeting}
        </Text>
        <Text className="mt-1 text-sm text-[var(--color-ink-soft)]">
          {"Here's where things stand across your treasury today."}
        </Text>
      </View>

      {/* Admin Action Buttons */}
      {canAccessAdminFeatures && (
        <View className="mt-1 flex-row items-center gap-3">
          <View className="flex-1">
            <CustomButtonComponent
              id="dashboard-convert-button"
              variant="navy"
              buttonClassName="w-full h-10 flex-row items-center justify-center gap-2 rounded-lg px-3"
              onPress={() => router.push(ROUTE_NAMES.WALLETS.CURRENCY_CONVERSION as any)}
            >
              <ArrowLeftRight size={16} color="#d49a4d" />
              <Text className="text-xs font-semibold text-white">Convert</Text>
            </CustomButtonComponent>
          </View>

          <View className="flex-1">
            <CustomButtonComponent
              id="dashboard-send-money-button"
              variant="navy"
              buttonClassName="w-full h-10 flex-row items-center justify-center gap-2 rounded-lg px-3"
              onPress={() => router.push(ROUTE_NAMES.WALLETS.INDEX as any)}
            >
              <Send size={15} color="#d49a4d" />
              <Text className="text-xs font-semibold text-white">Send money</Text>
            </CustomButtonComponent>
          </View>
        </View>
      )}
    </View>
  );
}
