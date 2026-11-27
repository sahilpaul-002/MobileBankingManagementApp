import { useAppSelector } from '@/redux/hooks/reduxHooks';
import { selectEmail, selectIsAdmin, selectIsMasterAdmin } from '@/redux/slice/user/userSlice';
import { Power, Shield } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

interface CommonAppHeaderComponentProps {
    onPowerPress: () => void;
}

export default function CommonAppHeaderComponent({onPowerPress}: CommonAppHeaderComponentProps) {
    const reduxEmail = useAppSelector(selectEmail);
    const isAdmin = useAppSelector(selectIsAdmin);
    const isMasterAdmin = useAppSelector(selectIsMasterAdmin);

    const displayEmail = reduxEmail || 'user@example.com';
    const roleLabel = isMasterAdmin ? 'Master Admin' : isAdmin ? 'Admin' : 'Cardholder';

    return (
        <View className="w-full bg-[#0c1830] border-b border-[#16264a] px-4 py-3 shadow-md">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1 mr-3">
                    {/* <View className="h-10 w-10 items-center justify-center rounded-full bg-[#16264a] border border-[#d49a4d]/40 shadow-xs">
                        <Text className="text-base font-bold text-[#d49a4d]">
                            {initial}
                        </Text>
                    </View> */}

                    <View className="flex justify-center items-start gap-2">
                        <View className="mt-1 flex-row items-center">
                            <View className="flex-row items-center gap-1 rounded bg-[#16264a] px-2 py-0.5 border border-[#2b3e64]">
                                <Shield size={10} color="#d49a4d" />
                                <Text className="text-[10px] font-bold uppercase tracking-wider text-[#d49a4d]">
                                    {roleLabel}
                                </Text>
                            </View>
                        </View>

                        <Text
                            className="text-sm font-bold text-white tracking-tight"
                            numberOfLines={1}
                        >
                            {displayEmail}
                        </Text>
                    </View>
                </View>

                {/* Power / Log Out Button */}
                <Pressable
                    testID="app-header-power-button"
                    onPress={onPowerPress}
                    className="h-10 w-10 items-center justify-center rounded-xl bg-[#b03333]/20 border border-[#b03333]/40 active:bg-[#b03333]/40"
                    accessibilityLabel="Sign Out of Application"
                >
                    <Power size={18} color="#fca5a5" />
                </Pressable>
            </View>
        </View>
    );
}
