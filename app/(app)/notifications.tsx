import { ScrollView, View } from 'react-native';
import { Bell, Calendar, UserPlus } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { semantic } from '@/theme';

const notifications = [
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
    body: 'Trần Thị Bình - 15:00 hôm nay',
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

const iconFor = (t: string) => {
  if (t === 'NEW_LEAD') return <UserPlus size={20} color={semantic.action.primary} />;
  if (t === 'FOLLOWUP_DUE') return <Calendar size={20} color={semantic.status.warning} />;
  return <Bell size={20} color={semantic.leadGroup.engaged.fg} />;
};

export default function Notifications() {
  return (
    <View className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="pb-8">
        {notifications.map((n) => (
          <View
            key={n.id}
            className={`px-4 py-3 flex-row gap-3 border-b border-border-light ${
              n.unread ? 'bg-surface-alt' : 'bg-white'
            }`}
          >
            <View className="w-10 h-10 rounded-lg bg-white items-center justify-center border border-border-light">
              {iconFor(n.type)}
            </View>
            <View className="flex-1">
              <Text variant="h3" className="text-text-primary">{n.title}</Text>
              <Text variant="body" className="text-text-secondary mt-1" numberOfLines={2}>
                {n.body}
              </Text>
              <Text variant="caption" className="text-text-tertiary mt-1.5">{n.time}</Text>
            </View>
            {n.unread && <View className="w-2 h-2 rounded-full bg-primary mt-2" />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
