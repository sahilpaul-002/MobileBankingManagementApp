import CustomButtonComponent from '@/components/common/CustomButtonComponent';
import { ClipboardPlus } from 'lucide-react-native';
import { Text, View } from 'react-native';

interface OnboardingDetailsEmptyStatePropsType {
    onAddOnboarding: () => void;
}

export default function OnboardingDetailsEmptyState({
    onAddOnboarding,
}: OnboardingDetailsEmptyStatePropsType) {
    return (
        <View className="w-full min-h-[300px] items-center justify-center p-6">
            <View className="w-full max-w-sm items-center justify-center">
                <View className="mb-4 h-14 w-14 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-app-subtle)]">
                    <ClipboardPlus size={26} color="#d49a4d" />
                </View>

                <Text className="text-center text-lg font-bold text-[var(--color-ink)]">
                    Onboarding Details Not Added
                </Text>

                <Text className="mt-2 text-center text-sm leading-5 text-[var(--color-ink-soft)]">
                    Your address and banking information have not been added yet. Add your onboarding details to complete your account setup.
                </Text>

                <View className="mt-6 w-full max-w-[240px]">
                    <CustomButtonComponent
                        id="userDetailsPage-add-onboarding-btn"
                        label="Add Onboarding Details"
                        variant="navy"
                        onPress={onAddOnboarding}
                    />
                </View>
            </View>
        </View>
    );
}
