import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { cdnImage, IMG_SIZE } from '@/lib/img';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Eye,
  Heart,
  Images as ImagesIcon,
  Info,
  MapPin,
  Orbit,
  Ruler,
  Share2,
  TrendingUp,
  Users,
} from 'lucide-react-native';
import { FourTruthsBanner } from '@/components/FourTruthsBanner';
import { Text } from '@/components/ui/Text';
import { useSavedListings } from '@/store/savedListings';
import { listings } from '@/mock/listings';
import { formatPricePerM2, formatVND, formatVNDCompact, formatVNDWords } from '@/lib/format';
import { palette, semantic } from '@/theme';
import { listingStatusLabels, type ListingStatus } from '@/types/listing';

const statusDotColor: Record<ListingStatus, string> = {
  AVAILABLE:   palette.emerald[500],
  PENDING:     palette.sienna[500],
  COOPERATING: palette.blue[600],
  RESERVED:    palette.violet[600],
  SOLD:        palette.slate[400],
};

function formatPublishDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function formatViewCount(n: number) {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace('.', ',')}K`;
  return n.toLocaleString('vi-VN');
}

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const listing = useMemo(() => listings.find((l) => l.id === id), [id]);
  const isSaved = useSavedListings((s) => (id ? s.isSaved(id) : false));
  const toggleSave = useSavedListings((s) => s.toggle);

  if (!listing) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Text variant="body" className="text-text-secondary">Không tìm thấy sản phẩm</Text>
      </View>
    );
  }

  const pricePerM2 = listing.listPricePerM2 ?? listing.listPrice / listing.areaM2;
  const floorPricePerM2 =
    listing.floorPricePerM2 ?? (listing.floorPrice ? listing.floorPrice / listing.areaM2 : undefined);

  return (
    <View className="flex-1 bg-surface">
      {/* Custom header */}
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
        {/* Spacer để cân với 2 action icon bên phải (heart + share) */}
        <View className="w-10" />
        <View className="flex-1 items-center">
          <Text
            variant="h3"
            style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
          >
            {listing.code}
          </Text>
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <View
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: statusDotColor[listing.status] }}
            />
            <Text variant="caption" className="text-text-secondary">
              {listingStatusLabels[listing.status]}
            </Text>
          </View>
        </View>
        <Pressable
          className="w-10 h-10 items-center justify-center"
          hitSlop={8}
          onPress={() => listing && toggleSave(listing.id)}
        >
          <Heart
            size={20}
            color={isSaved ? palette.red[600] : semantic.text.secondary}
            fill={isSaved ? palette.red[600] : 'transparent'}
          />
        </Pressable>
        <Pressable className="w-10 h-10 items-center justify-center" hitSlop={8}>
          <Share2 size={20} color={semantic.text.secondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* 4/4 thật ribbon */}
        <View className="pt-3">
          <FourTruthsBanner truths={listing.truths} />
        </View>

        {/* Title + meta */}
        <View className="px-4 pt-4">
          <Text
            style={{
              color: semantic.text.primary,
              fontFamily: 'BeVietnamPro_700Bold',
              fontSize: 18,
              lineHeight: 24,
            }}
          >
            {listing.title}
          </Text>
          <View className="flex-row items-center gap-3 mt-2">
            <View className="flex-row items-center gap-1">
              <Eye size={13} color={semantic.text.tertiary} />
              <Text variant="caption" className="text-text-secondary">
                {formatViewCount(listing.viewCount)}
              </Text>
            </View>
            <Text variant="caption" className="text-text-tertiary">·</Text>
            <Text variant="caption" className="text-text-secondary">
              Ngày đăng: {formatPublishDate(listing.publishedAt)}
            </Text>
          </View>
        </View>

        {/* Agent card */}
        <View className="mx-4 mt-4 p-3 rounded-2xl bg-surface-card border border-border-light flex-row items-center gap-3">
          <View
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{ backgroundColor: semantic.surface.brandSoft }}
          >
            <Text
              variant="body"
              style={{ color: semantic.action.primaryDeep, fontFamily: 'BeVietnamPro_700Bold' }}
            >
              {listing.agent.fullName.split(' ').slice(-1)[0][0]}
            </Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text variant="h3" className="text-text-primary" numberOfLines={1}>
                {listing.agent.fullName}
              </Text>
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: palette.sienna[100] }}
              >
                <Text
                  variant="caption"
                  style={{
                    color: palette.sienna[700],
                    fontFamily: 'BeVietnamPro_700Bold',
                    fontSize: 11,
                  }}
                >
                  {listing.agent.score}/100
                </Text>
              </View>
            </View>
            <Text variant="caption" className="text-text-secondary mt-0.5" numberOfLines={1}>
              {listing.agent.company}
            </Text>
          </View>
        </View>

        {/* Gallery hero */}
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/(modal)/image-viewer',
              params: { listingId: listing.id, startIndex: '0' },
            })
          }
          className="mx-4 mt-4 rounded-2xl overflow-hidden"
        >
          <View style={{ position: 'relative', aspectRatio: 16 / 10 }}>
            <Image
              source={{ uri: cdnImage(listing.coverImage, IMG_SIZE.fullWidth) }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
            <View
              className="absolute top-3 right-3 px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(10,9,8,0.62)' }}
            >
              <Text
                variant="caption"
                style={{ color: palette.white, fontFamily: 'BeVietnamPro_600SemiBold', fontSize: 11 }}
              >
                1/{listing.gallery.length}
              </Text>
            </View>
          </View>

          <View className="flex-row" style={{ backgroundColor: palette.obsidian[900] }}>
            {listing.hasVrTour && (
              <Pressable className="flex-1 flex-row items-center justify-center gap-2 py-3 border-r border-white/10">
                <Orbit size={16} color={palette.white} strokeWidth={2.2} />
                <Text
                  variant="body"
                  style={{ color: palette.white, fontFamily: 'BeVietnamPro_500Medium' }}
                >
                  Xem VR Tour
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(modal)/image-viewer',
                  params: { listingId: listing.id, startIndex: '0' },
                })
              }
              className="flex-1 flex-row items-center justify-center gap-2 py-3"
            >
              <ImagesIcon size={16} color={palette.white} strokeWidth={2.2} />
              <Text
                variant="body"
                style={{ color: palette.white, fontFamily: 'BeVietnamPro_500Medium' }}
              >
                Xem ảnh ({listing.gallery.length})
              </Text>
            </Pressable>
          </View>
        </Pressable>

        {/* Property quick specs */}
        <View className="mx-4 mt-4 p-4 rounded-2xl bg-surface-card border border-border-light">
          <SpecRow
            icon={<Building2 size={16} color={semantic.text.tertiary} />}
            label="Dự án"
            value={listing.project.name}
          />
          <SpecRow
            icon={<MapPin size={16} color={semantic.text.tertiary} />}
            label="Vị trí"
            value={listing.project.location}
          />
          <SpecRow
            icon={<Ruler size={16} color={semantic.text.tertiary} />}
            label="Diện tích"
            value={`${listing.areaM2} m² · ${listing.unitType}`}
          />
          {typeof listing.floor === 'number' && (
            <SpecRow
              icon={<Users size={16} color={semantic.text.tertiary} />}
              label="Tầng"
              value={`Tầng ${listing.floor}${listing.building ? ` · ${listing.building}` : ''}`}
              last
            />
          )}
        </View>

        {/* Pricing */}
        <View className="mx-4 mt-4 p-4 rounded-2xl bg-surface-card border border-border-light">
          <Text variant="caption" className="text-text-secondary">
            Giá bán niêm yết
          </Text>
          <View className="flex-row items-baseline gap-2 mt-1">
            <Text
              variant="h1"
              style={{
                color: semantic.action.primaryDeep,
                fontFamily: 'BeVietnamPro_700Bold',
                fontSize: 24,
              }}
            >
              {formatVND(listing.listPrice)}
            </Text>
            <Text variant="caption" className="text-text-secondary">
              {formatPricePerM2(pricePerM2)}
            </Text>
          </View>
          <Text variant="caption" className="text-text-tertiary mt-1 italic">
            {formatVNDWords(listing.listPrice)}
          </Text>

          {listing.floorPrice && (
            <View
              className="flex-row items-center justify-between mt-3 pt-3"
              style={{ borderTopWidth: 1, borderTopColor: semantic.border.light }}
            >
              <Text variant="body" className="text-text-secondary">
                Giá bán sàn
              </Text>
              <View className="flex-row items-baseline gap-1.5">
                <Text
                  variant="body"
                  style={{ color: semantic.action.primary, fontFamily: 'BeVietnamPro_700Bold' }}
                >
                  {formatVND(listing.floorPrice)}
                </Text>
                {floorPricePerM2 && (
                  <Text variant="caption" className="text-text-tertiary">
                    ({formatPricePerM2(floorPricePerM2)})
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Commission breakdown — premium card */}
        <View
          className="mx-4 mt-4 rounded-2xl overflow-hidden"
          style={{
            shadowColor: semantic.action.primaryDeep,
            shadowOpacity: 0.15,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
            elevation: 5,
          }}
        >
          <LinearGradient
            colors={[...semantic.gradient.statCardSoft]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 16 }}
          >
            <View className="flex-row items-center gap-2 mb-3">
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: semantic.action.primary }}
              >
                <TrendingUp size={16} color={palette.white} strokeWidth={2.4} />
              </View>
              <Text variant="h3" className="text-text-primary">
                Hoa hồng
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-1.5">
              <Text variant="body" className="text-text-secondary">
                Tổng hoa hồng môi giới
              </Text>
              <Text
                variant="body"
                style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
              >
                {formatVNDCompact(listing.totalCommission)}
              </Text>
            </View>

            <View
              className="flex-row items-center justify-between py-1.5 mt-1"
              style={{
                borderTopWidth: 1,
                borderTopColor: semantic.border.light,
                paddingTop: 10,
              }}
            >
              <Text variant="body" className="text-text-primary" style={{ fontFamily: 'BeVietnamPro_600SemiBold' }}>
                Hoa hồng dự kiến của bạn
              </Text>
              <View className="flex-row items-baseline gap-1">
                <Text
                  variant="h2"
                  style={{
                    color: semantic.action.primaryDeep,
                    fontFamily: 'BeVietnamPro_700Bold',
                  }}
                >
                  {formatVNDCompact(listing.myCommission)}
                </Text>
                <Text
                  variant="caption"
                  style={{ color: semantic.action.primary, fontFamily: 'BeVietnamPro_600SemiBold' }}
                >
                  ({listing.myCommissionPct}%)
                </Text>
              </View>
            </View>

            <Pressable className="flex-row items-center gap-1 mt-3">
              <Text
                variant="caption"
                style={{ color: semantic.action.primary, fontFamily: 'BeVietnamPro_600SemiBold' }}
              >
                Xem chi tiết tỉ lệ
              </Text>
              <ChevronRight size={14} color={semantic.action.primary} />
            </Pressable>
          </LinearGradient>
        </View>

        {/* Description */}
        {listing.description && (
          <View className="mx-4 mt-4 p-4 rounded-2xl bg-surface-card border border-border-light">
            <View className="flex-row items-center gap-2 mb-2">
              <Info size={14} color={semantic.text.secondary} />
              <Text variant="h3" className="text-text-primary">Mô tả</Text>
            </View>
            <Text variant="body" className="text-text-secondary">
              {listing.description}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky action bar */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-border-light flex-row gap-3 px-4 pt-3"
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }}
      >
        <Pressable
          className="flex-1 h-12 rounded-xl items-center justify-center border"
          style={{ borderColor: semantic.border.default, backgroundColor: palette.white }}
        >
          <Text variant="body" style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_600SemiBold' }}>
            Liên hệ chủ
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push(`/(app)/listings/${listing.id}/request-cooperation`)}
          className="flex-[1.6] h-12 rounded-xl items-center justify-center"
          style={{
            backgroundColor: semantic.action.primary,
            shadowColor: semantic.action.primaryDeep,
            shadowOpacity: 0.25,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        >
          <Text variant="body" style={{ color: palette.white, fontFamily: 'BeVietnamPro_700Bold' }}>
            Yêu cầu hợp tác
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function SpecRow({
  icon,
  label,
  value,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      className="flex-row items-center py-2.5"
      style={{
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: semantic.border.light,
      }}
    >
      <View className="w-7 h-7 rounded-full bg-surface-alt items-center justify-center">
        {icon}
      </View>
      <Text variant="body" className="text-text-secondary ml-3 mr-4 w-20">{label}</Text>
      <Text variant="body" className="text-text-primary flex-1" numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}
