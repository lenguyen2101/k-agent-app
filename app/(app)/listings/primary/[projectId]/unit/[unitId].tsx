import { useMemo } from 'react';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { cdnImage, IMG_SIZE } from '@/lib/img';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowUpRight,
  Bath,
  Bed,
  Building2,
  Calculator,
  ChevronRight,
  Compass,
  Images as ImagesIcon,
  Layers,
  Maximize2,
  Ruler,
  Share2,
  Sparkles,
  Sprout,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import { SectionTitle } from '@/components/SectionTitle';
import { Text } from '@/components/ui/Text';
import { primaryProjects } from '@/mock/primaryProjects';
import { formatPricePerM2, formatVND, formatVNDCompact } from '@/lib/format';
import { palette, semantic } from '@/theme';
import {
  availableUnitStatusLabels,
  type AvailableUnitStatus,
} from '@/types/primaryProject';

const SECTION_DIVIDER = 32;
const { width: SCREEN_W } = Dimensions.get('window');

const statusTint: Record<AvailableUnitStatus, { bg: string; fg: string; dot: string }> = {
  AVAILABLE: { bg: palette.emerald[50], fg: palette.emerald[700], dot: palette.emerald[500] },
  RESERVED: { bg: palette.sienna[50], fg: palette.sienna[700], dot: palette.sienna[500] },
  SOLD: { bg: palette.slate[100], fg: palette.slate[700], dot: palette.slate[400] },
};

export default function UnitTypeDetail() {
  const { projectId, unitId } = useLocalSearchParams<{ projectId: string; unitId: string }>();
  const insets = useSafeAreaInsets();

  const project = useMemo(() => primaryProjects.find((p) => p.id === projectId), [projectId]);
  const unit = useMemo(
    () => project?.unitTypes.find((u) => u.id === unitId),
    [project, unitId]
  );

  if (!project || !unit) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Text variant="body" className="text-text-secondary">
          Không tìm thấy căn
        </Text>
      </View>
    );
  }

  const priceRange = `${formatPricePerM2(unit.pricePerM2Min).replace('~', '')} - ${formatPricePerM2(unit.pricePerM2Max).replace('~', '')}`;

  // Estimated total price range for this unit type
  const estMin = unit.areaMin * unit.pricePerM2Min;
  const estMax = unit.areaMax * unit.pricePerM2Max;
  const estTotalText = `${formatVNDCompact(estMin)} - ${formatVNDCompact(estMax)}`;

  // Commission estimate (on avg price)
  const avgPrice = (estMin + estMax) / 2;
  const commissionPct = unit.commissionPct ?? 2;
  const commissionAvg = (avgPrice * commissionPct) / 100;

  const interior = unit.interiorImages ?? [];

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
            Loại căn {unit.name}
          </Text>
        </View>
        <Pressable className="w-10 h-10 items-center justify-center" hitSlop={8}>
          <Share2 size={20} color={semantic.text.secondary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero floorplan */}
        <View style={{ position: 'relative', backgroundColor: palette.slate[50] }}>
          <Image
            source={{ uri: cdnImage(unit.floorplanImage, SCREEN_W) }}
            style={{ width: SCREEN_W, aspectRatio: 4 / 3 }}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          <View
            className="absolute top-3 left-3 flex-row items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(10,9,8,0.62)' }}
          >
            <Maximize2 size={12} color={palette.white} strokeWidth={2.2} />
            <Text
              variant="caption"
              style={{ color: palette.white, fontFamily: 'BeVietnamPro_600SemiBold' }}
            >
              Floorplan
            </Text>
          </View>
          <View
            className="absolute bottom-3 right-3 flex-row items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(10,9,8,0.62)' }}
          >
            <ImagesIcon size={12} color={palette.white} strokeWidth={2.2} />
            <Text
              variant="caption"
              style={{ color: palette.white, fontFamily: 'BeVietnamPro_600SemiBold' }}
            >
              {unit.photoCount}
            </Text>
          </View>
        </View>

        {/* Metadata */}
        <View className="bg-white px-4 pt-4 pb-5">
          <Text
            variant="badge"
            style={{ color: semantic.text.tertiary, fontFamily: 'BeVietnamPro_500Medium' }}
          >
            {project.shortName} · {unit.towerName}
          </Text>
          <Text
            variant="h1"
            style={{ color: semantic.text.primary, marginTop: 4 }}
          >
            {unit.name} · {unit.areaMin === unit.areaMax ? `${unit.areaMin}m²` : `${unit.areaMin}-${unit.areaMax}m²`}
          </Text>

          <Text
            variant="body-lg"
            style={{ color: palette.emerald[700], fontFamily: 'BeVietnamPro_700Bold', marginTop: 8 }}
          >
            {priceRange}
          </Text>
          <Text
            variant="caption"
            style={{
              color: semantic.text.secondary,
              fontFamily: 'BeVietnamPro_500Medium',
              marginTop: 2,
            }}
          >
            Tổng giá ước tính: {estTotalText}
          </Text>

          {/* Specs row 2x2-like */}
          <View className="flex-row flex-wrap mt-4" style={{ marginHorizontal: -4 }}>
            <SpecCell icon={<Bed size={14} color={palette.sienna[700]} strokeWidth={2.2} />} label="Phòng ngủ" value={unit.bedrooms === 0 ? 'Studio' : `${unit.bedrooms} PN`} tint="sienna" />
            <SpecCell icon={<Bath size={14} color={palette.blue[700]} strokeWidth={2.2} />} label="Vệ sinh" value={`${unit.bathrooms} WC`} tint="blue" />
            <SpecCell icon={<Ruler size={14} color={palette.emerald[700]} strokeWidth={2.2} />} label="Diện tích" value={`${unit.areaMin}-${unit.areaMax}m²`} tint="emerald" />
            {unit.balconyArea !== undefined && (
              <SpecCell icon={<Sprout size={14} color={palette.emerald[700]} strokeWidth={2.2} />} label="Ban công" value={`${unit.balconyArea}m²`} tint="emerald" />
            )}
            {unit.directions && unit.directions.length > 0 && (
              <SpecCell icon={<Compass size={14} color={palette.violet[700]} strokeWidth={2.2} />} label="Hướng" value={unit.directions.join(' / ')} tint="violet" />
            )}
            <SpecCell icon={<Layers size={14} color={palette.slate[700]} strokeWidth={2.2} />} label="Tầng" value={unit.floorRange.replace('Tầng ', '')} tint="slate" />
          </View>
        </View>

        {/* Description */}
        {unit.description && (
          <View
            className="bg-surface px-4 py-5"
            style={{ borderTopWidth: SECTION_DIVIDER, borderTopColor: palette.white }}
          >
            <SectionTitle title="Giới thiệu loại căn" />
            <View
              className="mt-3 p-4 rounded-2xl"
              style={{ backgroundColor: semantic.action.primarySoft }}
            >
              <Text variant="body" style={{ color: semantic.text.primary, lineHeight: 22 }}>
                {unit.description}
              </Text>
            </View>
          </View>
        )}

        {/* Commission breakdown — sale-facing WOW card */}
        <View
          className="bg-surface px-4 py-5"
          style={{ borderTopWidth: SECTION_DIVIDER, borderTopColor: palette.white }}
        >
          <SectionTitle title="Hoa hồng sale" subtitle="Tính theo giá trị căn trung bình" />
          <View
            className="mt-4 rounded-3xl overflow-hidden"
            style={{
              shadowColor: palette.sienna[900],
              shadowOpacity: 0.18,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 6 },
              elevation: 6,
            }}
          >
            <LinearGradient
              colors={[palette.sienna[700], palette.sienna[500], palette.sienna[400]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 20 }}
            >
              <View className="flex-row items-start justify-between">
                <View>
                  <View className="flex-row items-center gap-1.5">
                    <Sparkles size={14} color={palette.white} strokeWidth={2.4} />
                    <Text
                      variant="badge"
                      style={{
                        color: palette.white,
                        opacity: 0.92,
                      }}
                    >
                      HOA HỒNG / CĂN
                    </Text>
                  </View>
                  <Text
                    variant="display"
                    style={{
                      color: palette.white,
                      marginTop: 6,
                    }}
                  >
                    {formatVNDCompact(commissionAvg)}
                  </Text>
                  <Text
                    variant="caption"
                    style={{ color: palette.white, opacity: 0.9, marginTop: 2 }}
                  >
                    ước tính {formatVND(commissionAvg)}
                  </Text>
                </View>
                <View
                  className="px-3 py-1.5 rounded-full flex-row items-center gap-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}
                >
                  <TrendingUp size={14} color={palette.white} strokeWidth={2.4} />
                  <Text
                    variant="caption"
                    style={{ color: palette.white, fontFamily: 'BeVietnamPro_700Bold' }}
                  >
                    {commissionPct}%
                  </Text>
                </View>
              </View>

              {/* Breakdown row */}
              <View
                className="mt-4 pt-4 flex-row"
                style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' }}
              >
                <View className="flex-1">
                  <Text
                    variant="badge"
                    style={{ color: palette.white, opacity: 0.82 }}
                  >
                    Giá căn trung bình
                  </Text>
                  <Text
                    variant="body"
                    style={{
                      color: palette.white,
                      fontFamily: 'BeVietnamPro_700Bold',
                      marginTop: 2,
                    }}
                  >
                    {formatVNDCompact(avgPrice)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    variant="badge"
                    style={{ color: palette.white, opacity: 0.82 }}
                  >
                    Tỷ lệ HH
                  </Text>
                  <Text
                    variant="body"
                    style={{
                      color: palette.white,
                      fontFamily: 'BeVietnamPro_700Bold',
                      marginTop: 2,
                    }}
                  >
                    {commissionPct}% × giá căn
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
          <Text
            variant="caption"
            style={{
              color: semantic.text.tertiary,
              marginTop: 10,
              lineHeight: 18,
            }}
          >
            Mức hoa hồng thực nhận có thể thay đổi theo đợt bán và chính sách CĐT. Liên hệ sale leader để xác nhận.
          </Text>

          {/* Loan calculator CTA — tính vay cho căn này */}
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(app)/tools/loan-calculator',
                params: { price: String(Math.round(avgPrice)) },
              })
            }
            className="mt-3 flex-row items-center gap-3 p-3.5 rounded-2xl"
            style={{
              backgroundColor: palette.white,
              borderWidth: 1,
              borderColor: semantic.border.light,
            }}
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: palette.blue[50] }}
            >
              <Calculator size={18} color={palette.blue[700]} strokeWidth={2.2} />
            </View>
            <View className="flex-1">
              <Text
                variant="subtitle"
                style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
              >
                Tính vay cho căn này
              </Text>
              <Text variant="caption" className="text-text-secondary mt-0.5" numberOfLines={1}>
                Dư nợ giảm dần · trả hàng tháng · lãi suất VN
              </Text>
            </View>
            <ChevronRight size={18} color={semantic.text.tertiary} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Interior gallery */}
        {interior.length > 0 && (
          <View
            className="bg-surface px-4 py-5"
            style={{ borderTopWidth: SECTION_DIVIDER, borderTopColor: palette.white }}
          >
            <SectionTitle title={`Nội thất mẫu (${interior.length})`} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingTop: 12, paddingRight: 4 }}
            >
              {interior.map((img, i) => (
                <Image
                  key={i}
                  source={{ uri: cdnImage(img, IMG_SIZE.card) }}
                  style={{ width: 240, aspectRatio: 4 / 3, borderRadius: 14 }}
                  contentFit="cover"
                  transition={150}
                  cachePolicy="memory-disk"
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Available units list */}
        {unit.availableUnits && unit.availableUnits.length > 0 && (
          <View
            className="bg-surface px-4 py-5"
            style={{ borderTopWidth: SECTION_DIVIDER, borderTopColor: palette.white }}
          >
            <SectionTitle
              title={`Căn đang có (${unit.availableUnits.length})`}
              subtitle="Nhấn chọn căn để booking trực tiếp"
            />
            <View className="mt-3 gap-2.5">
              {unit.availableUnits.map((au) => {
                const tint = statusTint[au.status];
                const disabled = au.status === 'SOLD';
                return (
                  <Pressable
                    key={au.code}
                    disabled={disabled}
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/booking',
                        params: {
                          projectId: project.id,
                          unitId: unit.id,
                          unitCode: au.code,
                        },
                      })
                    }
                    className="flex-row items-center p-3 rounded-2xl"
                    style={{
                      backgroundColor: palette.white,
                      borderWidth: 1,
                      borderColor: semantic.border.light,
                      opacity: disabled ? 0.55 : 1,
                    }}
                  >
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text
                          variant="body"
                          style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
                        >
                          {au.code}
                        </Text>
                        <View
                          className="flex-row items-center gap-1 px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: tint.bg }}
                        >
                          <View
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: tint.dot,
                            }}
                          />
                          <Text variant="badge" style={{ color: tint.fg }}>
                            {availableUnitStatusLabels[au.status]}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center gap-3 mt-1">
                        <View className="flex-row items-center gap-1">
                          <Building2 size={11} color={semantic.text.tertiary} />
                          <Text variant="caption" className="text-text-secondary">
                            Tầng {au.floor}
                          </Text>
                        </View>
                        {au.direction && (
                          <View className="flex-row items-center gap-1">
                            <Compass size={11} color={semantic.text.tertiary} />
                            <Text variant="caption" className="text-text-secondary">
                              {au.direction}
                            </Text>
                          </View>
                        )}
                        <View className="flex-row items-center gap-1">
                          <Ruler size={11} color={semantic.text.tertiary} />
                          <Text variant="caption" className="text-text-secondary">
                            {au.areaM2}m²
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="items-end ml-2">
                      <Text
                        variant="body"
                        style={{ color: palette.emerald[700], fontFamily: 'BeVietnamPro_700Bold' }}
                      >
                        {formatVNDCompact(au.priceVnd)}
                      </Text>
                      {!disabled && (
                        <View className="flex-row items-center gap-0.5 mt-0.5">
                          <Text
                            variant="caption"
                            style={{
                              color: semantic.action.primaryDeep,
                              fontFamily: 'BeVietnamPro_600SemiBold',
                            }}
                          >
                            Booking
                          </Text>
                          <ArrowUpRight size={11} color={semantic.action.primaryDeep} strokeWidth={2.4} />
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-border-light flex-row gap-3 px-4 pt-3"
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }}
      >
        <View className="flex-1">
          <Text variant="caption" className="text-text-tertiary">
            Hoa hồng / căn
          </Text>
          <Text
            variant="body-lg"
            style={{ color: semantic.action.primaryDeep, fontFamily: 'BeVietnamPro_700Bold' }}
          >
            {formatVNDCompact(commissionAvg)}
          </Text>
        </View>
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/(app)/booking',
              params: { projectId: project.id, unitId: unit.id },
            })
          }
          className="h-12 px-5 rounded-xl items-center justify-center flex-row gap-1.5"
          style={{
            backgroundColor: semantic.action.primary,
            shadowColor: semantic.action.primaryDeep,
            shadowOpacity: 0.25,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        >
          <Wallet size={18} color={palette.white} strokeWidth={2.4} />
          <Text variant="button" style={{ color: palette.white }}>
            Booking căn này
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function SpecCell({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: 'sienna' | 'emerald' | 'blue' | 'violet' | 'slate';
}) {
  const tintMap = {
    sienna: { bg: palette.sienna[50], fg: palette.sienna[700], border: palette.sienna[100] },
    emerald: { bg: palette.emerald[50], fg: palette.emerald[700], border: palette.emerald[100] },
    blue: { bg: palette.blue[50], fg: palette.blue[700], border: palette.blue[50] },
    violet: { bg: palette.violet[50], fg: palette.violet[700], border: palette.violet[100] },
    slate: { bg: palette.slate[100], fg: palette.slate[700], border: palette.slate[200] },
  } as const;
  const t = tintMap[tint];
  return (
    <View style={{ width: '50%', paddingHorizontal: 4, marginBottom: 8 }}>
      <View
        className="p-3 rounded-xl flex-row items-center gap-2"
        style={{ backgroundColor: t.bg, borderWidth: 1, borderColor: t.border, minHeight: 56 }}
      >
        <View
          className="w-8 h-8 rounded-lg items-center justify-center"
          style={{ backgroundColor: palette.white }}
        >
          {icon}
        </View>
        <View className="flex-1">
          <Text
            variant="badge"
            style={{ color: t.fg, opacity: 0.85 }}
          >
            {label}
          </Text>
          <Text
            variant="caption"
            style={{
              color: semantic.text.primary,
              fontFamily: 'BeVietnamPro_700Bold',
              marginTop: 1,
            }}
            numberOfLines={2}
          >
            {value}
          </Text>
        </View>
      </View>
    </View>
  );
}
