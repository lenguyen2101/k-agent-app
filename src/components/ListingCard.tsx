import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { Building2, ChevronRight, Eye, Images, Orbit, TrendingUp } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { formatPricePerM2, formatVNDCompact } from '@/lib/format';
import { palette, semantic } from '@/theme';
import {
  listingStatusLabels,
  type Listing,
  type ListingStatus,
} from '@/types/listing';
import { FourTruthsPill } from './FourTruthsBanner';

const statusStyle: Record<ListingStatus, { bg: string; fg: string }> = {
  AVAILABLE:   { bg: palette.emerald[50],  fg: palette.emerald[700] },
  PENDING:     { bg: palette.sienna[50],   fg: palette.sienna[700] },
  COOPERATING: { bg: palette.blue[50],     fg: palette.blue[700] },
  RESERVED:    { bg: palette.violet[50],   fg: palette.violet[700] },
  SOLD:        { bg: palette.slate[200],   fg: palette.slate[700] },
};

function StatusPill({ status }: { status: ListingStatus }) {
  const s = statusStyle[status];
  return (
    <View
      className="px-2.5 py-1 rounded-full"
      style={{ backgroundColor: s.bg }}
    >
      <Text
        variant="caption"
        style={{
          color: s.fg,
          fontFamily: 'BeVietnamPro_600SemiBold',
          fontSize: 11,
        }}
      >
        {listingStatusLabels[status]}
      </Text>
    </View>
  );
}

export function ListingCard({ listing, onPress }: { listing: Listing; onPress?: () => void }) {
  const pricePerM2 = listing.listPricePerM2 ?? listing.listPrice / listing.areaM2;
  const isSold = listing.status === 'SOLD';
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      className="bg-surface-card rounded-2xl overflow-hidden active:opacity-90"
      style={{
        borderWidth: 1,
        borderColor: semantic.border.light,
        shadowColor: palette.obsidian[900],
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
        opacity: isSold ? 0.75 : 1,
      }}
    >
      {/* Cover image 16:10 + overlays */}
      <View className="relative" style={{ aspectRatio: 16 / 10 }}>
        {imgFailed ? (
          <View
            className="w-full h-full items-center justify-center"
            style={{ backgroundColor: semantic.action.primarySoft }}
          >
            <Building2 size={44} color={palette.sienna[300]} strokeWidth={1.5} />
          </View>
        ) : (
          <Image
            source={{ uri: listing.coverImage }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onError={() => setImgFailed(true)}
          />
        )}

        {/* Top row: status + 4/4 */}
        <View className="absolute top-3 left-3 right-3 flex-row items-start justify-between">
          <StatusPill status={listing.status} />
          <FourTruthsPill truths={listing.truths} />
        </View>

        {/* Bottom row: VR + gallery count */}
        <View className="absolute bottom-3 left-3 right-3 flex-row items-end justify-between">
          <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(10,9,8,0.62)' }}
          >
            <Eye size={12} color={palette.white} strokeWidth={2} />
            <Text
              variant="caption"
              style={{ color: palette.white, fontFamily: 'BeVietnamPro_500Medium', fontSize: 11 }}
            >
              {listing.viewCount.toLocaleString('vi-VN')}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            {listing.hasVrTour && (
              <View
                className="flex-row items-center gap-1 px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(10,9,8,0.62)' }}
              >
                <Orbit size={12} color={palette.white} strokeWidth={2.2} />
                <Text
                  variant="caption"
                  style={{ color: palette.white, fontFamily: 'BeVietnamPro_500Medium', fontSize: 11 }}
                >
                  VR
                </Text>
              </View>
            )}
            <View
              className="flex-row items-center gap-1 px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(10,9,8,0.62)' }}
            >
              <Images size={12} color={palette.white} strokeWidth={2.2} />
              <Text
                variant="caption"
                style={{ color: palette.white, fontFamily: 'BeVietnamPro_500Medium', fontSize: 11 }}
              >
                {listing.gallery.length}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Info area */}
      <View className="px-4 pt-3 pb-3">
        <View className="flex-row items-center gap-1.5">
          <Text
            variant="caption"
            style={{ color: semantic.action.primaryDeep, fontFamily: 'BeVietnamPro_600SemiBold' }}
            numberOfLines={1}
          >
            {listing.project.shortName}
          </Text>
          {listing.building && (
            <>
              <Text variant="caption" className="text-text-tertiary">·</Text>
              <Text variant="caption" className="text-text-secondary" numberOfLines={1}>
                {listing.building}
              </Text>
            </>
          )}
          {typeof listing.floor === 'number' && (
            <>
              <Text variant="caption" className="text-text-tertiary">·</Text>
              <Text variant="caption" className="text-text-secondary">Tầng {listing.floor}</Text>
            </>
          )}
        </View>

        <Text variant="h3" className="text-text-primary mt-1" numberOfLines={2}>
          {listing.unitType} — {listing.areaM2}m²
        </Text>

        <View className="flex-row items-baseline gap-2 mt-2">
          <Text
            variant="h2"
            style={{ color: semantic.action.primary, fontFamily: 'BeVietnamPro_700Bold' }}
          >
            {formatVNDCompact(listing.listPrice)}
          </Text>
          <Text variant="caption" className="text-text-secondary">
            {formatPricePerM2(pricePerM2)}
          </Text>
        </View>
      </View>

      {/* Commission strip */}
      <View
        className="px-4 py-2.5 flex-row items-center gap-2.5"
        style={{
          backgroundColor: semantic.action.primarySoft,
          borderTopWidth: 1,
          borderTopColor: semantic.border.light,
        }}
      >
        <View
          className="w-7 h-7 rounded-full items-center justify-center"
          style={{ backgroundColor: semantic.action.primary }}
        >
          <TrendingUp size={14} color={palette.white} strokeWidth={2.5} />
        </View>
        <View className="flex-1">
          <Text variant="caption" className="text-text-secondary" style={{ fontSize: 11 }}>
            Hoa hồng của bạn
          </Text>
          <Text
            variant="body"
            style={{
              color: semantic.action.primaryDeep,
              fontFamily: 'BeVietnamPro_700Bold',
              fontSize: 14,
              marginTop: -1,
            }}
          >
            {formatVNDCompact(listing.myCommission)}{' '}
            <Text
              variant="caption"
              style={{ color: semantic.action.primary, fontFamily: 'BeVietnamPro_500Medium' }}
            >
              ({listing.myCommissionPct}%)
            </Text>
          </Text>
        </View>
        <ChevronRight size={18} color={semantic.action.primary} />
      </View>
    </Pressable>
  );
}
