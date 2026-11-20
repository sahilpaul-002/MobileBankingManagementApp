import CustomButtonComponent from '@/components/common/CustomButtonComponent';
import LogoutConfirmationModalComponent from '@/components/common/LogoutConfirmationModalComponent';
import { useAppSelector } from '@/redux/hooks/reduxHooks';
import { selectEmail, selectIsAdmin, selectIsMasterAdmin } from '@/redux/slice/user/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogOut, Mail, ShieldCheck, UserCheck, UserRound } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UserScreenComponent() {
  const insets = useSafeAreaInsets();
  const reduxEmail = useAppSelector(selectEmail);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isMasterAdmin = useAppSelector(selectIsMasterAdmin);

  const [storedEmail, setStoredEmail] = useState<string | null>(null);
  const [storedUserId, setStoredUserId] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchStorage = async () => {
      try {
        const storedItems = await AsyncStorage.multiGet(['userEmail', 'userId']);
        const storedMap = Object.fromEntries(storedItems);
        if (isMounted) {
          if (storedMap.userEmail) setStoredEmail(storedMap.userEmail);
          if (storedMap.userId) setStoredUserId(storedMap.userId);
        }
      } catch {
        // Ignored
      }
    };
    fetchStorage();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayEmail = reduxEmail || storedEmail || 'user@example.com';
  const roleLabel = isMasterAdmin ? 'Master Admin' : isAdmin ? 'Admin' : 'Cardholder';
  const initial = displayEmail.charAt(0).toUpperCase();

  return (
    <View className="flex-1 bg-[var(--color-app)]">
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top + 16, 24),
          paddingBottom: Math.max(insets.bottom + 24, 32),
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold tracking-tight text-[var(--color-navy)]">
            Account Profile
          </Text>
          <Text className="mt-1 text-sm text-[var(--color-ink-soft)]">
            Manage your account settings and session
          </Text>
        </View>

        {/* Profile Card */}
        <View className="mb-5 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[var(--color-navy)] shadow-sm">
              <Text className="text-2xl font-bold text-[var(--color-gold)]">
                {initial}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-base font-bold text-[var(--color-navy)]" numberOfLines={1}>
                {displayEmail}
              </Text>
              <View className="mt-1.5 flex-row items-center gap-2">
                <View className="rounded-full bg-[#fcf5eb] border border-[#f3d9b4] px-2.5 py-0.5">
                  <Text className="text-xs font-semibold text-[var(--color-gold)]">
                    {roleLabel}
                  </Text>
                </View>

                <View className="flex-row items-center gap-1 rounded-full bg-[#ebf7ee] border border-[#bde5c5] px-2.5 py-0.5">
                  <View className="h-1.5 w-1.5 rounded-full bg-[#2e7d32]" />
                  <Text className="text-xs font-medium text-[#2e7d32]">Active</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Account Details Card */}
        <View className="mb-6 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--color-ink-soft)]">
            Account Details
          </Text>

          <View className="flex-col divide-y divide-[#f0f2f6]">
            {/* Email Row */}
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center gap-3">
                <Mail size={18} color="#6b7a99" />
                <Text className="text-sm text-[var(--color-ink-soft)]">Email</Text>
              </View>
              <Text className="text-sm font-semibold text-[var(--color-navy)] max-w-[200px]" numberOfLines={1}>
                {displayEmail}
              </Text>
            </View>

            {/* Role Row */}
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center gap-3">
                <UserCheck size={18} color="#6b7a99" />
                <Text className="text-sm text-[var(--color-ink-soft)]">Role</Text>
              </View>
              <Text className="text-sm font-semibold text-[var(--color-navy)]">
                {roleLabel}
              </Text>
            </View>

            {/* Security Status */}
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center gap-3">
                <ShieldCheck size={18} color="#6b7a99" />
                <Text className="text-sm text-[var(--color-ink-soft)]">Security</Text>
              </View>
              <Text className="text-sm font-semibold text-[#2e7d32]">
                2FA Protected
              </Text>
            </View>
          </View>
        </View>

        {/* Log Out Button */}
        <View className="mt-2">
          <CustomButtonComponent
            id="user-profile-logout-button"
            variant="destructive"
            buttonClassName="h-12 w-full flex-row items-center justify-center gap-2 rounded-xl bg-[#b03333] active:bg-[#972b2b]"
            onPress={() => setShowLogoutModal(true)}
          >
            <LogOut size={18} color="#ffffff" />
            <Text className="text-sm font-bold text-white">Log Out</Text>
          </CustomButtonComponent>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModalComponent
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </View>
  );
}
