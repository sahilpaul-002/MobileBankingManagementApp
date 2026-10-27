import { useEffect, useState } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: object;
}

function SkeletonItem({
    width = "100%",
    height = 16,
    borderRadius = 8,
    style,
}: SkeletonProps) {
    const [pulseAnim] = useState(() => new Animated.Value(0.4));

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.9,
                    duration: 900,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.4,
                    duration: 900,
                    useNativeDriver: true,
                }),
            ])
        );

        pulse.start();

        return () => pulse.stop();
    }, [pulseAnim]);

    return (
        <Animated.View
            style={[
                styles.skeletonBase,
                {
                    width: width as any,
                    height: height as any,
                    borderRadius,
                    opacity: pulseAnim,
                },
                style,
            ]}
        />
    );
}

export default function DashboardLoaderComponent() {
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {/* Header / User bar */}
            <View style={styles.headerRow}>
                <View style={styles.headerTextCol}>
                    <SkeletonItem width={120} height={12} borderRadius={4} />
                    <SkeletonItem width={180} height={20} borderRadius={6} style={{ marginTop: 6 }} />
                </View>
                <SkeletonItem width={44} height={44} borderRadius={22} />
            </View>

            {/* Main Balance Card (Navy Banking Style) */}
            <View style={styles.balanceCard}>
                <View style={styles.cardTopRow}>
                    <SkeletonItem width={110} height={12} borderRadius={4} style={styles.cardInnerItem} />
                    <SkeletonItem width={40} height={24} borderRadius={6} style={styles.cardInnerItem} />
                </View>
                <SkeletonItem width={220} height={36} borderRadius={8} style={[styles.cardInnerItem, { marginTop: 14 }]} />
                <View style={[styles.cardBottomRow, { marginTop: 20 }]}>
                    <SkeletonItem width={140} height={14} borderRadius={4} style={styles.cardInnerItem} />
                    <SkeletonItem width={70} height={14} borderRadius={4} style={styles.cardInnerItem} />
                </View>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.actionRow}>
                {[1, 2, 3, 4].map((item) => (
                    <View key={item} style={styles.actionItem}>
                        <SkeletonItem width={52} height={52} borderRadius={26} />
                        <SkeletonItem width={48} height={10} borderRadius={4} style={{ marginTop: 8 }} />
                    </View>
                ))}
            </View>

            {/* Wallets / Metrics Summary Cards */}
            <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                    <SkeletonItem width={36} height={36} borderRadius={18} />
                    <SkeletonItem width={80} height={12} borderRadius={4} style={{ marginTop: 12 }} />
                    <SkeletonItem width={110} height={22} borderRadius={6} style={{ marginTop: 6 }} />
                </View>

                <View style={styles.summaryCard}>
                    <SkeletonItem width={36} height={36} borderRadius={18} />
                    <SkeletonItem width={80} height={12} borderRadius={4} style={{ marginTop: 12 }} />
                    <SkeletonItem width={110} height={22} borderRadius={6} style={{ marginTop: 6 }} />
                </View>
            </View>

            {/* Recent Transactions Section */}
            <View style={styles.transactionsSection}>
                <View style={styles.sectionHeader}>
                    <SkeletonItem width={160} height={18} borderRadius={6} />
                    <SkeletonItem width={60} height={14} borderRadius={4} />
                </View>

                {[1, 2, 3, 4].map((item) => (
                    <View key={item} style={styles.transactionRow}>
                        <SkeletonItem width={46} height={46} borderRadius={12} />
                        <View style={styles.transactionDetails}>
                            <SkeletonItem width={140} height={14} borderRadius={4} />
                            <SkeletonItem width={90} height={11} borderRadius={4} style={{ marginTop: 6 }} />
                        </View>
                        <SkeletonItem width={75} height={16} borderRadius={4} />
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f4f6fa",
    },
    contentContainer: {
        padding: 18,
        paddingBottom: 40,
    },
    skeletonBase: {
        backgroundColor: "#d8dde6",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    headerTextCol: {
        flex: 1,
    },
    balanceCard: {
        backgroundColor: "#0c1830",
        borderRadius: 16,
        padding: 22,
        marginBottom: 22,
        shadowColor: "#0c1830",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    cardInnerItem: {
        backgroundColor: "#243452",
    },
    cardTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardBottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 12,
        marginBottom: 22,
        borderWidth: 1,
        borderColor: "#e6e8ee",
    },
    actionItem: {
        alignItems: "center",
        flex: 1,
    },
    summaryRow: {
        flexDirection: "row",
        gap: 14,
        marginBottom: 22,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e6e8ee",
    },
    transactionsSection: {
        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e6e8ee",
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    transactionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f1f5",
    },
    transactionDetails: {
        flex: 1,
        marginLeft: 14,
    },
});
