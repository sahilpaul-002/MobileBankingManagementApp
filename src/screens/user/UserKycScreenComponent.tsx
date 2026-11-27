import CircleFadeLoaderComponent from "@/components/common/loaders/CircleFadeLoaderComponent";
import KycNotAvailableComponent from "@/components/user/userVerification/KycNotAvailableComponent";
import KycStatusComponent from "@/components/user/userVerification/KycStatusComponent";
import KycUploadModalComponent from "@/components/user/userVerification/KycUploadModalComponent";
import { useGetKycDetailsQuery } from "@/redux/features/kyc/kycApis";
import { useappDispatchType, useAppSelector } from "@/redux/hooks/reduxHooks";
import { selectIsLoggingOut } from "@/redux/slice/appSession/appSessionSlice";
import { selectEmail, selectUserId } from "@/redux/slice/user/userSlice";
import { setShowInfoBanner } from "@/redux/slice/utility/utilitySlice";
import type { KycStatusDataType } from "@/types/user/userVerificationPageTypes";
import ShowInConsole from "@/utils/ShowInConsole";
import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

export default function UserKycScreenComponent() {
  const dispatch = useappDispatchType();

  // Runtime user session from Redux
  const userEmail = useAppSelector(selectEmail);
  const userId = useAppSelector(selectUserId);
  const isLoggingOut = useAppSelector(selectIsLoggingOut);

  // Validate session presence
  useEffect(() => {
    if (!isLoggingOut && (!userEmail || !userId)) {
      dispatch(
        setShowInfoBanner(
          "Application facing issue, necessary user details not present in session. Please re-login.",
        ),
      );
    }
  }, [dispatch, isLoggingOut, userEmail, userId]);

  // ---------------------- Get KYC Verification Status Api ---------------------- \\
  // Get Kyc Status Api Mutation
  const {
    data: getKycData,
    isLoading: getKycDetailsIsLoading,
    isFetching: getKycDetailsIsFetching,
    isError: getKycDetailsIsError,
    error: getKycDetailsError,
    refetch: refetchGetKycDetails,
  } = useGetKycDetailsQuery({ email: userEmail! }, { skip: !userEmail || isLoggingOut });

  const userKycDetails = getKycData?.data as Record<string, any> | undefined;
  const userKycStatusData: KycStatusDataType = {
    email: userKycDetails?.email ?? userEmail ?? "",
    kyc_request_id: userKycDetails?.kyc_request_id ?? "",
    kyc_status: userKycDetails?.kyc_status ?? "PENDING",
  };

  // KYC not found check
  const isKycNotFound =
    getKycDetailsIsError &&
    getKycDetailsError &&
    "status" in getKycDetailsError &&
    getKycDetailsError.status === 404;

  useEffect(() => {
    if (userKycDetails) {
      ShowInConsole("User KYC details:", userKycDetails);
    }
  }, [userKycDetails]);
  // ------------------------------ XXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------------ \\

  // Modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Pull to refresh
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchGetKycDetails();
    } catch {
      // Handled
    } finally {
      setRefreshing(false);
    }
  }, [refetchGetKycDetails]);

  // ------------------------------ Page Loader State ------------------------------ \\
  const showKycPageLoader =
    getKycDetailsIsLoading ||
    (!refreshing && getKycDetailsIsFetching) ||
    (!getKycData?.data && !isKycNotFound);
  // -------------------------------- XXXXXXXXXXXXXXXXXXX -------------------------------- \\

  if (isLoggingOut) {
    return <View className="flex-1 w-full bg-[var(--color-app)]" />;
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
            colors={["#d49a4d", "#0c1830"]}
          />
        }
      >
        {/* Header */}
        <View className="mb-4">
          <Text className="text-xl font-bold tracking-tight text-[var(--color-ink)]">
            KYC & Identity Verification
          </Text>
          <Text className="mt-1 text-xs text-[var(--color-ink-muted)]">
            Manage and track your official identity and address verification
          </Text>
        </View>

        {/* Page Loader */}
        {showKycPageLoader ? (
          <View className="w-full min-h-[260px] items-center justify-center">
            <CircleFadeLoaderComponent size={40} color="#d49a4d" />
          </View>
        ) : null}

        {/* Main Content */}
        {!showKycPageLoader ? (
          <View className="w-full flex-col gap-4">
            {isKycNotFound ? (
              <KycNotAvailableComponent
                onOpenSidebar={() => setIsUploadModalOpen(true)}
              />
            ) : (
              <KycStatusComponent
                kycData={userKycStatusData}
                onOpenSidebar={() => setIsUploadModalOpen(true)}
                onRefresh={refetchGetKycDetails}
                isRefreshing={getKycDetailsIsFetching}
              />
            )}
          </View>
        ) : null}
      </ScrollView>

      {/* KYC Upload Modal */}
      <KycUploadModalComponent
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        userEmail={userEmail}
      />
    </View>
  );
}
