import CustomInputComponent from "@/components/common/CustomInputComponent";
import CustomSelectComponent from "@/components/common/CustomSelectComponent";
import type { UserDetailsType } from "@/types/user/userDetailsPageTypes";
import mobileCountryCodesLists from "@/utils/mobileCountryCodesList";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Shield, XCircle } from "lucide-react-native";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { z } from "zod";

// ── Zod Schema ──────────────────────────────────────────────────────────────
const personalDetailsSchema = z.object({
  fullName: z
    .string()
    .min(4, "Full name must be at least 4 characters")
    .regex(/^[A-Za-z0-9 .'"-]+$/, "Full name contains invalid characters"),
  userEmail: z.string().email("Invalid email"),
  gender: z.string().min(1, "Please select a gender"),
  isEmailVerified: z.string(),
  isAdmin: z.string(),
  mobileCountryCode: z.string().min(1, "Please select a dial code"),
  mobileCountryName: z.string().min(1, "Please select a country"),
  twoFaType: z.string(),
});

type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;

// ── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({
  value,
  trueLabel = "Yes",
  falseLabel = "No",
}: {
  value: string;
  trueLabel?: string;
  falseLabel?: string;
}) {
  const isActive = value === "Y" || value === "true";
  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-full px-3 py-1 ${
        isActive
          ? "border border-[var(--color-status-success)]/30 bg-[var(--color-status-success-bg)]"
          : "border border-[var(--color-status-danger)]/30 bg-[var(--color-status-danger-bg)]"
      }`}
    >
      {isActive ? (
        <CheckCircle2 size={12} color="#1f8a5b" />
      ) : (
        <XCircle size={12} color="#b03333" />
      )}
      <Text
        className={`text-xs font-semibold ${
          isActive
            ? "text-[var(--color-status-success)]"
            : "text-[var(--color-status-danger)]"
        }`}
      >
        {isActive ? trueLabel : falseLabel}
      </Text>
    </View>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
interface PersonalDetailsComponentProps {
  userDetails: UserDetailsType;
}

export default function PersonalDetailsComponent({
  userDetails,
}: PersonalDetailsComponentProps) {
  const mobileDialCodes: { label: string; value: string }[] = useMemo(
    () =>
      mobileCountryCodesLists().map((item) => ({
        label: `${item.country} (${item.code})`,
        value: item.code,
      })),
    [],
  );
  const mobileCountryCodes: { label: string; value: string }[] = useMemo(
    () =>
      mobileCountryCodesLists().map((item) => ({
        label: item.name,
        value: item.country,
      })),
    [],
  );

  const {
    control,
    formState: { errors },
  } = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(personalDetailsSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: userDetails.full_name || "",
      userEmail: userDetails.email || "",
      gender: userDetails.gender || "",
      isEmailVerified: userDetails.is_email_verified || "N",
      isAdmin: userDetails.is_admin || "N",
      mobileCountryCode: userDetails.mobile_country_code || "",
      mobileCountryName: userDetails.mobile_country_name || "",
      twoFaType: userDetails.two_fa_type || "",
    },
  });

  const initial = (userDetails.full_name || userDetails.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <View className="w-full flex-col gap-5">
      {/* User Identity Card Banner */}
      <View className="flex-row items-center gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-4 shadow-xs">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-[var(--color-navy)] shadow-xs">
          <Text className="text-xl font-bold text-[var(--color-gold)]">
            {initial}
          </Text>
        </View>

        <View className="flex-1">
          <Text
            className="text-base font-bold text-[var(--color-ink)]"
            numberOfLines={1}
          >
            {userDetails.full_name || "Cardholder"}
          </Text>
          <Text
            className="text-xs text-[var(--color-ink-soft)]"
            numberOfLines={1}
          >
            {userDetails.email}
          </Text>
          <View className="mt-1 flex-row items-center gap-2">
            <View className="flex-row items-center gap-1 rounded-md bg-[#fcf5eb] px-2 py-0.5 border border-[#f3d9b4]">
              <Shield size={11} color="#d49a4d" />
              <Text className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
                {userDetails.program_type || "STANDARD"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Section Header */}
      <View className="w-full">
        <Text className="text-base font-bold tracking-tight text-[var(--color-ink)]">
          Personal Information
        </Text>
        <Text className="text-xs text-[var(--color-ink-muted)]">
          Manage your verified personal account information
        </Text>
      </View>

      {/* Fields Grid */}
      <View className="flex-col gap-4">
        {/* Full Name */}
        <Controller
          name="fullName"
          control={control}
          render={({ field }) => (
            <CustomInputComponent
              id="personalDetails-input-fullName"
              label="Full Name"
              placeholder="Full name"
              value={field.value}
              editable={false}
              fieldLabelClassname="text-xs font-semibold uppercase text-[var(--color-ink-soft)]"
              inputClassname="bg-[var(--color-app-subtle)] text-[var(--color-ink)]"
              error={errors?.fullName?.message}
            />
          )}
        />

        {/* Email Address */}
        <Controller
          name="userEmail"
          control={control}
          render={({ field }) => (
            <CustomInputComponent
              id="personalDetails-input-email"
              label="Email Address"
              placeholder="Email address"
              value={field.value}
              editable={false}
              fieldLabelClassname="text-xs font-semibold uppercase text-[var(--color-ink-soft)]"
              inputClassname="bg-[var(--color-app-subtle)] text-[var(--color-ink)]"
              error={errors?.userEmail?.message}
            />
          )}
        />

        {/* Gender */}
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <CustomSelectComponent
              id="personalDetails-select-gender"
              fieldLabel="Gender"
              placeholder="Select Gender"
              labels={["MALE", "FEMALE", "OTHER"]}
              value={field.value}
              onChange={field.onChange}
              disabled
              fieldLabelClassName="text-xs font-semibold uppercase text-[var(--color-ink-soft)]"
              error={errors?.gender?.message}
            />
          )}
        />

        {/* 2FA Method */}
        <Controller
          name="twoFaType"
          control={control}
          render={({ field }) => (
            <CustomInputComponent
              id="personalDetails-input-twoFaType"
              label="Two-Factor Auth Method"
              placeholder="2FA Method"
              value={field.value}
              editable={false}
              fieldLabelClassname="text-xs font-semibold uppercase text-[var(--color-ink-soft)]"
              inputClassname="bg-[var(--color-app-subtle)] text-[var(--color-ink)]"
            />
          )}
        />

        {/* Mobile Dial Code */}
        <Controller
          name="mobileCountryCode"
          control={control}
          render={({ field }) => (
            <CustomSelectComponent
              id="personalDetails-select-dialCode"
              fieldLabel="Mobile Dial Code"
              placeholder="Select Dial Code"
              labels={mobileDialCodes}
              value={field.value}
              onChange={field.onChange}
              disabled
              fieldLabelClassName="text-xs font-semibold uppercase text-[var(--color-ink-soft)]"
              error={errors?.mobileCountryCode?.message}
            />
          )}
        />

        {/* Mobile Country */}
        <Controller
          name="mobileCountryName"
          control={control}
          render={({ field }) => (
            <CustomSelectComponent
              id="personalDetails-select-countryName"
              fieldLabel="Mobile Country"
              placeholder="Select Country"
              labels={mobileCountryCodes}
              value={field.value}
              onChange={field.onChange}
              disabled
              fieldLabelClassName="text-xs font-semibold uppercase text-[var(--color-ink-soft)]"
              error={errors?.mobileCountryName?.message}
            />
          )}
        />

        {/* Status Badges Card */}
        <View className="flex-row items-center justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-4">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-soft)]">
              Email Verified
            </Text>
            <Text className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
              Account authorization state
            </Text>
          </View>
          <StatusBadge
            value={userDetails.is_email_verified}
            trueLabel="Verified"
            falseLabel="Unverified"
          />
        </View>

        <View className="flex-row items-center justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-4">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-soft)]">
              Admin Access
            </Text>
            <Text className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
              Privileged role level
            </Text>
          </View>
          <StatusBadge
            value={userDetails.is_admin}
            trueLabel="Admin"
            falseLabel="Cardholder"
          />
        </View>
      </View>
    </View>
  );
}
