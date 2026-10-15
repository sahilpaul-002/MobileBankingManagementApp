import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Platform, Pressable } from 'react-native';

const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 shadow-none',
    Platform.select({
      web: "whitespace-nowrap outline-none transition-all disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    })
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-[var(--color-navy)] active:bg-[var(--color-navy-active)] rounded-[var(--radius-control)] shadow-sm shadow-black/5',
          Platform.select({ web: 'hover:bg-[var(--color-navy-active)]' })
        ),
        destructive: cn(
          'bg-[var(--color-status-danger)] active:bg-[var(--color-status-danger)]/90 rounded-[var(--radius-control)] shadow-sm shadow-black/5',
          Platform.select({ web: 'hover:bg-[var(--color-status-danger)]/90' })
        ),
        outline: cn(
          'border border-[var(--color-line)] bg-[var(--color-app-surface)] active:bg-[var(--color-app-hover)] rounded-[var(--radius-control)] shadow-sm shadow-black/5',
          Platform.select({ web: 'hover:bg-[var(--color-app-hover)]' })
        ),
        secondary: cn(
          'bg-[var(--color-app-subtle)] active:bg-[var(--color-app-hover)] rounded-[var(--radius-control)] shadow-sm shadow-black/5',
          Platform.select({ web: 'hover:bg-[var(--color-app-hover)]' })
        ),
        ghost: cn(
          'rounded-[var(--radius-control)] active:bg-[var(--color-app-hover)]',
          Platform.select({ web: 'hover:bg-[var(--color-app-hover)]' })
        ),
        link: '',
        navy: cn(
          'bg-[var(--color-navy)] border border-[var(--color-gold)] active:bg-[var(--color-navy-active)] rounded-[var(--radius-control)] shadow-sm shadow-black/5',
          Platform.select({ web: 'hover:bg-[var(--color-navy-active)]' })
        ),
        gold: cn(
          'bg-[var(--color-gold)] active:bg-[var(--color-gold-light)] rounded-[var(--radius-control)] shadow-sm shadow-black/5',
          Platform.select({ web: 'hover:bg-[var(--color-gold-light)]' })
        ),
        authResend: cn(
          'border border-[var(--color-line)] bg-[var(--color-app-surface)] active:bg-[var(--color-app-hover)] rounded-[var(--radius-control)]',
          Platform.select({ web: 'hover:bg-[var(--color-app-hover)]' })
        ),
        authLink: '',
      },
      size: {
        default: cn('h-10 px-4 py-2 sm:h-9', Platform.select({ web: 'has-[>svg]:px-3' })),
        sm: cn('h-9 gap-1.5 px-3 sm:h-8', Platform.select({ web: 'has-[>svg]:px-2.5' })),
        lg: cn('h-11 px-6 sm:h-10', Platform.select({ web: 'has-[>svg]:px-4' })),
        icon: 'h-10 w-10 sm:h-9 sm:w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva(
  cn(
    'text-[var(--color-ink)] text-sm font-medium',
    Platform.select({ web: 'pointer-events-none transition-colors' })
  ),
  {
    variants: {
      variant: {
        default: 'text-white',
        destructive: 'text-white',
        outline: cn(
          'text-[var(--color-ink)]',
          Platform.select({ web: 'group-hover:text-[var(--color-ink-secondary)]' })
        ),
        secondary: 'text-[var(--color-ink-secondary)]',
        ghost: 'text-[var(--color-ink)]',
        link: cn(
          'text-[var(--color-link)] group-active:underline',
          Platform.select({ web: 'underline-offset-4 group-hover:underline' })
        ),
        navy: 'text-white',
        gold: 'text-white',
        authResend: 'text-[var(--color-ink-secondary)]',
        authLink: cn(
          'text-[var(--color-link)] group-active:underline',
          Platform.select({ web: 'underline-offset-4 group-hover:underline' })
        ),
      },
      size: {
        default: '',
        sm: '',
        lg: '',
        icon: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = React.ComponentProps<typeof Pressable> & React.RefAttributes<typeof Pressable> & VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(props.disabled && 'opacity-50', buttonVariants({ variant, size }), className)}
        role="button"
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
