import CustomButtonComponent from "@/components/common/CustomButtonComponent";
import CustomOtpInputComponent from "@/components/common/CustomOtpInputComponent";
import { showToastMessage } from "@/components/common/ToastMessagesComponent";
import { Text } from "@/components/ui/text";
import {
  useSendTwoFaCodeMutation,
  useVerifyTwoFaCodeMutation,
} from "@/redux/features/twoFa/twoFaApis";
import { useAppSelector } from "@/redux/hooks/reduxHooks";
import { selectEmail } from "@/redux/slice/user/userSlice";
import { ROUTE_NAMES } from "@/routes/routeNames";
import ShowInConsole from "@/utils/ShowInConsole";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Copy, Landmark } from "lucide-react-native";
import React, { Activity, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

export default function VerifyTwoFaCodeScreenComponent() {
  const router = useRouter();
  const storedEmail = useAppSelector(selectEmail);
  const params = useLocalSearchParams<{
    twoFatype?: string;
    twoFaType?: string;
    secretKey?: string;
    qrCodeUrl?: string;
    email?: string;
  }>();

  const rawTwoFaType = params.twoFatype || params.twoFaType || "emailOtp";
  const normalizedType = rawTwoFaType.toLowerCase().includes("totp")
    ? "totp"
    : rawTwoFaType.toLowerCase().includes("sms")
    ? "smsOtp"
    : "emailOtp";

  const email = params.email || storedEmail || "";
  const secretKey = params.secretKey;
  const qrCodeUrl = params.qrCodeUrl;

  useEffect(() => {
    if (!email) {
      router.replace(`/two-fa/send-code/${normalizedType}`);
    }
  }, [email, normalizedType, router]);

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

  // Timer for Email OTP resend
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const isResendDisabled = timeRemaining > 0;

  useEffect(() => {
    if (normalizedType !== "emailOtp" || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, normalizedType]);

  // Mutations
  const [verify2FaCode, { isLoading: isVerifying2FaCode }] =
    useVerifyTwoFaCodeMutation();
  const [send2FaCode, { isLoading: isSendingCode }] =
    useSendTwoFaCodeMutation();

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
        router.replace(`/two-fa/send-code/${normalizedType}`);
        return;
      }

      let codeType: string;
      if (normalizedType === "emailOtp") {
        codeType = "EMAIL-OTP";
      } else if (normalizedType === "totp") {
        codeType = "TOTP";
      } else {
        codeType = "SMS-OTP";
      }

      const payload = {
        email,
        code_type: codeType,
        code: otpValue,
      };

      const result = await verify2FaCode(payload).unwrap();
      ShowInConsole("2fa verification code response:", result);

      if (result?.status?.toUpperCase() !== "SUCCESS") {
        showToastMessage({
          type: "error",
          text1: "2FA Verification Error",
          text2:
            "2 factor authentication service is facing issue. Please try again later.",
        });
        return;
      }

      showToastMessage({
        type: "success",
        text1: "2FA Verified",
        text2: "2-factor-authentication code verified successfully.",
      });

      setTimeout(() => {
        router.replace(ROUTE_NAMES.DASHBOARD);
      }, 500);
    } catch (err: any) {
      ShowInConsole("2Fa code verification service error:", err);
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "2 factor authentication service is facing issue. Please try again later.";
      const normalizedMessage = errorMessage.toLowerCase();

      switch (true) {
        case normalizedMessage.includes(
          "email not in the valid state for 2 factor authentication using email - 2fa not enabled"
        ):
        case normalizedMessage.includes(
          "email not in the valid state for 2 factor authentication using authenticator - 2fa not configured for authenticator"
        ):
        case normalizedMessage.includes(
          "verifiemailservice is facing issue - email not in the correct state for two factor auth verification"
        ):
          showToastMessage({
            type: "error",
            text1: "Invalid State",
            text2:
              "2-factor-authentication service failed due to incorrect account email state. Please restart the verification process.",
          });
          setTimeout(() => {
            router.replace("/selectTwoFaMethod");
          }, 500);
          break;

        case normalizedMessage.includes("verification code expired"):
          showToastMessage({
            type: "error",
            text1: "Expired Code",
            text2: "2-factor-authentication service failed due to expired code.",
          });
          break;

        case normalizedMessage.includes("invalid verification code"):
          showToastMessage({
            type: "error",
            text1: "Invalid Code",
            text2: "2-factor-authentication service failed due to invalid code.",
          });
          break;

        default:
          showToastMessage({
            type: "error",
            text1: "2FA Failed",
            text2: errorMessage,
          });
          break;
      }
    }
  };

  const handleResendCode = async () => {
    setOtpError("");
    try {
      if (!email) {
        router.replace(`/two-fa/send-code/${normalizedType}`);
        return;
      }

      const payload = {
        email,
        code_type: "EMAIL-OTP",
      };

      const result = await send2FaCode(payload).unwrap();
      ShowInConsole("Send 2fa code response:", result);

      if (result?.status?.toUpperCase() !== "SUCCESS") {
        showToastMessage({
          type: "error",
          text1: "Resend Failed",
          text2:
            "Resend 2-factor-authentication code service is facing issue. Please try again later.",
        });
        return;
      }

      showToastMessage({
        type: "success",
        text1: "Code Resent",
        text2: "2-factor-authentication code sent to email successfully.",
      });

      setTimeRemaining(60);
    } catch (err: any) {
      ShowInConsole("Get 2fa code error:", err);
      showToastMessage({
        type: "error",
        text1: "Resend Failed",
        text2:
          "Resend 2-factor-authentication code service is facing issue. Please try again later.",
      });
    }
  };

  const handleCopySecretKey = async () => {
    if (!secretKey) return;
    try {
      await Clipboard.setStringAsync(secretKey);
      showToastMessage({
        type: "success",
        text1: "Copied",
        text2: "Secret key copied to clipboard.",
      });
    } catch {
      showToastMessage({
        type: "error",
        text1: "Copy Error",
        text2: "Unable to copy secret key.",
      });
    }
  };

  const subtitleText =
    normalizedType === "emailOtp"
      ? "A 6 digit authentication code is sent to your email."
      : normalizedType === "totp"
      ? "Enter the 6 digit code from your authenticator app."
      : "A 6 digit authentication code is sent to SMS.";

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
              Verify Code
            </Text>
            <Text className="text-md text-[var(--color-ink-muted)] text-center max-w-[290px]">
              {subtitleText}
            </Text>
            {Boolean(email) && (
              <Text className="text-xs font-semibold text-[var(--color-navy)] text-center">
                {email}
              </Text>
            )}
          </View>

          {/* Authenticator QR Code & Secret Key Display (for TOTP) */}
          <Activity
            mode={
              normalizedType === "totp" && Boolean(qrCodeUrl || secretKey)
                ? "visible"
                : "hidden"
            }
          >
            <View className="w-full items-center gap-3 p-4 rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-app-surface)] shadow-sm shadow-black/5">
              <Activity mode={Boolean(qrCodeUrl) ? "visible" : "hidden"}>
                <View className="w-36 h-36 p-2 rounded-lg bg-white border border-[var(--color-line)] items-center justify-center">
                  {Boolean(qrCodeUrl) && (
                    <Image
                      source={{ uri: qrCodeUrl! }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="contain"
                      accessibilityLabel="Authenticator QR Code"
                    />
                  )}
                </View>
              </Activity>

              <Activity mode={Boolean(secretKey) ? "visible" : "hidden"}>
                <View className="w-full flex-row items-center justify-between p-2.5 rounded-lg bg-[var(--color-app-subtle)] border border-[var(--color-line)]">
                  <View className="flex-1 mr-2">
                    <Text className="text-[11px] font-medium text-[var(--color-ink-muted)]">
                      Secret Key
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="text-xs font-mono font-bold text-[var(--color-navy)]"
                    >
                      {secretKey}
                    </Text>
                  </View>

                  <Pressable
                    hitSlop={8}
                    onPress={handleCopySecretKey}
                    className="p-1.5 rounded-md bg-[var(--color-app-surface)] active:bg-[var(--color-gold-soft)]"
                    accessibilityRole="button"
                    accessibilityLabel="Copy secret key"
                  >
                    <Copy size={14} color="#d49a4d" strokeWidth={2} />
                  </Pressable>
                </View>
              </Activity>
            </View>
          </Activity>

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
                id="verify2FaCode-verify2FaCodeForm-button"
                label="Verify Otp"
                variant="navy"
                buttonClassName="w-full"
                labelClassName="text-lg font-semibold"
                showButtonLoader={isVerifying2FaCode}
                onPress={handleVerifySubmit}
              />
            </View>

            {/* Resend Code Button (Email OTP only) */}
            <Activity mode={normalizedType === "emailOtp" ? "visible" : "hidden"}>
              <View className="w-full items-center pt-2">
                <CustomButtonComponent
                  id="verify2FaCode-verify2FaCodeForm-resendCode-button"
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
            </Activity>

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
