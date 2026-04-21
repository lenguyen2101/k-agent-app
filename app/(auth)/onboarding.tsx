import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  View,
  type ViewToken,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowRight,
  Building2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { useAppStatus } from '@/store/appStatus';
import { palette, semantic } from '@/theme';

const { width: SCREEN_W } = Dimensions.get('window');

type Slide = {
  key: string;
  icon: LucideIcon;
  iconBg: string;      // soft tint cho chip "highlight"
  iconColor: string;   // dark tone cho icon lớn + chip text
  gradient: readonly [string, string, string];  // gradient outer frame match icon family
  title: string;
  body: string;
  highlight: string;
};

const SLIDES: Slide[] = [
  {
    key: 's1',
    icon: Sparkles,
    iconBg: palette.sienna[50],
    iconColor: palette.sienna[700],
    gradient: [palette.sienna[900], palette.sienna[700], palette.sienna[500]] as const,
    title: 'Lead mới đến tay trong 60 giây',
    body: 'AI phân bổ thông minh kiểu Grab — chỉ 1 sale tiếp 1 lead, không cạnh tranh nội bộ, không mất khách.',
    highlight: 'AI PHÂN BỔ',
  },
  {
    key: 's2',
    icon: Building2,
    iconBg: palette.blue[50],
    iconColor: palette.blue[700],
    gradient: [palette.blue[700], palette.blue[600], palette.blue[600]] as const,
    title: 'Rổ hàng chuẩn "4 Thật"',
    body: 'Nhà thật · Giá thật · Người thật · Ảnh thật. Yên tâm tư vấn khách — data đã được verify.',
    highlight: 'VERIFIED',
  },
  {
    key: 's3',
    icon: TrendingUp,
    iconBg: palette.emerald[50],
    iconColor: palette.emerald[700],
    gradient: [palette.emerald[700], palette.emerald[600], palette.emerald[500]] as const,
    title: 'Thu nhập minh bạch, mạng lưới 4 cấp',
    body: 'Xem tổng hoa hồng, chi tiết từng deal, HHMG mạng lưới F1-F4 — không còn "hoa hồng mập mờ".',
    highlight: 'TRANSPARENT',
  },
];

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const flatRef = useRef<FlatList<Slide>>(null);
  const completeOnboarding = useAppStatus((s) => s.completeOnboarding);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && typeof viewableItems[0].index === 'number') {
        setIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const isLast = index === SLIDES.length - 1;

  const goNext = () => {
    if (isLast) finish();
    else flatRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const finish = () => {
    completeOnboarding();
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Skip */}
      <View
        className="flex-row items-center justify-end px-4"
        style={{ paddingTop: insets.top + 4, paddingBottom: 4 }}
      >
        {!isLast && (
          <Pressable onPress={finish} className="px-3 py-2" hitSlop={6}>
            <Text
              variant="body"
              style={{
                color: semantic.text.secondary,
                fontFamily: 'BeVietnamPro_600SemiBold',
              }}
            >
              Bỏ qua
            </Text>
          </Pressable>
        )}
      </View>

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.key}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => <SlideView slide={item} />}
        getItemLayout={(_, i) => ({ length: SCREEN_W, offset: SCREEN_W * i, index: i })}
      />

      {/* Dots + CTA */}
      <View
        className="px-6"
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 20 }}
      >
        {/* Dots */}
        <View className="flex-row items-center justify-center gap-2 mb-5">
          {SLIDES.map((_, i) => {
            const active = i === index;
            return (
              <View
                key={i}
                style={{
                  width: active ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: active ? semantic.action.primary : semantic.border.default,
                }}
              />
            );
          })}
        </View>

        {/* CTA */}
        <Pressable
          onPress={goNext}
          className="h-14 rounded-2xl flex-row items-center justify-center gap-2"
          style={{
            backgroundColor: semantic.action.primary,
            shadowColor: semantic.action.primaryDeep,
            shadowOpacity: 0.3,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }}
        >
          <Text
            style={{
              color: palette.white,
              fontFamily: 'BeVietnamPro_700Bold',
              fontSize: 16,
              letterSpacing: 0.3,
            }}
          >
            {isLast ? 'Bắt đầu với K-Agent' : 'Tiếp tục'}
          </Text>
          <ArrowRight size={18} color={palette.white} strokeWidth={2.6} />
        </Pressable>

        <Text
          variant="caption"
          className="text-text-tertiary text-center mt-3"
          numberOfLines={1}
        >
          Hành trình sale BĐS của bạn bắt đầu từ đây
        </Text>
      </View>
    </View>
  );
}

function SlideView({ slide }: { slide: Slide }) {
  const Icon = slide.icon;

  return (
    <View style={{ width: SCREEN_W }} className="flex-1 items-center justify-center px-8">
      {/* Icon hero — gradient outer frame match color family của icon */}
      <View className="mb-8">
        <LinearGradient
          colors={[...slide.gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 128,
            height: 128,
            borderRadius: 36,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: slide.iconColor,
            shadowOpacity: 0.3,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 12 },
            elevation: 10,
          }}
        >
          <View
            className="w-20 h-20 rounded-3xl items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
          >
            <Icon size={36} color={slide.iconColor} strokeWidth={2.2} />
          </View>
        </LinearGradient>
      </View>

      {/* Highlight chip */}
      <View
        className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
        style={{ backgroundColor: slide.iconBg }}
      >
        <ShieldCheck size={12} color={slide.iconColor} strokeWidth={2.4} />
        <Text
          variant="caption"
          style={{
            color: slide.iconColor,
            fontFamily: 'BeVietnamPro_700Bold',
            letterSpacing: 0.6,
            fontSize: 11,
          }}
        >
          {slide.highlight}
        </Text>
      </View>

      {/* Title */}
      <Text
        style={{
          color: semantic.text.primary,
          fontFamily: 'BeVietnamPro_700Bold',
          fontSize: 24,
          lineHeight: 32,
          textAlign: 'center',
          marginBottom: 12,
        }}
      >
        {slide.title}
      </Text>

      {/* Body */}
      <Text
        variant="body-lg"
        className="text-text-secondary text-center"
        style={{ lineHeight: 24, maxWidth: 340 }}
      >
        {slide.body}
      </Text>
    </View>
  );
}
