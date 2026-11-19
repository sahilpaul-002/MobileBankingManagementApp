import CustomButtonComponent from '@/components/common/CustomButtonComponent';
import { ShieldAlert } from 'lucide-react-native';
import { Text, View } from 'react-native';

interface VerificationRequiredBannerProps {
  title: string;
  description: string;
  buttonText: string;
  onAction: () => void;
}

export default function VerificationRequiredBannerComponent({
  title,
  description,
  buttonText,
  onAction,
}: VerificationRequiredBannerProps) {
  return (
    <View className="mb-4 w-full rounded-xl border border-[var(--color-status-warning)]/40 border-l-4 border-l-[var(--color-status-warning)] bg-[var(--color-status-warning-bg)] p-4 shadow-sm">
      <View className="flex-row items-start gap-3">
        <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-status-warning)]">
          <ShieldAlert size={20} color="#ffffff" />
        </View>

        <View className="flex-1 flex-col gap-2">
          <Text className="text-base font-semibold text-[var(--color-ink)]">
            {title}
          </Text>

          <Text className="text-xs leading-5 text-[var(--color-ink-soft)]">
            {description}
          </Text>

          <View className="mt-1 self-start">
            <CustomButtonComponent
              variant="navy"
              buttonClassName="h-9 px-4 rounded-lg"
              onPress={onAction}
            >
              <Text className="text-xs font-semibold text-white">
                {buttonText}
              </Text>
            </CustomButtonComponent>
          </View>
        </View>
      </View>
    </View>
  );
}
