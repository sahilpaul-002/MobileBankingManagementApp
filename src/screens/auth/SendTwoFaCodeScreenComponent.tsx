import CustomButtonComponent from "@/components/common/CustomButtonComponent";
import CustomInputComponent from "@/components/common/CustomInputComponent";
import { showToastMessage } from "@/components/common/ToastMessagesComponent";
import { Text } from "@/components/ui/text";
import { useSendTwoFaCodeMutation } from "@/redux/features/twoFa/twoFaApis";
import { useappDispatchType, useAppSelector } from "@/redux/hooks/reduxHooks";
import { selectEmail, setIsEmail } from "@/redux/slice/user/userSlice";
import { ROUTE_NAMES } from "@/routes/routeNames";
import ShowInConsole from "@/utils/ShowInConsole";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Landmark } from "lucide-react-native";
import { useEffect } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { z } from "zod";

// ------------------------------------- ZOD VALIDATION SCHEMA ------------------------------------- \\
const sendTwoFaCodeFormValidationSchema = z.object({
  email: z
    .string()
    .min(1, "Email required")
    .email("Invalid email")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid email format"
    ),
});

type SendTwoFaCodeFormData = z.infer<typeof sendTwoFaCodeFormValidationSchema>;
// -------------------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXX -------------------------------- \\

export default function SendTwoFaCodeScreenComponent() {
  const router = useRouter();
  const dispatch = useappDispatchType();
  const storedEmail = useAppSelector(selectEmail);
  const params = useLocalSearchParams<{twoFaType?: string}>();

  const rawTwoFaType = params.twoFaType || "emailOtp";
  const normalizedType = rawTwoFaType.toLowerCase().includes("totp") ? "totp" : rawTwoFaType.toLowerCase().includes("sms") ? "smsOtp" : "emailOtp";

  const activeEmail = storedEmail || "";

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SendTwoFaCodeFormData>({
    resolver: zodResolver(sendTwoFaCodeFormValidationSchema),
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

  const [send2FaCode, { isLoading }] = useSendTwoFaCodeMutation();

  // Send Two Fa Code Form Submission Handler
  const onSendTwoFaCodeFormSubmit: SubmitHandler<SendTwoFaCodeFormData> = async (formData) => {
    try {
      let codeType: string;
      if (normalizedType === "emailOtp") {
        codeType = "EMAIL-OTP";
      } else if (normalizedType === "totp") {
        codeType = "TOTP";
      } else {
        codeType = "SMS-OTP";
      }

      const payload = {
        email: formData.email,
        code_type: codeType,
      };

      const result = await send2FaCode(payload).unwrap();
      ShowInConsole("Send 2fa code response:", result);

      if (result?.status?.toUpperCase() !== "SUCCESS") {
        showToastMessage({
          type: "error",
          text1: "2FA Service Issue",
          text2:
            "Get 2-factor-authentication code service is facing issue. Please try again later.",
        });
        return;
      }

      if (normalizedType === "emailOtp") {
        showToastMessage({
          type: "success",
          text1: "Code Sent",
          text2: "2-factor-authentication code sent to email successfully.",
        });
      } else if (normalizedType === "totp") {
        showToastMessage({
          type: "success",
          text1: "Code Ready",
          text2: "2-factor-authentication code generated successfully.",
        });
      } else {
        showToastMessage({
          type: "success",
          text1: "Code Sent",
          text2: "2-factor-authentication code sent to SMS successfully.",
        });
      }

      dispatch(setIsEmail(formData.email));

      setTimeout(() => {
        if (normalizedType === "emailOtp") {
          router.push("/two-fa/verify-code/emailOtp" as any);
        } else if (normalizedType === "totp") {
          router.push({
            pathname: "/two-fa/verify-code/[twoFatype]",
            params: {
              twoFatype: "totp",
              secretKey: result?.data?.secretKey || "",
              qrCodeUrl: result?.data?.qrCodeUrl || "",
            },
          });
        } else {
          router.push("/two-fa/verify-code/smsOtp" as any);
        }
      }, 500);
    } 
    catch (err: any) {
      ShowInConsole("Get 2fa code error:", err);
      const errorMessage = Array.isArray(err?.data?.message)
        ? err.data.message[0]
        : err?.data?.message ||
          err?.message ||
          "Get 2-factor-authentication code service is facing issue. Please try again later.";

      const normalizedMessage = errorMessage.toLowerCase();

      if (normalizedMessage === "email not verified") {
        showToastMessage({
          type: "error",
          text1: "Email Not Verified",
          text2:
            "User email not verified for receiving 2-factor authentication code. Please verify the email.",
        });
        setTimeout(() => {
          router.push("/email-verification/send-code");
        }, 1000);
        return;
      }

      showToastMessage({
        type: "error",
        text1: "2FA Error",
        text2: errorMessage,
      });
    }
  };

  const subtitleText =
    normalizedType === "emailOtp"
      ? "Get a 6 digit code on email. Use this code to verify 2-factor-authentication."
      : normalizedType === "totp"
      ? "Get a 6 digit code on authenticator app. Use this code to verify 2-factor-authentication."
      : "Get a 6 digit code on SMS. Use this code to verify 2-factor-authentication.";

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
        <View className="w-full h-full flex-col justify-center items-center gap-5 my-auto">
          {/* Logo */}
          <View className="w-28 h-28 rounded-2xl bg-[var(--color-navy)] border border-[var(--color-gold)]/40 items-center justify-center shadow-sm shadow-black/10">
            <Landmark size={56} color="#d49a4d" strokeWidth={1.8} />
          </View>

          {/* Heading Text */}
          <View className="w-full items-center text-center gap-5">
            <Text className="text-3xl font-bold tracking-tight text-[var(--color-navy)]">
              2-Factor Authentication
            </Text>
            <Text className="text-md text-[var(--color-ink-muted)] text-center max-w-[290px]">
              {subtitleText}
            </Text>
          </View>

          {/* Form */}
          <View className="w-full flex flex-col justify-start items-center gap-5">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInputComponent
                  id="send2FaCodeForm-input-email"
                  label="Email"
                  placeholder="Enter Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={value}
                  editable={!storedEmail}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors?.email?.message}
                />
              )}
            />

            {/* Submit Button */}
            <View className="w-full pt-3 items-center">
              <CustomButtonComponent
                id="send2FaCode-send2FaCodeForm-button"
                label="Get Code"
                variant="navy"
                buttonClassName="w-full"
                labelClassName="text-lg font-semibold"
                showButtonLoader={isLoading}
                onPress={handleSubmit(onSendTwoFaCodeFormSubmit)}
              />
            </View>

            {/* Back To Sign In */}
            <View className="w-full flex-row justify-center items-center gap-1">
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
