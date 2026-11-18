import CustomButtonComponent from "@/components/common/CustomButtonComponent";
import CustonRadioGroupChoiceCardComponent from "@/components/common/CustonRadioGroupChoiceCardComponent";
import { Text } from "@/components/ui/text";
import { useAppSelector } from "@/redux/hooks/reduxHooks";
import { selectEmail } from "@/redux/slice/user/userSlice";
import { ROUTE_NAMES } from "@/routes/routeNames";
import { useRouter } from "expo-router";
import { Landmark } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

const TWO_FA_METHODS = [
  {
    title: "Authenticator App",
    description: "Use 2-factor-authenticator app to get time-based-otp",
    value: "TOTP",
  },
  {
    title: "Email Otp",
    description: "Get 2-factor-authentication code on your email",
    value: "EMAIL-OTP",
  },
];

export default function SelectTwoFaMethodScreenComponent() {
  const router = useRouter();
  const storedEmail = useAppSelector(selectEmail);

  const [twoFaMethodType, setTwoFaMethodType] = useState<string>("EMAIL-OTP");
  const [methodError, setMethodError] = useState<string>("");

  const handleSubmit = () => {
    if (!twoFaMethodType) {
      setMethodError("2-factor-authentication method is required");
      return;
    }

    setMethodError("");

    router.push({
      pathname: ROUTE_NAMES.TWO_FA.SEND_CODE,
      params: {
        twoFaType: twoFaMethodType === "TOTP" ? "totp" : "emailOtp",
      },
    });
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
      >
        <View className="w-full h-full flex flex-col justify-center items-center gap-5 my-auto">
          {/* Logo */}
          <View className="w-28 h-28 rounded-2xl bg-[var(--color-navy)] border border-[var(--color-gold)]/40 items-center justify-center shadow-sm shadow-black/10">
            <Landmark size={56} color="#d49a4d" strokeWidth={1.8} />
          </View>

          {/* Heading Text */}
          <View className="w-full items-center text-center gap-1.5">
            <Text className="text-3xl font-bold tracking-tight text-[var(--color-navy)]">
              Authentication Method
            </Text>
            <Text className="text-md text-[var(--color-ink-muted)] text-center max-w-[280px]">
              Set the 2-factor-authentication method.
            </Text>
            {Boolean(storedEmail) && (
              <Text className="text-xs font-semibold text-[var(--color-navy)] text-center">
                {storedEmail}
              </Text>
            )}
          </View>

          {/* Method Selection */}
          <View className="w-full flex flex-col justify-start items-center gap-5">
            <CustonRadioGroupChoiceCardComponent
              id="authForm-radioGroupChoiceCards"
              label="Select Type"
              defaultItem="EMAIL-OTP"
              value={twoFaMethodType}
              fieldItems={TWO_FA_METHODS}
              onValueChange={(value) => {
                setTwoFaMethodType(value);
                setMethodError("");
              }}
              error={methodError}
            />

            {/* Submit Button */}
            <View className="w-full items-center">
              <CustomButtonComponent
                id="select2FaMethod-select2FaMethodForm-button"
                label="Select Method"
                variant="navy"
                buttonClassName="w-full"
                labelClassName="text-lg font-semibold"
                onPress={handleSubmit}
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
