import DashboardLoaderComponent from '@/components/common/loaders/DashboardLoaderComponent';
import LogoutConfirmationModalComponent from '@/components/common/LogoutConfirmationModalComponent';
import RefreshPageFallbackComponent from '@/components/common/RefreshPageFallbackComponent';
import ExpenditureChartSection from '@/components/dashboard/expenditure/ExpenditureChartSection';
import DashboardHeaderComponent from '@/components/dashboard/header/DashboardHeaderComponent';
import RecentTransactionsSection from '@/components/dashboard/recentTransactions/RecentTransactionsSection';
import TopCardsSection from '@/components/dashboard/topSpendingCards/TopCardsSection';
import VerificationRequiredBannerComponent from '@/components/dashboard/verification/VerificationRequiredBannerComponent';
import WalletBalanceSection from '@/components/dashboard/walletBalance/WalletBalanceSection';
import { useGetTopSpendingCardsQuery } from '@/redux/features/card/cardApi';
import { useLazyGetDnsConfigQuery } from '@/redux/features/config/configApi';
import { useGetKycDetailsQuery } from '@/redux/features/kyc/kycApis';
import { useGetUserOnboardingDetailsQuery } from '@/redux/features/user/userApis';
import { useGetAllWalletBalancesQuery, useGetWalletTransactionsQuery } from '@/redux/features/wallet/walletApis';
import { useappDispatchType, useAppSelector } from '@/redux/hooks/reduxHooks';
import { selectDnsConfigDetails } from '@/redux/slice/config/configSlice';
import { selectEmail, selectIsAdmin, selectIsMasterAdmin } from '@/redux/slice/user/userSlice';
import { setShowInfoBanner } from '@/redux/slice/utility/utilitySlice';
import { ROUTE_NAMES } from '@/routes/routeNames';
import type { AllWalletBalancesResponseDataType } from '@/types/dashboard/allWalletsBalancesSectionTypes';
import type { TopSpendingCardsResponseDataType } from '@/types/dashboard/topSpendingCardsTypes';
import type { WalletTransactionsListResponseDataType } from '@/types/dashboard/walletTransactionsSectionTypes';
import { isKybApproved } from '@/utils/kybHelper';
import { isKycApproved } from '@/utils/kycHelper';
import ShowInConsole from '@/utils/ShowInConsole';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { Activity, useCallback, useEffect, useState } from 'react';
import { BackHandler, RefreshControl, ScrollView, View } from 'react-native';

export default function DashboardScreenComponent() {
  const router = useRouter();
  const dispatch = useappDispatchType();

  const isAdmin = useAppSelector(selectIsAdmin);
  const isMasterAdmin = useAppSelector(selectIsMasterAdmin);
  const canAccessAdminFeatures = isAdmin || isMasterAdmin;
  const reduxEmail = useAppSelector(selectEmail);

  // ------------------------------- LOGOUT CONFIRMATION MODAL & BACK HANDLER ---------------------------------- \\
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Intercept hardware/mobile back button on Dashboard to prompt logout confirmation
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        setShowLogoutModal(true);
        return true; // Prevents default hardware back navigation
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, []),
  );

  // ------------------------------- GET CREDENTIALS FROM ASYNC STORAGE ---------------------------------- \\
  const [userSession, setUserSession] = useState<{
    email: string | null;
    userId: string | null;
    cardholderId: string | null;
    walletId: string | null;
  }>({
    email: null,
    userId: null,
    cardholderId: null,
    walletId: null,
  });
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadSession = async () => {
      try {
        const storedItems = await AsyncStorage.multiGet([
          'userEmail',
          'userId',
          'cardholderId',
          'userWalletId',
        ]);
        const storedMap = Object.fromEntries(storedItems);
        const email = storedMap.userEmail || reduxEmail || null;
        const userId = storedMap.userId || null;
        const cardholderId = storedMap.cardholderId || null;
        const walletId = storedMap.userWalletId || null;

        if (isMounted) {
          setUserSession({
            email,
            userId,
            cardholderId,
            walletId,
          });
          setIsSessionLoaded(true);

          if (!email || !userId || !cardholderId) {
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
          dispatch(
            setShowInfoBanner(
              'Failed to read user session details. Please re-login.'
            )
          );
        }
      }
    };

    loadSession();
    return () => {
      isMounted = false;
    };
  }, [dispatch, reduxEmail]);

  const userEmail = userSession.email;
  const userCardholderId = userSession.cardholderId;
  // ------------------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------------- \\

  // ---------------------------------- Get DNS Data ---------------------------------- \\
  const dnsData = useAppSelector(selectDnsConfigDetails);
  const domainName = process.env.EXPO_PUBLIC_DOMAIN_NAME as string;
  const [triggerDnsConfig, { isFetching: isDnsFetching }] = useLazyGetDnsConfigQuery();

  useEffect(() => {
    if (!dnsData && !isDnsFetching && domainName) {
      triggerDnsConfig({ domainName });
    }
  }, [dnsData, isDnsFetching, triggerDnsConfig, domainName]);
  // -------------------------------- XXXXXXXXXXXXXXXXXXXXXXXX -------------------------------- \\

  // ----------------------------------- KYC / KYB Verification Status ----------------------------------- \\
  // Get KYC Details API
  const { data: getKycData, isLoading: getKycDetailsIsLoading, isError: getKycDetailsIsError, error: getKycDetailsError, isSuccess: getKycDetailsIsSuccess, refetch: refetchGetKycDetails } = useGetKycDetailsQuery({ email: userEmail! }, { skip: !userEmail });

  const userKycDetails = getKycData?.data as Record<string, any> | undefined;
  const isKycNotFound =
    getKycDetailsIsError &&
    getKycDetailsError &&
    'status' in getKycDetailsError &&
    getKycDetailsError.status === 404;

  // Get KYB Details API
  const { data: getOnboardingData, isLoading: getOnboardingDetailsLoading, isError: getOnboardingDetailsIsError, error: getOnboardingDetailsError, isSuccess: getOnboardingDetailsIsSuccess, refetch: refetchGetOnboardingDetails } = useGetUserOnboardingDetailsQuery({ email: userEmail! }, { skip: !userEmail });

  const userOnboardingDetails = getOnboardingData?.data as Record<string, any> | undefined;
  const isOnboardingNotFound =
    getOnboardingDetailsIsError &&
    getOnboardingDetailsError &&
    'status' in getOnboardingDetailsError &&
    getOnboardingDetailsError.status === 404;

  const kycApproved = isKycApproved(getKycData?.data);
  const kybApproved = isKybApproved(getOnboardingData?.data);

  const verificationApisCompleted =
    !!userEmail &&
    !!userKycDetails &&
    !!userOnboardingDetails &&
    getKycDetailsIsSuccess &&
    getOnboardingDetailsIsSuccess &&
    !getKycDetailsIsError &&
    !getOnboardingDetailsIsError;

  const shouldFetchDependentApis = verificationApisCompleted;

  useEffect(() => {
    ShowInConsole('User kyc details', userKycDetails);
  }, [userKycDetails]);

  useEffect(() => {
    ShowInConsole('User onboarding details', userOnboardingDetails);
  }, [userOnboardingDetails]);
  // -------------------------------- XXXXXXXXXXXXXXXXX -------------------------------- \\

  // -------------------------------- All Wallets Balances -------------------------------- \\
  const { data: getAllWalletsBalancesData, isError: getAllWalletsBalancesIsError, error: getAllWalletsBalancesError, isSuccess: getAllWalletsBalancesIsSuccess, refetch: refetchGetAllWalletsBalances } = useGetAllWalletBalancesQuery({ email: userEmail!, cardholderId: userCardholderId! }, { skip: !userEmail || !userCardholderId || !shouldFetchDependentApis, refetchOnMountOrArgChange: true });

  const userAllWalletsBalances = (getAllWalletsBalancesData?.data as AllWalletBalancesResponseDataType | undefined) ?? [];
  const fetchedWalletId = (getAllWalletsBalancesData?.data as AllWalletBalancesResponseDataType | undefined)?.walletId;

  // Set user wallet id in expo secure store
  useEffect(() => {
    if (getAllWalletsBalancesIsSuccess && fetchedWalletId) {
      AsyncStorage.setItem('userWalletId', fetchedWalletId);
    }
  }, [getAllWalletsBalancesIsSuccess, fetchedWalletId]);

  const isAllWalletsBalancesNotFound =
    getAllWalletsBalancesIsError &&
    getAllWalletsBalancesError != null &&
    'status' in getAllWalletsBalancesError &&
    getAllWalletsBalancesError.status === 404;
  // --------------------------------- XXXXXXXXXXXXXXXXXXXXXX --------------------------------- \\

  // -------------------------------- Cards List -------------------------------- \\
  const shouldFetchTopSpendingCardsList = shouldFetchDependentApis && getAllWalletsBalancesIsSuccess && !!userCardholderId;

  const { data: getTopSpendingCardsData, isError: getTopSpendingCardsIsError, error: getTopSpendingCardsError, refetch: refetchTopSpendingCards } = useGetTopSpendingCardsQuery({ email: userEmail!, cardholderId: userCardholderId! }, { skip: !userEmail || !userCardholderId || !shouldFetchTopSpendingCardsList, refetchOnMountOrArgChange: true });

  const topSpendingCardsResponseData = getTopSpendingCardsData?.data as TopSpendingCardsResponseDataType | undefined;
  const topSpendingCardsList = topSpendingCardsResponseData?.cards ?? [];

  const isTopSpendingCardsNotFound =
    getTopSpendingCardsIsError &&
    getTopSpendingCardsError != null &&
    'status' in getTopSpendingCardsError &&
    getTopSpendingCardsError.status === 404;
  // ------------------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------------- \\

  // -------------------------------- Wallet Transactions -------------------------------- \\
  const activeWalletId = fetchedWalletId || userSession.walletId;
  const shouldFetchWalletTransactions = shouldFetchDependentApis && getAllWalletsBalancesIsSuccess && !!activeWalletId;

  const { data: getWalletTransactionsData, isError: getWalletTransactionsIsError, error: getWalletTransactionsError, refetch: refetchWalletTransactions } = useGetWalletTransactionsQuery({ email: userEmail!, cardholderId: userCardholderId!, walletId: activeWalletId!, pageNumber: 1, pageSize: 7 }, { skip: !userEmail || !userCardholderId || !activeWalletId || !shouldFetchWalletTransactions, refetchOnMountOrArgChange: true });

  const userWalletTransactions = (getWalletTransactionsData?.data as WalletTransactionsListResponseDataType | undefined) ?? [];

  const isWalletTransactionsNotFound =
    getWalletTransactionsIsError &&
    getWalletTransactionsError != null &&
    'status' in getWalletTransactionsError &&
    getWalletTransactionsError.status === 404;
  // ------------------------------------ XXXXXXXXXXXXXXXXXXXXXXXXX ------------------------------------ \\

  // -------------------------------- Failure & Loading Handling -------------------------------- \\
  const isInitialPageLoading = !isSessionLoaded || getKycDetailsIsLoading || getOnboardingDetailsLoading;

  const hasBlockingApiFailure = (getKycDetailsIsError && !isKycNotFound) || (getOnboardingDetailsIsError && !isOnboardingNotFound);

  const hasDashboardUiApiFailure = getAllWalletsBalancesIsError || getWalletTransactionsIsError;

  const canRenderDashboard = !isInitialPageLoading && !hasBlockingApiFailure;
  const canAccessDashboard = kycApproved && kybApproved;

  useEffect(() => {
    if (hasBlockingApiFailure) {
      dispatch(
        setShowInfoBanner(
          'Application failed to fetch necessary details. Please try again later.'
        )
      );
    } else if (hasDashboardUiApiFailure) {
      dispatch(
        setShowInfoBanner('Some dashboard services are currently unavailable.')
      );
    }
  }, [hasBlockingApiFailure, hasDashboardUiApiFailure, dispatch]);

  const handleRetryFailedRequests = useCallback(() => {
    if (getKycDetailsIsError) refetchGetKycDetails();
    if (getOnboardingDetailsIsError) refetchGetOnboardingDetails();
    if (getAllWalletsBalancesIsError) refetchGetAllWalletsBalances();
    if (getWalletTransactionsIsError) refetchWalletTransactions();
  }, [
    getKycDetailsIsError,
    refetchGetKycDetails,
    getOnboardingDetailsIsError,
    refetchGetOnboardingDetails,
    getAllWalletsBalancesIsError,
    refetchGetAllWalletsBalances,
    getWalletTransactionsIsError,
    refetchWalletTransactions,
  ]);

  // Pull to refresh
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchGetKycDetails(),
        refetchGetOnboardingDetails(),
        refetchGetAllWalletsBalances(),
        refetchTopSpendingCards(),
        refetchWalletTransactions(),
      ]);
    } catch {
      // Handled by queries
    } finally {
      setRefreshing(false);
    }
  }, [
    refetchGetKycDetails,
    refetchGetOnboardingDetails,
    refetchGetAllWalletsBalances,
    refetchTopSpendingCards,
    refetchWalletTransactions,
  ]);

  return (
    <View className="flex-1 w-full bg-[var(--color-app)]">
      {/* Initial Page Loading Skeleton */}
      <Activity mode={isInitialPageLoading ? 'visible' : 'hidden'}>
        <View className={isInitialPageLoading ? 'flex-1 w-full' : 'hidden'}>
          <DashboardLoaderComponent />
        </View>
      </Activity>

      {/* Blocking Fallback Dialog */}
      <Activity
        mode={!isInitialPageLoading && hasBlockingApiFailure ? 'visible' : 'hidden'}
      >
        <View
          className={
            !isInitialPageLoading && hasBlockingApiFailure
              ? 'flex-1 w-full'
              : 'hidden'
          }
        >
          <RefreshPageFallbackComponent
            visible={!isInitialPageLoading && hasBlockingApiFailure}
            onRetry={handleRetryFailedRequests}
            isLoading={getKycDetailsIsLoading || getOnboardingDetailsLoading}
          />
        </View>
      </Activity>

      {/* Main Dashboard Screen View */}
      <Activity mode={canRenderDashboard ? 'visible' : 'hidden'}>
        <View className={canRenderDashboard ? 'flex-1 w-full' : 'hidden'}>
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
            {/* Header */}
            <DashboardHeaderComponent
              canAccessAdminFeatures={canAccessAdminFeatures}
            />

            {/* Verification Banners (if verification incomplete) */}
            <Activity mode={!canAccessDashboard ? 'visible' : 'hidden'}>
              <View className={!canAccessDashboard ? 'w-full' : 'hidden'}>
                <Activity mode={!kycApproved ? 'visible' : 'hidden'}>
                  <View className={!kycApproved ? 'w-full' : 'hidden'}>
                    <VerificationRequiredBannerComponent
                      title="User Details Verification Required"
                      description="Your user details verification is incomplete. Please complete your verification to access financial features such as Accounts, Stablecoins, Payables, Cards, and Transfers."
                      buttonText="Complete User Verification"
                      onAction={() => router.push(ROUTE_NAMES.USER.VERIFICATION as any)}
                    />
                  </View>
                </Activity>

                <Activity mode={!kybApproved ? 'visible' : 'hidden'}>
                  <View className={!kybApproved ? 'w-full' : 'hidden'}>
                    <VerificationRequiredBannerComponent
                      title="User Bank Details Verification Required"
                      description="Your bank details verification is incomplete. Please complete your bank details verification to access financial features such as Accounts, Stablecoins, Payables, Cards, and Transfers."
                      buttonText="Complete Bank Details Verification"
                      onAction={() => router.push(ROUTE_NAMES.USER.INDEX as any)}
                    />
                  </View>
                </Activity>
              </View>
            </Activity>

            {/* Dashboard Main Content Sections */}
            <Activity mode={canAccessDashboard ? 'visible' : 'hidden'}>
              <View className={canAccessDashboard ? 'w-full flex-col gap-5' : 'hidden'}>
                {/* Wallet Balance Section (with crypto balances) */}
                <WalletBalanceSection
                  walletsBalances={userAllWalletsBalances}
                  walletsBalancesNotFound={isAllWalletsBalancesNotFound}
                />

                {/* Top 3 Spending Cards Section */}
                <TopCardsSection
                  cardsList={topSpendingCardsList}
                  cardsListNotFound={isTopSpendingCardsNotFound}
                />

                {/* Expenditure Graph */}
                <ExpenditureChartSection
                  userEmail={userEmail}
                  userCardholderId={userCardholderId}
                  userId={userSession.userId}
                />

                {/* Recent Transactions Section */}
                <RecentTransactionsSection
                  walletTransactions={userWalletTransactions}
                  walletTransactionsNotFound={isWalletTransactionsNotFound}
                />
              </View>
            </Activity>
          </ScrollView>
        </View>
      </Activity>

      {/* Logout Confirmation Modal (triggered by mobile hardware back button) */}
      <LogoutConfirmationModalComponent
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </View>
  );
}
