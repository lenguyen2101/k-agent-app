import { useMemo, useState } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import { useLeads } from '@/store/leads';
import type { LeadStatus } from '@/types/lead';
import { LeadCard } from '@/components/LeadCard';
import { CreateLeadMenu } from '@/components/CreateLeadMenu';
import { VoiceLeadModal } from '@/components/VoiceLeadModal';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/ui/Text';
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
      <View className="px-4 pt-2 pb-3 bg-white border-b border-border-light">
        <View className="flex-row items-baseline justify-between mb-3">
          <Text variant="h2" className="text-text-title">Lead của tôi</Text>
          <Text variant="caption" className="text-text-tertiary">
            {filtered.length} kết quả
          </Text>
        </View>

        <View className="flex-row items-center bg-surface-alt rounded-md h-11 px-3 gap-2 border border-border-light">
          <Search size={18} color={semantic.text.tertiary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm theo tên hoặc SĐT"
            placeholderTextColor={semantic.text.tertiary}
            style={typography.body}
            className="flex-1 text-text-primary"
          />
        </View>
      </View>

      <View className="py-3 bg-white">
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
                className={`px-3.5 h-9 rounded-full items-center justify-center border ${
                  active ? 'bg-text-primary border-text-primary' : 'bg-white border-border'
                }`}
              >
                <Text variant="body" className={active ? 'text-white' : 'text-text-secondary'} style={{ fontWeight: '600' }}>
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
        renderItem={({ item }) => (
          <LeadCard lead={item} onPress={() => router.push(`/(app)/leads/${item.id}`)} />
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text variant="body" className="text-text-secondary">
              Không tìm thấy lead phù hợp
            </Text>
          </View>
        }
      />

      <Pressable
        onPress={() => setMenuOpen(true)}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center"
        style={{
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
