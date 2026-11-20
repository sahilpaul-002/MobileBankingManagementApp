import CustomButtonComponent from '@/components/common/CustomButtonComponent';
import { ShieldAlert, UploadCloud } from 'lucide-react-native';
import { Text, View } from 'react-native';

interface KycNotAvailableComponentProps {
    onOpenSidebar: () => void;
}

export default function KycNotAvailableComponent({
    onOpenSidebar,
}: KycNotAvailableComponentProps) {
    return (
        <View className="w-full min-h-[280px] items-center justify-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-app-surface)] p-6 shadow-xs">
            <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-[var(--color-status-warning-bg)] border border-[var(--color-status-warning)]/30">
                <ShieldAlert size={28} color="#c47a1a" />
            </View>

            <Text className="text-center text-lg font-bold text-[var(--color-ink)]">
                KYC Verification Not Available
            </Text>

            <Text className="mt-2 text-center text-xs leading-5 text-[var(--color-ink-soft)] max-w-sm">
                Your KYC verification details are currently not available. Please upload your Proof of Address (POA) and Proof of Identity (POI) documents to initiate verification.
            </Text>

            <View className="mt-6 w-full max-w-[200px]">
                <CustomButtonComponent
                    id="kycNotAvailable-upload-btn"
                    variant="navy"
                    buttonClassName="h-11 flex-row items-center justify-center gap-2 rounded-xl"
                    onPress={onOpenSidebar}
                >
                    <UploadCloud size={16} color="#d49a4d" />
                    <Text className="text-xs font-bold text-white">Upload KYC</Text>
                </CustomButtonComponent>
            </View>
        </View>
    );
}
