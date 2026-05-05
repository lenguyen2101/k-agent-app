import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { cdnImage, IMG_SIZE } from '@/lib/img';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bath,
  Bed,
  Building2,
  Calendar,
  Check,
  Images as ImagesIcon,
  Layers,
  Ruler,
  Share2,
} from 'lucide-react-native';
import { SectionTitle } from '@/components/SectionTitle';
import { Text } from '@/components/ui/Text';
import { primaryProjects } from '@/mock/primaryProjects';
import { formatPricePerM2 } from '@/lib/format';
import { palette, semantic } from '@/theme';
import {
  towerStatusLabels,
  type TowerStatus,
  type UnitType,
} from '@/types/primaryProject';

const SECTION_DIVIDER = 32;

const towerStatusBadge: Record<TowerStatus, { bg: string; fg: string }> = {
  CONSTRUCTING: { bg: palette.sienna[50], fg: palette.sienna[700] },
  FINISHED: { bg: palette.emerald[50], fg: palette.emerald[700] },
  PLANNED: { bg: palette.slate[100], fg: palette.slate[700] },
};

export default function TowerDetail() {
  const { projectId, towerId } = useLocalSearchParams<{ projectId: string; towerId: string }>();
  const insets = useSafeAreaInsets();

  const project = useMemo(() => primaryProjects.find((p) => p.id === projectId), [projectId]);
  const tower = useMemo(
    () => project?.towers.find((t) => t.id === towerId),
    [project, towerId]
  );
  const towerUnits = useMemo<UnitType[]>(() => {
    if (!project || !tower) return [];
    const ids = tower.unitTypeIds;
    if (!ids || ids.length === 0) return project.unitTypes;
    return project.unitTypes.filter((u) => ids.includes(u.id));
  }, [project, tower]);

  if (!project || !tower) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Text variant="body" className="text-text-secondary">
          Không tìm thấy toà
        </Text>
      </View>
    );
  }

  const badge = towerStatusBadge[tower.status];
  const priceText =
    tower.pricePerM2Min && tower.pricePerM2Max
      ? `${formatPricePerM2(tower.pricePerM2Min).replace('~', '')} - ${formatPricePerM2(tower.pricePerM2Max).replace('~', '')}`
      : 'Giá đang cập nhật';

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
            Chi tiết toà
          </Text>
        </View>
        <Pressable className="w-10 h-10 items-center justify-center" hitSlop={8}>
          <Share2 size={20} color={semantic.text.secondary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero image */}
        <View style={{ aspectRatio: 16 / 10, position: 'relative' }}>
          <Image
            source={{ uri: cdnImage(tower.thumbnail, IMG_SIZE.fullWidth) }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          <View
            className="absolute top-3 right-3 flex-row items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ backgroundColor: badge.bg }}
          >
            <Text variant="badge" style={{ color: badge.fg }}>
              {towerStatusLabels[tower.status]}
            </Text>
          </View>
        </View>

        {/* Metadata */}
        <View className="bg-white px-4 pt-4 pb-5">
          <Text
            variant="badge"
            style={{
              color: semantic.text.tertiary,
              fontFamily: 'BeVietnamPro_500Medium',
            }}
          >
            {project.shortName}
          </Text>
          <Text
            variant="h2"
            style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold', marginTop: 4 }}
          >
            {tower.name}
          </Text>
          <Text
            variant="h3"
            style={{
              color: palette.emerald[700],
              marginTop: 8,
            }}
          >
            {priceText}
          </Text>

          {/* Quick stats row */}
          <View className="flex-row gap-2 mt-4">
            <StatPill icon={<Layers size={14} color={palette.sienna[700]} strokeWidth={2.2} />} label="Tầng" value={`${tower.floors}`} tint="sienna" />
            <StatPill icon={<Building2 size={14} color={palette.emerald[700]} strokeWidth={2.2} />} label="Căn" value={tower.units.toLocaleString('vi-VN')} tint="emerald" />
            {tower.unitsPerFloor && (
              <StatPill icon={<Ruler size={14} color={palette.blue[700]} strokeWidth={2.2} />} label="Căn/tầng" value={`${tower.unitsPerFloor}`} tint="blue" />
            )}
          </View>

          {tower.handoverDate && (
            <View className="flex-row items-center gap-1.5 mt-3">
              <Calendar size={14} color={semantic.text.tertiary} />
              <Text variant="body" style={{ color: semantic.text.secondary }}>
                Bàn giao {tower.handoverDate}
              </Text>
            </View>
          )}
        </View>

        {/* Progress section (only CONSTRUCTING) */}
        {tower.progressPct !== undefined && (
          <View
            className="bg-surface px-4 py-5"
            style={{ borderTopWidth: SECTION_DIVIDER, borderTopColor: palette.white }}
          >
            <SectionTitle title="Tiến độ thi công" />
            <View
              className="mt-4 p-5 rounded-2xl"
              style={{ backgroundColor: semantic.action.primarySoft }}
            >
              <View className="flex-row items-baseline justify-between mb-3">
                <Text
                  variant="badge"
                  style={{ color: semantic.action.primaryDeep }}
                >
                  Tiến độ hiện tại
                </Text>
                <Text
                  variant="h1"
                  style={{ color: semantic.action.primaryDeep }}
                >
                  {tower.progressPct}%
                </Text>
              </View>

              <View
                style={{
                  height: 10,
                  backgroundColor: palette.white,
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${tower.progressPct}%`,
                    height: '100%',
                    backgroundColor: semantic.action.primary,
                    borderRadius: 999,
                  }}
                />
              </View>
            </View>
          </View>
        )}

        {/* Milestones timeline */}
        {tower.progressMilestones && tower.progressMilestones.length > 0 && (
          <View
            className="bg-surface px-4 py-5"
            style={
              tower.progressPct === undefined
                ? { borderTopWidth: SECTION_DIVIDER, borderTopColor: palette.white }
                : undefined
            }
          >
            <SectionTitle title="Cột mốc dự án" />
            <View className="mt-4">
              {tower.progressMilestones.map((m, i) => {
                const isLast = i === tower.progressMilestones!.length - 1;
                return (
                  <View key={i} className="flex-row" style={{ minHeight: 54 }}>
                    {/* Timeline rail */}
                    <View className="items-center" style={{ width: 28 }}>
                      <View
                        className="w-6 h-6 rounded-full items-center justify-center"
                        style={{
                          backgroundColor: m.done ? semantic.action.primary : palette.white,
                          borderWidth: m.done ? 0 : 2,
                          borderColor: semantic.border.default,
                        }}
                      >
                        {m.done && <Check size={14} color={palette.white} strokeWidth={3} />}
                      </View>
                      {!isLast && (
                        <View
                          style={{
                            flex: 1,
                            width: 2,
                            backgroundColor: m.done ? semantic.action.primary : semantic.border.light,
                            marginTop: 2,
                            marginBottom: 2,
                          }}
                        />
                      )}
                    </View>
                    <View className="flex-1 ml-3" style={{ paddingBottom: isLast ? 0 : 14 }}>
                      <Text
                        variant="body"
                        style={{
                          color: m.done ? semantic.text.primary : semantic.text.secondary,
                          fontFamily: m.done ? 'BeVietnamPro_700Bold' : 'BeVietnamPro_500Medium',
                        }}
                      >
                        {m.label}
                      </Text>
                      <Text
                        variant="caption"
                        style={{
                          color: m.done ? semantic.action.primaryDeep : semantic.text.tertiary,
                          marginTop: 2,
                          fontFamily: 'BeVietnamPro_500Medium',
                        }}
                      >
                        {m.date}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Description */}
        {tower.description && (
          <View
            className="bg-surface px-4 py-5"
            style={{ borderTopWidth: SECTION_DIVIDER, borderTopColor: palette.white }}
          >
            <SectionTitle title="Giới thiệu toà" />
            <View
              className="mt-3 p-4 rounded-2xl"
              style={{ backgroundColor: semantic.action.primarySoft }}
            >
              <Text
                variant="body"
                style={{ color: semantic.text.primary, lineHeight: 22 }}
              >
                {tower.description}
              </Text>
            </View>
          </View>
        )}

        {/* Gallery */}
        {tower.gallery && tower.gallery.length > 0 && (
          <View
            className="bg-surface px-4 py-5"
            style={{ borderTopWidth: SECTION_DIVIDER, borderTopColor: palette.white }}
          >
            <SectionTitle title={`Hình ảnh (${tower.gallery.length})`} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingTop: 12, paddingRight: 4 }}
            >
              {tower.gallery.map((img, i) => (
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

        {/* Unit types in this tower */}
        {towerUnits.length > 0 && (
          <View
            className="bg-surface px-4 py-5"
            style={{ borderTopWidth: SECTION_DIVIDER, borderTopColor: palette.white }}
          >
            <SectionTitle
              title={`Loại căn trong toà (${towerUnits.length})`}
              subtitle="Chọn loại căn để xem chi tiết floorplan và giá"
            />
            <View className="mt-3 gap-3">
              {towerUnits.map((u) => (
                <Pressable
                  key={u.id}
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/listings/primary/[projectId]/unit/[unitId]',
                      params: { projectId: project.id, unitId: u.id },
                    })
                  }
                  className="flex-row items-center gap-3 p-3 rounded-2xl"
                  style={{
                    backgroundColor: palette.white,
                    borderWidth: 1,
                    borderColor: semantic.border.light,
                  }}
                >
                  <Image
                    source={{ uri: cdnImage(u.floorplanImage, IMG_SIZE.thumb) }}
                    style={{ width: 84, height: 84, borderRadius: 12 }}
                    contentFit="cover"
                    transition={150}
                    cachePolicy="memory-disk"
                  />
                  <View className="flex-1">
                    <Text
                      variant="body"
                      style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
                    >
                      {u.name} · {u.areaMin}-{u.areaMax}m²
                    </Text>
                    <View className="flex-row items-center gap-3 mt-1">
                      {u.bedrooms > 0 && (
                        <View className="flex-row items-center gap-1">
                          <Bed size={12} color={semantic.text.tertiary} />
                          <Text variant="caption" className="text-text-secondary">
                            {u.bedrooms} PN
                          </Text>
                        </View>
                      )}
                      <View className="flex-row items-center gap-1">
                        <Bath size={12} color={semantic.text.tertiary} />
                        <Text variant="caption" className="text-text-secondary">
                          {u.bathrooms} WC
                        </Text>
                      </View>
                      {u.photoCount > 0 && (
                        <View className="flex-row items-center gap-1">
                          <ImagesIcon size={12} color={semantic.text.tertiary} />
                          <Text variant="caption" className="text-text-secondary">
                            {u.photoCount}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      variant="caption"
                      style={{
                        color: palette.emerald[700],
                        fontFamily: 'BeVietnamPro_700Bold',
                        marginTop: 4,
                      }}
                    >
                      {formatPricePerM2(u.pricePerM2Min).replace('~', '')} -{' '}
                      {formatPricePerM2(u.pricePerM2Max).replace('~', '')}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-border-light flex-row gap-3 px-4 pt-3"
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="flex-1 h-12 rounded-xl items-center justify-center border"
          style={{ borderColor: semantic.border.default, backgroundColor: palette.white }}
        >
          <Text variant="button" style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_600SemiBold' }}>
            Xem toàn dự án
          </Text>
        </Pressable>
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/(app)/booking',
              params: { projectId: project.id, towerId: tower.id },
            })
          }
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
          <Text variant="button" style={{ color: palette.white }}>
            Booking toà này
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function StatPill({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: 'sienna' | 'emerald' | 'blue';
}) {
  const tintMap = {
    sienna: { bg: palette.sienna[50], fg: palette.sienna[700], border: palette.sienna[100] },
    emerald: { bg: palette.emerald[50], fg: palette.emerald[700], border: palette.emerald[100] },
    blue: { bg: palette.blue[50], fg: palette.blue[700], border: palette.blue[50] },
  } as const;
  const t = tintMap[tint];
  return (
    <View
      className="flex-1 px-3 py-2.5 rounded-xl flex-row items-center gap-2"
      style={{ backgroundColor: t.bg, borderWidth: 1, borderColor: t.border }}
    >
      {icon}
      <View className="flex-1">
        <Text
          variant="badge"
          style={{ color: t.fg, opacity: 0.85 }}
        >
          {label}
        </Text>
        <Text
          variant="body"
          style={{
            color: semantic.text.primary,
            fontFamily: 'BeVietnamPro_700Bold',
            marginTop: 1,
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}
