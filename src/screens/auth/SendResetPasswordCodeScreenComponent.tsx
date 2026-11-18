import CustomButtonComponent from "@/components/common/CustomButtonComponent";
import CustomInputComponent from "@/components/common/CustomInputComponent";
import { showToastMessage } from "@/components/common/ToastMessagesComponent";
import { Text } from "@/components/ui/text";
import { useSendResetPasswordCodeMutation } from "@/redux/features/twoFa/twoFaApis";
import { useappDispatchType, useAppSelector } from "@/redux/hooks/reduxHooks";
import { selectEmail, setIsEmail } from "@/redux/slice/user/userSlice";
import { ROUTE_NAMES } from "@/routes/routeNames";
import ShowInConsole from "@/utils/ShowInConsole";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Landmark } from "lucide-react-native";
import React, { useEffect } from "react";
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
const sendResetPasswordCodeFormValidationSchema = z.object({
  email: z
    .string()
    .min(1, "Email required")
    .email("Invalid email")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid email format"
    ),
});

type SendResetPasswordCodeFormData = z.infer<
  typeof sendResetPasswordCodeFormValidationSchema
>;

export default function SendResetPasswordCodeScreenComponent() {
  const router = useRouter();
  const dispatch = useappDispatchType();
  const storedEmail = useAppSelector(selectEmail);
  const params = useLocalSearchParams<{ email?: string }>();

  const activeEmail = params.email || storedEmail || "";

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SendResetPasswordCodeFormData>({
    resolver: zodResolver(sendResetPasswordCodeFormValidationSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      email: activeEmail,
    },
  });

  useEffect(() => {
    if (activeEmail) {
      setValue("email", activeEmail, { shouldValidate: true });
    }
  }, [activeEmail, setValue]);

  const [sendResetPasswordCode, { isLoading }] =
    useSendResetPasswordCodeMutation();

  const onSendResetPasswordCodeFormSubmit: SubmitHandler<
    SendResetPasswordCodeFormData
  > = async (formData) => {
    try {
      const result = await sendResetPasswordCode({
        email: formData.email,
      }).unwrap();

      ShowInConsole("Send reset password code response:", result);

      if (result?.status?.toUpperCase() !== "SUCCESS") {
        showToastMessage({
          type: "error",
          text1: "Service Issue",
          text2:
            "Get reset password verification code service is facing issue. Please try again later.",
        });
        return;
      }

      showToastMessage({
        type: "success",
        text1: "Code Sent",
        text2: "Reset password code sent to email successfully.",
      });

      dispatch(setIsEmail(formData.email));

      setTimeout(() => {
        router.push({
          pathname: "/reset-password/verify-code",
          params: { email: formData.email },
        });
      }, 500);
    } catch (err: any) {
      ShowInConsole("Send reset password code error:", err);
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Get reset password verification code service is facing issue. Please try again later.";
      const normalizedMessage = errorMessage.toLowerCase();

      if (
        normalizedMessage.includes("user with the provided email does not exist")
      ) {
        showToastMessage({
          type: "error",
          text1: "Account Not Found",
          text2:
            "Get reset password code service failed due to non-existing email. Please try with correct email.",
        });
      } else {
        showToastMessage({
          type: "error",
          text1: "Error",
          text2: errorMessage,
        });
      }
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
              Send a 6 digit code to your email. Use this code to reset your
              password.
            </Text>
          </View>

          {/* Form */}
          <View className="w-full space-y-3.5">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInputComponent
                  id="sendResetPasswordCodeForm-input-email"
                  label="Email"
                  placeholder="Enter Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors?.email?.message}
                />
              )}
            />

            {/* Send Code Button */}
            <View className="w-full pt-3 items-center">
              <CustomButtonComponent
                id="signPage-sendResetPasswordCodeForm-button"
                label="Send Code"
                variant="navy"
                buttonClassName="w-full"
                labelClassName="text-lg font-semibold"
                showButtonLoader={isLoading}
                onPress={handleSubmit(onSendResetPasswordCodeFormSubmit)}
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

