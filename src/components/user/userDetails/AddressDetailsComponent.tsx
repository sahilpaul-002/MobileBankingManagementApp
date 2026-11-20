import CustomButtonComponent from '@/components/common/CustomButtonComponent';
import CustomInputComponent from '@/components/common/CustomInputComponent';
import { showToastMessage } from '@/components/common/ToastMessagesComponent';
import { useUserOnboardingMutation } from '@/redux/features/user/userApis';
import type {
    AddressDetailsType,
    AddressType,
    BankDetailsType,
} from '@/types/user/userDetailsPageTypes';
import ShowInConsole from '@/utils/ShowInConsole';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react-native';
import { Activity, useState } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { Text, View } from 'react-native';
import { z } from 'zod';

// ── Zod Schema ──────────────────────────────────────────────────────────────
const addressSchema = z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postal_code: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
});

type AddressFormData = z.infer<typeof addressSchema>;

// ── Single Address Sub-Form ──────────────────────────────────────────────────
interface AddressSubFormPropsType {
    title: string;
    description: string;
    formId: string;
    defaultValues: AddressType;
    onSave: (data: AddressFormData) => Promise<boolean>;
    isSaving: boolean;
    kybApproved: boolean;
}

function AddressSubForm({
    title,
    description,
    formId,
    defaultValues,
    onSave,
    isSaving,
    kybApproved,
}: AddressSubFormPropsType) {
    const [isEditing, setIsEditing] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
        mode: 'onTouched',
        defaultValues: {
            line1: defaultValues.line1 || '',
            line2: defaultValues.line2 || '',
            city: defaultValues.city || '',
            state: defaultValues.state || '',
            postal_code: defaultValues.postal_code || '',
            country: defaultValues.country || '',
        },
    });

    const onValid: SubmitHandler<AddressFormData> = async (formData) => {
        const isSaved = await onSave(formData);
        if (isSaved) {
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        reset();
        setIsEditing(false);
    };

    return (
        <View className="w-full flex-col gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-5 shadow-xs">
            {/* Sub-section Header */}
            <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-2">
                    <Text className="text-sm font-bold tracking-tight text-[var(--color-ink)]">
                        {title}
                    </Text>
                    <Text className="text-xs text-[var(--color-ink-muted)]">
                        {description}
                    </Text>
                </View>

                <Activity mode={!isEditing && !kybApproved ? 'visible' : 'hidden'}>
                    <View className="w-20">
                        <CustomButtonComponent
                            id={`${formId}-edit-btn`}
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
                    name="line1"
                    control={control}
                    render={({ field }) => (
                        <CustomInputComponent
                            id={`${formId}-input-line1`}
                            label="Address Line 1"
                            placeholder="Enter address line 1"
                            value={field.value}
                            onChangeText={field.onChange}
                            editable={isEditing}
                            fieldLabelClassname="text-xs font-semibold uppercase text-[var(--color-ink-soft)]"
                            inputClassname={
                                isEditing
                                    ? 'bg-[var(--color-app-surface)]'
                                    : 'bg-[var(--color-app-subtle)] text-[var(--color-ink)]'
                            }
                            error={errors?.line1?.message}
                        />
                    )}
                />

                <Controller
                    name="line2"
                    control={control}
                    render={({ field }) => (
                        <CustomInputComponent
                            id={`${formId}-input-line2`}
                            label="Address Line 2 (Optional)"
                            placeholder="Enter address line 2"
                            value={field.value}
                            onChangeText={field.onChange}
                            editable={isEditing}
                            fieldLabelClassname="text-xs font-semibold uppercase text-[var(--color-ink-soft)]"
                            inputClassname={
                                isEditing
                                    ? 'bg-[var(--color-app-surface)]'
                                    : 'bg-[var(--color-app-subtle)] text-[var(--color-ink)]'
                            }
                            error={errors?.line2?.message}
                        />
                    )}
                />

                <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                        <CustomInputComponent
                            id={`${formId}-input-city`}
                            label="City"
                            placeholder="Enter city"
                            value={field.value}
                            onChangeText={field.onChange}
                            editable={isEditing}
                            fieldLabelClassname="text-xs font-semibold uppercase text-[var(--color-ink-soft)]"
                            inputClassname={
                                isEditing
                                    ? 'bg-[var(--color-app-surface)]'
                                    : 'bg-[var(--color-app-subtle)] text-[var(--color-ink)]'
                            }
                            error={errors?.city?.message}
                        />
                    )}
                />

                <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                        <CustomInputComponent
                            id={`${formId}-input-state`}
                            label="State / Region"
                            placeholder="Enter state"
                            value={field.value}
                            onChangeText={field.onChange}
                            editable={isEditing}
                            fieldLabelClassname="text-xs font-semibold uppercase text-[var(--color-ink-soft)]"
                            inputClassname={
                                isEditing
                                    ? 'bg-[var(--color-app-surface)]'
                                    : 'bg-[var(--color-app-subtle)] text-[var(--color-ink)]'
                            }
                            error={errors?.state?.message}
                        />
                    )}
                />

                <Controller
                    name="postal_code"
                    control={control}
                    render={({ field }) => (
                        <CustomInputComponent
                            id={`${formId}-input-postalCode`}
                            label="Postal Code"
                            placeholder="Enter postal code"
                            value={field.value}
                            onChangeText={field.onChange}
                            editable={isEditing}
                            fieldLabelClassname="text-xs font-semibold uppercase text-[var(--color-ink-soft)]"
                            inputClassname={
                                isEditing
                                    ? 'bg-[var(--color-app-surface)]'
                                    : 'bg-[var(--color-app-subtle)] text-[var(--color-ink)]'
                            }
                            error={errors?.postal_code?.message}
                        />
                    )}
                />

                <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                        <CustomInputComponent
                            id={`${formId}-input-country`}
                            label="Country"
                            placeholder="Enter country"
                            value={field.value}
                            onChangeText={field.onChange}
                            editable={isEditing}
                            fieldLabelClassname="text-xs font-semibold uppercase text-[var(--color-ink-soft)]"
                            inputClassname={
                                isEditing
                                    ? 'bg-[var(--color-app-surface)]'
                                    : 'bg-[var(--color-app-subtle)] text-[var(--color-ink)]'
                            }
                            error={errors?.country?.message}
                        />
                    )}
                />
            </View>

            {/* Action Buttons */}
            <Activity mode={isEditing ? 'visible' : 'hidden'}>
                <View className="mt-3 flex-row items-center justify-end gap-3 border-t border-[var(--color-line)] pt-3">
                    <View className="flex-1">
                        <CustomButtonComponent
                            id={`${formId}-cancel-btn`}
                            label="Cancel"
                            variant="outline"
                            onPress={handleCancel}
                            disabled={isSaving}
                        />
                    </View>

                    <View className="flex-1">
                        <CustomButtonComponent
                            id={`${formId}-submit-btn`}
                            label="Save Changes"
                            variant="navy"
                            onPress={handleSubmit(onValid)}
                            disabled={isSaving}
                            showButtonLoader={isSaving}
                        />
                    </View>
                </View>
            </Activity>
        </View>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
interface AddressDetailsComponentProps {
    addressDetails: AddressDetailsType;
    bankDetails: BankDetailsType;
    kybApproved: boolean;
    userEmail: string;
}

export default function AddressDetailsComponent({
    addressDetails,
    bankDetails,
    kybApproved,
    userEmail,
}: AddressDetailsComponentProps) {
    const [triggerUserOnboarding, { isLoading: isUpdating }] =
        useUserOnboardingMutation();

    const bankDetailsPayload = {
        email: userEmail,
        account_holder_name: bankDetails?.account_holder_name || '',
        account_number: bankDetails?.account_number || '',
        swift_code: bankDetails?.swift_code || '',
        iban_code: bankDetails?.iban_code || '',
        bank_name: bankDetails?.bank_name || '',
        is_verified: bankDetails?.is_verified ?? false,
    };

    const handleBillingSave = async (
        data: AddressFormData
    ): Promise<boolean> => {
        if (!userEmail) {
            showToastMessage({
                type: 'error',
                text1: 'Error',
                text2: 'Email not available. Please try again.',
            });
            return false;
        }

        const payload = {
            email: userEmail,
            address_details: {
                email: userEmail,
                billing_address: {
                    ...data,
                    line2: data.line2 || '',
                    type: 'Billing',
                },
                delivery_address: {
                    ...addressDetails.delivery_address,
                    line2: addressDetails.delivery_address.line2 || '',
                    type: 'Delivery',
                },
            },
            bank_details: bankDetailsPayload,
        };

        try {
            const result = await triggerUserOnboarding(payload).unwrap();

            if (result?.status?.toUpperCase() !== 'SUCCESS') {
                showToastMessage({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Update user onboarding service is facing issue. Please try again later.',
                });
                return false;
            }

            ShowInConsole('Update user onboarding response:', result);
            showToastMessage({
                type: 'success',
                text1: 'Success',
                text2: 'Billing address updated successfully.',
            });
            return true;
        } catch (err: any) {
            ShowInConsole('Update billing address error:', err);
            const errorMessage =
                err?.data?.message ||
                err?.message ||
                'Update address service is facing an issue. Please try again later.';
            showToastMessage({
                type: 'error',
                text1: 'Update Failed',
                text2: errorMessage,
            });
            return false;
        }
    };

    const handleDeliverySave = async (
        data: AddressFormData
    ): Promise<boolean> => {
        if (!userEmail) {
            showToastMessage({
                type: 'error',
                text1: 'Error',
                text2: 'Email not available. Please try again.',
            });
            return false;
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
                    ...data,
                    line2: data.line2 || '',
                    type: 'Delivery',
                },
            },
            bank_details: bankDetailsPayload,
        };

        try {
            const result = await triggerUserOnboarding(payload).unwrap();

            if (result?.status?.toUpperCase() !== 'SUCCESS') {
                showToastMessage({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Update user onboarding service is facing issue. Please try again later.',
                });
                return false;
            }

            ShowInConsole('Update user onboarding response:', result);
            showToastMessage({
                type: 'success',
                text1: 'Success',
                text2: 'Delivery address updated successfully.',
            });
            return true;
        } catch (err: any) {
            ShowInConsole('Update delivery address error:', err);
            const errorMessage =
                err?.data?.message ||
                err?.message ||
                'Update address service is facing an issue. Please try again later.';
            showToastMessage({
                type: 'error',
                text1: 'Update Failed',
                text2: errorMessage,
            });
            return false;
        }
    };

    return (
        <View className="w-full flex-col gap-6">
            <View>
                <Text className="text-base font-bold tracking-tight text-[var(--color-ink)]">
                    Registered Addresses
                </Text>
                <Text className="text-xs text-[var(--color-ink-muted)]">
                    Manage your verified billing and delivery destinations
                </Text>
            </View>

            <AddressSubForm
                title="Billing Address"
                description="Official financial & billing address"
                formId="billingAddress-form"
                defaultValues={addressDetails.billing_address}
                onSave={handleBillingSave}
                isSaving={isUpdating}
                kybApproved={kybApproved}
            />

            <AddressSubForm
                title="Delivery Address"
                description="Physical card & document delivery address"
                formId="deliveryAddress-form"
                defaultValues={addressDetails.delivery_address}
                onSave={handleDeliverySave}
                isSaving={isUpdating}
                kybApproved={kybApproved}
            />
        </View>
    );
}
