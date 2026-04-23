import { useMemo, useState } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Banknote,
  Building2,
  ChevronRight,
  Ruler,
  Search,
  Wallet,
} from 'lucide-react-native';
import { BookingStatusBadge, bookingStatusTint } from '@/components/BookingStatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { Text } from '@/components/ui/Text';
import { useBookings, type Booking, type BookingStatus } from '@/store/bookings';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { formatRelativeTime, formatVNDCompact } from '@/lib/format';
import { palette, semantic } from '@/theme';

// "Booking của tôi" list — overview tất cả booking sale đã tạo, filter theo
// pipeline stage, search theo khách/dự án. Tap 1 card → detail + update status.

type FilterKey = 'all' | 'active' | 'done' | 'cancelled';

const FILTERS: { key: FilterKey; label: string; match: (s: BookingStatus) => boolean }[] = [
  { key: 'all', label: 'Tất cả', match: () => true },
  {
    key: 'active',
    label: 'Đang xử lý',
    match: (s) => s !== 'COMPLETED' && s !== 'CANCELLED',
  },
  { key: 'done', label: 'Hoàn tất', match: (s) => s === 'COMPLETED' },
  { key: 'cancelled', label: 'Đã huỷ', match: (s) => s === 'CANCELLED' },
];

export default function BookingsList() {
  const insets = useSafeAreaInsets();
  const bookings = useBookings((s) => s.bookings);
  const refresh = usePullToRefresh();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter)!;
    let xs = bookings.filter((b) => f.match(b.status));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      xs = xs.filter(
        (b) =>
          b.customerName.toLowerCase().includes(q) ||
          b.customerPhone.includes(q) ||
          b.projectName.toLowerCase().includes(q) ||
          (b.unitCode?.toLowerCase().includes(q) ?? false)
      );
    }
    return xs.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [bookings, filter, search]);

  // Stats per pipeline stage — dùng cho summary chips
  const statusCounts = useMemo(() => {
    const map: Record<BookingStatus, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      DEPOSITED: 0,
      CONTRACTED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    for (const b of bookings) map[b.status]++;
    return map;
  }, [bookings]);

  const totalActive =
    statusCounts.PENDING +
    statusCounts.CONFIRMED +
    statusCounts.DEPOSITED +
    statusCounts.CONTRACTED;

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
        <View className="w-10" />
        <View className="flex-1 items-center">
          <Text
            variant="h3"
            style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
          >
            Booking của tôi
          </Text>
        </View>
        <View className="w-10" />
      </View>

      {/* Pipeline summary — 4 tile grid */}
      <View className="px-4 pt-3 pb-2 bg-white border-b border-border-light">
        <Text
          variant="badge"
          style={{ color: semantic.text.tertiary, marginBottom: 8 }}
        >
          Pipeline hiện tại
        </Text>
        <View className="flex-row gap-2">
          <PipelineStat
            status="PENDING"
            count={statusCounts.PENDING}
            label="Chờ CĐT"
          />
          <PipelineStat
            status="CONFIRMED"
            count={statusCounts.CONFIRMED}
            label="Đã xác nhận"
          />
          <PipelineStat
            status="DEPOSITED"
            count={statusCounts.DEPOSITED}
            label="Đã cọc"
          />
          <PipelineStat
            status="CONTRACTED"
            count={statusCounts.CONTRACTED}
            label="Đã ký HĐ"
          />
        </View>
        <Text
          variant="caption"
          className="text-text-tertiary mt-2"
        >
          {totalActive} đang xử lý · {statusCounts.COMPLETED} hoàn tất ·{' '}
          {statusCounts.CANCELLED} đã huỷ
        </Text>
      </View>

      {/* Search */}
      <View className="px-4 pt-3 pb-2 bg-white border-b border-border-light">
        <View
          className="flex-row items-center rounded-xl h-11 px-3 gap-2"
          style={{
            backgroundColor: semantic.surface.alt,
            borderWidth: 1,
            borderColor: semantic.border.light,
          }}
        >
          <Search size={16} color={semantic.text.tertiary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm theo tên khách / dự án / mã căn"
            placeholderTextColor={semantic.text.tertiary}
            style={{
              flex: 1,
              fontFamily: 'BeVietnamPro_500Medium',
              fontSize: 14,
              color: semantic.text.primary,
            }}
          />
        </View>
      </View>

      {/* Filter chips */}
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
                className="px-3.5 h-9 rounded-full items-center justify-center"
                style={{
                  backgroundColor: active ? semantic.text.primary : semantic.surface.card,
                  borderWidth: 1,
                  borderColor: active ? semantic.text.primary : semantic.border.default,
                }}
              >
                <Text
                  variant="caption"
                  style={{
                    color: active ? palette.white : semantic.text.secondary,
                    fontFamily: 'BeVietnamPro_600SemiBold',
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
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
        refreshing={refresh.refreshing}
        onRefresh={refresh.onRefresh}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onPress={() => router.push(`/(app)/bookings/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={Wallet}
            title={
              search || filter !== 'all'
                ? 'Không tìm thấy booking'
                : 'Chưa có booking nào'
            }
            description={
              search || filter !== 'all'
                ? 'Thử bỏ bộ lọc hoặc đổi từ khoá tìm kiếm.'
                : 'Tạo booking từ Rổ hàng hoặc Lead detail để quản lý deal.'
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
    </View>
  );
}

function PipelineStat({
  status,
  count,
  label,
}: {
  status: BookingStatus;
  count: number;
  label: string;
}) {
  const tint = bookingStatusTint[status];
  return (
    <View
      className="flex-1 p-2.5 rounded-xl"
      style={{ backgroundColor: tint.bg }}
    >
      <Text
        variant="h3"
        style={{ color: tint.fg }}
      >
        {count}
      </Text>
      <Text
        variant="badge"
        style={{
          color: tint.fg,
          opacity: 0.85,
          marginTop: 1,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

function BookingCard({
  booking,
  onPress,
}: {
  booking: Booking;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="p-4 rounded-2xl"
      style={{
        backgroundColor: palette.white,
        borderWidth: 1,
        borderColor: semantic.border.light,
      }}
    >
      <View className="flex-row items-start gap-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <BookingStatusBadge status={booking.status} withDot />
            <Text variant="caption" className="text-text-tertiary">
              {formatRelativeTime(booking.updatedAt)}
            </Text>
          </View>
          <Text
            variant="body"
            style={{
              color: semantic.text.primary,
              fontFamily: 'BeVietnamPro_700Bold',
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {booking.customerName}
          </Text>
          <View className="flex-row items-center gap-2 mt-1.5 flex-wrap">
            <View className="flex-row items-center gap-1">
              <Building2 size={12} color={semantic.text.tertiary} />
              <Text
                variant="caption"
                style={{ color: semantic.text.secondary }}
                numberOfLines={1}
              >
                {booking.projectName}
              </Text>
            </View>
            {booking.unitTypeName && (
              <>
                <Text variant="caption" className="text-text-tertiary">·</Text>
                <View className="flex-row items-center gap-1">
                  <Ruler size={12} color={semantic.text.tertiary} />
                  <Text
                    variant="caption"
                    style={{ color: semantic.text.secondary }}
                  >
                    {booking.unitTypeName}
                    {booking.unitCode ? ` · ${booking.unitCode}` : ''}
                  </Text>
                </View>
              </>
            )}
          </View>
          <View className="flex-row items-center gap-1 mt-2">
            <Banknote size={12} color={palette.emerald[700]} />
            <Text
              variant="caption"
              style={{ color: palette.emerald[700], fontFamily: 'BeVietnamPro_700Bold' }}
            >
              Cọc {formatVNDCompact(booking.depositVnd)}
            </Text>
          </View>
        </View>
        <ChevronRight size={18} color={semantic.text.tertiary} strokeWidth={2} />
      </View>
    </Pressable>
  );
}
