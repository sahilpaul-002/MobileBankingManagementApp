import { ActivityIndicator } from 'react-native';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { ReactNode } from 'react';

interface CustomButtonProps extends ButtonProps {
  /** Accessible identifier */
  id?: string;
  /** Button label text — used when children is not provided */
  label?: ReactNode;
  /** Shows a loading spinner and disables interaction */
  showButtonLoader?: boolean;
}

export default function CustomButtonComponent({
  id,
  label,
  children,
  className,
  showButtonLoader = false,
  disabled,
  variant = 'navy',
  size = 'lg',
  ...rest
}: CustomButtonProps) {
  const buttonContent = children ?? (
    typeof label === 'string' ? (
      <Text className="font-semibold">{label}</Text>
    ) : (
      label
    )
  );

  return (
    <Button
      {...rest}
      testID={id}
      variant={variant}
      size={size}
      disabled={disabled || showButtonLoader}
      className={cn('w-full py-2 px-4', className)}
    >
      {showButtonLoader ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        buttonContent
      )}
    </Button>
  );
}
