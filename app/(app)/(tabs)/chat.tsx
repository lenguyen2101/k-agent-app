import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import {
  ChevronRight,
  FileText,
  MessageSquare,
  MessageSquarePlus,
  Wand2,
} from 'lucide-react-native';
import { FAB } from '@/components/FAB';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/ui/Text';
import { formatRelativeTime } from '@/lib/format';
import { palette, semantic } from '@/theme';

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();

const conversations = [
  {
    id: 'c1',
    title: 'Sky Garden Q9 còn căn 2PN nào?',
    snippet: 'Theo rổ hàng hiện tại, NOXH Sky Garden Q9 còn 3 căn...',
    updatedAt: hoursAgo(2),
    citationCount: 2,
  },
  {
    id: 'c2',
    title: 'Quy trình đặt cọc NOXH cho khách công nhân',
    snippet: '1. Khách đủ điều kiện eKYC noxh.net (CCCD + thu nhập...)',
    updatedAt: hoursAgo(22),
    citationCount: 3,
  },
  {
    id: 'c3',
    title: 'Điều kiện mua NOXH theo Luật 2023',
    snippet: 'Điều kiện mua NOXH theo Luật Nhà ở 2023 (hiệu lực...)',
    updatedAt: hoursAgo(72),
    citationCount: 1,
  },
];

const SUGGESTIONS = [
  {
    icon: Wand2,
    title: 'Tân Bình Garden có chính sách thanh toán nào?',
    subtitle: 'Tra cứu chính sách bán hàng',
  },
  {
    icon: Wand2,
    title: 'Khách thu nhập 8tr/tháng có mua NOXH được?',
    subtitle: 'Điều kiện NOXH theo Luật 2023',
  },
  {
    icon: Wand2,
    title: 'Giá net cho sale dự án Sky Garden?',
    subtitle: 'Tính hoa hồng + giá bán sàn',
  },
];

export default function Chat() {
  return (
    <Screen>
      <ScrollView contentContainerClassName="pb-8">
        {/* Hero */}
        <View className="px-4 pt-1 pb-4">
          <Text variant="h2" className="text-text-title">
            K-Agent AI
          </Text>
        </View>

        {/* Suggestions */}
        <View className="px-4">
          <Text
            variant="caption"
            style={{
              color: semantic.text.secondary,
              fontFamily: 'BeVietnamPro_700Bold',
              letterSpacing: 0.5,
            }}
          >
            GỢI Ý CÂU HỎI
          </Text>
          <View className="mt-2.5 gap-2.5">
            {SUGGESTIONS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <Pressable
                  key={idx}
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/chat/[conversationId]',
                      params: { conversationId: 'new', prompt: s.title },
                    })
                  }
                  className="p-3.5 rounded-2xl flex-row items-center gap-3"
                  style={{
                    backgroundColor: palette.white,
                    borderWidth: 1,
                    borderColor: semantic.border.light,
                  }}
                >
                  <View
                    className="w-9 h-9 rounded-xl items-center justify-center"
                    style={{ backgroundColor: semantic.action.primarySoft }}
                  >
                    <Icon size={16} color={semantic.action.primary} strokeWidth={2.2} />
                  </View>
                  <View className="flex-1">
                    <Text
                      variant="body"
                      style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_600SemiBold' }}
                      numberOfLines={2}
                    >
                      {s.title}
                    </Text>
                    <Text variant="caption" className="text-text-tertiary mt-0.5" numberOfLines={1}>
                      {s.subtitle}
                    </Text>
                  </View>
                  <ChevronRight size={16} color={semantic.text.tertiary} />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Recent conversations */}
        <View className="mt-6 px-4">
          <View className="flex-row items-baseline justify-between mb-3">
            <Text
              variant="caption"
              style={{
                color: semantic.text.secondary,
                fontFamily: 'BeVietnamPro_700Bold',
                letterSpacing: 0.5,
              }}
            >
              CUỘC TRÒ CHUYỆN GẦN ĐÂY
            </Text>
            <Text variant="caption" className="text-text-tertiary">
              {conversations.length} mục
            </Text>
          </View>
          <View className="gap-2.5">
            {conversations.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => router.push(`/(app)/chat/${c.id}`)}
                className="p-4 rounded-2xl flex-row items-start gap-3"
                style={{
                  backgroundColor: palette.white,
                  borderWidth: 1,
                  borderColor: semantic.border.light,
                  shadowColor: palette.obsidian[900],
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 1,
                }}
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  style={{
                    backgroundColor: semantic.action.primarySoft,
                    borderWidth: 1,
                    borderColor: palette.sienna[100],
                  }}
                >
                  <MessageSquare size={16} color={semantic.action.primaryDeep} strokeWidth={2.2} />
                </View>
                <View className="flex-1">
                  <Text
                    variant="body"
                    style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_600SemiBold' }}
                    numberOfLines={2}
                  >
                    {c.title}
                  </Text>
                  <Text variant="caption" className="text-text-tertiary mt-0.5" numberOfLines={2}>
                    {c.snippet}
                  </Text>
                  <View className="flex-row items-center gap-3 mt-2">
                    <Text variant="caption" className="text-text-tertiary">
                      {formatRelativeTime(c.updatedAt)}
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <FileText size={11} color={semantic.text.tertiary} />
                      <Text variant="caption" className="text-text-tertiary">
                        {c.citationCount} nguồn
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <FAB
        icon={MessageSquarePlus}
        onPress={() => router.push('/(app)/chat/new')}
      />
    </Screen>
  );
}
