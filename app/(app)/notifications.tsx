import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bell,
  Calendar,
  CheckCheck,
  Sparkles,
  UserPlus,
} from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { palette, semantic } from '@/theme';

type NotificationItem = {
  id: string;
  type: 'NEW_LEAD' | 'FOLLOWUP_DUE' | 'CHAT_REPLY' | 'DEAL_UPDATE';
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

const INITIAL: NotificationItem[] = [
  {
    id: 'n1',
    type: 'NEW_LEAD',
    title: 'Lead mới được phân bổ',
    body: 'Bạn vừa nhận lead Bùi Thị Hương · NOXH Sky Garden Q9',
    time: '2 phút trước',
    unread: true,
  },
  {
    id: 'n2',
    type: 'FOLLOWUP_DUE',
    title: 'Sắp đến giờ follow up',
    body: 'Trần Thị Bình — 15:00 hôm nay',
    time: '1 tiếng trước',
    unread: true,
  },
  {
    id: 'n3',
    type: 'CHAT_REPLY',
    title: 'AI đã trả lời',
    body: 'Câu trả lời cho "Sky Garden Q9 còn căn 2PN nào?"',
    time: '3 tiếng trước',
    unread: false,
  },
];

const meta: Record<
  NotificationItem['type'],
  { icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>; color: string; bg: string }
> = {
  NEW_LEAD:     { icon: UserPlus, color: palette.sienna[700],  bg: palette.sienna[50] },
  FOLLOWUP_DUE: { icon: Calendar, color: palette.red[600],     bg: palette.red[50] },
  CHAT_REPLY:   { icon: Sparkles, color: palette.blue[700],    bg: palette.blue[50] },
  DEAL_UPDATE:  { icon: Bell,     color: palette.emerald[700], bg: palette.emerald[50] },
};

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<NotificationItem[]>(INITIAL);

  const unreadCount = useMemo(() => items.filter((i) => i.unread).length, [items]);
  const allRead = unreadCount === 0;

  const markAllRead = () => {
    setItems((xs) => xs.map((x) => ({ ...x, unread: false })));
  };

  const toggleRead = (id: string) => {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, unread: false } : x)));
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Custom header */}
      <View
        className="bg-white border-b border-border-light flex-row items-center px-2"
        style={{ paddingTop: insets.top + 4, paddingBottom: 10 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
          hitSlop={8}
        >
          <ArrowLeft size={22} color={semantic.text.primary} />
        </Pressable>
        <View className="flex-1 items-center">
          <Text
            variant="h3"
            style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
          >
            Thông báo
          </Text>
          <Text variant="caption" className="text-text-secondary mt-0.5">
            {allRead ? 'Tất cả đã đọc' : `${unreadCount} chưa đọc`}
          </Text>
        </View>
        <Pressable
          onPress={markAllRead}
          disabled={allRead}
          className="w-10 h-10 items-center justify-center"
          style={{ opacity: allRead ? 0.3 : 1 }}
          hitSlop={8}
        >
          <CheckCheck
            size={22}
            color={allRead ? semantic.text.tertiary : semantic.action.primary}
            strokeWidth={2.2}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {items.map((n) => {
          const m = meta[n.type];
          const Icon = m.icon;
          return (
            <Pressable
              key={n.id}
              onPress={() => toggleRead(n.id)}
              className="px-4 py-3 flex-row gap-3 active:bg-surface-hover"
              style={{
                backgroundColor: n.unread ? semantic.action.primarySoft : palette.white,
                borderBottomWidth: 1,
                borderBottomColor: semantic.border.light,
              }}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: m.bg }}
              >
                <Icon size={18} color={m.color} strokeWidth={2.2} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-start gap-2">
                  <Text
                    variant="body"
                    className="flex-1 text-text-primary"
                    style={{
                      fontFamily: n.unread ? 'BeVietnamPro_700Bold' : 'BeVietnamPro_600SemiBold',
                    }}
                  >
                    {n.title}
                  </Text>
                  {n.unread && (
                    <View
                      className="w-2 h-2 rounded-full mt-1.5"
                      style={{ backgroundColor: semantic.action.primary }}
                    />
                  )}
                </View>
                <Text
                  variant="caption"
                  className="text-text-secondary mt-1"
                  numberOfLines={2}
                >
                  {n.body}
                </Text>
                <Text variant="caption" className="text-text-tertiary mt-1.5">
                  {n.time}
                </Text>
              </View>
            </Pressable>
          );
        })}

        {items.length === 0 && (
          <View className="items-center py-20 px-8">
            <View
              className="w-16 h-16 rounded-3xl items-center justify-center mb-3"
              style={{
                backgroundColor: semantic.surface.alt,
                borderWidth: 1,
                borderColor: semantic.border.light,
              }}
            >
              <Bell size={28} color={semantic.text.tertiary} strokeWidth={1.8} />
            </View>
            <Text variant="h3" className="text-text-primary">
              Chưa có thông báo
            </Text>
            <Text variant="body" className="text-text-secondary text-center mt-1">
              Khi có lead mới hoặc cập nhật, thông báo sẽ xuất hiện ở đây.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
