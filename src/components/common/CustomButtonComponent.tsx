import { Button, type ButtonProps } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { ActivityIndicator } from 'react-native';

interface CustomButtonProps extends ButtonProps {
  // Accessible identifier
  id?: string;

  // Button label — used when children is not provided
  label?: ReactNode;

  // Additional styling for the label
  labelClassName?: string;

  // Additional styling for the button
  buttonClassName?: string;

  // Shows a loading spinner and disables interaction
  showButtonLoader?: boolean;
}

export default function CustomButtonComponent({
  id,
  label,
  children,
  buttonClassName,
  labelClassName,
  showButtonLoader = false,
  disabled,
  variant = 'navy',
  ...rest
}: CustomButtonProps) {
  const buttonContent = children ?? (
    typeof label === 'string' ? (
      <Text className={cn('font-semibold', labelClassName)}>
        {label}
      </Text>
    ) : (
      label
    )
  );

  return (
    <Button
      {...rest}
      testID={id}
      variant={variant}
      disabled={disabled || showButtonLoader}
      buttonClassName={buttonClassName ?? ''}
    >
      {showButtonLoader ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        buttonContent
      )}
    </Button>
  );
}