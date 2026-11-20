import CustomButtonComponent from '@/components/common/CustomButtonComponent';
import type {
    KycStatusDataType,
    KycStatusOption,
} from '@/types/user/userVerificationPageTypes';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Mail,
    RefreshCw,
} from 'lucide-react-native';
import { Text, View } from 'react-native';

interface KycStatusComponentProps {
    kycData: KycStatusDataType;
    onOpenSidebar: () => void;
    onRefresh: () => void;
    isRefreshing: boolean;
}

// ── KYC Status Badge ────────────────────────────────────────────────────────
function KycStatusBadge({ status }: { status: KycStatusOption }) {
    switch (status) {
        case 'COMPLETED':
            return (
                <View className="flex-row items-center gap-1.5 rounded-full border border-[var(--color-status-success)]/30 bg-[var(--color-status-success-bg)] px-3 py-1">
                    <CheckCircle2 size={13} color="#1f8a5b" />
                    <Text className="text-xs font-semibold text-[var(--color-status-success)]">
                        Verification Completed
                    </Text>
                </View>
            );
        case 'IN-PROGRESS':
            return (
                <View className="flex-row items-center gap-1.5 rounded-full border border-[var(--color-status-info)]/30 bg-[var(--color-status-info-bg)] px-3 py-1">
                    <Clock size={13} color="#2a6fdb" />
                    <Text className="text-xs font-semibold text-[var(--color-status-info)]">
                        Verification In Progress
                    </Text>
                </View>
            );
        case 'RFI':
            return (
                <View className="flex-row items-center gap-1.5 rounded-full border border-[var(--color-status-warning)]/30 bg-[var(--color-status-warning-bg)] px-3 py-1">
                    <AlertTriangle size={13} color="#c47a1a" />
                    <Text className="text-xs font-semibold text-[var(--color-status-warning)]">
                        RFI - Information Required
                    </Text>
                </View>
            );
        case 'PENDING':
        default:
            return (
                <View className="flex-row items-center gap-1.5 rounded-full border border-[var(--color-status-warning)]/30 bg-[var(--color-status-warning-bg)] px-3 py-1">
                    <Clock size={13} color="#c47a1a" />
                    <Text className="text-xs font-semibold text-[var(--color-status-warning)]">
                        Pending Verification
                    </Text>
                </View>
            );
    }
}

export default function KycStatusComponent({
    kycData,
    onOpenSidebar,
    onRefresh,
    isRefreshing,
}: KycStatusComponentProps) {
    const isCompleted = kycData.kyc_status === 'COMPLETED';
    const isInProgress = kycData.kyc_status === 'IN-PROGRESS';
    const canUpdateKyc =
        kycData.kyc_status === 'PENDING' || kycData.kyc_status === 'RFI';

    return (
        <View className="w-full flex-col gap-5">
            {/* Main Status Information Display Box */}
            <View className="w-full flex-col gap-5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-5 shadow-xs">
                {/* User Email */}
                <View className="flex-row items-center gap-2.5">
                    <View className="h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-app-subtle)] border border-[var(--color-line)]">
                        <Mail size={16} color="#6b7a99" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
                            Registered Account
                        </Text>
                        <Text
                            className="text-sm font-bold text-[var(--color-ink)]"
                            numberOfLines={1}
                        >
                            {kycData.email}
                        </Text>
                    </View>
                </View>

                {/* Status Badge */}
                <View className="flex-row items-center justify-between border-t border-[var(--color-line-faint)] pt-3">
                    <Text className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
                        Current KYC Status
                    </Text>
                    <KycStatusBadge status={kycData.kyc_status} />
                </View>

                {/* Action Buttons */}
                <View className="flex-row items-center gap-3 pt-2">
                    <View className="flex-1">
                        <CustomButtonComponent
                            id="kycStatus-refresh-btn"
                            variant="outline"
                            buttonClassName="h-10 flex-row items-center justify-center gap-2 rounded-xl"
                            onPress={onRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw size={14} color="#0c1830" />
                            <Text className="text-xs font-semibold text-[var(--color-ink)]">
                                Refresh
                            </Text>
                        </CustomButtonComponent>
                    </View>

                    {canUpdateKyc && (
                        <View className="flex-1">
                            <CustomButtonComponent
                                id="kycStatus-update-btn"
                                label="Update KYC"
                                variant="navy"
                                buttonClassName="h-10 rounded-xl"
                                onPress={onOpenSidebar}
                            />
                        </View>
                    )}
                </View>
            </View>

            {/* Status Informational Callout Messages */}
            {isInProgress && (
                <View className="rounded-xl border border-[var(--color-status-info)]/30 bg-[var(--color-status-info-bg)] p-4">
                    <Text className="text-xs font-semibold leading-5 text-[var(--color-status-info)]">
                        Your KYC documents are currently under review by our compliance team. Document updates are disabled while review is in progress.
                    </Text>
                </View>
            )}

            {isCompleted && (
                <View className="rounded-xl border border-[var(--color-status-success)]/30 bg-[var(--color-status-success-bg)] p-4">
                    <Text className="text-xs font-semibold leading-5 text-[var(--color-status-success)]">
                        Your identity and address documents have been successfully verified and approved. Your account has full treasury access.
                    </Text>
                </View>
            )}

            {canUpdateKyc && (
                <View className="rounded-xl border border-[var(--color-status-warning)]/30 bg-[var(--color-status-warning-bg)] p-4">
                    <Text className="text-xs font-semibold leading-5 text-[var(--color-status-warning)]">
                        Action Required: Please click &quot;Update KYC&quot; above to submit or re-upload your Proof of Identity (POI) and Proof of Address (POA) documents.
                    </Text>
                </View>
            )}
        </View>
    );
}
