import CustomButtonComponent from "@/components/common/CustomButtonComponent";
import CustomDatePickerComponent from "@/components/common/CustomDatePickerComponent";
import CustomInputComponent from "@/components/common/CustomInputComponent";
import CustomPasswordInputComponent from "@/components/common/CustomPasswordInputComponent";
import CustomSelectComponent from "@/components/common/CustomSelectComponent";
import { showToastMessage } from "@/components/common/ToastMessagesComponent";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useSignUpMutation } from "@/redux/features/user/userApis";
import mobileCountryCodesLists from "@/utils/mobileCountryCodesList";
import ShowInConsole from "@/utils/ShowInConsole";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Landmark } from "lucide-react-native";
import {
  Activity,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Controller,
  useForm,
  type SubmitErrorHandler,
  type SubmitHandler,
} from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
  type GestureResponderEvent,
} from "react-native";
import { z } from "zod";

// ------------------------------------- ZOD VALIDATION SCHEMA ------------------------------------- \\
const signupFormValidationSchema = z
  .object({
    fullName: z
      .string()
      .min(4, "Full name must be atleast 4 characters")
      .regex(
        /^[A-Za-z0-9 .'-]+$/,
        "Full name can only contain letters, numbers, spaces, dots (.), apostrophes ('), and hyphens (-)",
      ),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email")
      .regex(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid email format",
      ),
    password: z
      .string()
      .min(8, "Password must be atleast of 8 characters")
      .regex(/[A-Z]/, "Password must contain a uppercase character")
      .regex(/[a-z]/, "Password must contain a lowercase character")
      .regex(/\d/, "Password must contain a digit")
      .regex(/[!@#$%^&*]/, "Password must contain special characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    gender: z.string().min(1, "Please select a gender"),
    dialCode: z.string().min(1, "Please select a dial code"),
    countryCode: z.string().min(1, "Please select a country"),
    phoneNumber: z
      .string()
      .min(4, "Phone number must be atleast of 4 digits")
      .max(15, "Phone number can be of maximum of 15 digits")
      .regex(/^[0-9]+$/, "Phone number must contain only digits"),
    dateOfBirth: z
      .date({
        error: (issue) =>
          issue.input === undefined
            ? "Date of birth required"
            : "Invalid date of birth",
      })
      .refine(
        (date) => {
          const today = new Date();
          const minDate = new Date(
            today.getFullYear() - 18,
            today.getMonth(),
            today.getDate(),
          );
          return date <= minDate;
        },
        {
          message: "You must be at least 18 years old",
        },
      ),
    businessName: z.string().min(1, "Business name is required"),
    businessType: z.enum(["NEW", "EXISTING"], {
      error: "Please select a business type",
    }),
    programType: z.enum(["MASTER", "VISA"], {
      error: "Please select a program type",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Password do not match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupFormValidationSchema>;

const FORM_STEPS = [
  { step: 1, title: "Account", description: "Credentials" },
  { step: 2, title: "Personal", description: "Contact & DOB" },
  { step: 3, title: "Business", description: "Company Info" },
];

export default function SignUpScreenComponent() {
  // SignUp API Mutation
  const [signUp, { isLoading }] = useSignUpMutation();

  // State to manage password visibility
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // State to manage active form step (1, 2, 3)
  const [formStep, setFormStep] = useState<number>(1);

  // State to manage mobile country codes lists
  const [mobileDialCodes, setMobileDialCodes] = useState<
    { id: string; label: string; value: string }[]
  >([]);
  const [mobileCountryCodes, setMobileCountryCodes] = useState<
    { id: string; label: string; value: string }[]
  >([]);

  useEffect(() => {
    const list = mobileCountryCodesLists();
    const dialCodesList = list.map((item) => ({
      id: `${item.country}-${item.code}`,
      label: item.country,
      value: item.code,
    }));
    setMobileDialCodes(dialCodesList);

    const countryCodesList = list.map((item) => ({
      id: `${item.country}-${item.name}`,
      label: item.name,
      value: item.country,
    }));
    setMobileCountryCodes(countryCodesList);
  }, []);

  // React Hook Form
  const {
    control,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupFormValidationSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: "",
      dialCode: "",
      countryCode: "",
      phoneNumber: "",
      businessName: "",
    },
  });

  const passwordValue = watch("password");

  // Step 1 navigation validation
  const handleValidateAndProceedToStep2 = async () => {
    const isStep1Valid = await trigger([
      "fullName",
      "email",
      "password",
      "confirmPassword",
      "gender",
    ]);
    if (isStep1Valid) {
      setFormStep(2);
    }
  };

  // Step 2 navigation validation
  const handleValidateAndProceedToStep3 = async () => {
    const isStep2Valid = await trigger([
      "dialCode",
      "countryCode",
      "dateOfBirth",
      "phoneNumber",
    ]);
    if (isStep2Valid) {
      setFormStep(3);
    }
  };

  // Backwards navigation
  const handleGoBack = () => {
    if (formStep > 1) {
      setFormStep((prev) => prev - 1);
    }
  };

  // Horizontal Swipe Gesture Handling
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  const handleTouchStart = (event: GestureResponderEvent) => {
    touchStartXRef.current = event.nativeEvent.pageX;
    touchStartYRef.current = event.nativeEvent.pageY;
  };

  const handleTouchEnd = (event: GestureResponderEvent) => {
    const deltaX = event.nativeEvent.pageX - touchStartXRef.current;
    const deltaY = event.nativeEvent.pageY - touchStartYRef.current;

    // Detect horizontal swipe if deltaX exceeds 45px and is predominantly horizontal
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX < 0) {
        // Swipe Left: advance to next step
        if (formStep === 1) {
          void handleValidateAndProceedToStep2();
        } else if (formStep === 2) {
          void handleValidateAndProceedToStep3();
        }
      } else if (deltaX > 0) {
        // Swipe Right: go back to previous step
        handleGoBack();
      }
    }
  };

  // Form Submit Handler
  const onValid: SubmitHandler<SignupFormData> = async (formData) => {
    try {
      const result = await signUp(formData).unwrap();
      ShowInConsole("Sign up success", result?.data);

      if (result?.status?.toUpperCase() !== "SUCCESS") {
        showToastMessage({
          type: "error",
          text1: "Sign Up Error",
          text2:
            "Sign up service is facing issue. Please try again later. If issue persist please contact support.",
        });
        return;
      }

      showToastMessage({
        type: "success",
        text1: "Success",
        text2: "Sign up successful.",
      });

      setTimeout(() => {
        router.replace("/(auth)");
      }, 1000);
    } catch (err: any) {
      ShowInConsole("Sign up error:", err);

      const errorMessage = Array.isArray(err?.data?.message)
        ? err.data.message[0]
        : err?.data?.message ||
          err?.message ||
          "Sign up service is facing issue. Please try again later. If issue persist please contact support.";

      const normalizedMessage = errorMessage.toLowerCase();

      switch (true) {
        case normalizedMessage.includes("user already exist"):
          showToastMessage({
            type: "error",
            text1: "Registration Error",
            text2: "User already exist with provided email.",
          });
          break;

        case normalizedMessage.includes("business name already exist, use 'existing' type"):
          showToastMessage({
            type: "error",
            text1: "Business Conflict",
            text2:
              "Business with provided business name already exist. Switch to existing business type.",
          });
          break;

        case normalizedMessage.includes(
          "business name does not exist for the specified business type",
        ):
          showToastMessage({
            type: "error",
            text1: "Business Error",
            text2: "Business does not exist for the specified business type.",
          });
          break;

        case normalizedMessage.includes("is registerd for") ||
          normalizedMessage.includes("register with different business name"):
          showToastMessage({
            type: "error",
            text1: "Registration Error",
            text2: errorMessage,
          });
          break;

        case normalizedMessage.includes("phone number is not valid"):
          showToastMessage({
            type: "error",
            text1: "Invalid Phone",
            text2: errorMessage,
          });
          break;

        default:
          showToastMessage({
            type: "error",
            text1: "Sign Up Failed",
            text2:
              "Sign up service is facing issue. Please try again later. If issue persist please contact support.",
          });
          break;
      }
    }
  };

  const onError: SubmitErrorHandler<SignupFormData> = (formErrors) => {
    const step1Fields = [
      "fullName",
      "email",
      "password",
      "confirmPassword",
      "gender",
    ] as const;

    if (step1Fields.some((field) => formErrors[field])) {
      setFormStep(1);
      return;
    }

    const step2Fields = [
      "dialCode",
      "countryCode",
      "phoneNumber",
      "dateOfBirth",
    ] as const;

    if (step2Fields.some((field) => formErrors[field])) {
      setFormStep(2);
      return;
    }

    const step3Fields = [
      "businessName",
      "businessType",
      "programType",
    ] as const;

    if (step3Fields.some((field) => formErrors[field])) {
      setFormStep(3);
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
          paddingVertical: 20,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="my-auto w-full flex-col items-center gap-5"
        >
          {/* Logo / Brand Header */}
          <View className="h-24 w-24 items-center justify-center rounded-2xl bg-[var(--color-navy)] shadow-sm shadow-black/10">
            <Landmark size={48} color="#ffffff" strokeWidth={1.8} />
          </View>

          {/* Heading Text */}
          <View className="w-full items-center gap-1.5 text-center">
            <Text className="text-3xl font-bold tracking-tight text-[var(--color-navy)]">
              Create Account
            </Text>
            <View className="flex-row items-center justify-center gap-1.5 pt-1">
              <Text className="text-sm text-[var(--color-ink-muted)]">
                Already have an account -
              </Text>
              <Pressable
                onPress={() => router.push("/(auth)")}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Go to sign in"
              >
                <Text className="text-sm font-semibold text-[var(--color-link)] active:opacity-70">
                  Sign In
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Step Progress Indicators */}
          <View className="w-full flex-row items-center justify-between px-1 pt-1">
            {FORM_STEPS.map((stepItem) => {
              const isActive = formStep === stepItem.step;
              const isPast = formStep > stepItem.step;

              return (
                <Pressable
                  key={stepItem.step}
                  onPress={() => {
                    if (stepItem.step < formStep) {
                      setFormStep(stepItem.step);
                    } else if (stepItem.step === 2 && formStep === 1) {
                      void handleValidateAndProceedToStep2();
                    } else if (stepItem.step === 3 && formStep === 2) {
                      void handleValidateAndProceedToStep3();
                    }
                  }}
                  className="flex-1 items-center px-1"
                >
                  <View
                    className={cn(
                      "h-1.5 w-full rounded-full mb-2",
                      isActive
                        ? "bg-[var(--color-navy)]"
                        : isPast
                          ? "bg-[var(--color-navy)]/40"
                          : "bg-[var(--color-line)]",
                    )}
                  />
                  <Text
                    className={cn(
                      "text-xs font-semibold",
                      isActive
                        ? "text-[var(--color-navy)] font-bold"
                        : isPast
                          ? "text-[var(--color-ink)]"
                          : "text-[var(--color-ink-muted)]",
                    )}
                  >
                    Step {stepItem.step}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className={cn(
                      "text-[11px]",
                      isActive
                        ? "text-[var(--color-navy)] font-semibold"
                        : "text-[var(--color-ink-muted)]",
                    )}
                  >
                    {stepItem.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* ================================= FORM STEPS ================================= */}
          <View className="w-full">
            {/* Step 1: Account Credentials & Gender */}
            <Activity mode={formStep === 1 ? "visible" : "hidden"}>
              <View className="w-full space-y-3.5">
                {/* Full Name */}
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CustomInputComponent
                      id="signupForm1-input-fullName"
                      label="Full Name"
                      placeholder="Enter full name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors?.fullName?.message}
                    />
                  )}
                />

                {/* Email */}
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CustomInputComponent
                      id="signupForm1-input-email"
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

                {/* Password */}
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CustomPasswordInputComponent
                      id="signupForm1-input-password"
                      label="Password"
                      placeholder="••••••••"
                      autoCapitalize="none"
                      autoComplete="new-password"
                      value={value}
                      password={passwordValue}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
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
                      id="signupForm1-input-confirmPassword"
                      label="Confirm Password"
                      placeholder="••••••••"
                      autoCapitalize="none"
                      autoComplete="new-password"
                      value={value}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors?.confirmPassword?.message}
                    />
                  )}
                />

                {/* Gender */}
                <Controller
                  control={control}
                  name="gender"
                  render={({ field: { onChange, value } }) => (
                    <CustomSelectComponent
                      id="signupForm1-input-select-gender"
                      fieldLabel="Gender"
                      label="Select Gender"
                      labels={["Male", "Female", "Other"]}
                      value={value}
                      onChange={onChange}
                      error={errors?.gender?.message}
                    />
                  )}
                />
              </View>
            </Activity>

            {/* Step 2: Dial Code, Country, DOB, Phone */}
            <Activity mode={formStep === 2 ? "visible" : "hidden"}>
              <View className="w-full space-y-3.5">
                {/* Phone Dial Code */}
                <Controller
                  control={control}
                  name="dialCode"
                  render={({ field: { onChange, value } }) => (
                    <CustomSelectComponent
                      id="signupForm2-input-select-dialCode"
                      fieldLabel="Phone Dial Code"
                      label="Select Dial Code"
                      labels={mobileDialCodes}
                      value={value}
                      onChange={onChange}
                      error={errors?.dialCode?.message}
                    />
                  )}
                />

                {/* Country Code */}
                <Controller
                  control={control}
                  name="countryCode"
                  render={({ field: { onChange, value } }) => (
                    <CustomSelectComponent
                      id="signupForm2-input-select-countryCode"
                      fieldLabel="Country Code"
                      label="Select Country Code"
                      labels={mobileCountryCodes}
                      value={value}
                      onChange={onChange}
                      error={errors?.countryCode?.message}
                    />
                  )}
                />

                {/* Date of Birth */}
                <Controller
                  control={control}
                  name="dateOfBirth"
                  render={({ field: { onChange, value } }) => (
                    <CustomDatePickerComponent
                      id="signupForm2-input-select-dateOfBirth"
                      fieldLabel="Date of Birth"
                      label="Select Date of Birth"
                      date={value}
                      setDate={onChange}
                      restrictTo18Years={true}
                      hint="* Date of birth must be above 18 years"
                      error={errors?.dateOfBirth?.message}
                    />
                  )}
                />

                {/* Phone Number */}
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CustomInputComponent
                      id="signupForm2-input-phoneNumber"
                      label="Phone Number"
                      placeholder="Enter phone number"
                      keyboardType="phone-pad"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      hint="* Enter number without country code"
                      error={errors?.phoneNumber?.message}
                    />
                  )}
                />
              </View>
            </Activity>

            {/* Step 3: Business Information & Submission */}
            <Activity mode={formStep === 3 ? "visible" : "hidden"}>
              <View className="w-full space-y-3.5">
                {/* Business Name */}
                <Controller
                  control={control}
                  name="businessName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CustomInputComponent
                      id="signupForm3-input-businessName"
                      label="Business Name"
                      placeholder="Enter business name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors?.businessName?.message}
                    />
                  )}
                />

                {/* Business Type */}
                <Controller
                  control={control}
                  name="businessType"
                  render={({ field: { onChange, value } }) => (
                    <CustomSelectComponent
                      id="signupForm3-input-select-businessType"
                      fieldLabel="Business Type"
                      label="Select Business Type"
                      labels={["New", "Existing"]}
                      value={
                        value === "NEW"
                          ? "New"
                          : value === "EXISTING"
                            ? "Existing"
                            : ""
                      }
                      onChange={(selected) => {
                        onChange(
                          selected === "New"
                            ? "NEW"
                            : selected === "Existing"
                              ? "EXISTING"
                              : selected,
                        );
                      }}
                      error={errors?.businessType?.message}
                    />
                  )}
                />

                {/* Program Type */}
                <Controller
                  control={control}
                  name="programType"
                  render={({ field: { onChange, value } }) => (
                    <CustomSelectComponent
                      id="signupForm3-input-select-programType"
                      fieldLabel="Program Type"
                      label="Select Program Type"
                      labels={["Master", "Visa"]}
                      value={
                        value === "MASTER"
                          ? "Master"
                          : value === "VISA"
                            ? "Visa"
                            : ""
                      }
                      onChange={(selected) => {
                        onChange(
                          selected === "Master"
                            ? "MASTER"
                            : selected === "Visa"
                              ? "VISA"
                              : selected,
                        );
                      }}
                      error={errors?.programType?.message}
                    />
                  )}
                />

                {/* Sign Up Submit Button */}
                <View className="w-full items-center pt-3">
                  <CustomButtonComponent
                    id="signupForm-submit-button"
                    label="Sign Up"
                    variant="navy"
                    buttonClassName="w-full"
                    labelClassName="text-lg font-semibold"
                    showButtonLoader={isLoading}
                    onPress={handleSubmit(onValid, onError)}
                  />
                </View>
              </View>
            </Activity>
          </View>

          {/* ======================= SIMPLE CENTERED SWIPE DIRECTION INDICATOR ======================= */}
          <View className="w-full flex-row items-center justify-center py-4 my-1">
            {/* Left Arrows (Swipe Right to go back) */}
            <Pressable
              onPress={handleGoBack}
              disabled={formStep === 1}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Previous step"
              className={cn(
                "px-2 py-1 active:opacity-50",
                formStep === 1 ? "opacity-20" : "opacity-75",
              )}
            >
              <Text className="text-base font-bold tracking-tighter text-[var(--color-navy)]">
                {"<<<< "}
              </Text>
            </Pressable>

            {/* Center Swipe Text */}
            <View className="px-2">
              <Text className="text-sm font-semibold tracking-wider text-[var(--color-ink-muted)]">
                Swipe
              </Text>
            </View>

            {/* Right Arrows (Swipe Left to advance) */}
            <Pressable
              onPress={() => {
                if (formStep === 1) {
                  void handleValidateAndProceedToStep2();
                } else if (formStep === 2) {
                  void handleValidateAndProceedToStep3();
                }
              }}
              disabled={formStep === 3}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Next step"
              className={cn(
                "px-2 py-1 active:opacity-50",
                formStep === 3 ? "opacity-20" : "opacity-75",
              )}
            >
              <Text className="text-base font-bold tracking-tighter text-[var(--color-navy)]">
                {" >>>>"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
