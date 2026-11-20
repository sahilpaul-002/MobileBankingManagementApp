import { showToastMessage } from '@/components/common/ToastMessagesComponent';
import * as Clipboard from 'expo-clipboard';
import { Check, Copy } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

interface PrefundAccountItemDetailsComponentPropsType {
    id: string;
    label: string;
    value?: string | null | undefined;
    children?: React.ReactNode;
    copyable?: boolean;
    breakAll?: boolean;
    className?: string;
}

export default function PrefundAccountItemDetailsComponent({
    id,
    label,
    value,
    children,
    copyable = false,
    className = '',
}: PrefundAccountItemDetailsComponentPropsType) {
    const [isCopied, setIsCopied] = useState(false);

    const displayValue = value && value.trim() !== '' ? value : '—';
    const canCopy = copyable && !!value && value.trim() !== '';

    const handleCopy = async () => {
        if (!value) return;

        try {
            await Clipboard.setStringAsync(value);
            setIsCopied(true);
            showToastMessage({
                type: 'success',
                text1: 'Copied',
                text2: `${label} copied to clipboard.`,
            });
            setTimeout(() => setIsCopied(false), 2000);
        } catch {
            showToastMessage({
                type: 'error',
                text1: 'Copy Failed',
                text2: `Failed to copy ${label.toLowerCase()}.`,
            });
        }
    };

    return (
        <View
            className={`w-full flex-col justify-center gap-1 border-b border-[var(--color-line-faint)] pb-3 ${className}`}
        >
            {/* Label */}
            <Text className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
                {label}
            </Text>

            {/* Value Row */}
            <View className="w-full flex-row items-center justify-between gap-2">
                <View className="flex-1">
                    {children ?? (
                        <Text
                            testID={id}
                            className="text-sm font-bold text-[var(--color-ink)]"
                            selectable
                        >
                            {displayValue}
                        </Text>
                    )}
                </View>

                {canCopy && (
                    <Pressable
                        testID={`${id}-copy-btn`}
                        onPress={handleCopy}
                        className="h-7 w-7 items-center justify-center rounded-md bg-[var(--color-app-subtle)] border border-[var(--color-line)] active:bg-[var(--color-app-hover)]"
                    >
                        {isCopied ? (
                            <Check size={14} color="#1f8a5b" />
                        ) : (
                            <Copy size={13} color="#6b7a99" />
                        )}
                    </Pressable>
                )}
            </View>
        </View>
    );
}
