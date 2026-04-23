import { useMemo, useState } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Plus, Search, Users } from 'lucide-react-native';
import { useLeads } from '@/store/leads';
import type { LeadStatus } from '@/types/lead';
import { LeadCard } from '@/components/LeadCard';
import { CreateLeadMenu } from '@/components/CreateLeadMenu';
import { EmptyState } from '@/components/EmptyState';
import { VoiceLeadModal } from '@/components/VoiceLeadModal';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/ui/Text';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { palette, semantic, typography } from '@/theme';

const FILTERS: { key: 'all' | LeadStatus; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'NEW', label: 'Mới' },
  { key: 'CONTACTED', label: 'Đã liên hệ' },
  { key: 'INTERESTED', label: 'Quan tâm' },
  { key: 'APPOINTMENT', label: 'Đã hẹn' },
  { key: 'NEGOTIATING', label: 'Đàm phán' },
  { key: 'DEPOSITED', label: 'Đã cọc' },
];

export default function LeadsList() {
  const [filter, setFilter] = useState<'all' | LeadStatus>('all');
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const allLeads = useLeads((s) => s.leads);
  const refresh = usePullToRefresh();

  const filtered = useMemo(() => {
    let xs = allLeads;
    if (filter !== 'all') xs = xs.filter((l) => l.status === filter);
    if (search) {
      const q = search.toLowerCase();
      xs = xs.filter((l) => l.fullName.toLowerCase().includes(q) || l.phone.includes(q));
    }
    return xs;
  }, [allLeads, filter, search]);

  return (
    <Screen bg="surface">
      <View
        className="px-4 pt-2 pb-3"
        style={{
          backgroundColor: semantic.surface.card,
          borderBottomWidth: 1,
          borderBottomColor: semantic.border.light,
        }}
      >
        <View className="flex-row items-baseline justify-between mb-3">
          <Text variant="h2" style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}>
            Lead của tôi
          </Text>
          <Text variant="caption" style={{ color: semantic.text.tertiary }}>
            {filtered.length} kết quả
          </Text>
        </View>

        <View
          className="flex-row items-center rounded-md h-11 px-3 gap-2"
          style={{
            backgroundColor: semantic.surface.alt,
            borderWidth: 1,
            borderColor: semantic.border.light,
          }}
        >
          <Search size={18} color={semantic.text.tertiary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm theo tên hoặc SĐT"
            placeholderTextColor={semantic.text.tertiary}
            style={[typography.body, { flex: 1, color: semantic.text.primary }]}
          />
        </View>
      </View>

      <View className="py-3" style={{ backgroundColor: semantic.surface.card }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const active = filter === item.key;
            return (
              <Pressable
                onPress={() => setFilter(item.key)}
                className="px-3.5 h-9 rounded-full items-center justify-center"
                style={{
                  backgroundColor: active ? semantic.text.primary : semantic.surface.card,
                  borderWidth: 1,
                  borderColor: active ? semantic.text.primary : semantic.border.default,
                }}
              >
                <Text
                  variant="body"
                  style={{
                    color: active ? semantic.surface.card : semantic.text.secondary,
                    fontWeight: '600',
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        refreshing={refresh.refreshing}
        onRefresh={refresh.onRefresh}
        renderItem={({ item }) => (
          <LeadCard lead={item} onPress={() => router.push(`/(app)/leads/${item.id}`)} />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={Users}
            title={search || filter !== 'all' ? 'Không tìm thấy lead phù hợp' : 'Chưa có lead nào'}
            description={
              search || filter !== 'all'
                ? 'Thử bỏ bộ lọc hoặc thay từ khoá tìm kiếm.'
                : 'Tạo lead mới hoặc bật nhận lead từ hệ thống để bắt đầu.'
            }
            variant={search || filter !== 'all' ? 'filter' : 'info'}
            ctaLabel={search || filter !== 'all' ? 'Xoá bộ lọc' : undefined}
            onCtaPress={
              search || filter !== 'all'
                ? () => {
                    setSearch('');
                    setFilter('all');
                  }
                : undefined
            }
          />
        }
      />

      <Pressable
        onPress={() => setMenuOpen(true)}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center"
        style={{
          backgroundColor: semantic.action.primary,
          shadowColor: palette.slate[900],
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        }}
      >
        <Plus size={28} color={palette.white} />
      </Pressable>

      <CreateLeadMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onPickVoice={() => setVoiceOpen(true)}
        onPickForm={() => router.push('/(app)/leads/new')}
      />

      <VoiceLeadModal
        visible={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onCreated={(leadId) => router.push(`/(app)/leads/${leadId}`)}
      />
    </Screen>
  );
}
