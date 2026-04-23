import { useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StatusBar,
  View,
  type ViewToken,
} from 'react-native';
import { Image } from 'expo-image';
import { cdnImage } from '@/lib/img';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Share2, X } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { listings } from '@/mock/listings';
import { palette } from '@/theme';

const { width: SCREEN_W } = Dimensions.get('window');

export default function ImageViewer() {
  const { listingId, startIndex } = useLocalSearchParams<{
    listingId?: string;
    startIndex?: string;
  }>();
  const insets = useSafeAreaInsets();

  const listing = useMemo(
    () => listings.find((l) => l.id === listingId),
    [listingId]
  );
  const gallery = listing?.gallery ?? [];
  const initial = Math.max(0, Math.min(gallery.length - 1, parseInt(startIndex ?? '0', 10) || 0));

  const [index, setIndex] = useState(initial);
  const flatRef = useRef<FlatList>(null);
  const thumbRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && typeof viewableItems[0].index === 'number') {
        setIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const goto = (i: number) => {
    if (i < 0 || i >= gallery.length) return;
    flatRef.current?.scrollToIndex({ index: i, animated: true });
    thumbRef.current?.scrollToIndex({ index: i, animated: true, viewPosition: 0.5 });
  };

  if (!listing || gallery.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.obsidian[900], justifyContent: 'center', alignItems: 'center' }}>
        <Text variant="body" style={{ color: palette.obsidian[50] }}>
          Không có ảnh để hiển thị
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.obsidian[900] }}>
      <StatusBar barStyle="light-content" />

      {/* Top bar */}
      <View
        className="flex-row items-center justify-between px-3 z-10"
        style={{ paddingTop: insets.top + 4, paddingBottom: 10 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
          hitSlop={8}
        >
          <X size={20} color={palette.white} />
        </Pressable>

        <View className="items-center">
          <Text
            variant="body"
            style={{
              color: palette.white,
              fontFamily: 'BeVietnamPro_700Bold',
            }}
          >
            {index + 1} / {gallery.length}
          </Text>
          <Text
            variant="caption"
            style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}
            numberOfLines={1}
          >
            {listing.code} · {listing.unitType}
          </Text>
        </View>

        <Pressable
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
          hitSlop={8}
        >
          <Share2 size={18} color={palette.white} />
        </Pressable>
      </View>

      {/* Main swiper */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <FlatList
          ref={flatRef}
          data={gallery}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initial}
          getItemLayout={(_, i) => ({ length: SCREEN_W, offset: SCREEN_W * i, index: i })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          keyExtractor={(uri, i) => `${uri}-${i}`}
          renderItem={({ item }) => (
            <View style={{ width: SCREEN_W, justifyContent: 'center', alignItems: 'center' }}>
              <Image
                source={{ uri: cdnImage(item, SCREEN_W) }}
                style={{ width: SCREEN_W, aspectRatio: 3 / 4, maxHeight: '100%' }}
                contentFit="contain"
                transition={200}
                cachePolicy="memory-disk"
              />
            </View>
          )}
        />

        {/* Side chevrons */}
        {index > 0 && (
          <Pressable
            onPress={() => goto(index - 1)}
            className="absolute left-3 w-10 h-10 rounded-full items-center justify-center"
            style={{
              top: '50%',
              marginTop: -20,
              backgroundColor: 'rgba(255,255,255,0.2)',
            }}
            hitSlop={8}
          >
            <ChevronLeft size={22} color={palette.white} strokeWidth={2.4} />
          </Pressable>
        )}
        {index < gallery.length - 1 && (
          <Pressable
            onPress={() => goto(index + 1)}
            className="absolute right-3 w-10 h-10 rounded-full items-center justify-center"
            style={{
              top: '50%',
              marginTop: -20,
              backgroundColor: 'rgba(255,255,255,0.2)',
            }}
            hitSlop={8}
          >
            <ChevronRight size={22} color={palette.white} strokeWidth={2.4} />
          </Pressable>
        )}
      </View>

      {/* Thumbnail strip */}
      <View
        style={{
          paddingTop: 12,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
          paddingHorizontal: 12,
          backgroundColor: 'rgba(0,0,0,0.6)',
        }}
      >
        <FlatList
          ref={thumbRef}
          data={gallery}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(uri, i) => `thumb-${uri}-${i}`}
          contentContainerStyle={{ gap: 8 }}
          getItemLayout={(_, i) => ({ length: 68, offset: 68 * i, index: i })}
          renderItem={({ item, index: i }) => {
            const active = i === index;
            return (
              <Pressable onPress={() => goto(i)}>
                <Image
                  source={{ uri: cdnImage(item, 60) }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 10,
                    borderWidth: active ? 2 : 1,
                    borderColor: active ? palette.white : 'rgba(255,255,255,0.25)',
                    opacity: active ? 1 : 0.65,
                  }}
                  contentFit="cover"
                  transition={100}
                  cachePolicy="memory-disk"
                />
              </Pressable>
            );
          }}
        />
      </View>
    </View>
  );
}
