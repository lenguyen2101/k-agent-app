import { Pressable, ScrollView, View } from 'react-native';
import { Plus, Sparkles } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/ui/Text';
import { palette, semantic } from '@/theme';

const conversations = [
  { id: 'c1', title: 'Sky Garden Q9 còn căn 2PN nào?', updatedAt: '2 tiếng trước' },
  { id: 'c2', title: 'Quy trình đặt cọc NOXH cho khách công nhân', updatedAt: 'hôm qua' },
  { id: 'c3', title: 'Điều kiện mua NOXH theo Luật 2023', updatedAt: '3 ngày trước' },
];

const SUGGESTIONS = [
  'Dự án Tân Bình Garden có chính sách thanh toán nào?',
  'Khách thu nhập 8tr/tháng có đủ điều kiện mua NOXH không?',
  'Giá net cho sale dự án Sky Garden là bao nhiêu?',
];

export default function Chat() {
  return (
    <Screen>
      <View className="px-4 pb-4 flex-row items-center justify-between">
        <View>
          <Text variant="h2" className="text-text-title">Chat AI</Text>
          <Text variant="body" className="text-text-secondary mt-1">
            Hỏi về dự án, NOXH, quy trình
          </Text>
        </View>
        <Pressable className="w-11 h-11 rounded-full bg-primary items-center justify-center">
          <Plus size={22} color={palette.white} />
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="px-4 gap-3 pb-8">
        {conversations.map((c) => (
          <Pressable
            key={c.id}
            className="bg-white border border-border-light rounded-lg p-4 flex-row items-start gap-3 active:bg-surface-hover"
          >
            <View className="w-10 h-10 rounded-lg bg-surface-alt items-center justify-center">
              <Sparkles size={18} color={semantic.text.primary} />
            </View>
            <View className="flex-1">
              <Text variant="h3" className="text-text-primary" numberOfLines={1}>
                {c.title}
              </Text>
              <Text variant="caption" className="text-text-tertiary mt-1">{c.updatedAt}</Text>
            </View>
          </Pressable>
        ))}

        <View className="mt-6 p-4 rounded-lg bg-surface-alt border border-border-light">
          <Text variant="caption" className="text-text-secondary mb-2">Gợi ý câu hỏi</Text>
          <View className="gap-2">
            {SUGGESTIONS.map((q) => (
              <Pressable key={q} className="bg-white rounded-md p-3 active:opacity-70">
                <Text variant="body" className="text-text-primary">{q}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
