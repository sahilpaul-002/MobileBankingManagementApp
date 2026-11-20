import CustomButtonComponent from '@/components/common/CustomButtonComponent';
import CustomInputComponent from '@/components/common/CustomInputComponent';
import { showToastMessage } from '@/components/common/ToastMessagesComponent';
import { useUserOnboardingMutation } from '@/redux/features/user/userApis';
import type {
    AddressDetailsType,
    BankDetailsType,
} from '@/types/user/userDetailsPageTypes';
import ShowInConsole from '@/utils/ShowInConsole';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Clock, Pencil } from 'lucide-react-native';
import { Activity, useState } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { Text, View } from 'react-native';
import { z } from 'zod';

// ── Zod Schema ──────────────────────────────────────────────────────────────
const bankDetailsSchema = z.object({
    account_holder_name: z.string().min(1, 'Account holder name is required'),
    account_number: z
        .string()
        .min(6, 'Account number must be at least 6 digits')
        .regex(/^[0-9]+$/, 'Account number must contain only digits'),
    swift_code: z
        .string()
        .min(8, 'SWIFT code must be 8–11 characters')
        .max(11, 'SWIFT code must be 8–11 characters'),
    iban_code: z.string().min(15, 'IBAN must be at least 15 characters'),
    bank_name: z.string().min(1, 'Bank name is required'),
});

type BankDetailsFormData = z.infer<typeof bankDetailsSchema>;

// ── Verification Badge ──────────────────────────────────────────────────────
function VerificationBadge({ verified }: { verified: boolean }) {
    return (
        <View
            className={`flex-row items-center gap-1.5 rounded-full px-3 py-1 ${
                verified
                    ? 'border border-[var(--color-status-success)]/30 bg-[var(--color-status-success-bg)]'
                    : 'border border-[var(--color-status-warning)]/30 bg-[var(--color-status-warning-bg)]'
            }`}
        >
            {verified ? (
                <CheckCircle2 size={13} color="#1f8a5b" />
            ) : (
                <Clock size={13} color="#c47a1a" />
            )}
            <Text
                className={`text-xs font-semibold ${
                    verified
                        ? 'text-[var(--color-status-success)]'
                        : 'text-[var(--color-status-warning)]'
                }`}
            >
                {verified ? 'Verified' : 'Pending Verification'}
            </Text>
        </View>
    );
}

// ── Component ────────────────────────────────────────────────────────────────
interface BankDetailsComponentProps {
    bankDetails: BankDetailsType;
    addressDetails: AddressDetailsType;
    kybApproved: boolean;
    userEmail: string;
}

export default function BankDetailsComponent({
    bankDetails,
    addressDetails,
    kybApproved,
    userEmail,
}: BankDetailsComponentProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [triggerUserOnboarding, { isLoading: isUpdating }] =
        useUserOnboardingMutation();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<BankDetailsFormData>({
        resolver: zodResolver(bankDetailsSchema),
        mode: 'onTouched',
        defaultValues: {
            account_holder_name: bankDetails.account_holder_name || '',
            account_number: bankDetails.account_number || '',
            swift_code: bankDetails.swift_code || '',
            iban_code: bankDetails.iban_code || '',
            bank_name: bankDetails.bank_name || '',
        },
    });

    const onValid: SubmitHandler<BankDetailsFormData> = async (formData) => {
        if (!userEmail) {
            showToastMessage({
                type: 'error',
                text1: 'Error',
                text2: 'Email not available. Please try again.',
            });
            return;
        }

        const payload = {
            email: userEmail,
            address_details: {
                email: userEmail,
                billing_address: {
                    ...addressDetails.billing_address,
                    line2: addressDetails.billing_address.line2 || '',
                    type: 'Billing',
                },
                delivery_address: {
                    ...addressDetails.delivery_address,
                    line2: addressDetails.delivery_address.line2 || '',
                    type: 'Delivery',
                },
            },
            bank_details: {
                email: userEmail,
                account_holder_name: formData.account_holder_name,
                account_number: formData.account_number,
                swift_code: formData.swift_code,
                iban_code: formData.iban_code,
                bank_name: formData.bank_name,
                is_verified: bankDetails.is_verified,
            },
        };

        try {
            const result = await triggerUserOnboarding(payload).unwrap();
            if (result?.status?.toUpperCase() !== 'SUCCESS') {
                showToastMessage({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to update bank details. Please try again later.',
                });
                return;
            }

            ShowInConsole('Update bank details response:', result);
            showToastMessage({
                type: 'success',
                text1: 'Success',
                text2: 'Bank details updated successfully.',
            });
            setIsEditing(false);
        } catch (err: any) {
            ShowInConsole('Update bank details error:', err);
            const errorMessage =
                err?.data?.message ||
                err?.message ||
                'Update bank details service is facing an issue. Please try again later.';
            showToastMessage({
                type: 'error',
                text1: 'Update Failed',
                text2: errorMessage,
            });
        }
    };

    const handleCancel = () => {
        reset();
        setIsEditing(false);
    };

    return (
        <View className="w-full flex-col gap-5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-5 shadow-xs">
            {/* Header */}
            <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-2">
                    <Text className="text-base font-bold tracking-tight text-[var(--color-ink)]">
                        Linked Bank Account
                    </Text>
                    <Text className="text-xs text-[var(--color-ink-muted)]">
                        Bank details associated with your settlement account
                    </Text>
                </View>

                <Activity mode={!isEditing && !kybApproved ? 'visible' : 'hidden'}>
                    <View className="w-20">
                        <CustomButtonComponent
                            id="bankDetails-edit-btn"
                            variant="outline"
                            buttonClassName="h-9 px-3 rounded-lg flex-row items-center justify-center gap-1.5"
                            onPress={() => setIsEditing(true)}
                            disabled={kybApproved}
                        >
                            <Pencil size={13} color="#0c1830" />
                            <Text className="text-xs font-semibold text-[var(--color-ink)]">
                                Edit
                            </Text>
                        </CustomButtonComponent>
                    </View>
                </Activity>
            </View>

            {/* Form Fields */}
            <View className="flex-col gap-3.5">
                <Controller
                    name="bank_name"
                    control={control}
                    render={({ field }) => (
                        <CustomInputComponent
                            id="bankDetails-input-bankName"
                            label="Bank Name"
                            placeholder="Enter bank name"
                            value={field.value}
                            onChangeText={field.onChange}
                            editable={isEditing}
                            fieldLabelClassname="text-xs font-semibold uppercase text-[var(--color-ink-soft)]"
                            inputClassname={
                                isEditing
                                    ? 'bg-[var(--color-app-surface)]'
                                    : 'bg-[var(--color-app-subtle)] text-[var(--color-ink)]'
                            }
                            error={errors?.bank_name?.message}
                        />
                    )}
                />

                <Controller
                    name="account_holder_name"
                    control={control}
                    render={({ field }) => (
                        <CustomInputComponent
                            id="bankDetails-input-accountHolderName"
                            label="Account Holder Name"
                            placeholder="Enter account holder name"
                            value={field.value}
                            onChangeText={field.onChange}
                            editable={isEditing}
                            fieldLabelClassname="text-xs font-semibold uppercase text-[var(--color-ink-soft)]"
                            inputClassname={
                                isEditing
                                    ? 'bg-[var(--color-app-surface)]'
                                    : 'bg-[var(--color-app-subtle)] text-[var(--color-ink)]'
                            }
                            error={errors?.account_holder_name?.message}
                        />
                    )}
                />

                <Controller
                    name="account_number"
                    control={control}
                    render={({ field }) => (
                        <CustomInputComponent
                            id="bankDetails-input-accountNumber"
                            label="Account Number"
                            placeholder="Enter account number"
                            value={field.value}
                            onChangeText={field.onChange}
                            editable={isEditing}
                            fieldLabelClassname="text-xs font-semibold uppercase text-[var(--color-ink-soft)]"
                            inputClassname={
                                isEditing
                                    ? 'bg-[var(--color-app-surface)]'
                                    : 'bg-[var(--color-app-subtle)] text-[var(--color-ink)]'
                            }
                            error={errors?.account_number?.message}
                        />
                    )}
                />

                <Controller
                    name="swift_code"
                    control={control}
                    render={({ field }) => (
                        <CustomInputComponent
                            id="bankDetails-input-swiftCode"
                            label="SWIFT / BIC Code"
                            placeholder="Enter SWIFT code"
                            value={field.value}
                            onChangeText={field.onChange}
                            editable={isEditing}
                            fieldLabelClassname="text-xs font-semibold uppercase text-[var(--color-ink-soft)]"
                            inputClassname={
                                isEditing
                                    ? 'bg-[var(--color-app-surface)]'
                                    : 'bg-[var(--color-app-subtle)] text-[var(--color-ink)]'
                            }
                            error={errors?.swift_code?.message}
                        />
                    )}
                />

                <Controller
                    name="iban_code"
                    control={control}
                    render={({ field }) => (
                        <CustomInputComponent
                            id="bankDetails-input-ibanCode"
                            label="IBAN Code"
                            placeholder="Enter IBAN code"
                            value={field.value}
                            onChangeText={field.onChange}
                            editable={isEditing}
                            fieldLabelClassname="text-xs font-semibold uppercase text-[var(--color-ink-soft)]"
                            inputClassname={
                                isEditing
                                    ? 'bg-[var(--color-app-surface)]'
                                    : 'bg-[var(--color-app-subtle)] text-[var(--color-ink)]'
                            }
                            error={errors?.iban_code?.message}
                        />
                    )}
                />

                {/* Verification Status */}
                <View className="flex-row items-center justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-app-subtle)] p-3.5">
                    <Text className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-soft)]">
                        Verification Status
                    </Text>
                    <VerificationBadge verified={bankDetails.is_verified} />
                </View>
            </View>

            {/* Action Buttons */}
            <Activity mode={isEditing ? 'visible' : 'hidden'}>
                <View className="mt-3 flex-row items-center justify-end gap-3 border-t border-[var(--color-line)] pt-3">
                    <View className="flex-1">
                        <CustomButtonComponent
                            id="bankDetails-cancel-btn"
                            label="Cancel"
                            variant="outline"
                            onPress={handleCancel}
                            disabled={isUpdating}
                        />
                    </View>

                    <View className="flex-1">
                        <CustomButtonComponent
                            id="bankDetails-submit-btn"
                            label="Save Changes"
                            variant="navy"
                            onPress={handleSubmit(onValid)}
                            disabled={isUpdating}
                            showButtonLoader={isUpdating}
                        />
                    </View>
                </View>
            </Activity>
        </View>
    );
}
