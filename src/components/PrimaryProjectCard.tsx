import { memo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Building2, Images, MapPin } from 'lucide-react-native';
import { cdnImage, IMG_SIZE } from '@/lib/img';
import { Text } from '@/components/ui/Text';
import { formatVNDCompact, formatPricePerM2 } from '@/lib/format';
import { palette, semantic } from '@/theme';
import {
  primaryStatusLabels,
  type PrimaryProject,
  type PrimaryProjectStatus,
} from '@/types/primaryProject';

// Vertical full-image card cho danh sách dự án Sơ cấp.
// Inspired reference: 2 badge top-left ("Sơ cấp" + status) + title + address + price.

const statusStyle: Record<PrimaryProjectStatus, { bg: string; fg: string }> = {
  SELLING:     { bg: palette.emerald[50], fg: palette.emerald[700] },
  UPCOMING:    { bg: palette.sienna[50],  fg: palette.sienna[700] },
  HANDED_OVER: { bg: palette.blue[50],    fg: palette.blue[700] },
  SOLD_OUT:    { bg: palette.slate[200],  fg: palette.slate[700] },
};

export const PrimaryProjectCard = memo(function PrimaryProjectCard({
  project,
  onPress,
}: {
  project: PrimaryProject;
  onPress?: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const status = statusStyle[project.status];
  const priceRange = `${formatVNDCompact(project.priceMinVnd)} - ${formatVNDCompact(project.priceMaxVnd)}`;
  const pricePerM2 = `${formatPricePerM2(project.pricePerM2Min).replace('~', '')} - ${formatPricePerM2(project.pricePerM2Max).replace('~', '')}`;

  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl overflow-hidden active:opacity-90"
      style={{
        backgroundColor: semantic.surface.card,
        borderWidth: 1,
        borderColor: semantic.border.light,
        shadowColor: palette.obsidian[900],
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
    >
      {/* Cover */}
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
            source={{ uri: cdnImage(project.gallery[0], IMG_SIZE.card) }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={150}
            cachePolicy="memory-disk"
            onError={() => setImgFailed(true)}
          />
        )}

        {/* Top-left: 2 badges stacked horizontally */}
        <View className="absolute top-3 left-3 flex-row gap-2">
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

        {/* Bottom-right: photo count */}
        <View
          className="absolute bottom-3 right-3 flex-row items-center gap-1 px-2.5 py-1 rounded-full"
          style={{ backgroundColor: 'rgba(10,9,8,0.62)' }}
        >
          <Images size={12} color={palette.white} strokeWidth={2.2} />
          <Text
            variant="caption"
            style={{ color: palette.white, fontFamily: 'BeVietnamPro_500Medium' }}
          >
            {project.gallery.length}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View className="px-4 pt-3 pb-4">
        <Text
          variant="h3"
          style={{ color: semantic.text.primary }}
          numberOfLines={2}
        >
          {project.shortName}
        </Text>

        <View className="flex-row items-center gap-1.5 mt-1.5">
          <MapPin size={13} color={semantic.text.tertiary} />
          <Text
            variant="caption"
            style={{ color: semantic.text.secondary, flex: 1 }}
            numberOfLines={1}
          >
            {project.addressFull}
          </Text>
        </View>

        <View className="mt-3">
          <Text
            variant="h3"
            style={{ color: palette.emerald[700] }}
          >
            {priceRange}
          </Text>
          <Text
            variant="caption"
            style={{ color: palette.emerald[600], marginTop: 1 }}
          >
            {pricePerM2}
          </Text>
        </View>

        <View
          className="flex-row items-center gap-4 mt-3 pt-3"
          style={{ borderTopWidth: 1, borderTopColor: semantic.border.light }}
        >
          <View className="flex-row items-center gap-1.5">
            <Building2 size={13} color={semantic.text.tertiary} />
            <Text variant="caption" className="text-text-secondary">
              {project.scaleUnits.toLocaleString('vi-VN')} căn
            </Text>
          </View>
          <Text variant="caption" className="text-text-tertiary">·</Text>
          <Text variant="caption" className="text-text-secondary">
            {project.towers.length} tòa
          </Text>
          <Text variant="caption" className="text-text-tertiary">·</Text>
          <Text variant="caption" className="text-text-secondary">
            Bàn giao {project.handoverDate}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});
