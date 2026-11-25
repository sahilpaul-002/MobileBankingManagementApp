import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FormKeyboardContainerProps {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  className?: string;
  bottomOffset?: number;
  showsVerticalScrollIndicator?: boolean;
}

export default function FormKeyboardContainer({
  children,
  contentContainerStyle,
  className = 'flex-1 w-full bg-[var(--color-app)]',
  bottomOffset = 40,
  showsVerticalScrollIndicator = false,
}: FormKeyboardContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAwareScrollView
      className={className}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      bottomOffset={bottomOffset + insets.bottom}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      contentContainerStyle={[
        {
          flexGrow: 1,
          paddingBottom: insets.bottom + 48,
        },
        contentContainerStyle,
      ]}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
