import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { ActivityForm } from '@/components/ActivityForm';
import { Text } from '@/components/ui/Text';
import { useLeads } from '@/store/leads';
import { semantic } from '@/theme';

export default function ActivityCreate() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const lead = useLeads((s) => s.leads.find((l) => l.id === id));
  const addActivity = useLeads((s) => s.addActivity);

  if (!lead) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Text variant="body" className="text-text-secondary">Không tìm thấy lead</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
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
            Thêm hoạt động
          </Text>
          <Text variant="caption" className="text-text-secondary mt-0.5" numberOfLines={1}>
            {lead.fullName}
          </Text>
        </View>
        <View className="w-10" />
      </View>

      <ActivityForm
        chrome="screen"
        submitLabel="Lưu hoạt động"
        onSubmit={(v) => {
          addActivity({ leadId: lead.id, ...v });
          router.back();
        }}
      />
    </View>
  );
}
