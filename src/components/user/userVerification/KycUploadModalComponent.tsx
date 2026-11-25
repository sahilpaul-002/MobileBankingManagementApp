import CustomButtonComponent from '@/components/common/CustomButtonComponent';
import CustomInputComponent from '@/components/common/CustomInputComponent';
import { showToastMessage } from '@/components/common/ToastMessagesComponent';
import { useUploadKycDetailsMutation } from '@/redux/features/kyc/kycApis';
import ShowInConsole from '@/utils/ShowInConsole';
import { zodResolver } from '@hookform/resolvers/zod';
import * as DocumentPicker from 'expo-document-picker';
import { AlertCircle, CheckCircle, FileText, RotateCcw, UploadCloud, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const kycUploadSchema = z.object({
    poiNumber: z
        .string()
        .trim()
        .min(1, 'Proof of Identity number is required')
        .regex(/^\d+$/, 'Proof of Identity number must contain only digits'),
    poaNumber: z
        .string()
        .trim()
        .min(1, 'Proof of Address number is required')
        .regex(/^\d+$/, 'Proof of Address number must contain only digits'),
});

type KycUploadFormData = z.infer<typeof kycUploadSchema>;

interface SelectedDoc {
    name: string;
    size: number;
    uri: string;
    mimeType?: string;
}

interface KycUploadModalComponentProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail: string | null;
}

export default function KycUploadModalComponent({
    isOpen,
    onClose,
    userEmail,
}: KycUploadModalComponentProps) {
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [triggerUploadKycDetails, { isLoading: isSubmitting }] = useUploadKycDetailsMutation();

    const [poiDoc, setPoiDoc] = useState<SelectedDoc | null>(null);
    const [poaDoc, setPoaDoc] = useState<SelectedDoc | null>(null);
    const [docErrors, setDocErrors] = useState<{
        poi?: string;
        poa?: string;
    }>({});

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<KycUploadFormData>({
        resolver: zodResolver(kycUploadSchema),
        mode: 'onTouched',
        defaultValues: {
            poiNumber: '',
            poaNumber: '',
        },
    });

    const pickDocument = async (type: 'poi' | 'poa') => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/pdf',
                    'image/png',
                    'image/jpeg',
                    'image/jpg',
                ],
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return;
            }

            const asset = result.assets[0];
            if (!asset) return;
            const size = asset.size || 0;

            if (size > MAX_FILE_SIZE_BYTES) {
                setDocErrors((prev) => ({
                    ...prev,
                    [type]: 'File size must not exceed 5 MB',
                }));
                return;
            }

            const docData: SelectedDoc = {
                name: asset.name,
                size,
                uri: asset.uri,
                mimeType: asset.mimeType || 'application/octet-stream',
            };

            if (type === 'poi') {
                setPoiDoc(docData);
                setDocErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.poi;
                    return copy;
                });
            } else {
                setPoaDoc(docData);
                setDocErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.poa;
                    return copy;
                });
            }
        } catch {
            showToastMessage({
                type: 'error',
                text1: 'Picker Error',
                text2: 'Could not access file picker. Please try again.',
            });
        }
    };

    const handleFormSubmit: SubmitHandler<KycUploadFormData> = async (
        formData
    ) => {
        let hasDocError = false;
        const newDocErrors: { poi?: string; poa?: string } = {};

        if (!poiDoc) {
            newDocErrors.poi = 'Proof of Identity document is required';
            hasDocError = true;
        }

        if (!poaDoc) {
            newDocErrors.poa = 'Proof of Address document is required';
            hasDocError = true;
        }

        if (hasDocError) {
            setDocErrors(newDocErrors);
            return;
        }

        if (!userEmail) {
            showToastMessage({
                type: 'error',
                text1: 'Error',
                text2: 'User email not found. Please re-login.',
            });
            return;
        }

        const poiFilePayload = {
            uri: poiDoc!.uri,
            name: poiDoc!.name,
            type: poiDoc!.mimeType || 'application/pdf',
        };

        const poaFilePayload = {
            uri: poaDoc!.uri,
            name: poaDoc!.name,
            type: poaDoc!.mimeType || 'application/pdf',
        };

        try {
            setApiError(null);
            const result = await triggerUploadKycDetails({
                email: userEmail,
                poi_number: formData.poiNumber,
                poa_number: formData.poaNumber,
                poi_document: poiFilePayload,
                poa_document: poaFilePayload,
            }).unwrap();

            if (result?.status?.toUpperCase() !== 'SUCCESS') {
                const errorMsg =
                    (result as any)?.message ||
                    'Failed to upload KYC documents. Please try again.';
                setApiError(errorMsg);
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                return;
            }

            ShowInConsole('Upload KYC response:', result);
            showToastMessage({
                type: 'success',
                text1: 'KYC Submitted',
                text2: 'KYC documents have been uploaded successfully for review.',
            });

            reset();
            setPoiDoc(null);
            setPoaDoc(null);
            setDocErrors({});
            setApiError(null);
            onClose();
        } catch (error: any) {
            ShowInConsole('Upload KYC details error:', error);
            const errorMessage =
                error?.data?.message ||
                error?.message ||
                'Failed to upload KYC details. Please try again later.';
            setApiError(errorMessage);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        // Keep entered files and form data intact on error or close
        setApiError(null);
        onClose();
    };

    const handleResetAll = () => {
        if (isSubmitting) return;
        reset();
        setPoiDoc(null);
        setPoaDoc(null);
        setDocErrors({});
        setApiError(null);
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
                            maxHeight: '90%',
                            paddingBottom: Math.max(insets.bottom, 16),
                        }}
                        className="w-full rounded-t-3xl border-t border-[var(--color-line)] bg-[var(--color-app-surface)] shadow-2xl"
                    >
                        {/* Header */}
                        <View className="flex-row items-center justify-between border-b border-[var(--color-line)] px-6 py-4">
                            <View className="flex-1 mr-2">
                                <Text className="text-lg font-bold text-[var(--color-ink)]">
                                    Upload KYC Documents
                                </Text>
                                <Text className="text-xs text-[var(--color-ink-muted)]">
                                    Identity & address verification submission
                                </Text>
                            </View>

                            <View className="flex-row items-center gap-2">
                                <Pressable
                                    onPress={handleResetAll}
                                    disabled={isSubmitting}
                                    className="flex-row items-center gap-1 rounded-lg px-2.5 py-1.5 bg-[var(--color-app-subtle)]"
                                    accessibilityLabel="Reset form and uploads"
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
                            contentContainerStyle={{ paddingBottom: 24 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Inline API Error Banner */}
                            {apiError ? (
                                <View className="mb-4 flex-row items-start gap-2.5 rounded-xl border border-[var(--color-status-danger)]/40 bg-[var(--color-status-danger-bg)] p-3.5 shadow-xs">
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
                            <View className="mb-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-app-subtle)] p-3.5">
                                <Text className="text-xs leading-5 text-[var(--color-ink-soft)]">
                                    Please upload valid Proof of Identity (POI) and Proof of Address (POA) documents. Formats supported: PDF, PNG, JPG under 5 MB.
                                </Text>
                            </View>

                            <View className="flex-col gap-4">
                                {/* POI Number */}
                                <Controller
                                    name="poiNumber"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomInputComponent
                                            id="kycUpload-poi-number"
                                            label="Proof of Identity (POI) Number"
                                            placeholder="Enter POI document number"
                                            value={field.value}
                                            onChangeText={field.onChange}
                                            keyboardType="number-pad"
                                            error={errors.poiNumber?.message}
                                            editable={!isSubmitting}
                                        />
                                    )}
                                />

                                {/* POI File Picker */}
                                <View className="flex-col gap-1.5">
                                    <Text className="text-xs font-semibold uppercase text-[var(--color-ink-soft)]">
                                        Proof of Identity Document *
                                    </Text>
                                    <Pressable
                                        onPress={() => pickDocument('poi')}
                                        disabled={isSubmitting}
                                        className="w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-line-strong)] bg-[var(--color-app-subtle)] p-4 active:border-[var(--color-gold)]"
                                    >
                                        {poiDoc ? (
                                            <View className="flex-row items-center gap-2">
                                                <CheckCircle size={18} color="#1f8a5b" />
                                                <Text
                                                    className="text-xs font-semibold text-[var(--color-status-success)] max-w-[240px]"
                                                    numberOfLines={1}
                                                >
                                                    {poiDoc.name}
                                                </Text>
                                            </View>
                                        ) : (
                                            <View className="items-center">
                                                <FileText size={22} color="#8a93a8" />
                                                <Text className="mt-1.5 text-xs font-bold text-[var(--color-ink)]">
                                                    Select POI Document
                                                </Text>
                                                <Text className="text-[10px] text-[var(--color-ink-muted)]">
                                                    Passport, National ID or Driver License
                                                </Text>
                                            </View>
                                        )}
                                    </Pressable>
                                    {!!docErrors.poi && (
                                        <Text className="text-xs text-[var(--color-status-danger)]">
                                            {docErrors.poi}
                                        </Text>
                                    )}
                                </View>

                                {/* POA Number */}
                                <Controller
                                    name="poaNumber"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomInputComponent
                                            id="kycUpload-poa-number"
                                            label="Proof of Address (POA) Number"
                                            placeholder="Enter POA document number"
                                            value={field.value}
                                            onChangeText={field.onChange}
                                            keyboardType="number-pad"
                                            error={errors.poaNumber?.message}
                                            editable={!isSubmitting}
                                        />
                                    )}
                                />

                                {/* POA File Picker */}
                                <View className="flex-col gap-1.5">
                                    <Text className="text-xs font-semibold uppercase text-[var(--color-ink-soft)]">
                                        Proof of Address Document *
                                    </Text>
                                    <Pressable
                                        onPress={() => pickDocument('poa')}
                                        disabled={isSubmitting}
                                        className="w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-line-strong)] bg-[var(--color-app-subtle)] p-4 active:border-[var(--color-gold)]"
                                    >
                                        {poaDoc ? (
                                            <View className="flex-row items-center gap-2">
                                                <CheckCircle size={18} color="#1f8a5b" />
                                                <Text
                                                    className="text-xs font-semibold text-[var(--color-status-success)] max-w-[240px]"
                                                    numberOfLines={1}
                                                >
                                                    {poaDoc.name}
                                                </Text>
                                            </View>
                                        ) : (
                                            <View className="items-center">
                                                <UploadCloud size={22} color="#8a93a8" />
                                                <Text className="mt-1.5 text-xs font-bold text-[var(--color-ink)]">
                                                    Select POA Document
                                                </Text>
                                                <Text className="text-[10px] text-[var(--color-ink-muted)]">
                                                    Utility bill or Bank statement (under 3 months)
                                                </Text>
                                            </View>
                                        )}
                                    </Pressable>
                                    {!!docErrors.poa && (
                                        <Text className="text-xs text-[var(--color-status-danger)]">
                                            {docErrors.poa}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {/* Bottom API Error Alert */}
                            {apiError ? (
                                <View className="mt-4 flex-row items-center gap-2 rounded-lg border border-[var(--color-status-danger)]/30 bg-[var(--color-status-danger-bg)] px-3 py-2">
                                    <AlertCircle size={14} color="#b03333" className="shrink-0" />
                                    <Text className="flex-1 text-xs font-medium text-[#b03333]" numberOfLines={2}>
                                        {apiError}
                                    </Text>
                                </View>
                            ) : null}

                            {/* Submit Buttons */}
                            <View className="mt-6 flex-row items-center gap-3">
                                <View className="flex-1">
                                    <CustomButtonComponent
                                        id="kycUpload-cancel-btn"
                                        label="Cancel"
                                        variant="outline"
                                        onPress={handleClose}
                                        disabled={isSubmitting}
                                    />
                                </View>

                                <View className="flex-1">
                                    <CustomButtonComponent
                                        id="kycUpload-submit-btn"
                                        label="Submit Documents"
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
