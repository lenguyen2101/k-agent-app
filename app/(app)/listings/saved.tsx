import { useMemo } from 'react';
import { Alert, FlatList, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, BookmarkX, Heart } from 'lucide-react-native';
import { EmptyState } from '@/components/EmptyState';
import { ListingCard } from '@/components/ListingCard';
import { Text } from '@/components/ui/Text';
import { listings } from '@/mock/listings';
import { useSavedListings } from '@/store/savedListings';
import { palette, semantic } from '@/theme';

export default function SavedListings() {
  const insets = useSafeAreaInsets();
  const savedIds = useSavedListings((s) => s.savedIds);
  const remove = useSavedListings((s) => s.remove);

  const savedListings = useMemo(
    () => listings.filter((l) => savedIds.has(l.id)),
    [savedIds]
  );

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
        <View className="flex-1 items-center">
          <Text
            variant="h3"
            style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
          >
            Đã lưu
          </Text>
          <Text variant="caption" className="text-text-secondary mt-0.5">
            {savedListings.length} sản phẩm
          </Text>
        </View>
        <View className="w-10" />
      </View>

      <FlatList
        data={savedListings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 22 }}
        renderItem={({ item }) => (
          <View>
            <ListingCard
              listing={item}
              onPress={() => router.push(`/(app)/listings/${item.id}`)}
            />
            <Pressable
              onPress={() =>
                Alert.alert('Bỏ khỏi danh sách lưu', `Bỏ ghim ${item.code}?`, [
                  { text: 'Huỷ', style: 'cancel' },
                  {
                    text: 'Bỏ lưu',
                    style: 'destructive',
                    onPress: () => remove(item.id),
                  },
                ])
              }
              className="flex-row items-center justify-center gap-1.5 mt-2 py-2 rounded-xl"
              style={{
                backgroundColor: palette.white,
                borderWidth: 1,
                borderColor: palette.red[100],
              }}
            >
              <BookmarkX size={14} color={palette.red[600]} />
              <Text
                variant="caption"
                style={{
                  color: palette.red[600],
                  fontFamily: 'BeVietnamPro_600SemiBold',
                }}
              >
                Bỏ khỏi danh sách
              </Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <View className="px-4 pt-10">
            <EmptyState
              icon={Heart}
              title="Chưa có sản phẩm lưu"
              description="Tap ♥ ở chi tiết sản phẩm để ghim và quay lại nhanh."
              ctaLabel="Khám phá rổ hàng"
              onCtaPress={() => router.back()}
            />
          </View>
        }
      />
    </View>
  );
}
