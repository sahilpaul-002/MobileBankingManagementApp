import CustomButtonComponent from '@/components/common/CustomButtonComponent';
import CircleFadeLoaderComponent from '@/components/common/loaders/CircleFadeLoaderComponent';
import CryptoPrefundAccountsDetailsComponent from '@/components/user/userPrefundAccounts/CryptoPrefundAccountsDetailsComponent';
import FiatPrefundAccountDetailsComponent from '@/components/user/userPrefundAccounts/FiatPrefundAccountDetailsComponent';
import PrefundAccountsEmptyStateComponent from '@/components/user/userPrefundAccounts/PrefundAccountsEmptyStateComponent';
import PrefundAccountsTabsComponent from '@/components/user/userPrefundAccounts/PrefundAccountTabsComponent';
import { useGetUserPrefundAccountsDetailsQuery } from '@/redux/features/user/userApis';
import { useappDispatchType, useAppSelector } from '@/redux/hooks/reduxHooks';
import {
    selectEmail,
    selectIsAdmin,
    selectIsMasterAdmin,
} from '@/redux/slice/user/userSlice';
import { setShowInfoBanner } from '@/redux/slice/utility/utilitySlice';
import { ROUTE_NAMES } from '@/routes/routeNames';
import type { UserPrefundAccountsDetailsType } from '@/types/user/userPrefundAccountsDetailsTypes';
import ShowInConsole from '@/utils/ShowInConsole';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ShieldAlert } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';

type TabId = 'fiat' | 'crypto';

const TABS: { id: TabId; label: string }[] = [
    { id: 'fiat', label: 'Fiat Accounts' },
    { id: 'crypto', label: 'Crypto Accounts' },
];

export default function UserPrefundAccountsScreenComponent() {
    const router = useRouter();
    const dispatch = useappDispatchType();

    const isAdmin = useAppSelector(selectIsAdmin);
    const isMasterAdmin = useAppSelector(selectIsMasterAdmin);
    const isAuthorizedAdmin = isAdmin || isMasterAdmin;

    const reduxEmail = useAppSelector(selectEmail);
    const [userEmail, setUserEmail] = useState<string | null>(reduxEmail || null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isSessionLoaded, setIsSessionLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const loadSession = async () => {
            try {
                const storedItems = await AsyncStorage.multiGet([
                    'userEmail',
                    'userId',
                ]);
                const storedMap = Object.fromEntries(storedItems);
                const email = storedMap.userEmail || reduxEmail || null;
                const uid = storedMap.userId || null;

                if (isMounted) {
                    setUserEmail(email);
                    setUserId(uid);
                    setIsSessionLoaded(true);

                    if (!email || !uid) {
                        dispatch(
                            setShowInfoBanner(
                                'Application facing issue, necessary user details not present in session. Please re-login.'
                            )
                        );
                    }
                }
            } catch {
                if (isMounted) {
                    setIsSessionLoaded(true);
                }
            }
        };

        loadSession();
        return () => {
            isMounted = false;
        };
    }, [dispatch, reduxEmail]);

    // ── Get User Prefund Accounts Details ──────────────────────────────────────
    const {
        data: getPrefundAccountsData,
        isLoading: getPrefundAccountsDetailsIsLoading,
        isFetching: getPrefundAccountsDetailsIsFetching,
        isError: getPrefundAccountsDetailsIsError,
        error: getPrefundAccountsDetailsError,
        refetch: refetchPrefundAccounts,
    } = useGetUserPrefundAccountsDetailsQuery(
        { email: userEmail! },
        {
            skip: !userEmail || !userId || !isAuthorizedAdmin,
            refetchOnMountOrArgChange: true,
        }
    );

    const userPrefundAccountsDetails = getPrefundAccountsData?.data as
        | UserPrefundAccountsDetailsType
        | undefined;
    const userFiatDetails = userPrefundAccountsDetails?.fiat;
    const userCryptoDetails = userPrefundAccountsDetails?.crypto;

    // Detect prefund accounts not found error
    const userPrefundAccountsDetailsNotFound =
        getPrefundAccountsDetailsIsError &&
        getPrefundAccountsDetailsError &&
        'status' in getPrefundAccountsDetailsError &&
        getPrefundAccountsDetailsError.status === 404;

    useEffect(() => {
        if (userPrefundAccountsDetails) {
            ShowInConsole('User prefund accounts:', userPrefundAccountsDetails);
        }
    }, [userPrefundAccountsDetails]);

    // Active tab
    const [activeTab, setActiveTab] = useState<TabId>('fiat');

    // Pull to refresh
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(async () => {
        if (!isAuthorizedAdmin) return;
        setRefreshing(true);
        try {
            await refetchPrefundAccounts();
        } catch {
            // Handled
        } finally {
            setRefreshing(false);
        }
    }, [isAuthorizedAdmin, refetchPrefundAccounts]);

    // ── Prefund Accounts Page Loader State ─────────────────────────────────────
    const showPrefundingAccountsPageLoader =
        !isSessionLoaded ||
        (!refreshing && (getPrefundAccountsDetailsIsFetching || getPrefundAccountsDetailsIsLoading));

    // Non-admin restriction guard
    if (!isAuthorizedAdmin) {
        return (
            <View className="flex-1 w-full bg-[var(--color-app)] p-6 items-center justify-center">
                <View className="w-full max-w-sm rounded-2xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-6 items-center shadow-xs">
                    <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-[var(--color-status-danger-bg)] border border-[var(--color-status-danger)]/30">
                        <ShieldAlert size={28} color="#b03333" />
                    </View>

                    <Text className="text-center text-lg font-bold text-[var(--color-ink)]">
                        Admin Access Required
                    </Text>

                    <Text className="mt-2 text-center text-xs leading-5 text-[var(--color-ink-soft)]">
                        Treasury prefunding accounts and liquidity reserves are restricted to users with administrator privileges.
                    </Text>

                    <View className="mt-6 w-full">
                        <CustomButtonComponent
                            id="restricted-back-to-details"
                            label="Go to User Details"
                            variant="navy"
                            onPress={() => router.push(ROUTE_NAMES.USER.DETAILS as any)}
                        />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 w-full bg-[var(--color-app)]">
            <ScrollView
                className="flex-1 w-full px-4 py-4"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#d49a4d"
                        colors={['#d49a4d', '#0c1830']}
                    />
                }
            >
                {/* Page Loader */}
                {showPrefundingAccountsPageLoader ? (
                    <View className="w-full min-h-[300px] items-center justify-center">
                        <CircleFadeLoaderComponent size={40} color="#d49a4d" />
                    </View>
                ) : null}

                {/* Main Content */}
                {!showPrefundingAccountsPageLoader ? (
                    <View className="w-full flex-col gap-4">
                        {userPrefundAccountsDetailsNotFound ? (
                            <View className="w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-app-surface)] shadow-xs">
                                <PrefundAccountsEmptyStateComponent type="notFound" />
                            </View>
                        ) : (
                            <View className="w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-app-surface)] shadow-xs overflow-hidden">
                                {/* Tab Navigation */}
                                <PrefundAccountsTabsComponent
                                    tabs={TABS}
                                    activeTab={activeTab}
                                    onTabChange={setActiveTab}
                                    idPrefix="userPrefundingAccountsPage"
                                />

                                {/* Tab Content */}
                                <View className="p-4 sm:p-6">
                                    {activeTab === 'fiat' ? (
                                        <View className="w-full">
                                            {getPrefundAccountsDetailsIsFetching ? (
                                                <View className="w-full py-10 items-center justify-center">
                                                    <CircleFadeLoaderComponent size={32} color="#d49a4d" />
                                                </View>
                                            ) : (
                                                <FiatPrefundAccountDetailsComponent
                                                    fiatDetails={userFiatDetails}
                                                />
                                            )}
                                        </View>
                                    ) : null}

                                    {activeTab === 'crypto' ? (
                                        <View className="w-full">
                                            {getPrefundAccountsDetailsIsFetching ? (
                                                <View className="w-full py-10 items-center justify-center">
                                                    <CircleFadeLoaderComponent size={32} color="#d49a4d" />
                                                </View>
                                            ) : (
                                                <CryptoPrefundAccountsDetailsComponent
                                                    cryptoDetails={userCryptoDetails}
                                                />
                                            )}
                                        </View>
                                    ) : null}
                                </View>
                            </View>
                        )}
                    </View>
                ) : null}
            </ScrollView>
        </View>
    );
}
