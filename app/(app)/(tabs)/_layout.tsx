import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Home, MessageSquare, User, Users } from 'lucide-react-native';
import { palette, semantic } from '@/theme';

function TabIcon({ Icon, color, focused }: { Icon: React.ComponentType<{ size: number; color: string }>; color: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: focused ? semantic.action.primary : palette.transparent,
          marginBottom: 4,
        }}
      />
      <Icon size={22} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  // Bottom breathing: iPhone có home indicator (inset.bottom ~34) thì add padding
  // ngang bằng inset để icon + label nằm trên home indicator. Device không notch
  // (inset.bottom = 0) vẫn giữ 12px breathing tối thiểu.
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 12;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: semantic.action.primary,
        tabBarInactiveTintColor: semantic.text.tertiary,
        tabBarStyle: {
          backgroundColor: semantic.surface.nav,
          borderTopColor: semantic.border.light,
          borderTopWidth: 1,
          height: 64 + bottomPadding,
          paddingTop: 6,
          paddingBottom: bottomPadding,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Home} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="leads"
        options={{
          title: 'Lead',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Users} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat AI',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={MessageSquare} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Bell} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: 'Tôi',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={User} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
