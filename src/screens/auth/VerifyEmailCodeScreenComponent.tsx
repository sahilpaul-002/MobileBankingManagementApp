import CustomButtonComponent from "@/components/common/CustomButtonComponent";
import CustomOtpInputComponent from "@/components/common/CustomOtpInputComponent";
import { showToastMessage } from "@/components/common/ToastMessagesComponent";
import { Text } from "@/components/ui/text";
import {
    useSendEmailVerificationCodeMutation,
    useVerifyEmailCodeMutation,
} from "@/redux/features/twoFa/twoFaApis";
import { useAppSelector } from "@/redux/hooks/reduxHooks";
import { selectEmail } from "@/redux/slice/user/userSlice";
import { ROUTE_NAMES } from "@/routes/routeNames";
import ShowInConsole from "@/utils/ShowInConsole";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Landmark } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    View,
} from "react-native";

export default function VerifyEmailCodeScreenComponent() {
  const router = useRouter();
  const storedEmail = useAppSelector(selectEmail);
  const params = useLocalSearchParams<{ email?: string }>();

  const email = params.email || storedEmail || "";

  useEffect(() => {
    if (!email) {
      router.replace("/email-verification/send-code");
    }
  }, [email, router]);

  const [otpValue, setOtpValue] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");

  const handleOtpChange = (value: string): void => {
    if (!/^\d*$/.test(value)) return;
    const formatted = value.slice(0, 6);
    setOtpValue(formatted);
    if (otpError) {
      setOtpError("");
    }
  };

  // Timer
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const isResendDisabled = timeRemaining > 0;

  useEffect(() => {
    if (timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  // Mutations
  const [verifyEmailCode, { isLoading: isVerifyingCode }] =
    useVerifyEmailCodeMutation();
  const [sendEmailVerificationCode, { isLoading: isSendingCode }] =
    useSendEmailVerificationCodeMutation();

  const handleVerifySubmit = async () => {
    setOtpError("");

    if (!otpValue.trim()) {
      setOtpError("OTP is required");
      return;
    }
    if (otpValue.length !== 6) {
      setOtpError("OTP must be 6 digits");
      return;
    }
    if (!/^\d+$/.test(otpValue)) {
      setOtpError("OTP must contain only numbers");
      return;
    }

    try {
      if (!email) {
        router.replace("/email-verification/send-code");
        return;
      }

      const result = await verifyEmailCode({
        email,
        code: otpValue,
      }).unwrap();

      ShowInConsole("Verify email verification code response:", result);

      if (result?.status?.toUpperCase() !== "SUCCESS") {
        showToastMessage({
          type: "error",
          text1: "Verification Error",
          text2:
            "Email verification service is facing issue. Please try again later.",
        });
        return;
      }

      showToastMessage({
        type: "success",
        text1: "Email Verified",
        text2: "Email verified successfully.",
      });

      setTimeout(() => {
        router.push("/selectTwoFaMethod");
      }, 500);
    } catch (err: any) {
      ShowInConsole("Verify email verification code service error:", err);
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Email verification service is facing issue. Please try again later.";
      const normalizedMessage = errorMessage.toLowerCase();

      if (normalizedMessage.includes("invalid verification code")) {
        showToastMessage({
          type: "error",
          text1: "Invalid Code",
          text2: "Email verification failed due to invalid code.",
        });
      } else if (normalizedMessage.includes("verification code expired")) {
        showToastMessage({
          type: "error",
          text1: "Expired Code",
          text2: "Email verification failed due to expired code.",
        });
      } else {
        showToastMessage({
          type: "error",
          text1: "Verification Failed",
          text2: errorMessage,
        });
      }
    }
  };

  const handleResendCode = async () => {
    setOtpError("");
    try {
      if (!email) {
        router.replace("/email-verification/send-code");
        return;
      }

      const result = await sendEmailVerificationCode({ email }).unwrap();
      ShowInConsole("Send email verification code response:", result);

      if (result?.status?.toUpperCase() !== "SUCCESS") {
        showToastMessage({
          type: "error",
          text1: "Resend Failed",
          text2: "Resend email verification code service failed.",
        });
        return;
      }

      showToastMessage({
        type: "success",
        text1: "Code Resent",
        text2: "Email verification code sent to email. Please check email.",
      });

      setTimeRemaining(60);
    } catch (err: any) {
      ShowInConsole("Resend email verification code service error:", err);
      showToastMessage({
        type: "error",
        text1: "Resend Error",
        text2: "Resend email verification code service failed.",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-[var(--color-app)]"
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingVertical: 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full h-full flex-col items-center gap-5 my-auto">
          {/* Logo */}
          <View className="w-28 h-28 rounded-2xl bg-[var(--color-navy)] border border-[var(--color-gold)]/40 items-center justify-center shadow-sm shadow-black/10">
            <Landmark size={56} color="#d49a4d" strokeWidth={1.8} />
          </View>

          {/* Heading Text */}
          <View className="w-full items-center text-center gap-1.5">
            <Text className="text-3xl font-bold tracking-tight text-[var(--color-navy)]">
              Verify Email
            </Text>
            <Text className="text-md text-[var(--color-ink-muted)] text-center max-w-[280px]">
              A 6 digit verification code is sent to your email.
            </Text>
            {Boolean(email) && (
              <Text className="text-xs font-semibold text-[var(--color-navy)] text-center">
                {email}
              </Text>
            )}
          </View>

          {/* OTP Input Form */}
          <View className="w-full space-y-4 pt-2">
            <CustomOtpInputComponent
              id="authForm-otp-input"
              label="Enter 6-Digit Code"
              otpValue={otpValue}
              onChange={handleOtpChange}
              error={otpError}
              otpLength={6}
            />

            {/* Verify Button */}
            <View className="w-full pt-2 items-center">
              <CustomButtonComponent
                id="verifyEmail-verifyEmailForm-button"
                label="Verify Otp"
                variant="navy"
                buttonClassName="w-full"
                labelClassName="text-lg font-semibold"
                showButtonLoader={isVerifyingCode}
                onPress={handleVerifySubmit}
              />
            </View>

            {/* Resend Code Button */}
            <View className="w-full items-center pt-2">
              <CustomButtonComponent
                id="verifyEmail-verifyEmailForm-resendCode-button"
                label={
                  isSendingCode
                    ? "Resending..."
                    : isResendDisabled
                      ? `Resend Code [ ${timeRemaining}s ]`
                      : "Resend Code"
                }
                variant="authResend"
                buttonClassName="w-full"
                labelClassName="text-sm font-semibold text-[var(--color-ink-secondary)]"
                disabled={isResendDisabled || isSendingCode}
                onPress={handleResendCode}
              />
            </View>

            {/* Back To Sign In */}
            <View className="w-full flex-row justify-center items-center pt-3 gap-1">
              <Text className="text-sm text-[var(--color-ink-muted)]">
                Back To -
              </Text>
              <Pressable
                onPress={() => router.push(ROUTE_NAMES.SIGN_IN)}
                hitSlop={8}
                accessibilityRole="button"
              >
                <Text className="text-sm font-semibold text-[var(--color-link)]">
                  Sign In
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
