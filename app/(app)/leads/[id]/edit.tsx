import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { LeadForm } from '@/components/LeadForm';
import { Text } from '@/components/ui/Text';
import { useLeads } from '@/store/leads';
import { semantic } from '@/theme';

export default function LeadEdit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const lead = useLeads((s) => s.leads.find((l) => l.id === id));
  const updateLead = useLeads((s) => s.updateLead);

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
            numberOfLines={1}
          >
            Sửa lead
          </Text>
          <Text variant="caption" className="text-text-secondary mt-0.5" numberOfLines={1}>
            {lead.fullName}
          </Text>
        </View>
        <View className="w-10" />
      </View>

      <LeadForm
        submitLabel="Lưu thay đổi"
        initial={{
          fullName: lead.fullName,
          phone: lead.phone,
          project: lead.primaryProject,
          unitTypes: lead.unitTypeInterests ?? [],
          source: lead.source,
          notes: lead.notes ?? '',
          nextFollowupAt: lead.nextFollowupAt,
        }}
        onSubmit={(v) => {
          if (!v.project) return;
          updateLead(lead.id, {
            fullName: v.fullName,
            phone: v.phone,
            primaryProject: v.project,
            source: v.source,
            unitTypeInterests: v.unitTypes,
            notes: v.notes,
            nextFollowupAt: v.nextFollowupAt ?? null,
          });
          router.back();
        }}
      />
    </View>
  );
}
