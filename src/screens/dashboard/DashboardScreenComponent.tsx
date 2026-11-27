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
import { selectIsLoggingOut } from '@/redux/slice/appSession/appSessionSlice';
import {
  selectCardholderId,
  selectEmail,
  selectIsAdmin,
  selectIsMasterAdmin,
  selectUserId,
  selectWalletId,
  setWalletId,
} from '@/redux/slice/user/userSlice';
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
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, RefreshControl, ScrollView, View } from 'react-native';

export default function DashboardScreenComponent() {
  const router = useRouter();
  const dispatch = useappDispatchType();

  const isAdmin = useAppSelector(selectIsAdmin);
  const isMasterAdmin = useAppSelector(selectIsMasterAdmin);
  const canAccessAdminFeatures = isAdmin || isMasterAdmin;
  const isLoggingOut = useAppSelector(selectIsLoggingOut);

  // Runtime User Session from Redux
  const userEmail = useAppSelector(selectEmail);
  const userId = useAppSelector(selectUserId);
  const userCardholderId = useAppSelector(selectCardholderId);
  const userWalletId = useAppSelector(selectWalletId);

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

  // Validate session presence
  useEffect(() => {
    if (!isLoggingOut && (!userEmail || !userId || !userCardholderId)) {
      dispatch(
        setShowInfoBanner(
          'Application facing issue, necessary user details not present in session. Please re-login.'
        )
      );
    }
  }, [dispatch, isLoggingOut, userEmail, userId, userCardholderId]);
  // ------------------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------------- \\

  // ---------------------------------- Get DNS Data ---------------------------------- \\
  const dnsData = useAppSelector(selectDnsConfigDetails);
  const domainName = process.env.EXPO_PUBLIC_DOMAIN_NAME as string;
  const [triggerDnsConfig, { isFetching: isDnsFetching }] = useLazyGetDnsConfigQuery();

  useEffect(() => {
    if (!dnsData && !isDnsFetching && domainName && !isLoggingOut) {
      triggerDnsConfig({ domainName });
    }
  }, [dnsData, isDnsFetching, triggerDnsConfig, domainName, isLoggingOut]);
  // -------------------------------- XXXXXXXXXXXXXXXXXXXXXXXX -------------------------------- \\

  // ----------------------------------- KYC / KYB Verification Status ----------------------------------- \\
  // Get KYC Details API
  const { data: getKycData, isLoading: getKycDetailsIsLoading, isError: getKycDetailsIsError, error: getKycDetailsError, isSuccess: getKycDetailsIsSuccess, refetch: refetchGetKycDetails } = useGetKycDetailsQuery({ email: userEmail! }, { skip: !userEmail || isLoggingOut });

  const userKycDetails = getKycData?.data as Record<string, any> | undefined;
  const isKycNotFound =
    getKycDetailsIsError &&
    getKycDetailsError &&
    'status' in getKycDetailsError &&
    getKycDetailsError.status === 404;

  // Get KYB Details API
  const { data: getOnboardingData, isLoading: getOnboardingDetailsLoading, isError: getOnboardingDetailsIsError, error: getOnboardingDetailsError, isSuccess: getOnboardingDetailsIsSuccess, refetch: refetchGetOnboardingDetails } = useGetUserOnboardingDetailsQuery({ email: userEmail! }, { skip: !userEmail || isLoggingOut });

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
    !getOnboardingDetailsIsError &&
    !isLoggingOut;

  const shouldFetchDependentApis = verificationApisCompleted;

  useEffect(() => {
    if (!isLoggingOut) {
      ShowInConsole('User kyc details', userKycDetails);
    }
  }, [userKycDetails, isLoggingOut]);

  useEffect(() => {
    if (!isLoggingOut) {
      ShowInConsole('User onboarding details', userOnboardingDetails);
    }
  }, [userOnboardingDetails, isLoggingOut]);
  // -------------------------------- XXXXXXXXXXXXXXXXX -------------------------------- \\

  // -------------------------------- All Wallets Balances -------------------------------- \\
  const { data: getAllWalletsBalancesData, isError: getAllWalletsBalancesIsError, error: getAllWalletsBalancesError, isSuccess: getAllWalletsBalancesIsSuccess, refetch: refetchGetAllWalletsBalances } = useGetAllWalletBalancesQuery({ email: userEmail!, cardholderId: userCardholderId! }, { skip: !userEmail || !userCardholderId || !shouldFetchDependentApis || isLoggingOut, refetchOnMountOrArgChange: true });

  const userAllWalletsBalances = (getAllWalletsBalancesData?.data as AllWalletBalancesResponseDataType | undefined) ?? [];
  const fetchedWalletId = (getAllWalletsBalancesData?.data as AllWalletBalancesResponseDataType | undefined)?.walletId;

  // Set user wallet id in expo secure store and Redux
  useEffect(() => {
    if (getAllWalletsBalancesIsSuccess && fetchedWalletId && !isLoggingOut) {
      AsyncStorage.setItem('userWalletId', fetchedWalletId);
      dispatch(setWalletId(fetchedWalletId));
    }
  }, [getAllWalletsBalancesIsSuccess, fetchedWalletId, dispatch, isLoggingOut]);

  const isAllWalletsBalancesNotFound =
    getAllWalletsBalancesIsError &&
    getAllWalletsBalancesError != null &&
    'status' in getAllWalletsBalancesError &&
    getAllWalletsBalancesError.status === 404;
  // --------------------------------- XXXXXXXXXXXXXXXXXXXXXX --------------------------------- \\

  // -------------------------------- Cards List -------------------------------- \\
  const shouldFetchTopSpendingCardsList = shouldFetchDependentApis && getAllWalletsBalancesIsSuccess && !!userCardholderId && !isLoggingOut;

  const { data: getTopSpendingCardsData, isError: getTopSpendingCardsIsError, error: getTopSpendingCardsError, refetch: refetchTopSpendingCards } = useGetTopSpendingCardsQuery({ email: userEmail!, cardholderId: userCardholderId! }, { skip: !userEmail || !userCardholderId || !shouldFetchTopSpendingCardsList || isLoggingOut, refetchOnMountOrArgChange: true });

  const topSpendingCardsResponseData = getTopSpendingCardsData?.data as TopSpendingCardsResponseDataType | undefined;
  const topSpendingCardsList = topSpendingCardsResponseData?.cards ?? [];

  const isTopSpendingCardsNotFound =
    getTopSpendingCardsIsError &&
    getTopSpendingCardsError != null &&
    'status' in getTopSpendingCardsError &&
    getTopSpendingCardsError.status === 404;
  // ------------------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------------- \\

  // -------------------------------- Wallet Transactions -------------------------------- \\
  const activeWalletId = fetchedWalletId || userWalletId;
  const shouldFetchWalletTransactions = shouldFetchDependentApis && getAllWalletsBalancesIsSuccess && !!activeWalletId && !isLoggingOut;

  const { data: getWalletTransactionsData, isError: getWalletTransactionsIsError, error: getWalletTransactionsError, refetch: refetchWalletTransactions } = useGetWalletTransactionsQuery({ email: userEmail!, cardholderId: userCardholderId!, walletId: activeWalletId!, pageNumber: 1, pageSize: 7 }, { skip: !userEmail || !userCardholderId || !activeWalletId || !shouldFetchWalletTransactions || isLoggingOut, refetchOnMountOrArgChange: true });

  const userWalletTransactions = (getWalletTransactionsData?.data as WalletTransactionsListResponseDataType | undefined) ?? [];

  const isWalletTransactionsNotFound =
    getWalletTransactionsIsError &&
    getWalletTransactionsError != null &&
    'status' in getWalletTransactionsError &&
    getWalletTransactionsError.status === 404;
  // ------------------------------------ XXXXXXXXXXXXXXXXXXXXXXXXX ------------------------------------ \\

  // -------------------------------- Failure & Loading Handling -------------------------------- \\
  const isInitialPageLoading = getKycDetailsIsLoading || getOnboardingDetailsLoading;

  const hasBlockingApiFailure = (getKycDetailsIsError && !isKycNotFound) || (getOnboardingDetailsIsError && !isOnboardingNotFound);

  const hasDashboardUiApiFailure = getAllWalletsBalancesIsError || getWalletTransactionsIsError;

  const canRenderDashboard = !isInitialPageLoading && !hasBlockingApiFailure && !isLoggingOut;
  const canAccessDashboard = kycApproved && kybApproved && !isLoggingOut;

  useEffect(() => {
    if (isLoggingOut) return;
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
  }, [hasBlockingApiFailure, hasDashboardUiApiFailure, dispatch, isLoggingOut]);

  const handleRetryFailedRequests = useCallback(() => {
    if (isLoggingOut) return;
    if (getKycDetailsIsError) refetchGetKycDetails();
    if (getOnboardingDetailsIsError) refetchGetOnboardingDetails();
    if (getAllWalletsBalancesIsError) refetchGetAllWalletsBalances();
    if (getWalletTransactionsIsError) refetchWalletTransactions();
  }, [
    isLoggingOut,
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
    if (isLoggingOut) return;
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
    isLoggingOut,
    refetchGetKycDetails,
    refetchGetOnboardingDetails,
    refetchGetAllWalletsBalances,
    refetchTopSpendingCards,
    refetchWalletTransactions,
  ]);

  if (isLoggingOut) {
    return <View className="flex-1 w-full bg-[var(--color-app)]" />;
  }

  return (
    <View className="flex-1 w-full bg-[var(--color-app)]">
      {/* Initial Page Loading Skeleton */}
      {isInitialPageLoading ? (
        <View className="flex-1 w-full">
          <DashboardLoaderComponent />
        </View>
      ) : null}

      {/* Blocking Fallback Dialog */}
      {!isInitialPageLoading && hasBlockingApiFailure ? (
        <View className="flex-1 w-full">
          <RefreshPageFallbackComponent
            visible={!isInitialPageLoading && hasBlockingApiFailure}
            onRetry={handleRetryFailedRequests}
            isLoading={getKycDetailsIsLoading || getOnboardingDetailsLoading}
          />
        </View>
      ) : null}

      {/* Main Dashboard Screen View */}
      {canRenderDashboard ? (
        <View className="flex-1 w-full">
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
            {!canAccessDashboard ? (
              <View className="w-full">
                {!kycApproved ? (
                  <View className="w-full">
                    <VerificationRequiredBannerComponent
                      title="User Details Verification Required"
                      description="Your user details verification is incomplete. Please complete your verification to access financial features such as Accounts, Stablecoins, Payables, Cards, and Transfers."
                      buttonText="Complete User Verification"
                      onAction={() => router.push(ROUTE_NAMES.USER.VERIFICATION as any)}
                    />
                  </View>
                ) : null}

                {!kybApproved ? (
                  <View className="w-full">
                    <VerificationRequiredBannerComponent
                      title="User Bank Details Verification Required"
                      description="Your bank details verification is incomplete. Please complete your bank details verification to access financial features such as Accounts, Stablecoins, Payables, Cards, and Transfers."
                      buttonText="Complete Bank Details Verification"
                      onAction={() => router.push(ROUTE_NAMES.USER.INDEX as any)}
                    />
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* Dashboard Main Content Sections */}
            {canAccessDashboard ? (
              <View className="w-full flex-col gap-5">
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
                  userId={userId}
                />

                {/* Recent Transactions Section */}
                <RecentTransactionsSection
                  walletTransactions={userWalletTransactions}
                  walletTransactionsNotFound={isWalletTransactionsNotFound}
                />
              </View>
            ) : null}
          </ScrollView>
        </View>
      ) : null}

      {/* Logout Confirmation Modal (triggered by mobile hardware back button) */}
      <LogoutConfirmationModalComponent
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </View>
  );
}
