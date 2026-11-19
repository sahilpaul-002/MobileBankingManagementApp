import type {
  WalletTransactionItemType,
  WalletTransactionStatusType,
  WalletTransactionType,
} from '@/types/dashboard/walletTransactionsSectionTypes';
import * as Clipboard from 'expo-clipboard';
import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  CreditCard,
  Lock,
  RotateCcw,
  Unlock,
} from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

interface RecentTransactionItemComponentPropsType {
  transaction: WalletTransactionItemType;
}

type VisualConfig = {
  icon: typeof ArrowDownRight;
  bgColor: string;
  iconColor: string;
  amountColor: string;
  sign: '+' | '-' | '';
};

const TYPE_CONFIG: Record<WalletTransactionType, VisualConfig> = {
  LOAD: {
    icon: ArrowDownRight,
    bgColor: 'bg-[var(--color-status-success-bg)]',
    iconColor: '#1f8a5b',
    amountColor: 'text-[var(--color-status-success)]',
    sign: '+',
  },
  REFUND: {
    icon: RotateCcw,
    bgColor: 'bg-[var(--color-status-success-bg)]',
    iconColor: '#1f8a5b',
    amountColor: 'text-[var(--color-status-success)]',
    sign: '+',
  },
  WITHDRAW: {
    icon: ArrowUpRight,
    bgColor: 'bg-[var(--color-app-subtle)]',
    iconColor: '#4a5673',
    amountColor: 'text-[var(--color-ink)]',
    sign: '-',
  },
  TRANSFER: {
    icon: ArrowLeftRight,
    bgColor: 'bg-[var(--color-app-subtle)]',
    iconColor: '#4a5673',
    amountColor: 'text-[var(--color-ink)]',
    sign: '',
  },
  HOLD: {
    icon: Lock,
    bgColor: 'bg-[var(--color-status-warning-bg)]',
    iconColor: '#c47a1a',
    amountColor: 'text-[var(--color-status-warning)]',
    sign: '-',
  },
  RELEASE: {
    icon: Unlock,
    bgColor: 'bg-[var(--color-status-success-bg)]',
    iconColor: '#1f8a5b',
    amountColor: 'text-[var(--color-status-success)]',
    sign: '+',
  },
  CARD: {
    icon: CreditCard,
    bgColor: 'bg-[var(--color-app-subtle)]',
    iconColor: '#4a5673',
    amountColor: 'text-[var(--color-ink)]',
    sign: '',
  },
};

const STATUS_CONFIG: Record<
  WalletTransactionStatusType,
  { bg: string; text: string }
> = {
  SUCCESS: {
    bg: 'bg-[var(--color-status-success-bg)]',
    text: 'text-[var(--color-status-success)]',
  },
  PENDING: {
    bg: 'bg-[var(--color-status-warning-bg)]',
    text: 'text-[var(--color-status-warning)]',
  },
  FAILED: {
    bg: 'bg-[var(--color-status-danger-bg)]',
    text: 'text-[var(--color-status-danger)]',
  },
  REVERSED: {
    bg: 'bg-[var(--color-status-warning-bg)]',
    text: 'text-[var(--color-status-warning)]',
  },
};

function maskTransactionId(transactionId: string): string {
  if (!transactionId) return '—';
  if (transactionId.length <= 8) return transactionId;
  return `${transactionId.slice(0, 4)}••••${transactionId.slice(-4)}`;
}

function parseDecimal(value?: string): number {
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAmount(value?: string): string {
  return parseDecimal(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTransactionLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTransactionDate(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function RecentTransactionItemComponent({
  transaction,
}: RecentTransactionItemComponentPropsType) {
  const typeConfig = TYPE_CONFIG[transaction.transaction_type] ?? TYPE_CONFIG.TRANSFER;
  const statusConfig =
    STATUS_CONFIG[transaction.transaction_status] ?? STATUS_CONFIG.SUCCESS;
  const TransactionIcon = typeConfig.icon;

  const handleCopyTransactionId = async () => {
    if (!transaction.transaction_id) return;
    await Clipboard.setStringAsync(transaction.transaction_id);
    Toast.show({
      type: 'success',
      text1: 'Transaction ID copied',
      text2: transaction.transaction_id,
      visibilityTime: 2000,
    });
  };

  return (
    <View className="w-full flex-row items-center justify-between gap-3 border-b border-[var(--color-line-faint)] py-3 last:border-b-0">
      {/* Icon + Details */}
      <View className="flex-1 flex-row items-center gap-3">
        <View
          className={`h-10 w-10 shrink-0 items-center justify-center rounded-xl ${typeConfig.bgColor}`}
        >
          <TransactionIcon size={18} color={typeConfig.iconColor} />
        </View>

        <View className="flex-1 flex-col">
          <Text className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
            {formatTransactionLabel(transaction.transaction_type)}
          </Text>

          <Pressable onPress={handleCopyTransactionId} hitSlop={6}>
            <Text className="text-xs text-[var(--color-ink-muted)]">
              {maskTransactionId(transaction.transaction_id)}
            </Text>
          </Pressable>

          <Text className="mt-0.5 text-[10px] text-[var(--color-ink-muted)]">
            {formatTransactionDate(transaction.createdAt)}
          </Text>
        </View>
      </View>

      {/* Amount + Fee + Status */}
      <View className="items-end gap-1">
        <Text className={`text-sm font-bold ${typeConfig.amountColor}`}>
          {typeConfig.sign}
          {formatAmount(transaction.amount?.$numberDecimal)}{' '}
          <Text className="text-xs font-semibold text-[var(--color-ink-muted)]">
            {transaction.wallet_details?.wallet_currency}
          </Text>
        </Text>

        <Text className="text-[10px] text-[var(--color-ink-muted)]">
          Fee: {formatAmount(transaction.fee?.$numberDecimal)}{' '}
          {transaction.wallet_details?.wallet_currency}
        </Text>

        <View className={`rounded px-1.5 py-0.5 ${statusConfig.bg}`}>
          <Text className={`text-[9px] font-bold uppercase ${statusConfig.text}`}>
            {transaction.transaction_status}
          </Text>
        </View>
      </View>
    </View>
  );
}
