import { useMemo, useState } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Heart, Search } from 'lucide-react-native';
import { ListingCard } from '@/components/ListingCard';
import { PrimaryProjectCard } from '@/components/PrimaryProjectCard';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/ui/Text';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { listings } from '@/mock/listings';
import { primaryProjects } from '@/mock/primaryProjects';
import { useSavedListings } from '@/store/savedListings';
import { palette, semantic, typography } from '@/theme';
import { truthsScore, type Listing } from '@/types/listing';

type MarketTab = 'primary' | 'secondary';

type FilterKey = 'all' | 'four_truths' | 'available' | 'cooperating' | 'has_vr';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'four_truths', label: '✓ 4/4 thật' },
  { key: 'available', label: 'Sẵn hàng' },
  { key: 'cooperating', label: 'Đang hợp tác' },
  { key: 'has_vr', label: 'Có VR Tour' },
];

function matchFilter(ls: Listing, key: FilterKey): boolean {
  switch (key) {
    case 'all':          return ls.status !== 'SOLD';
    case 'four_truths':  return truthsScore(ls.truths) === 4 && ls.status !== 'SOLD';
    case 'available':    return ls.status === 'AVAILABLE';
    case 'cooperating':  return ls.status === 'COOPERATING' || ls.status === 'PENDING';
    case 'has_vr':       return ls.hasVrTour && ls.status !== 'SOLD';
  }
}

export default function Listings() {
  const [market, setMarket] = useState<MarketTab>('primary');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const savedCount = useSavedListings((s) => s.savedIds.size);
  const refresh = usePullToRefresh();

  const secondaryFiltered = useMemo(() => {
    let xs = listings.filter((l) => matchFilter(l, filter));
    if (search) {
      const q = search.toLowerCase();
      xs = xs.filter(
        (l) =>
          l.code.toLowerCase().includes(q) ||
          l.title.toLowerCase().includes(q) ||
          l.project.shortName.toLowerCase().includes(q)
      );
    }
    return xs;
  }, [filter, search]);

  const primaryFiltered = useMemo(() => {
    if (!search) return primaryProjects;
    const q = search.toLowerCase();
    return primaryProjects.filter(
      (p) =>
        p.shortName.toLowerCase().includes(q) ||
        p.addressFull.toLowerCase().includes(q) ||
        p.developer.toLowerCase().includes(q)
    );
  }, [search]);

  const count = market === 'primary' ? primaryFiltered.length : secondaryFiltered.length;

  return (
    <Screen bg="surface">
      {/* Header */}
      <View className="px-4 pt-2 pb-3 bg-white border-b border-border-light">
        <View className="flex-row items-baseline justify-between mb-3">
          <Text variant="h2" className="text-text-title">Rổ hàng</Text>
          <Text variant="caption" className="text-text-tertiary">
            {count} {market === 'primary' ? 'dự án' : 'sản phẩm'}
          </Text>
        </View>

        {/* Market sub-tabs — Sơ cấp / Thứ cấp */}
        <View
          className="flex-row rounded-xl p-1 mb-3"
          style={{ backgroundColor: semantic.surface.alt }}
        >
          {(['primary', 'secondary'] as const).map((m) => {
            const active = market === m;
            return (
              <Pressable
                key={m}
                onPress={() => setMarket(m)}
                className="flex-1 h-9 rounded-lg items-center justify-center"
                style={{
                  backgroundColor: active ? palette.white : 'transparent',
                  shadowColor: active ? palette.obsidian[900] : 'transparent',
                  shadowOpacity: active ? 0.06 : 0,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 1 },
                  elevation: active ? 1 : 0,
                }}
              >
                <Text
                  variant="body"
                  style={{
                    color: active ? semantic.action.primaryDeep : semantic.text.secondary,
                    fontFamily: 'BeVietnamPro_700Bold',
                    fontSize: 13,
                  }}
                >
                  {m === 'primary' ? 'Sơ cấp' : 'Thứ cấp'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Search */}
        <View className="flex-row items-center gap-2">
          <View className="flex-1 flex-row items-center bg-surface-alt rounded-md h-11 px-3 gap-2 border border-border-light">
            <Search size={18} color={semantic.text.tertiary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={market === 'primary' ? 'Tìm dự án, CĐT, khu vực...' : 'Tìm mã LST, dự án, căn...'}
              placeholderTextColor={semantic.text.tertiary}
              style={typography.body}
              className="flex-1 text-text-primary"
            />
          </View>
          <Pressable
            onPress={() => router.push('/(app)/listings/saved')}
            className="w-11 h-11 rounded-md items-center justify-center border border-border-light"
            style={{ backgroundColor: semantic.surface.alt }}
          >
            <Heart
              size={18}
              color={savedCount > 0 ? palette.red[600] : semantic.text.secondary}
              fill={savedCount > 0 ? palette.red[600] : 'transparent'}
            />
            {savedCount > 0 && (
              <View
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full items-center justify-center"
                style={{ backgroundColor: semantic.action.primary }}
              >
                <Text
                  style={{
                    color: palette.white,
                    fontFamily: 'BeVietnamPro_700Bold',
                    fontSize: 10,
                    lineHeight: 12,
                  }}
                >
                  {savedCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Filter chips — chỉ Thứ cấp có filter "4 thật / Có VR..." */}
      {market === 'secondary' && (
        <View className="py-3 bg-white border-b border-border-light">
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
                  className="px-3.5 h-9 rounded-full items-center justify-center border"
                  style={{
                    backgroundColor: active ? semantic.action.primary : palette.white,
                    borderColor: active ? semantic.action.primary : semantic.border.default,
                  }}
                >
                  <Text
                    variant="body"
                    style={{
                      color: active ? palette.white : semantic.text.secondary,
                      fontFamily: 'BeVietnamPro_600SemiBold',
                      fontSize: 13,
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      )}

      {/* List — Sơ cấp hoặc Thứ cấp */}
      {market === 'primary' ? (
        <FlatList
          data={primaryFiltered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 22 }}
          refreshing={refresh.refreshing}
          onRefresh={refresh.onRefresh}
          renderItem={({ item }) => (
            <PrimaryProjectCard
              project={item}
              onPress={() => router.push(`/(app)/listings/primary/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text variant="body" className="text-text-secondary">
                Không có dự án phù hợp
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={secondaryFiltered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 22 }}
          refreshing={refresh.refreshing}
          onRefresh={refresh.onRefresh}
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              onPress={() => router.push(`/(app)/listings/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text variant="body" className="text-text-secondary">
                Không có sản phẩm phù hợp
              </Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}
