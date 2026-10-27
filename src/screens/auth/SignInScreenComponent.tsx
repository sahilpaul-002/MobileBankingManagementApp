import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Clipboard from 'expo-clipboard';
import { Copy, Landmark } from 'lucide-react-native';
import { z } from 'zod';

import CustomButtonComponent from '@/components/common/CustomButtonComponent';
import CustomInputComponent from '@/components/common/CustomInputComponent';
import CustomPasswordInputComponent from '@/components/common/CustomPasswordInputComponent';
import { showToastMessage } from '@/components/common/ToastMessagesComponent';
import { useSignInMutation } from '@/redux/features/user/userApis';
import { useappDispatchType } from '@/redux/hooks/reduxHooks';
import { setIsEmail } from '@/redux/slice/user/userSlice';
import ShowInConsole from '@/utils/ShowInConsole';

// ------------------------------------- ZOD VALIDATION SCHEMA ------------------------------------- \\
const signInFormValidationSchema = z.object({
  email: z
    .string()
    .min(1, 'Email required')
    .email('Invalid email')
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Invalid email format'
    ),
  password: z
    .string()
    .min(8, 'Password must be atleast of 8 characters')
    .regex(/[A-Z]/, 'Password must contain a uppercase character')
    .regex(/[a-z]/, 'Password must contain a lowercase character')
    .regex(/\d/, 'Password must contain a digit')
    .regex(/[!@#$%^&*]/, 'Password must contain special characters'),
});

type SigninFormData = z.infer<typeof signInFormValidationSchema>;

const DEMO_CREDENTIALS = [
  { label: 'Email', value: 'bmatest02@yopmail.com' },
  { label: 'Password', value: 'W@llet123' },
];

export default function SignInScreenComponent() {
  const dispatch = useappDispatchType();

  // Clear userEmail state on mount
  useEffect(() => {
    dispatch(setIsEmail(null));
  }, [dispatch]);

  // State to manage password visibility
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signInFormValidationSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // SignIn API Mutation
  const [signIn, { isLoading }] = useSignInMutation();

  // Handle form submission
  const onSigninFormSubmit: SubmitHandler<SigninFormData> = async (formData) => {
    const { email, password } = formData;
    try {
      let redirectionStep:
        | 'SEND-VERIFY-EMAIL'
        | 'VERIFY-EMAIL'
        | 'SELECT-2FA'
        | 'SEND-EMAIL-OTP'
        | 'VERIFY-TOTP'
        | 'SMS-OTP'
        | null = null;

      const result = await signIn({ email, password }).unwrap();

      ShowInConsole('Sign in response', result);
      dispatch(setIsEmail(email));

      const successMessage = result?.message || '';
      const normalizedMessage = successMessage.toLowerCase();

      switch (true) {
        case normalizedMessage.includes('user login successfull, email verification code sent to the email'):
          showToastMessage({
            type: 'success',
            text1: 'Sign in successful!',
            text2: 'Redirecting to email verification.',
          });
          redirectionStep = 'VERIFY-EMAIL';
          break;

        case normalizedMessage.includes('user login successfull, but failed to send email verification code'):
          showToastMessage({
            type: 'success',
            text1: 'Sign in successful!',
            text2: 'Failed to generate email verification code.',
          });
          redirectionStep = 'SEND-VERIFY-EMAIL';
          break;

        case normalizedMessage.includes('user login successfull, 2fa not enabled'):
          showToastMessage({
            type: 'success',
            text1: 'Sign in successful!',
            text2: 'Redirecting to 2-factor-authentication method selection.',
          });
          redirectionStep = 'SELECT-2FA';
          break;

        case normalizedMessage.includes('user login successful, 2fa enabled'):
          if (result?.data?.twoFaType === 'EMAIL-OTP') {
            showToastMessage({
              type: 'success',
              text1: 'Sign in successful!',
              text2: 'Redirecting to 2-factor-authentication using email.',
            });
            redirectionStep = 'SEND-EMAIL-OTP';
          } else if (result?.data?.twoFaType === 'TOTP') {
            showToastMessage({
              type: 'success',
              text1: 'Sign in successful!',
              text2: 'Redirecting to 2-factor-authentication using authenticator.',
            });
            redirectionStep = 'VERIFY-TOTP';
          } else {
            showToastMessage({
              type: 'success',
              text1: 'Sign in successful!',
              text2: 'Redirecting to 2-factor-authentication using SMS.',
            });
            redirectionStep = 'SMS-OTP';
          }
          break;

        default:
          showToastMessage({
            type: 'error',
            text1: 'Sign In Error',
            text2: 'Sign in service is facing issue. Please try again later.',
          });
          redirectionStep = null;
          break;
      }

      if (redirectionStep === 'SEND-VERIFY-EMAIL') {
        setTimeout(() => {
          router.push('/email-verification/send-code');
        }, 500);
      } else if (redirectionStep === 'VERIFY-EMAIL') {
        setTimeout(() => {
          router.push('/email-verification/verify-code');
        }, 500);
      } else if (redirectionStep === 'SELECT-2FA') {
        setTimeout(() => {
          router.push('/select2FaMethod');
        }, 500);
      } else if (redirectionStep === 'SEND-EMAIL-OTP') {
        setTimeout(() => {
          router.push('/two-fa/send-code/emailOtp');
        }, 500);
      } else if (redirectionStep === 'VERIFY-TOTP') {
        setTimeout(() => {
          router.push('/two-fa/verify-code/totp');
        }, 500);
      } else if (redirectionStep === 'SMS-OTP') {
        setTimeout(() => {
          router.push('/two-fa/send-code/smsOtp');
        }, 500);
      }
    } catch (err: any) {
      ShowInConsole('Sign in error', typeof err === 'object' && err !== null ? err : { error: err });

      const errorMessage = Array.isArray(err?.data?.message)
        ? err.data.message[0]
        : err?.data?.message ||
          err?.message ||
          'Sign in service is facing issue. Please try again later. If issue persist please contact support.';

      const normalizedMessage = errorMessage.toLowerCase();

      switch (true) {
        case normalizedMessage.includes('user does not exist'):
          showToastMessage({
            type: 'error',
            text1: 'Account Not Found',
            text2: 'No account found with this email. Please check your email or contact support.',
          });
          break;

        case normalizedMessage.includes('invalid credentials'):
          showToastMessage({
            type: 'error',
            text1: 'Invalid Credentials',
            text2: 'Sign in service failed due to invalid credentials.',
          });
          break;

        case normalizedMessage.includes('user configuration does not match'):
          showToastMessage({
            type: 'error',
            text1: 'Unauthorized',
            text2: 'Account is not authorized to access this application.',
          });
          break;

        default:
          showToastMessage({
            type: 'error',
            text1: 'Sign In Failed',
            text2: errorMessage || 'Sign in service is facing issue. Please try again later.',
          });
          break;
      }
    }
  };

  // Copy and autofill demo credentials
  const handleCopyCredential = async (label: string, value: string) => {
    try {
      await Clipboard.setStringAsync(value);
      if (label.toLowerCase() === 'email') {
        setValue('email', value, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      } else if (label.toLowerCase() === 'password') {
        setValue('password', value, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
      showToastMessage({
        type: 'success',
        text1: 'Copied & Applied',
        text2: `${label} copied and filled in form`,
      });
    } catch {
      showToastMessage({
        type: 'error',
        text1: 'Clipboard Error',
        text2: `Unable to copy ${label.toLowerCase()}`,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-[var(--color-app)]"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full flex-col items-center gap-5 my-auto">
          {/* Logo / Brand Header */}
          <View className="w-16 h-16 rounded-2xl bg-[var(--color-navy)] border border-[var(--color-gold)]/40 items-center justify-center shadow-sm shadow-black/10">
            <Landmark size={30} color="#d49a4d" strokeWidth={1.8} />
          </View>

          {/* Heading Text */}
          <View className="w-full items-center text-center gap-1.5">
            <Text className="text-2xl font-bold tracking-tight text-[var(--color-gold)]">
              Sign in
            </Text>
            <Text className="text-xs text-[var(--color-ink-muted)] text-center max-w-[280px]">
              Welcome back. Access your crypto & fiat wallet.
            </Text>
          </View>

          {/* Form Fields */}
          <View className="w-full space-y-3.5">
            {/* Email Field */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInputComponent
                  id="signinForm-input-email"
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

            {/* Password Field + Forgot Password */}
            <View className="w-full flex-col gap-1.5">
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomPasswordInputComponent
                    id="signinForm-input-password"
                    label="Password"
                    placeholder="Enter Password"
                    autoCapitalize="none"
                    autoComplete="current-password"
                    value={value}
                    password={value}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors?.password?.message}
                  />
                )}
              />

              {/* Forgot Password */}
              <View className="w-full items-end pt-1">
                <Pressable
                  onPress={() => router.push('/reset-password/send-code')}
                  hitSlop={8}
                >
                  <Text className="text-xs font-semibold text-[var(--color-link)] active:opacity-70">
                    Forgot Password ?
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Sign In Button */}
            <View className="w-full pt-3 items-center">
              <CustomButtonComponent
                id="signPage-signinForm-button"
                label="Sign In"
                variant="navy"
                size="lg"
                showButtonLoader={isLoading}
                onPress={handleSubmit(onSigninFormSubmit)}
              />
            </View>

            {/* Create Account Link */}
            <View className="w-full flex-row justify-center items-center gap-1.5 pt-2">
              <Text className="text-xs text-[var(--color-ink-muted)]">
                Create a new account -
              </Text>
              <Pressable
                onPress={() => router.push('/signUp')}
                hitSlop={8}
              >
                <Text className="text-xs font-semibold text-[var(--color-link)] active:opacity-70">
                  Sign Up
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Demo Credentials Card */}
          <View className="w-full rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-app-surface)] p-4 space-y-2.5 mt-2 shadow-sm shadow-black/5">
            <View className="items-start gap-0.5">
              <Text className="text-xs font-bold text-[var(--color-gold)]">
                Try the Demo Application
              </Text>
              <Text className="text-[11px] text-[var(--color-ink-muted)]">
                Tap copy to autofill and copy credentials.
              </Text>
            </View>

            <View className="space-y-2 pt-1">
              {DEMO_CREDENTIALS.map(({ label, value }) => (
                <View
                  key={label}
                  className="flex-row items-center justify-between py-1 border-b border-[var(--color-line-faint)] last:border-b-0"
                >
                  <View className="flex-row items-center gap-2 flex-1 mr-2">
                    <Text className="text-xs font-semibold text-[var(--color-ink-secondary)] w-16">
                      {label}
                    </Text>
                    <Text className="text-xs text-[var(--color-ink-muted)]">-</Text>
                    <Text
                      numberOfLines={1}
                      className="text-xs font-medium text-[var(--color-ink)] flex-1"
                    >
                      {value}
                    </Text>
                  </View>

                  <Pressable
                    hitSlop={8}
                    onPress={() => handleCopyCredential(label, value)}
                    className="p-1.5 rounded-md bg-[var(--color-app-subtle)] active:bg-[var(--color-gold-soft)]"
                    accessibilityRole="button"
                    accessibilityLabel={`Copy demo ${label.toLowerCase()}`}
                  >
                    <Copy size={13} color="#d49a4d" strokeWidth={2} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}