import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { cdnImage, IMG_SIZE } from '@/lib/img';
import {
  Briefcase,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  MapPin,
  Sparkles,
  ShoppingBag,
  TramFront,
  Trees,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { palette, semantic } from '@/theme';
import type {
  AmenityCategory,
  AmenityCategoryIcon,
  AmenityItem,
  AmenityList,
} from '@/types/primaryProject';

const ICON_MAP: Record<AmenityCategoryIcon, LucideIcon> = {
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

// Màu chip icon theo category — subtle tint + đậm icon
const ICON_TINT: Record<AmenityCategoryIcon, { bg: string; fg: string }> = {
  entertainment: { bg: palette.sienna[50],  fg: palette.sienna[700] },
  wellness:      { bg: palette.emerald[50], fg: palette.emerald[700] },
  school:        { bg: palette.blue[50],    fg: palette.blue[700] },
  healthcare:    { bg: palette.red[50],     fg: palette.red[600] },
  shopping:      { bg: palette.violet[50],  fg: palette.violet[700] },
  transport:     { bg: palette.sky[50],     fg: palette.sky[600] },
  nature:        { bg: palette.emerald[50], fg: palette.emerald[700] },
  dining:        { bg: palette.sienna[50],  fg: palette.sienna[700] },
  business:      { bg: palette.slate[100],  fg: palette.slate[700] },
  lifestyle:     { bg: palette.sienna[50],  fg: palette.sienna[700] },
};

type Props = {
  data: AmenityList;
  title: string;
  subtitle: string;
};

export function AmenitySection({ data, title, subtitle }: Props) {
  return (
    <View>
      <HeroBlock
        image={data.heroImage}
        title={title}
        subtitle={subtitle}
        totalCount={data.totalCount}
        categoryCount={data.categories.length}
      />

      <View className="px-4 pt-6 pb-4">
        <View className="gap-6">
          {data.categories.map((cat) => (
            <CategoryBlock key={cat.key} category={cat} />
          ))}
        </View>
      </View>
    </View>
  );
}

function HeroBlock({
  image,
  title,
  subtitle,
  totalCount,
  categoryCount,
}: {
  image: string;
  title: string;
  subtitle: string;
  totalCount: number;
  categoryCount: number;
}) {
  return (
    <View style={{ position: 'relative' }}>
      <Image
        source={{ uri: cdnImage(image, IMG_SIZE.fullWidth) }}
        style={{ width: '100%', aspectRatio: 16 / 9 }}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      <LinearGradient
        colors={['transparent', 'rgba(10,9,8,0.1)', 'rgba(10,9,8,0.82)']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Total count badge top-right */}
      <View
        className="absolute top-4 right-4 flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
      >
        <Sparkles size={13} color={semantic.action.primary} strokeWidth={2.4} />
        <Text
          variant="caption"
          style={{
            color: semantic.action.primaryDeep,
            fontFamily: 'BeVietnamPro_700Bold',
          }}
        >
          {totalCount} tiện ích
        </Text>
      </View>

      <View style={{ position: 'absolute', bottom: 18, left: 18, right: 18 }}>
        <Text
          variant="display"
          style={{ color: palette.white, letterSpacing: 0.2 }}
        >
          {title}
        </Text>
        <Text
          variant="body"
          style={{
            color: 'rgba(255,255,255,0.88)',
            marginTop: 4,
            lineHeight: 20,
          }}
          numberOfLines={2}
        >
          {subtitle} · {categoryCount} nhóm
        </Text>
      </View>
    </View>
  );
}

function CategoryBlock({ category }: { category: AmenityCategory }) {
  const Icon = ICON_MAP[category.icon];
  const tint = ICON_TINT[category.icon];

  return (
    <View>
      {/* Category header */}
      <View className="flex-row items-center gap-2.5 mb-3">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: tint.bg }}
        >
          <Icon size={20} color={tint.fg} strokeWidth={2.2} />
        </View>
        <Text
          variant="h3"
          style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
        >
          {category.label}
        </Text>
        <View
          className="px-2 py-0.5 rounded-full"
          style={{ backgroundColor: semantic.surface.alt }}
        >
          <Text
            variant="caption"
            style={{ color: semantic.text.secondary, fontFamily: 'BeVietnamPro_700Bold' }}
          >
            {category.items.length}
          </Text>
        </View>
      </View>

      {/* Items */}
      <View
        className="gap-2 ml-0"
        style={{
          paddingLeft: 4,
          borderLeftWidth: 2,
          borderLeftColor: tint.bg,
          marginLeft: 19,
        }}
      >
        <View className="gap-3 pl-4">
          {category.items.map((item) => (
            <ItemRow key={item.id} item={item} icon={Icon} tint={tint} />
          ))}
        </View>
      </View>
    </View>
  );
}

function ItemRow({
  item,
  icon: Icon,
  tint,
}: {
  item: AmenityItem;
  icon: LucideIcon;
  tint: { bg: string; fg: string };
}) {
  return (
    <View
      className="flex-row gap-3 p-3 rounded-2xl"
      style={{
        backgroundColor: palette.white,
        borderWidth: 1,
        borderColor: semantic.border.light,
      }}
    >
      {/* Placeholder icon + tint bg phía sau — khi Image fail/slow load, vẫn thấy category icon thay vì trắng kì. */}
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 14,
          backgroundColor: tint.bg,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={32} color={tint.fg} strokeWidth={1.8} />
        </View>
        <Image
          source={{ uri: cdnImage(item.image, IMG_SIZE.thumb) }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={150}
          cachePolicy="memory-disk"
        />
      </View>
      <View className="flex-1">
        <Text
          variant="body"
          style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {item.distance && (
          <View
            className="flex-row items-center gap-1 mt-1.5 self-start px-2 py-0.5 rounded-full"
            style={{ backgroundColor: semantic.action.primarySoft }}
          >
            <MapPin size={10} color={semantic.action.primary} strokeWidth={2.4} />
            <Text
              variant="caption"
              style={{ color: semantic.action.primaryDeep, fontFamily: 'BeVietnamPro_700Bold' }}
            >
              {item.distance}
            </Text>
          </View>
        )}

        <Text
          variant="caption"
          style={{ color: semantic.text.secondary, marginTop: item.distance ? 6 : 4 }}
          numberOfLines={3}
        >
          {item.description}
        </Text>
      </View>
    </View>
  );
}
