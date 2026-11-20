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
    <View className="mb-4 w-full rounded-2xl border border-[var(--color-gold)]/30 border-l-4 border-l-[var(--color-gold)] bg-[#fffdfa] p-4 shadow-xs">
      <View className="flex-row items-start gap-3">
        <View className="h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0c1830] border border-[var(--color-gold)]/40 shadow-xs">
          <ShieldAlert size={20} color="#d49a4d" />
        </View>

        <View className="flex-1 flex-col">
          <Text className="text-sm font-bold text-[var(--color-ink)]">
            {title}
          </Text>

          <Text className="mt-1 text-xs leading-5 text-[var(--color-ink-soft)]">
            {description}
          </Text>
        </View>
      </View>

      <View className="mt-3.5 w-full">
        <CustomButtonComponent
          id="verification-banner-action-btn"
          variant="navy"
          label={buttonText}
          buttonClassName="w-full h-10 flex-row items-center justify-center rounded-xl border border-[var(--color-gold)] bg-[var(--color-navy)] active:bg-[var(--color-navy-active)]"
          labelClassName="text-xs font-bold text-white text-center"
          onPress={onAction}
        />
      </View>
    </View>
  );
}
