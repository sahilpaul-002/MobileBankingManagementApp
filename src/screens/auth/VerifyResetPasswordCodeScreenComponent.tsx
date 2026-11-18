import CustomButtonComponent from "@/components/common/CustomButtonComponent";
import CustomOtpInputComponent from "@/components/common/CustomOtpInputComponent";
import CustomPasswordInputComponent from "@/components/common/CustomPasswordInputComponent";
import { showToastMessage } from "@/components/common/ToastMessagesComponent";
import { Text } from "@/components/ui/text";
import {
  useSendResetPasswordCodeMutation,
  useVerifyResetPasswordCodeMutation,
} from "@/redux/features/twoFa/twoFaApis";
import { useAppSelector } from "@/redux/hooks/reduxHooks";
import { selectEmail } from "@/redux/slice/user/userSlice";
import { ROUTE_NAMES } from "@/routes/routeNames";
import ShowInConsole from "@/utils/ShowInConsole";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Landmark } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { z } from "zod";

// ------------------------------------- ZOD VALIDATION SCHEMA ------------------------------------- \\
const resetPasswordValidationSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password required")
      .min(8, "Password must be atleast of 8 characters")
      .regex(/[A-Z]/, "Password must contain uppercase character")
      .regex(/[a-z]/, "Password must contain lowercase character")
      .regex(/\d/, "Password must contain a digit")
      .regex(/[!@#$%^&*]/, "Password must contain special character"),
    confirmPassword: z.string().min(1, "Confirm password required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordValidationSchema>;

export default function VerifyResetPasswordCodeScreenComponent() {
  const router = useRouter();
  const storedEmail = useAppSelector(selectEmail);
  const params = useLocalSearchParams<{ email?: string }>();

  const email = params.email || storedEmail || "";

  useEffect(() => {
    if (!email) {
      router.replace("/reset-password/send-code");
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

  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordValidationSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const currentPassword = watch("password");
  const currentConfirmPassword = watch("confirmPassword");

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
  const [verifyResetPasswordCode, { isLoading: isVerifyingCode }] =
    useVerifyResetPasswordCodeMutation();
  const [sendResetPasswordCode, { isLoading: isSendingCode }] =
    useSendResetPasswordCodeMutation();

  const onResetPasswordSubmit: SubmitHandler<
    ResetPasswordFormData
  > = async (formData) => {
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
        router.replace("/reset-password/send-code");
        return;
      }

      const result = await verifyResetPasswordCode({
        email,
        code: otpValue,
        password: formData.password,
      }).unwrap();

      ShowInConsole("Password reset service response:", result);

      if (result?.status?.toUpperCase() !== "SUCCESS") {
        showToastMessage({
          type: "error",
          text1: "Reset Failed",
          text2:
            "Reset password service is facing issue. Please try again later.",
        });
        return;
      }

      showToastMessage({
        type: "success",
        text1: "Password Reset",
        text2: "Password reset successfully.",
      });

      setTimeout(() => {
        router.push(ROUTE_NAMES.SIGN_IN);
      }, 500);
    } catch (err: any) {
      ShowInConsole("Password reset service error:", err);
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Password reset service is facing issue. Please try again later.";
      const normalizedMessage = errorMessage.toLowerCase();

      if (
        normalizedMessage.includes("user with the provided email does not exist")
      ) {
        showToastMessage({
          type: "error",
          text1: "Account Not Found",
          text2:
            "Password reset failed due to non-existing account. Please try with another email.",
        });
        setTimeout(() => {
          router.replace("/reset-password/send-code");
        }, 500);
      } else if (
        normalizedMessage.includes(
          "email not in the correct state for reset password code verification"
        )
      ) {
        showToastMessage({
          type: "error",
          text1: "Invalid State",
          text2:
            "Password reset failed due to incorrect account state. Please try again.",
        });
        setTimeout(() => {
          router.replace("/reset-password/send-code");
        }, 500);
      } else if (normalizedMessage.includes("invalid verification code")) {
        showToastMessage({
          type: "error",
          text1: "Invalid Code",
          text2: "Password reset failed due to invalid code.",
        });
      } else if (normalizedMessage.includes("verification code expired")) {
        showToastMessage({
          type: "error",
          text1: "Expired Code",
          text2: "Password reset failed due to expired code.",
        });
      } else {
        showToastMessage({
          type: "error",
          text1: "Reset Failed",
          text2: errorMessage,
        });
      }
    }
  };

  const handleResendCode = async () => {
    setOtpError("");
    try {
      if (!email) {
        router.replace("/reset-password/send-code");
        return;
      }

      const result = await sendResetPasswordCode({ email }).unwrap();
      ShowInConsole("Send reset password code response:", result);

      if (result?.status?.toUpperCase() !== "SUCCESS") {
        showToastMessage({
          type: "error",
          text1: "Resend Failed",
          text2: "Get reset password verification code service failed.",
        });
        return;
      }

      showToastMessage({
        type: "success",
        text1: "Code Sent",
        text2: "Reset password code sent to email successfully.",
      });

      setTimeRemaining(60);
    } catch (err: any) {
      ShowInConsole("Send reset password code error:", err);
      showToastMessage({
        type: "error",
        text1: "Resend Failed",
        text2: "Get reset password verification code service failed.",
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
              Reset Password
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

          {/* Form */}
          <View className="w-full space-y-4 pt-2">
            <CustomOtpInputComponent
              id="authForm-otp-input"
              label="Enter 6-Digit Code"
              otpValue={otpValue}
              onChange={handleOtpChange}
              error={otpError}
              otpLength={6}
            />

            {/* New Password */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomPasswordInputComponent
                  id="resetPassword-input-password"
                  label="New Password"
                  placeholder="Enter New Password"
                  autoCapitalize="none"
                  autoComplete="new-password"
                  value={value}
                  password={currentPassword}
                  showPassword={showNewPassword}
                  setShowPassword={setShowNewPassword}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors?.password?.message}
                />
              )}
            />

            {/* Confirm Password */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomPasswordInputComponent
                  id="resetPassword-input-confirm-password"
                  label="Confirm Password"
                  placeholder="Confirm New Password"
                  autoCapitalize="none"
                  autoComplete="new-password"
                  value={value}
                  password={currentConfirmPassword}
                  showPassword={showConfirmPassword}
                  setShowPassword={setShowConfirmPassword}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors?.confirmPassword?.message}
                />
              )}
            />

            {/* Submit Button */}
            <View className="w-full pt-2 items-center">
              <CustomButtonComponent
                id="resetPassword-resetPasswordForm-button"
                label="Reset Password"
                variant="navy"
                buttonClassName="w-full"
                labelClassName="text-lg font-semibold"
                showButtonLoader={isVerifyingCode}
                onPress={handleSubmit(onResetPasswordSubmit)}
              />
            </View>

            {/* Resend Code Button */}
            <View className="w-full items-center pt-2">
              <CustomButtonComponent
                id="resetPassword-resetPasswordForm-resendCode-button"
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
