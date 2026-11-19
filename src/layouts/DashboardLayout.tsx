import { Tabs } from 'expo-router';
import { CreditCard, LayoutDashboard, UserRound, Wallet } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Design tokens corresponding to CSS variables in src/global.css
const GLOBAL_VARS = {
  '--color-navy': '#0c1830',
  '--color-navy-active': '#16264a',
  '--color-nav-muted': '#6b7a99',
  '--color-gold': '#d49a4d',
  '--color-app': '#f4f6fa',
} as const;

export default function DashboardLayout() {
  const insets = useSafeAreaInsets();
  const tabHeight = 20 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: GLOBAL_VARS['--color-gold'],
        tabBarInactiveTintColor: GLOBAL_VARS['--color-nav-muted'],
        tabBarStyle: {
          backgroundColor: GLOBAL_VARS['--color-navy'],
          borderTopColor: GLOBAL_VARS['--color-navy-active'],
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        sceneStyle: {
          backgroundColor: GLOBAL_VARS['--color-app'],
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="wallets"
        options={{
          title: 'Wallets',
          tabBarIcon: ({ color, size }) => (
            <Wallet color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="cards"
        options={{
          title: 'Cards',
          tabBarIcon: ({ color, size }) => (
            <CreditCard color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="user"
        options={{
          title: 'User',
          tabBarIcon: ({ color, size }) => (
            <UserRound color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
