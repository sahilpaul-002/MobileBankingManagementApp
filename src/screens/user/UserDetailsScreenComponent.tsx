import CircleFadeLoaderComponent from '@/components/common/loaders/CircleFadeLoaderComponent';
import AddOnboardingDetailsModalComponent from '@/components/user/userDetails/AddOnboardingDetailsModalComponent';
import AddressDetailsComponent from '@/components/user/userDetails/AddressDetailsComponent';
import BankDetailsComponent from '@/components/user/userDetails/BankDetailsComponent';
import DetailsEmptyState from '@/components/user/userDetails/DetailsEmptyState';
import OnboardingDetailsEmptyState from '@/components/user/userDetails/OnboardingDetailsEmptyState';
import PersonalDetailsComponent from '@/components/user/userDetails/PersonalDetailsComponent';
import { useGetUserDetailsQuery, useGetUserOnboardingDetailsQuery } from '@/redux/features/user/userApis';
import { useappDispatchType, useAppSelector } from '@/redux/hooks/reduxHooks';
import { selectEmail } from '@/redux/slice/user/userSlice';
import { setShowInfoBanner } from '@/redux/slice/utility/utilitySlice';
import type { UserDetailsType, UserOnboardingDetailsType } from '@/types/user/userDetailsPageTypes';
import { isKybApproved } from '@/utils/kybHelper';
import ShowInConsole from '@/utils/ShowInConsole';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

type TabId = 'personal' | 'address' | 'bank';

const TABS: { id: TabId; label: string }[] = [
    { id: 'personal', label: 'Personal' },
    { id: 'address', label: 'Address' },
    { id: 'bank', label: 'Bank' },
];

export default function UserDetailsScreenComponent() {
    const dispatch = useappDispatchType();
    const reduxEmail = useAppSelector(selectEmail);

    const [userEmail, setUserEmail] = useState<string | null>(reduxEmail || null);
    const [isSessionLoaded, setIsSessionLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const loadSession = async () => {
            try {
                const storedItems = await AsyncStorage.multiGet([
                    'userEmail',
                    'userId',
                    'cardholderId',
                ]);
                const storedMap = Object.fromEntries(storedItems);
                const email = storedMap.userEmail || reduxEmail || null;
                const uid = storedMap.userId || null;
                const cid = storedMap.cardholderId || null;

                if (isMounted) {
                    setUserEmail(email);
                    setIsSessionLoaded(true);

                    if (!email || !uid || !cid) {
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

    // -------------------------------- User Details / User Onboarding Details Api -------------------------------- \\
    // Get User Details API
    const {data: getUserData, isLoading: getUserDetailsIsLoading, isFetching: getUserDetailsIsFetching, refetch: refetchGetUserDetails} = useGetUserDetailsQuery({ email: userEmail! }, { skip: !userEmail });
    const userDetails = getUserData?.data as UserDetailsType | undefined;

    // Get User Onboarding Details API
    const {data: getOnboardingData, isLoading: getOnboardingDetailsIsLoading, isFetching: getOnboardingDetailsIsFetching, isError: getOnboardingDetailsIsError, error: getOnboardingDetailsError, refetch: refetchGetOnboardingDetails} = useGetUserOnboardingDetailsQuery({ email: userEmail! }, { skip: !userEmail });

    const userOnboardingDetails = getOnboardingData?.data as UserOnboardingDetailsType | undefined;
    const addressDetails = userOnboardingDetails?.addressDetails;
    const bankDetails = userOnboardingDetails?.bankDetails;

    // Detect Onboarding details not found
    const isOnboardingDetailsNotFound =
        getOnboardingDetailsIsError &&
        getOnboardingDetailsError &&
        'status' in getOnboardingDetailsError &&
        getOnboardingDetailsError.status === 404;

    const kybApproved = isKybApproved(getOnboardingData?.data);

    useEffect(() => {
        if (userDetails) {
            ShowInConsole('User details:', userDetails);
        }
    }, [userDetails]);

    useEffect(() => {
        if (userOnboardingDetails) {
            ShowInConsole('User onboarding details:', userOnboardingDetails);
        }
    }, [userOnboardingDetails]);

    // --------------------------- Sub-tabs & Modal state --------------------------- \\
    const [activeTab, setActiveTab] = useState<TabId>('personal');
    const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

    // Pull to refresh
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                refetchGetUserDetails(),
                refetchGetOnboardingDetails(),
            ]);
        } catch {
            // Handled by queries
        } finally {
            setRefreshing(false);
        }
    }, [refetchGetUserDetails, refetchGetOnboardingDetails]);

    // -------------------------------- Page Loader State -------------------------------- \\
    // const showUserDetailsPageLoader = getOnboardingDetailsIsFetching || getUserDetailsIsFetching
    const showUserDetailsPageLoader =
        !isSessionLoaded ||
        getUserDetailsIsLoading ||
        getOnboardingDetailsIsLoading ||
        (!refreshing &&
            (getUserDetailsIsFetching || getOnboardingDetailsIsFetching) &&
            !userDetails &&
            !userOnboardingDetails &&
            !isOnboardingDetailsNotFound);
    // ------------------------------ XXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------------ \\

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
                {/* Page Loader State */}
                {showUserDetailsPageLoader ? (
                    <View className="w-full min-h-[300px] items-center justify-center">
                        <CircleFadeLoaderComponent size={42} color="#d49a4d" />
                    </View>
                ) : null}

                {/* Content */}
                {!showUserDetailsPageLoader ? (
                    <View className="w-full flex-col gap-4">
                        {isOnboardingDetailsNotFound ? (
                            <View className="w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-app-surface)] shadow-xs">
                                <OnboardingDetailsEmptyState
                                    onAddOnboarding={() => setIsOnboardingModalOpen(true)}
                                />
                            </View>
                        ) : (
                            <View className="w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-app-surface)] shadow-xs overflow-hidden">
                                {/* Sub Tab Bar */}
                                <View className="flex-row items-center border-b border-[var(--color-line)] bg-[var(--color-app-subtle)] px-2">
                                    {TABS.map((tab) => {
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <Pressable
                                                key={tab.id}
                                                onPress={() => setActiveTab(tab.id)}
                                                className={`flex-1 items-center justify-center py-3 border-b-2 ${
                                                    isActive
                                                        ? 'border-[var(--color-gold)] bg-[var(--color-app-surface)]'
                                                        : 'border-transparent'
                                                }`}
                                            >
                                                <Text
                                                    className={`text-xs font-bold tracking-wide ${
                                                        isActive
                                                            ? 'text-[var(--color-navy)]'
                                                            : 'text-[var(--color-ink-muted)]'
                                                    }`}
                                                >
                                                    {tab.label}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>

                                {/* Tab Panels */}
                                <View className="p-4 sm:p-6">
                                    {/* Personal Tab */}
                                    {activeTab === 'personal' ? (
                                        <View className="w-full">
                                            {getUserDetailsIsFetching ? (
                                                <View className="w-full py-10 items-center justify-center">
                                                    <CircleFadeLoaderComponent size={34} color="#d49a4d" />
                                                </View>
                                            ) : userDetails ? (
                                                <PersonalDetailsComponent
                                                    userDetails={userDetails}
                                                />
                                            ) : (
                                                <DetailsEmptyState type="personal" />
                                            )}
                                        </View>
                                    ) : null}

                                    {/* Address Tab */}
                                    {activeTab === 'address' ? (
                                        <View className="w-full">
                                            {getOnboardingDetailsIsFetching ? (
                                                <View className="w-full py-10 items-center justify-center">
                                                    <CircleFadeLoaderComponent size={34} color="#d49a4d" />
                                                </View>
                                            ) : addressDetails && bankDetails ? (
                                                <AddressDetailsComponent
                                                    addressDetails={addressDetails}
                                                    bankDetails={bankDetails}
                                                    kybApproved={kybApproved}
                                                    userEmail={userEmail!}
                                                />
                                            ) : (
                                                <DetailsEmptyState type="address" />
                                            )}
                                        </View>
                                    ) : null}

                                    {/* Bank Tab */}
                                    {activeTab === 'bank' ? (
                                        <View className="w-full">
                                            {getOnboardingDetailsIsFetching ? (
                                                <View className="w-full py-10 items-center justify-center">
                                                    <CircleFadeLoaderComponent size={34} color="#d49a4d" />
                                                </View>
                                            ) : bankDetails && addressDetails ? (
                                                <BankDetailsComponent
                                                    bankDetails={bankDetails}
                                                    addressDetails={addressDetails}
                                                    kybApproved={kybApproved}
                                                    userEmail={userEmail!}
                                                />
                                            ) : (
                                                <DetailsEmptyState type="bank" />
                                            )}
                                        </View>
                                    ) : null}
                                </View>
                            </View>
                        )}
                    </View>
                ) : null}
            </ScrollView>

            {/* Add Onboarding Details Modal */}
            <AddOnboardingDetailsModalComponent
                isOpen={isOnboardingModalOpen}
                onClose={() => setIsOnboardingModalOpen(false)}
                userEmail={userEmail}
            />
        </View>
    );
}
