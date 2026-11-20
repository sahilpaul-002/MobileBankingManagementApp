import CustomButtonComponent from '@/components/common/CustomButtonComponent';
import CustomInputComponent from '@/components/common/CustomInputComponent';
import CustomSelectComponent from '@/components/common/CustomSelectComponent';
import { showToastMessage } from '@/components/common/ToastMessagesComponent';
import { useUserOnboardingMutation } from '@/redux/features/user/userApis';
import mobileCountryCodesLists from '@/utils/mobileCountryCodesList';
import ShowInConsole from '@/utils/ShowInConsole';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Copy, RotateCcw, X } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

const onboardingDetailsSchema = z.object({
    // Billing address
    billingLine1: z.string().trim().min(1, 'Billing address line 1 is required'),
    billingLine2: z.string().trim().optional(),
    billingCity: z.string().trim().min(1, 'Billing city is required'),
    billingState: z.string().trim().min(1, 'Billing state is required'),
    billingPostalCode: z.string().trim().min(1, 'Billing postal code is required'),
    billingCountry: z.string().trim().min(1, 'Billing country is required'),

    // Delivery address
    deliveryLine1: z.string().trim().min(1, 'Delivery address line 1 is required'),
    deliveryLine2: z.string().trim().optional(),
    deliveryCity: z.string().trim().min(1, 'Delivery city is required'),
    deliveryState: z.string().trim().min(1, 'Delivery state is required'),
    deliveryPostalCode: z
        .string()
        .trim()
        .min(1, 'Delivery postal code is required'),
    deliveryCountry: z.string().trim().min(1, 'Delivery country is required'),

    // Bank details
    accountHolderName: z
        .string()
        .trim()
        .min(1, 'Account holder name is required'),
    accountNumber: z.string().trim().min(1, 'Account number is required'),
    swiftCode: z.string().trim().min(1, 'SWIFT code is required'),
    ibanCode: z.string().trim().min(1, 'IBAN code is required'),
    bankName: z.string().trim().min(1, 'Bank name is required'),
});

type OnboardingDetailsFormData = z.infer<typeof onboardingDetailsSchema>;

interface AddOnboardingDetailsModalComponentProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail: string | null;
}

export default function AddOnboardingDetailsModalComponent({
    isOpen,
    onClose,
    userEmail,
}: AddOnboardingDetailsModalComponentProps) {
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const mobileCountryCodes: { label: string; value: string }[] = useMemo(
        () =>
            mobileCountryCodesLists().map((item) => ({
                label: item.name,
                value: item.country,
            })),
        []
    );

    const [triggerUserOnboarding, { isLoading: isSubmitting }] =
        useUserOnboardingMutation();

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<OnboardingDetailsFormData>({
        resolver: zodResolver(onboardingDetailsSchema),
        mode: 'onTouched',
        defaultValues: {
            billingLine1: '',
            billingLine2: '',
            billingCity: '',
            billingState: '',
            billingPostalCode: '',
            billingCountry: '',

            deliveryLine1: '',
            deliveryLine2: '',
            deliveryCity: '',
            deliveryState: '',
            deliveryPostalCode: '',
            deliveryCountry: '',

            accountHolderName: '',
            accountNumber: '',
            swiftCode: '',
            ibanCode: '',
            bankName: '',
        },
    });

    const handleFormSubmit: SubmitHandler<OnboardingDetailsFormData> = async (
        formData
    ) => {
        if (!userEmail) {
            setApiError('User session email is not available. Please re-login.');
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            return;
        }

        const payload = {
            email: userEmail,
            address_details: {
                email: userEmail,
                billing_address: {
                    line1: formData.billingLine1,
                    line2: formData.billingLine2 || '',
                    city: formData.billingCity,
                    state: formData.billingState,
                    postal_code: formData.billingPostalCode,
                    country: formData.billingCountry,
                    type: 'Billing',
                },
                delivery_address: {
                    line1: formData.deliveryLine1,
                    line2: formData.deliveryLine2 || '',
                    city: formData.deliveryCity,
                    state: formData.deliveryState,
                    postal_code: formData.deliveryPostalCode,
                    country: formData.deliveryCountry,
                    type: 'Delivery',
                },
            },
            bank_details: {
                email: userEmail,
                account_holder_name: formData.accountHolderName,
                account_number: formData.accountNumber,
                swift_code: formData.swiftCode,
                iban_code: formData.ibanCode,
                bank_name: formData.bankName,
                is_verified: false,
            },
        };

        try {
            setApiError(null);
            const result = await triggerUserOnboarding(payload).unwrap();
            if (result?.status?.toUpperCase() !== 'SUCCESS') {
                const errorMsg =
                    (result as any)?.message ||
                    'Failed to add onboarding details. Please try again.';
                setApiError(errorMsg);
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                return;
            }

            ShowInConsole('Add onboarding response:', result);
            showToastMessage({
                type: 'success',
                text1: 'Success',
                text2: 'Onboarding details added successfully.',
            });
            reset();
            setApiError(null);
            onClose();
        } catch (err: any) {
            ShowInConsole('Add user onboarding error:', err);
            const errorMessage =
                err?.data?.message ||
                err?.message ||
                'Failed to add onboarding details. Please try again.';
            setApiError(errorMessage);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        // Keep entered form data intact so user doesn't lose inputs on error/accidental close
        setApiError(null);
        onClose();
    };

    const handleResetForm = () => {
        if (isSubmitting) return;
        reset();
        setApiError(null);
        setInfoNotice(null);
    };

    const [infoNotice, setInfoNotice] = useState<string | null>(null);

    const copyBillingToDelivery = () => {
        const values = getValues();
        if (
            !values.billingLine1 &&
            !values.billingCity &&
            !values.billingPostalCode &&
            !values.billingCountry
        ) {
            setInfoNotice('Please fill in billing address fields first.');
            return;
        }

        setValue('deliveryLine1', values.billingLine1, {
            shouldValidate: true,
            shouldDirty: true,
        });
        setValue('deliveryLine2', values.billingLine2 || '', {
            shouldValidate: true,
            shouldDirty: true,
        });
        setValue('deliveryCity', values.billingCity, {
            shouldValidate: true,
            shouldDirty: true,
        });
        setValue('deliveryState', values.billingState, {
            shouldValidate: true,
            shouldDirty: true,
        });
        setValue('deliveryPostalCode', values.billingPostalCode, {
            shouldValidate: true,
            shouldDirty: true,
        });
        setValue('deliveryCountry', values.billingCountry, {
            shouldValidate: true,
            shouldDirty: true,
        });

        setInfoNotice('Delivery address auto-filled from billing address.');
    };

    const copyDeliveryToBilling = () => {
        const values = getValues();
        if (
            !values.deliveryLine1 &&
            !values.deliveryCity &&
            !values.deliveryPostalCode &&
            !values.deliveryCountry
        ) {
            setInfoNotice('Please fill in delivery address fields first.');
            return;
        }

        setValue('billingLine1', values.deliveryLine1, {
            shouldValidate: true,
            shouldDirty: true,
        });
        setValue('billingLine2', values.deliveryLine2 || '', {
            shouldValidate: true,
            shouldDirty: true,
        });
        setValue('billingCity', values.deliveryCity, {
            shouldValidate: true,
            shouldDirty: true,
        });
        setValue('billingState', values.deliveryState, {
            shouldValidate: true,
            shouldDirty: true,
        });
        setValue('billingPostalCode', values.deliveryPostalCode, {
            shouldValidate: true,
            shouldDirty: true,
        });
        setValue('billingCountry', values.deliveryCountry, {
            shouldValidate: true,
            shouldDirty: true,
        });

        setInfoNotice('Billing address auto-filled from delivery address.');
    };

    return (
        <Modal
            animationType="slide"
            transparent
            visible={isOpen}
            onRequestClose={handleClose}
        >
            <View className="flex-1 bg-black/60 justify-end">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    className="flex-1 justify-end"
                >
                    <View
                        style={{
                            maxHeight: '92%',
                            paddingBottom: Math.max(insets.bottom, 16),
                        }}
                        className="w-full rounded-t-3xl border-t border-[var(--color-line)] bg-[var(--color-app-surface)] shadow-2xl"
                    >
                        {/* Header */}
                        <View className="flex-row items-center justify-between border-b border-[var(--color-line)] px-6 py-4">
                            <View className="flex-1 mr-2">
                                <Text className="text-lg font-bold text-[var(--color-ink)]">
                                    Add Onboarding Details
                                </Text>
                                <Text className="text-xs text-[var(--color-ink-muted)]">
                                    Register your verified address & banking information
                                </Text>
                            </View>

                            <View className="flex-row items-center gap-2">
                                <Pressable
                                    onPress={handleResetForm}
                                    disabled={isSubmitting}
                                    className="flex-row items-center gap-1 rounded-lg px-2.5 py-1.5 bg-[var(--color-app-subtle)]"
                                    accessibilityLabel="Reset form fields"
                                >
                                    <RotateCcw size={13} color="#4a5673" />
                                    <Text className="text-xs font-semibold text-[var(--color-ink-soft)]">
                                        Reset
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={handleClose}
                                    disabled={isSubmitting}
                                    className="h-8 w-8 items-center justify-center rounded-full bg-[var(--color-app-subtle)]"
                                    accessibilityLabel="Close modal"
                                >
                                    <X size={18} color="#0c1830" />
                                </Pressable>
                            </View>
                        </View>

                        {/* Form Content */}
                        <ScrollView
                            ref={scrollViewRef}
                            className="px-6 py-4"
                            contentContainerStyle={{ paddingBottom: 32 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Inline API Error Banner */}
                            {apiError ? (
                                <View className="mb-5 flex-row items-start gap-2.5 rounded-xl border border-[var(--color-status-danger)]/40 bg-[var(--color-status-danger-bg)] p-3.5 shadow-xs">
                                    <AlertCircle size={18} color="#b03333" className="mt-0.5 shrink-0" />
                                    <View className="flex-1">
                                        <Text className="text-xs font-bold text-[#b03333]">
                                            Submission Error
                                        </Text>
                                        <Text className="mt-0.5 text-xs leading-4 text-[var(--color-ink-soft)]">
                                            {apiError}
                                        </Text>
                                    </View>
                                    <Pressable
                                        onPress={() => setApiError(null)}
                                        hitSlop={8}
                                        className="p-0.5"
                                    >
                                        <X size={14} color="#8a93a8" />
                                    </Pressable>
                                </View>
                            ) : null}
                            {/* Info Notice Banner */}
                            {infoNotice ? (
                                <View className="mb-4 flex-row items-center justify-between rounded-xl border border-[var(--color-gold)]/40 bg-[#fffdfa] px-3.5 py-2.5 shadow-xs">
                                    <View className="flex-row items-center gap-2 flex-1 mr-2">
                                        <CheckCircle2 size={16} color="#c47a1a" />
                                        <Text className="text-xs font-medium text-[var(--color-ink)]">
                                            {infoNotice}
                                        </Text>
                                    </View>
                                    <Pressable onPress={() => setInfoNotice(null)} hitSlop={8}>
                                        <X size={14} color="#8a93a8" />
                                    </Pressable>
                                </View>
                            ) : null}

                            {/* Billing Address Section */}
                            <View className="mb-6 flex-col gap-3.5">
                                <View className="flex-row items-center justify-between border-b border-[var(--color-line-faint)] pb-2">
                                    <View className="flex-1 mr-2">
                                        <Text className="text-sm font-bold text-[var(--color-navy)]">
                                            1. Billing Address
                                        </Text>
                                        <Text className="text-xs text-[var(--color-ink-muted)]">
                                            Primary address for financial statement delivery
                                        </Text>
                                    </View>

                                    <Pressable
                                        onPress={copyDeliveryToBilling}
                                        className="flex-row items-center gap-1.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-app-subtle)] px-2.5 py-1.5 active:bg-[var(--color-line)]"
                                        accessibilityLabel="Copy from delivery address"
                                    >
                                        <Copy size={12} color="#4a5673" />
                                        <Text className="text-xs font-semibold text-[var(--color-ink-soft)]">
                                            Copy from Delivery
                                        </Text>
                                    </Pressable>
                                </View>

                                <Controller
                                    name="billingLine1"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomInputComponent
                                            id="onboarding-billing-line1"
                                            label="Address Line 1"
                                            placeholder="Street address or P.O. Box"
                                            value={field.value}
                                            onChangeText={field.onChange}
                                            error={errors?.billingLine1?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="billingLine2"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomInputComponent
                                            id="onboarding-billing-line2"
                                            label="Address Line 2 (Optional)"
                                            placeholder="Apt, Suite, Unit, Building"
                                            value={field.value}
                                            onChangeText={field.onChange}
                                        />
                                    )}
                                />

                                <Controller
                                    name="billingCity"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomInputComponent
                                            id="onboarding-billing-city"
                                            label="City"
                                            placeholder="City name"
                                            value={field.value}
                                            onChangeText={field.onChange}
                                            error={errors?.billingCity?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="billingState"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomInputComponent
                                            id="onboarding-billing-state"
                                            label="State / Region"
                                            placeholder="State or Province"
                                            value={field.value}
                                            onChangeText={field.onChange}
                                            error={errors?.billingState?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="billingPostalCode"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomInputComponent
                                            id="onboarding-billing-postalCode"
                                            label="Postal Code"
                                            placeholder="Postal / ZIP code"
                                            value={field.value}
                                            onChangeText={field.onChange}
                                            error={errors?.billingPostalCode?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="billingCountry"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomSelectComponent
                                            id="onboarding-billing-country"
                                            fieldLabel="Country"
                                            placeholder="Select Country"
                                            labels={mobileCountryCodes}
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={errors?.billingCountry?.message}
                                        />
                                    )}
                                />
                            </View>

                            {/* Delivery Address Section */}
                            <View className="mb-6 flex-col gap-3.5">
                                <View className="flex-row items-center justify-between border-b border-[var(--color-line-faint)] pb-2">
                                    <View className="flex-1 mr-2">
                                        <Text className="text-sm font-bold text-[var(--color-navy)]">
                                            2. Delivery Address
                                        </Text>
                                        <Text className="text-xs text-[var(--color-ink-muted)]">
                                            Address for physical card issuance & dispatch
                                        </Text>
                                    </View>

                                    <Pressable
                                        onPress={copyBillingToDelivery}
                                        className="flex-row items-center gap-1.5 rounded-lg border border-[var(--color-gold)]/40 bg-[#fffdfa] px-2.5 py-1.5 active:bg-[#f5e6cc]"
                                        accessibilityLabel="Copy from billing address"
                                    >
                                        <Copy size={12} color="#c47a1a" />
                                        <Text className="text-xs font-semibold text-[#c47a1a]">
                                            Same as Billing
                                        </Text>
                                    </Pressable>
                                </View>

                                <Controller
                                    name="deliveryLine1"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomInputComponent
                                            id="onboarding-delivery-line1"
                                            label="Address Line 1"
                                            placeholder="Street address or P.O. Box"
                                            value={field.value}
                                            onChangeText={field.onChange}
                                            error={errors?.deliveryLine1?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="deliveryLine2"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomInputComponent
                                            id="onboarding-delivery-line2"
                                            label="Address Line 2 (Optional)"
                                            placeholder="Apt, Suite, Unit, Building"
                                            value={field.value}
                                            onChangeText={field.onChange}
                                        />
                                    )}
                                />

                                <Controller
                                    name="deliveryCity"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomInputComponent
                                            id="onboarding-delivery-city"
                                            label="City"
                                            placeholder="City name"
                                            value={field.value}
                                            onChangeText={field.onChange}
                                            error={errors?.deliveryCity?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="deliveryState"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomInputComponent
                                            id="onboarding-delivery-state"
                                            label="State / Region"
                                            placeholder="State or Province"
                                            value={field.value}
                                            onChangeText={field.onChange}
                                            error={errors?.deliveryState?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="deliveryPostalCode"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomInputComponent
                                            id="onboarding-delivery-postalCode"
                                            label="Postal Code"
                                            placeholder="Postal / ZIP code"
                                            value={field.value}
                                            onChangeText={field.onChange}
                                            error={errors?.deliveryPostalCode?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="deliveryCountry"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomSelectComponent
                                            id="onboarding-delivery-country"
                                            fieldLabel="Country"
                                            placeholder="Select Country"
                                            labels={mobileCountryCodes}
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={errors?.deliveryCountry?.message}
                                        />
                                    )}
                                />
                            </View>

                            {/* Bank Details Section */}
                            <View className="mb-6 flex-col gap-3.5">
                                <View className="border-b border-[var(--color-line-faint)] pb-1.5">
                                    <Text className="text-sm font-bold text-[var(--color-navy)]">
                                        3. Bank Account Information
                                    </Text>
                                    <Text className="text-xs text-[var(--color-ink-muted)]">
                                        Account for funding and treasury disbursements
                                    </Text>
                                </View>

                                <Controller
                                    name="bankName"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomInputComponent
                                            id="onboarding-bank-name"
                                            label="Bank Name"
                                            placeholder="Bank institution name"
                                            value={field.value}
                                            onChangeText={field.onChange}
                                            error={errors?.bankName?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="accountHolderName"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomInputComponent
                                            id="onboarding-account-holder"
                                            label="Account Holder Name"
                                            placeholder="Legal entity or personal name"
                                            value={field.value}
                                            onChangeText={field.onChange}
                                            error={errors?.accountHolderName?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="accountNumber"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomInputComponent
                                            id="onboarding-account-number"
                                            label="Account Number"
                                            placeholder="Bank account number"
                                            value={field.value}
                                            onChangeText={field.onChange}
                                            error={errors?.accountNumber?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="swiftCode"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomInputComponent
                                            id="onboarding-swift-code"
                                            label="SWIFT / BIC Code"
                                            placeholder="SWIFT code"
                                            value={field.value}
                                            onChangeText={field.onChange}
                                            error={errors?.swiftCode?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="ibanCode"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomInputComponent
                                            id="onboarding-iban-code"
                                            label="IBAN"
                                            placeholder="International Bank Account Number"
                                            value={field.value}
                                            onChangeText={field.onChange}
                                            error={errors?.ibanCode?.message}
                                        />
                                    )}
                                />
                            </View>

                            {/* Bottom API Error Alert */}
                            {apiError ? (
                                <View className="mt-4 mb-1 flex-row items-center gap-2 rounded-lg border border-[var(--color-status-danger)]/30 bg-[var(--color-status-danger-bg)] px-3 py-2">
                                    <AlertCircle size={14} color="#b03333" className="shrink-0" />
                                    <Text className="flex-1 text-xs font-medium text-[#b03333]" numberOfLines={2}>
                                        {apiError}
                                    </Text>
                                </View>
                            ) : null}

                            {/* Action Buttons */}
                            <View className="mt-4 flex-row items-center gap-3">
                                <View className="flex-1">
                                    <CustomButtonComponent
                                        id="onboarding-cancel-btn"
                                        label="Cancel"
                                        variant="outline"
                                        onPress={handleClose}
                                        disabled={isSubmitting}
                                    />
                                </View>

                                <View className="flex-1">
                                    <CustomButtonComponent
                                        id="onboarding-submit-btn"
                                        label="Submit Details"
                                        variant="navy"
                                        onPress={() => void handleSubmit(handleFormSubmit)()}
                                        disabled={isSubmitting}
                                        showButtonLoader={isSubmitting}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}
