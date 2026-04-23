import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { cdnImage, IMG_SIZE } from '@/lib/img';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bath,
  Bed,
  BedDouble,
  Briefcase,
  Building2,
  CircleDot,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Images as ImagesIcon,
  Layers,
  MapPin,
  PlayCircle,
  Quote,
  Ruler,
  Share2,
  ShoppingBag,
  Sparkles,
  TramFront,
  Trees,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react-native';
import { AmenitySection } from '@/components/AmenitySection';
import { Text } from '@/components/ui/Text';
import { primaryProjects } from '@/mock/primaryProjects';
import { formatVNDCompact, formatPricePerM2 } from '@/lib/format';
import { palette, semantic } from '@/theme';
import {
  primaryStatusLabels,
  towerStatusLabels,
  type AmenityCategoryIcon,
  type DescriptionBlock,
  type OverviewHighlight,
  type MediaItem,
  type PrimaryProject,
  type PrimaryProjectStatus,
  type Tower,
  type TowerStatus,
  type UnitType,
} from '@/types/primaryProject';

const HIGHLIGHT_ICON: Record<AmenityCategoryIcon, LucideIcon> = {
  entertainment: Gamepad2,
  wellness: Dumbbell,
  school: GraduationCap,
  healthcare: HeartPulse,
  shopping: ShoppingBag,
  transport: TramFront,
  nature: Trees,
  dining: UtensilsCrossed,
  business: Briefcase,
  lifestyle: Sparkles,
};

// Mỗi icon → soft color theme (bg + icon fg) để 4 highlight card không đơn điệu.
const HIGHLIGHT_TINT: Record<AmenityCategoryIcon, { bg: string; fg: string; border: string }> = {
  entertainment: { bg: palette.sienna[50],  fg: palette.sienna[700],  border: palette.sienna[100] },
  wellness:      { bg: palette.emerald[50], fg: palette.emerald[700], border: palette.emerald[100] },
  school:        { bg: palette.blue[50],    fg: palette.blue[700],    border: palette.blue[50] },
  healthcare:    { bg: palette.red[50],     fg: palette.red[600],     border: palette.red[100] },
  shopping:      { bg: palette.violet[50],  fg: palette.violet[700],  border: palette.violet[100] },
  transport:     { bg: palette.sky[50],     fg: palette.sky[600],     border: palette.sky[50] },
  nature:        { bg: palette.emerald[50], fg: palette.emerald[700], border: palette.emerald[100] },
  dining:        { bg: palette.sienna[50],  fg: palette.sienna[700],  border: palette.sienna[100] },
  business:      { bg: palette.slate[100],  fg: palette.slate[700],   border: palette.slate[200] },
  lifestyle:     { bg: palette.sienna[50],  fg: palette.sienna[700],  border: palette.sienna[100] },
};

// Section spacing = 32px (user yêu cầu) — divider surface.alt giữa các section
const SECTION_DIVIDER = 32;

const { width: SCREEN_W } = Dimensions.get('window');

type TabKey = 'overview' | 'towers' | 'units' | 'interior' | 'exterior';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Tổng quan dự án' },
  { key: 'towers', label: 'Danh sách tòa' },
  { key: 'units', label: 'Danh sách căn' },
  { key: 'interior', label: 'Tiện ích nội khu' },
  { key: 'exterior', label: 'Tiện ích ngoại khu' },
];

const TAB_ORDER: TabKey[] = ['overview', 'towers', 'units', 'interior', 'exterior'];

// Chiều cao tab bar sticky (padding + text) — dùng để offset khi scrollTo section
// và để detect active section trong onScroll.
const STICKY_TAB_HEIGHT = 48;

const statusBadge: Record<PrimaryProjectStatus, { bg: string; fg: string }> = {
  SELLING:     { bg: palette.emerald[50], fg: palette.emerald[700] },
  UPCOMING:    { bg: palette.sienna[50],  fg: palette.sienna[700] },
  HANDED_OVER: { bg: palette.blue[50],    fg: palette.blue[700] },
  SOLD_OUT:    { bg: palette.slate[200],  fg: palette.slate[700] },
};

const towerStatusBadge: Record<TowerStatus, { bg: string; fg: string }> = {
  CONSTRUCTING: { bg: palette.sienna[50],  fg: palette.sienna[700] },
  FINISHED:     { bg: palette.emerald[50], fg: palette.emerald[700] },
  PLANNED:      { bg: palette.slate[100],  fg: palette.slate[700] },
};

export default function PrimaryProjectDetail() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const insets = useSafeAreaInsets();
  const project = useMemo(() => primaryProjects.find((p) => p.id === projectId), [projectId]);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [galleryIndex, setGalleryIndex] = useState(0);

  const scrollRef = useRef<ScrollView>(null);
  const tabBarRef = useRef<ScrollView>(null);
  const sectionYsRef = useRef<Record<TabKey, number>>({
    overview: 0,
    towers: 0,
    units: 0,
    interior: 0,
    exterior: 0,
  });
  const tabLayoutsRef = useRef<Record<TabKey, { x: number; width: number }>>({
    overview: { x: 0, width: 0 },
    towers: { x: 0, width: 0 },
    units: { x: 0, width: 0 },
    interior: { x: 0, width: 0 },
    exterior: { x: 0, width: 0 },
  });
  // Flag để onScroll không override active tab trong khi animation scroll đang chạy
  const programmaticScrollRef = useRef(false);

  // Auto-scroll horizontal tab bar để active tab luôn visible (center nếu có thể)
  useEffect(() => {
    const layout = tabLayoutsRef.current[activeTab];
    if (!layout || layout.width === 0 || !tabBarRef.current) return;
    const target = Math.max(0, layout.x - (SCREEN_W - layout.width) / 2);
    tabBarRef.current.scrollTo({ x: target, animated: true });
  }, [activeTab]);

  if (!project) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Text variant="body" className="text-text-secondary">Không tìm thấy dự án</Text>
      </View>
    );
  }

  const status = statusBadge[project.status];
  const priceRange = `${formatVNDCompact(project.priceMinVnd)} - ${formatVNDCompact(project.priceMaxVnd)}`;
  const pricePerM2 = `${formatPricePerM2(project.pricePerM2Min).replace('~', '')} - ${formatPricePerM2(project.pricePerM2Max).replace('~', '')}`;

  const registerSection = (key: TabKey) => (e: LayoutChangeEvent) => {
    sectionYsRef.current[key] = e.nativeEvent.layout.y;
  };

  const scrollToSection = (key: TabKey) => {
    setActiveTab(key);
    const y = sectionYsRef.current[key];
    programmaticScrollRef.current = true;
    scrollRef.current?.scrollTo({
      y: Math.max(0, y - STICKY_TAB_HEIGHT),
      animated: true,
    });
    // Reset flag sau khi animation kết thúc (~400ms default)
    setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 500);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (programmaticScrollRef.current) return;
    // Scroll position + offset (stickyTab + breathing) để detect "section đang view"
    const probeY = e.nativeEvent.contentOffset.y + STICKY_TAB_HEIGHT + 24;
    let current: TabKey = 'overview';
    for (const k of TAB_ORDER) {
      if (probeY >= sectionYsRef.current[k]) current = k;
    }
    if (current !== activeTab) setActiveTab(current);
  };

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
        <View className="w-10" />
        <View className="flex-1 items-center">
          <Text
            variant="h3"
            style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
          >
            Chi tiết dự án
          </Text>
        </View>
        <Pressable className="w-10 h-10 items-center justify-center" hitSlop={8}>
          <Share2 size={20} color={semantic.text.secondary} />
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        stickyHeaderIndices={[2]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Index 0: Hero media carousel — image + youtube video thumbnail */}
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/(modal)/project-gallery',
              params: { projectId: project.id, startIndex: String(galleryIndex) },
            })
          }
        >
          <FlatList
            data={project.media}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(m, i) => `${m.url}-${i}`}
            onMomentumScrollEnd={(e) => {
              const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
              setGalleryIndex(i);
            }}
            renderItem={({ item }) => <HeroMediaFrame media={item} />}
          />
          <View
            className="absolute bottom-3 right-3 flex-row items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(10,9,8,0.62)' }}
          >
            <ImagesIcon size={12} color={palette.white} strokeWidth={2.2} />
            <Text
              variant="caption"
              style={{ color: palette.white, fontFamily: 'BeVietnamPro_600SemiBold' }}
            >
              {galleryIndex + 1}/{project.media.length}
            </Text>
          </View>
          {project.media.some((m) => m.type === 'youtube') && (
            <View
              className="absolute top-3 left-3 flex-row items-center gap-1 px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(10,9,8,0.62)' }}
            >
              <PlayCircle size={12} color={palette.white} strokeWidth={2.2} />
              <Text
                variant="caption"
                style={{ color: palette.white, fontFamily: 'BeVietnamPro_600SemiBold' }}
              >
                Có video
              </Text>
            </View>
          )}
        </Pressable>

        {/* Index 1: Metadata block */}
        <View className="bg-white px-4 pt-4 pb-5">
          <View className="flex-row gap-2 mb-2">
            <View
              className="px-2.5 py-1 rounded-full"
              style={{ backgroundColor: semantic.action.primaryDeep }}
            >
              <Text variant="badge" style={{ color: palette.white }}>
                Sơ cấp
              </Text>
            </View>
            <View
              className="px-2.5 py-1 rounded-full"
              style={{ backgroundColor: status.bg }}
            >
              <Text variant="badge" style={{ color: status.fg }}>
                {primaryStatusLabels[project.status]}
              </Text>
            </View>
          </View>

          <Text
            variant="h2"
            style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
          >
            {project.name}
          </Text>

          <View className="flex-row items-center gap-1.5 mt-2">
            <MapPin size={14} color={semantic.text.tertiary} />
            <Text variant="body" style={{ color: semantic.text.secondary, flex: 1 }}>
              {project.addressFull}
            </Text>
          </View>

          <View className="mt-3">
            <Text
              variant="h1"
              style={{ color: palette.emerald[700] }}
            >
              {priceRange}
            </Text>
            <Text
              variant="caption"
              style={{
                color: palette.emerald[600],
                fontFamily: 'BeVietnamPro_500Medium',
                marginTop: 2,
              }}
            >
              {pricePerM2}
            </Text>
          </View>
        </View>

        {/* Index 2: STICKY tab bar — click để scroll tới section, auto highlight khi scroll */}
        <View
          className="bg-white border-b border-border-light"
          style={{ borderTopWidth: 1, borderTopColor: semantic.border.light }}
        >
          <ScrollView
            ref={tabBarRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 4 }}
          >
            {TABS.map((t) => {
              const active = activeTab === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => scrollToSection(t.key)}
                  onLayout={(e) => {
                    tabLayoutsRef.current[t.key] = {
                      x: e.nativeEvent.layout.x,
                      width: e.nativeEvent.layout.width,
                    };
                  }}
                  className="px-3 py-3"
                  style={{
                    borderBottomWidth: 2,
                    borderBottomColor: active ? semantic.action.primary : 'transparent',
                  }}
                >
                  <Text
                    variant="subtitle"
                    style={{
                      color: active ? semantic.action.primaryDeep : semantic.text.secondary,
                      fontFamily: 'BeVietnamPro_700Bold',
                    }}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Index 3+: All sections stacked, onLayout register Y */}
        <View onLayout={registerSection('overview')} className="bg-surface">
          <OverviewSection project={project} />
        </View>
        <View onLayout={registerSection('towers')} className="bg-surface">
          <TowersSection project={project} />
        </View>
        <View onLayout={registerSection('units')} className="bg-surface">
          <UnitsSection project={project} />
        </View>
        <View
          onLayout={registerSection('interior')}
          className="bg-surface"
          style={{ borderTopWidth: SECTION_DIVIDER, borderTopColor: palette.white }}
        >
          <AmenitySection
            data={project.interiorAmenities}
            title="Tiện ích nội khu"
            subtitle="Không gian sống dành riêng cho cư dân"
          />
        </View>
        <View
          onLayout={registerSection('exterior')}
          className="bg-surface"
          style={{ borderTopWidth: SECTION_DIVIDER, borderTopColor: palette.white }}
        >
          <AmenitySection
            data={project.exteriorAmenities}
            title="Tiện ích ngoại khu"
            subtitle="Kết nối giao thông & dịch vụ khu vực"
          />
        </View>
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-border-light flex-row gap-3 px-4 pt-3"
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }}
      >
        <Pressable
          className="flex-1 h-12 rounded-xl items-center justify-center border"
          style={{ borderColor: semantic.border.default, backgroundColor: palette.white }}
        >
          <Text variant="button" style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_600SemiBold' }}>
            Liên hệ CĐT
          </Text>
        </Pressable>
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/(app)/booking',
              params: { projectId: project.id },
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
            Booking giữ chỗ
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// --- Sections ---

function OverviewSection({ project }: { project: PrimaryProject }) {
  return (
    <View className="px-4 py-5">
      <SectionTitle title="Tổng quan dự án" />

      {/* 4 highlight cards 2x2 grid — 4 tone soft khác nhau */}
      {project.highlights.length > 0 && (
        <View className="flex-row flex-wrap mt-4" style={{ marginHorizontal: -4 }}>
          {project.highlights.map((h) => (
            <View key={h.label} style={{ width: '50%', paddingHorizontal: 4, marginBottom: 8 }}>
              <HighlightCard highlight={h} />
            </View>
          ))}
        </View>
      )}

      {/* Info table */}
      <View
        className="rounded-2xl"
        style={{
          marginTop: 32,
          backgroundColor: palette.white,
          borderWidth: 1,
          borderColor: semantic.border.light,
          overflow: 'hidden',
        }}
      >
        <InfoRow label="Tên dự án" value={project.name} />
        <InfoRow label="Chủ đầu tư" value={project.developer} />
        <InfoRow label="Đơn vị phát triển" value={project.builder} />
        <InfoRow label="Quy mô" value={`${project.scaleUnits.toLocaleString('vi-VN')} căn hộ`} />
        <InfoRow label="Hình thức sở hữu" value={project.ownership} />
        <InfoRow label="Tổng diện tích" value={`${project.totalAreaM2.toLocaleString('vi-VN')} m²`} />
        <InfoRow
          label="Tiến độ"
          value={project.progressNote ?? 'Đang cập nhật'}
          valueTone={project.progressNote ? 'primary' : 'tertiary'}
        />
        <InfoRow label="Thời điểm khởi công" value={project.startDate} />
        <InfoRow label="Thời gian bàn giao" value={project.handoverDate} last />
      </View>

      {/* Description rich card — wrapper cam nhạt, không border-left, render blocks */}
      <View
        className="mt-5 p-5 rounded-2xl"
        style={{ backgroundColor: semantic.action.primarySoft }}
      >
        <Text
          variant="badge"
          style={{
            color: semantic.action.primaryDeep,
            marginBottom: 14,
          }}
        >
          Về dự án
        </Text>
        <DescriptionBlocks blocks={project.descriptionBlocks} />
      </View>
    </View>
  );
}

function DescriptionBlocks({ blocks }: { blocks: DescriptionBlock[] }) {
  return (
    <View style={{ gap: 14 }}>
      {blocks.map((b, i) => {
        if (b.type === 'heading') {
          return (
            <Text
              key={i}
              variant="h3"
              style={{
                color: semantic.action.primaryDeep,
                marginTop: i === 0 ? 0 : 8,
              }}
            >
              {b.text}
            </Text>
          );
        }
        if (b.type === 'paragraph') {
          return (
            <Text
              key={i}
              variant="body"
              style={{ color: semantic.text.primary, lineHeight: 22 }}
            >
              {b.text}
            </Text>
          );
        }
        if (b.type === 'quote') {
          return (
            <View
              key={i}
              className="p-3 rounded-xl"
              style={{ backgroundColor: palette.white, borderWidth: 1, borderColor: palette.sienna[100] }}
            >
              <Quote size={16} color={semantic.action.primary} strokeWidth={2.2} />
              <Text
                variant="subtitle"
                style={{
                  color: semantic.action.primaryDeep,
                  fontFamily: 'BeVietnamPro_600SemiBold',
                  marginTop: 6,
                  fontStyle: 'italic',
                }}
              >
                {b.text}
              </Text>
              {b.author && (
                <Text
                  variant="caption"
                  style={{
                    color: semantic.text.tertiary,
                    marginTop: 6,
                    fontFamily: 'BeVietnamPro_500Medium',
                  }}
                >
                  — {b.author}
                </Text>
              )}
            </View>
          );
        }
        if (b.type === 'list') {
          return (
            <View key={i} style={{ gap: 8 }}>
              {b.items.map((it, j) => (
                <View key={j} className="flex-row items-start gap-2">
                  <CircleDot
                    size={14}
                    color={semantic.action.primary}
                    strokeWidth={2.4}
                    style={{ marginTop: 3 }}
                  />
                  <Text
                    variant="body"
                    style={{ color: semantic.text.primary, flex: 1, lineHeight: 22 }}
                  >
                    {it}
                  </Text>
                </View>
              ))}
            </View>
          );
        }
        return null;
      })}
    </View>
  );
}

function HighlightCard({ highlight }: { highlight: OverviewHighlight }) {
  const Icon = HIGHLIGHT_ICON[highlight.icon];
  const tint = HIGHLIGHT_TINT[highlight.icon];
  return (
    <View
      className="p-3 rounded-2xl"
      style={{
        backgroundColor: tint.bg,
        borderWidth: 1,
        borderColor: tint.border,
        minHeight: 100,
      }}
    >
      <View
        className="w-8 h-8 rounded-xl items-center justify-center mb-2"
        style={{ backgroundColor: palette.white }}
      >
        <Icon size={16} color={tint.fg} strokeWidth={2.4} />
      </View>
      <Text
        variant="badge"
        style={{ color: tint.fg, opacity: 0.85 }}
      >
        {highlight.label}
      </Text>
      <Text
        variant="caption"
        style={{
          color: semantic.text.primary,
          fontFamily: 'BeVietnamPro_700Bold',
          marginTop: 2,
        }}
        numberOfLines={3}
      >
        {highlight.value}
      </Text>
    </View>
  );
}

function TowersSection({ project }: { project: PrimaryProject }) {
  return (
    <View className="px-4 py-5" style={{ borderTopWidth: SECTION_DIVIDER, borderTopColor: palette.white }}>
      <SectionTitle title={`Danh sách toà (${project.towers.length})`} />
      <View className="mt-3 gap-3">
        {project.towers.map((t) => (
          <TowerRow key={t.id} tower={t} projectId={project.id} />
        ))}
      </View>
    </View>
  );
}

function TowerRow({ tower, projectId }: { tower: Tower; projectId: string }) {
  const badge = towerStatusBadge[tower.status];
  const priceText =
    tower.pricePerM2Min && tower.pricePerM2Max
      ? `${formatPricePerM2(tower.pricePerM2Min).replace('~', '')} - ${formatPricePerM2(tower.pricePerM2Max).replace('~', '')}`
      : 'Giá đang cập nhật';
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/(app)/listings/primary/[projectId]/tower/[towerId]',
          params: { projectId, towerId: tower.id },
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
        source={{ uri: cdnImage(tower.thumbnail, IMG_SIZE.rowThumb) }}
        style={{ width: 72, height: 72, borderRadius: 12 }}
        contentFit="cover"
        transition={150}
        cachePolicy="memory-disk"
      />
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text
            variant="body"
            style={{
              color: semantic.text.primary,
              fontFamily: 'BeVietnamPro_700Bold',
              flex: 1,
            }}
            numberOfLines={1}
          >
            {tower.name}
          </Text>
          <View
            className="px-2 py-0.5 rounded-full"
            style={{ backgroundColor: badge.bg }}
          >
            <Text variant="badge" style={{ color: badge.fg }}>
              {towerStatusLabels[tower.status]}
            </Text>
          </View>
        </View>
        <Text variant="caption" className="text-text-secondary mt-1">
          {priceText}
        </Text>
        <View className="flex-row items-center gap-3 mt-1.5">
          <View className="flex-row items-center gap-1">
            <Layers size={12} color={semantic.text.tertiary} />
            <Text variant="caption" className="text-text-secondary">
              {tower.floors} tầng
            </Text>
          </View>
          <Text variant="caption" className="text-text-tertiary">·</Text>
          <View className="flex-row items-center gap-1">
            <Building2 size={12} color={semantic.text.tertiary} />
            <Text variant="caption" className="text-text-secondary">
              {tower.units.toLocaleString('vi-VN')} căn
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function UnitsSection({ project }: { project: PrimaryProject }) {
  const [filter, setFilter] = useState<string>('all');
  const filters = useMemo(() => {
    const names = Array.from(new Set(project.unitTypes.map((u) => u.name)));
    return [{ key: 'all', label: 'Tất cả' }, ...names.map((n) => ({ key: n, label: n }))];
  }, [project.unitTypes]);

  const shown = useMemo(() => {
    if (filter === 'all') return project.unitTypes;
    return project.unitTypes.filter((u) => u.name === filter);
  }, [filter, project.unitTypes]);

  return (
    <View className="px-4 py-5" style={{ borderTopWidth: SECTION_DIVIDER, borderTopColor: palette.white }}>
      <SectionTitle title={`Danh sách căn (${project.unitTypes.length})`} />
      <View className="flex-row flex-wrap gap-2 mt-3 mb-3">
        {filters.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              className="px-3.5 h-9 rounded-full items-center justify-center border"
              style={{
                backgroundColor: active ? semantic.action.primarySoft : palette.white,
                borderColor: active ? semantic.action.primary : semantic.border.default,
              }}
            >
              <Text
                variant="caption"
                style={{
                  color: active ? semantic.action.primaryDeep : semantic.text.secondary,
                  fontFamily: 'BeVietnamPro_700Bold',
                }}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View className="gap-3">
        {shown.map((u) => (
          <UnitTypeCard key={u.id} unit={u} projectId={project.id} />
        ))}
      </View>
    </View>
  );
}

function UnitTypeCard({ unit, projectId }: { unit: UnitType; projectId: string }) {
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/(app)/listings/primary/[projectId]/unit/[unitId]',
          params: { projectId, unitId: unit.id },
        })
      }
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: palette.white,
        borderWidth: 1,
        borderColor: semantic.border.light,
      }}
    >
      <View style={{ position: 'relative', aspectRatio: 16 / 9 }}>
        <Image
          source={{ uri: cdnImage(unit.floorplanImage, IMG_SIZE.card) }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={150}
          cachePolicy="memory-disk"
        />
        <View
          className="absolute bottom-3 right-3 flex-row items-center gap-1 px-2 py-1 rounded-full"
          style={{ backgroundColor: 'rgba(10,9,8,0.62)' }}
        >
          <ImagesIcon size={11} color={palette.white} strokeWidth={2.2} />
          <Text
            variant="caption"
            style={{ color: palette.white, fontFamily: 'BeVietnamPro_500Medium' }}
          >
            {unit.photoCount}
          </Text>
        </View>
      </View>
      <View className="px-4 py-3">
        <Text
          variant="body-lg"
          style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
        >
          {unit.name} ({unit.areaMin === unit.areaMax ? `${unit.areaMin}m²` : `${unit.areaMin} - ${unit.areaMax}m²`})
        </Text>
        <View className="flex-row items-center gap-3 mt-1.5">
          {unit.bedrooms > 0 && (
            <View className="flex-row items-center gap-1">
              <Bed size={12} color={semantic.text.tertiary} />
              <Text variant="caption" className="text-text-secondary">
                {unit.bedrooms} PN
              </Text>
            </View>
          )}
          <View className="flex-row items-center gap-1">
            <Bath size={12} color={semantic.text.tertiary} />
            <Text variant="caption" className="text-text-secondary">
              {unit.bathrooms} WC
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ruler size={12} color={semantic.text.tertiary} />
            <Text variant="caption" className="text-text-secondary">
              {unit.areaMin}-{unit.areaMax}m²
            </Text>
          </View>
        </View>
        <Text
          variant="body"
          style={{
            color: palette.emerald[700],
            fontFamily: 'BeVietnamPro_700Bold',
            marginTop: 6,
          }}
        >
          {formatPricePerM2(unit.pricePerM2Min).replace('~', '')} - {formatPricePerM2(unit.pricePerM2Max).replace('~', '')}
        </Text>
        <View className="flex-row items-center gap-1.5 mt-1.5">
          <BedDouble size={12} color={semantic.text.tertiary} />
          <Text variant="caption" className="text-text-secondary" numberOfLines={1}>
            {unit.towerName} · {unit.floorRange}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// --- Helpers ---

// Hero media frame — image hoặc youtube thumbnail với play overlay
function HeroMediaFrame({ media }: { media: MediaItem }) {
  if (media.type === 'image') {
    return (
      <Image
        source={{ uri: cdnImage(media.url, SCREEN_W) }}
        style={{ width: SCREEN_W, aspectRatio: 16 / 10 }}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
    );
  }
  return (
    <View style={{ width: SCREEN_W, aspectRatio: 16 / 10, position: 'relative' }}>
      <Image
        source={{ uri: cdnImage(media.thumbnail, SCREEN_W) }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.25)',
        }}
      >
        <View
          className="w-16 h-16 rounded-full items-center justify-center"
          style={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            shadowColor: palette.obsidian[900],
            shadowOpacity: 0.3,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
          }}
        >
          <PlayCircle size={40} color={semantic.action.primary} strokeWidth={2} fill={palette.white} />
        </View>
      </View>
      {media.title && (
        <View
          className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full"
          style={{ backgroundColor: 'rgba(10,9,8,0.7)' }}
        >
          <Text
            variant="caption"
            style={{ color: palette.white, fontFamily: 'BeVietnamPro_600SemiBold' }}
            numberOfLines={1}
          >
            {media.title}
          </Text>
        </View>
      )}
    </View>
  );
}


function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View>
      <Text
        variant="h3"
        style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          variant="body"
          style={{ color: semantic.text.secondary, marginTop: 4, lineHeight: 20 }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

function InfoRow({
  label,
  value,
  valueTone,
  last,
}: {
  label: string;
  value: string;
  valueTone?: 'primary' | 'tertiary';
  last?: boolean;
}) {
  return (
    <View
      className="flex-row items-start px-4"
      style={{
        paddingVertical: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: semantic.border.light,
      }}
    >
      <Text
        variant="body"
        style={{
          color: semantic.text.secondary,
          width: 140,
          flexShrink: 0,
          marginRight: 16,
        }}
      >
        {label}
      </Text>
      <Text
        variant="body"
        style={{
          color: valueTone === 'tertiary' ? semantic.text.tertiary : semantic.text.primary,
          fontFamily: valueTone === 'tertiary' ? 'BeVietnamPro_400Regular' : 'BeVietnamPro_600SemiBold',
          flex: 1,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
