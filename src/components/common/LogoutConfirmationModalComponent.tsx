import CustomButtonComponent from '@/components/common/CustomButtonComponent';
import { useappDispatchType } from '@/redux/hooks/reduxHooks';
import { logoutUser } from '@/redux/thunks/userThunks';
import { ROUTE_NAMES } from '@/routes/routeNames';
import { useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

interface LogoutConfirmationModalComponentProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export default function LogoutConfirmationModalComponent({
  visible,
  onClose,
  title = 'Log Out',
  subtitle = 'Are you sure you want to log out of your account?',
}: LogoutConfirmationModalComponentProps) {
  const dispatch = useappDispatchType();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    onClose();
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      // Error handled within logout thunk
    } finally {
      setIsLoggingOut(false);
      router.replace(ROUTE_NAMES.INDEX as any);
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      statusBarTranslucent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-[#0c1830]/75 p-6"
        onPress={onClose}
      >
        <Pressable
          className="w-full max-w-[360px] items-center rounded-2xl border border-[#e6e8ee] bg-white p-6 shadow-xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Logout Icon Badge */}
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-[#fdf2f2] border border-[#fbd5d5]">
            <LogOut size={26} color="#b03333" />
          </View>

          {/* Title */}
          <Text className="mb-2 text-center text-lg font-bold text-[#0c1830]">
            {title}
          </Text>

          {/* Subtitle */}
          <Text className="mb-6 text-center text-sm leading-5 text-[#4a5673]">
            {subtitle}
          </Text>

          {/* Action Buttons */}
          <View className="w-full flex-row items-center gap-3">
            <View className="flex-1">
              <CustomButtonComponent
                id="cancel-logout-button"
                variant="outline"
                label="Cancel"
                disabled={isLoggingOut}
                buttonClassName="h-11 rounded-lg border-[#d2d6de]"
                labelClassName="text-sm font-semibold text-[#0c1830]"
                onPress={onClose}
              />
            </View>

            <View className="flex-1">
              <CustomButtonComponent
                id="confirm-logout-button"
                variant="destructive"
                label="Log Out"
                showButtonLoader={isLoggingOut}
                buttonClassName="h-11 rounded-lg bg-[#b03333]"
                labelClassName="text-sm font-semibold text-white"
                onPress={handleLogout}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
