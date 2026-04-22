import { useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  View,
  type ViewToken,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { ChevronLeft, ChevronRight, PlayCircle, Share2, X } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { primaryProjects } from '@/mock/primaryProjects';
import { palette } from '@/theme';
import type { MediaItem } from '@/types/primaryProject';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Extract YouTube video ID từ các format URL:
// https://youtube.com/watch?v=ID | https://youtu.be/ID | https://youtube.com/embed/ID
function extractYoutubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([^&#]+)/,
    /youtu\.be\/([^?&#]+)/,
    /youtube\.com\/embed\/([^?&#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function ProjectGallery() {
  const { projectId, startIndex } = useLocalSearchParams<{
    projectId?: string;
    startIndex?: string;
  }>();
  const insets = useSafeAreaInsets();

  const project = useMemo(
    () => primaryProjects.find((p) => p.id === projectId),
    [projectId]
  );
  const media = project?.media ?? [];
  const initial = Math.max(0, Math.min(media.length - 1, parseInt(startIndex ?? '0', 10) || 0));

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

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const goto = (i: number) => {
    if (i < 0 || i >= media.length) return;
    flatRef.current?.scrollToIndex({ index: i, animated: true });
    thumbRef.current?.scrollToIndex({ index: i, animated: true, viewPosition: 0.5 });
  };

  if (!project || media.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.obsidian[900], justifyContent: 'center', alignItems: 'center' }}>
        <Text variant="body" style={{ color: palette.obsidian[50] }}>
          Không có media để hiển thị
        </Text>
      </View>
    );
  }

  const current = media[index];

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
            style={{ color: palette.white, fontFamily: 'BeVietnamPro_700Bold' }}
          >
            {index + 1} / {media.length}
          </Text>
          <Text
            variant="caption"
            style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}
            numberOfLines={1}
          >
            {project.shortName}
            {current.type === 'youtube' ? ' · Video' : ''}
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

      {/* Main swipe carousel */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <FlatList
          ref={flatRef}
          data={media}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initial}
          getItemLayout={(_, i) => ({ length: SCREEN_W, offset: SCREEN_W * i, index: i })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          keyExtractor={(m, i) => `${m.url}-${i}`}
          renderItem={({ item }) => <MediaFullFrame media={item} />}
        />

        {/* Chevron nav - hide khi video đang play (user có thể đang tương tác WebView) */}
        {index > 0 && current.type === 'image' && (
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
        {index < media.length - 1 && current.type === 'image' && (
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
          data={media}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(m, i) => `thumb-${m.url}-${i}`}
          contentContainerStyle={{ gap: 8 }}
          getItemLayout={(_, i) => ({ length: 68, offset: 68 * i, index: i })}
          renderItem={({ item, index: i }) => {
            const active = i === index;
            const thumbUri = item.type === 'youtube' ? item.thumbnail : item.url;
            return (
              <Pressable onPress={() => goto(i)}>
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 10,
                    borderWidth: active ? 2 : 1,
                    borderColor: active ? palette.white : 'rgba(255,255,255,0.25)',
                    opacity: active ? 1 : 0.65,
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    source={{ uri: thumbUri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                  {item.type === 'youtube' && (
                    <View
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.35)',
                      }}
                    >
                      <PlayCircle size={18} color={palette.white} strokeWidth={2} fill="rgba(0,0,0,0.5)" />
                    </View>
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      </View>
    </View>
  );
}

function MediaFullFrame({ media }: { media: MediaItem }) {
  if (media.type === 'image') {
    return (
      <View style={{ width: SCREEN_W, justifyContent: 'center', alignItems: 'center' }}>
        <Image
          source={{ uri: media.url }}
          style={{ width: SCREEN_W, aspectRatio: 3 / 4, maxHeight: '100%' }}
          resizeMode="contain"
        />
      </View>
    );
  }

  // YouTube embed via WebView
  const id = extractYoutubeId(media.url);
  if (!id) {
    return (
      <View style={{ width: SCREEN_W, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: palette.obsidian[50] }}>URL video không hợp lệ</Text>
      </View>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${id}?playsinline=1&rel=0&modestbranding=1`;

  // 16:9 video, center trong viewport
  const videoHeight = (SCREEN_W * 9) / 16;

  return (
    <View style={{ width: SCREEN_W, justifyContent: 'center' }}>
      <View style={{ width: SCREEN_W, height: videoHeight, backgroundColor: palette.obsidian[950] }}>
        <WebView
          source={{ uri: embedUrl }}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          style={{ flex: 1, backgroundColor: palette.obsidian[950] }}
        />
      </View>
      {media.title && (
        <Text
          variant="body"
          style={{
            color: palette.white,
            textAlign: 'center',
            marginTop: 16,
            paddingHorizontal: 24,
            fontFamily: 'BeVietnamPro_600SemiBold',
          }}
        >
          {media.title}
        </Text>
      )}
    </View>
  );
}
