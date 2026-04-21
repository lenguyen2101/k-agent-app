import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { LeadForm } from '@/components/LeadForm';
import { Text } from '@/components/ui/Text';
import { useLeads } from '@/store/leads';
import { semantic } from '@/theme';

export default function LeadCreate() {
  const insets = useSafeAreaInsets();
  const createLead = useLeads((s) => s.createLead);

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
            Tạo lead mới
          </Text>
          <Text variant="caption" className="text-text-secondary mt-0.5">
            Nhập thủ công
          </Text>
        </View>
        <View className="w-10" />
      </View>

      <LeadForm
        submitLabel="Tạo lead"
        onSubmit={(v) => {
          if (!v.project) return;
          const lead = createLead({
            fullName: v.fullName,
            phone: v.phone,
            primaryProject: v.project,
            source: v.source,
            unitTypeInterests: v.unitTypes.length ? v.unitTypes : undefined,
            notes: v.notes || undefined,
            nextFollowupAt: v.nextFollowupAt,
          });
          router.replace(`/(app)/leads/${lead.id}`);
        }}
      />
    </View>
  );
}
