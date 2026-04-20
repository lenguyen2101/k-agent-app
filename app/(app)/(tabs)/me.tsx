import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import {
  ChevronRight,
  Fingerprint,
  Globe,
  Info,
  LogOut,
  RefreshCw,
  Settings,
  User as UserIcon,
} from 'lucide-react-native';
import { useAuth } from '@/store/auth';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/ui/Text';
import { semantic } from '@/theme';

export default function Me() {
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);

  const onLogout = () => {
    signOut();
    router.replace('/(auth)/login');
  };

  const items = [
    { icon: <UserIcon size={20} color={semantic.text.primary} />, label: 'Hồ sơ cá nhân' },
    { icon: <Fingerprint size={20} color={semantic.text.primary} />, label: 'Đăng nhập sinh trắc' },
    {
      icon: <RefreshCw size={20} color={semantic.text.primary} />,
      label: 'Trạng thái đồng bộ',
      detail: 'Tất cả đã sync',
    },
    { icon: <Settings size={20} color={semantic.text.primary} />, label: 'Cài đặt' },
    { icon: <Globe size={20} color={semantic.text.primary} />, label: 'Ngôn ngữ', detail: 'Tiếng Việt' },
    { icon: <Info size={20} color={semantic.text.primary} />, label: 'Về ứng dụng', detail: 'v1.0.0' },
  ];

  return (
    <Screen>
      <ScrollView contentContainerClassName="pb-8">
        <View className="px-4 pb-6 bg-surface-alt">
          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 rounded-full bg-primary items-center justify-center">
              <Text variant="h2" className="text-white">{user?.fullName.charAt(0)}</Text>
            </View>
            <View className="flex-1">
              <Text variant="h3" className="text-text-title">{user?.fullName}</Text>
              <Text variant="body" className="text-text-secondary mt-1">{user?.phone}</Text>
              <Text variant="caption" className="text-text-tertiary mt-1">
                {user?.role} · {user?.team}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-4 mx-4 bg-white rounded-lg border border-border-light overflow-hidden">
          {items.map((item, i) => (
            <Pressable
              key={item.label}
              className={`flex-row items-center px-4 py-3.5 active:bg-surface-hover ${
                i < items.length - 1 ? 'border-b border-border-light' : ''
              }`}
            >
              {item.icon}
              <Text variant="body-lg" className="flex-1 ml-3 text-text-primary">{item.label}</Text>
              {item.detail && (
                <Text variant="caption" className="text-text-tertiary mr-1">{item.detail}</Text>
              )}
              <ChevronRight size={18} color={semantic.text.tertiary} />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={onLogout}
          className="mt-6 mx-4 flex-row items-center justify-center gap-2 h-12 rounded-md border border-status-error active:bg-status-error-bg"
        >
          <LogOut size={18} color={semantic.status.error} />
          <Text variant="button" className="text-status-error">Đăng xuất</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
