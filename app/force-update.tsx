import { Linking, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowDownToLine, ArrowUpRight, Check, Mail } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { useAppStatus } from '@/store/appStatus';
import { palette, semantic } from '@/theme';

export default function ForceUpdate() {
  const insets = useSafeAreaInsets();
  const forceUpdate = useAppStatus((s) => s.forceUpdate);

  const changelog = forceUpdate.changelog ?? 'Sửa lỗi và cải tiến hiệu suất.';
  const bullets = changelog
    .split(/[•\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <View className="flex-1 bg-surface">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 24,
        }}
      >
        {/* Hero icon */}
        <View className="items-center mt-4 mb-6">
          <View
            className="w-24 h-24 rounded-3xl items-center justify-center"
            style={{
              backgroundColor: semantic.action.primarySoft,
              borderWidth: 1,
              borderColor: palette.sienna[100],
              shadowColor: semantic.action.primaryDeep,
              shadowOpacity: 0.15,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
              elevation: 5,
            }}
          >
            <ArrowDownToLine size={40} color={semantic.action.primary} strokeWidth={2} />
          </View>
        </View>

        {/* Title + body */}
        <Text
          variant="display"
          style={{ color: semantic.text.primary, textAlign: 'center' }}
        >
          Cần cập nhật K-Agent
        </Text>
        <Text
          variant="body-lg"
          className="text-text-secondary text-center mt-2"
          style={{ lineHeight: 24 }}
        >
          Phiên bản bạn đang dùng đã cũ. Vui lòng cập nhật để tiếp tục nhận lead và dùng các tính năng mới.
        </Text>

        {/* Version pill */}
        <View className="flex-row justify-center gap-2 mt-5">
          <View
            className="px-3 py-1.5 rounded-full flex-row items-center gap-1.5"
            style={{ backgroundColor: semantic.surface.alt, borderWidth: 1, borderColor: semantic.border.default }}
          >
            <Text
              variant="caption"
              style={{ color: semantic.text.secondary, fontFamily: 'BeVietnamPro_600SemiBold' }}
            >
              Hiện tại
            </Text>
            <Text
              variant="caption"
              style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
            >
              v1.0.0
            </Text>
          </View>
          <View className="items-center justify-center">
            <Text style={{ color: semantic.text.tertiary, fontSize: 14 }}>→</Text>
          </View>
          <View
            className="px-3 py-1.5 rounded-full flex-row items-center gap-1.5"
            style={{ backgroundColor: semantic.action.primary }}
          >
            <Text
              variant="caption"
              style={{ color: palette.white, fontFamily: 'BeVietnamPro_600SemiBold', opacity: 0.85 }}
            >
              Bản mới
            </Text>
            <Text
              variant="caption"
              style={{ color: palette.white, fontFamily: 'BeVietnamPro_700Bold' }}
            >
              v{forceUpdate.latestVersion}
            </Text>
          </View>
        </View>

        {/* Changelog */}
        <View
          className="mt-8 p-4 rounded-2xl"
          style={{
            backgroundColor: palette.white,
            borderWidth: 1,
            borderColor: semantic.border.light,
          }}
        >
          <Text
            variant="caption"
            style={{
              color: semantic.text.secondary,
              fontFamily: 'BeVietnamPro_700Bold',
              letterSpacing: 0.5,
              marginBottom: 10,
            }}
          >
            CÓ GÌ MỚI
          </Text>
          <View style={{ gap: 10 }}>
            {bullets.map((b, i) => (
              <View key={i} className="flex-row items-start gap-2">
                <View
                  className="w-5 h-5 rounded-full items-center justify-center mt-0.5"
                  style={{ backgroundColor: palette.emerald[50] }}
                >
                  <Check size={12} color={palette.emerald[700]} strokeWidth={2.6} />
                </View>
                <Text variant="body" className="text-text-primary flex-1" style={{ lineHeight: 22 }}>
                  {b}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="flex-1" />

        {/* CTA */}
        <Pressable
          onPress={() => Linking.openURL(forceUpdate.storeUrl)}
          className="h-14 rounded-2xl flex-row items-center justify-center gap-2 mt-8"
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
            variant="button"
            style={{ color: palette.white, letterSpacing: 0.3 }}
          >
            Cập nhật ngay
          </Text>
          <ArrowUpRight size={18} color={palette.white} strokeWidth={2.6} />
        </Pressable>

        <Pressable
          onPress={() =>
            Linking.openURL(
              'mailto:agent-support@k-city.vn?subject=K-Agent%20update%20issue'
            )
          }
          className="flex-row items-center justify-center gap-1.5 py-3 mt-2"
          hitSlop={6}
        >
          <Mail size={13} color={semantic.text.secondary} />
          <Text
            variant="caption"
            style={{
              color: semantic.text.secondary,
              fontFamily: 'BeVietnamPro_500Medium',
            }}
          >
            Gặp lỗi khi update? Liên hệ hỗ trợ
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
