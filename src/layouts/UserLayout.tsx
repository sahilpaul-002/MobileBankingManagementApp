import { useAppSelector } from '@/redux/hooks/reduxHooks';
import { selectIsAdmin, selectIsMasterAdmin } from '@/redux/slice/user/userSlice';
import { ROUTE_NAMES } from '@/routes/routeNames';
import { Slot, usePathname, useRouter } from 'expo-router';
import { Landmark, ShieldCheck, UserRound } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

export default function UserLayout() {
    const router = useRouter();
    const pathname = usePathname();

    const isAdmin = useAppSelector(selectIsAdmin);
    const isMasterAdmin = useAppSelector(selectIsMasterAdmin);
    const isAuthorizedAdmin = isAdmin || isMasterAdmin;

    // Determine current active section
    const activeRouteKey = useMemo(() => {
        if (pathname.includes('/user/verification')) return 'verification';
        if (pathname.includes('/user/prefundAccounts')) return 'prefund';
        return 'details';
    }, [pathname]);

    const navItems = useMemo(() => {
        const items: {
            key: string;
            title: string;
            href: any;
            icon: any;
        }[] = [
            {
                key: 'details',
                title: 'User Details',
                href: ROUTE_NAMES.USER.DETAILS,
                icon: UserRound,
            },
            {
                key: 'verification',
                title: 'KYC Verification',
                href: ROUTE_NAMES.USER.VERIFICATION,
                icon: ShieldCheck,
            },
        ];

        if (isAuthorizedAdmin) {
            items.push({
                key: 'prefund',
                title: 'Prefund Accounts',
                href: ROUTE_NAMES.USER.PREFUND_ACCOUNTS,
                icon: Landmark,
            });
        }

        return items;
    }, [isAuthorizedAdmin]);

    return (
        <View className="flex-1 w-full bg-[var(--color-app)]">
            {/* ── TOP HORIZONTAL SEGMENTED SUB-NAV PILLS ── */}
            <View className="w-full bg-[#0c1830] px-4 pb-3 pt-1 border-b border-[#16264a]">
                <View className="flex-row items-center gap-1.5 rounded-xl bg-[#0a1428] p-1 border border-[#16264a]">
                    {navItems.map((item) => {
                        const isActive = activeRouteKey === item.key;
                        const Icon = item.icon;

                        return (
                            <Pressable
                                key={item.key}
                                testID={`user-subnav-${item.key}`}
                                onPress={() => router.push(item.href as any)}
                                className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2 px-1 ${
                                    isActive
                                        ? 'bg-[#16264a] border border-[#2e4270]'
                                        : 'active:bg-[#121f3a]'
                                }`}
                            >
                                <Icon
                                    size={13}
                                    color={isActive ? '#d49a4d' : '#8a93a8'}
                                />
                                <Text
                                    className={`text-xs font-bold ${
                                        isActive ? 'text-[#d49a4d]' : 'text-[#8a93a8]'
                                    }`}
                                    numberOfLines={1}
                                >
                                    {item.title}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {/* ── ACTIVE SCREEN VIEW ── */}
            <View className="flex-1 w-full bg-[var(--color-app)]">
                <Slot />
            </View>
        </View>
    );
}
