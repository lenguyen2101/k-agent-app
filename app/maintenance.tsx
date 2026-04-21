import { useState } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Clock,
  Mail,
  RefreshCw,
  Wrench,
} from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { useAppStatus } from '@/store/appStatus';
import { palette, semantic } from '@/theme';

function formatEstimatedEnd(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} · ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function Maintenance() {
  const insets = useSafeAreaInsets();
  const maintenance = useAppStatus((s) => s.maintenance);
  const hydrate = useAppStatus((s) => s.hydrate);
  const setMaintenance = useAppStatus((s) => s.setMaintenance);

  const [retrying, setRetrying] = useState(false);

  const endText = formatEstimatedEnd(maintenance.estimatedEndAt);
  const support = maintenance.supportEmail ?? 'agent-support@k-city.vn';

  const handleRetry = () => {
    setRetrying(true);
    // Demo re-fetch status. Phase integrate: await fetch('/app/status') + update store
    setTimeout(() => {
      setMaintenance({ active: false });
      setRetrying(false);
      hydrate();
    }, 1500);
  };

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
              backgroundColor: palette.sienna[50],
              borderWidth: 1,
              borderColor: palette.sienna[100],
            }}
          >
            <Wrench size={40} color={palette.sienna[700]} strokeWidth={2} />
          </View>
        </View>

        <Text
          style={{
            color: semantic.text.primary,
            fontFamily: 'BeVietnamPro_700Bold',
            fontSize: 26,
            lineHeight: 34,
            textAlign: 'center',
          }}
        >
          K-Agent đang bảo trì
        </Text>
        <Text
          variant="body-lg"
          className="text-text-secondary text-center mt-2"
          style={{ lineHeight: 24 }}
        >
          {maintenance.message}
        </Text>

        {/* Estimated end */}
        {endText && (
          <View
            className="flex-row items-center gap-2 self-center mt-5 px-3 py-2 rounded-full"
            style={{
              backgroundColor: semantic.action.primarySoft,
              borderWidth: 1,
              borderColor: palette.sienna[100],
            }}
          >
            <Clock size={14} color={semantic.action.primaryDeep} />
            <Text
              variant="caption"
              style={{
                color: semantic.action.primaryDeep,
                fontFamily: 'BeVietnamPro_700Bold',
              }}
            >
              Dự kiến hoạt động lại lúc {endText}
            </Text>
          </View>
        )}

        {/* Info */}
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
            TRONG LÚC CHỜ
          </Text>
          <View style={{ gap: 10 }}>
            <InfoLine>Dữ liệu của bạn vẫn an toàn trên thiết bị.</InfoLine>
            <InfoLine>Mọi hoạt động đã ghi nhận offline sẽ tự đồng bộ khi hệ thống hoạt động lại.</InfoLine>
            <InfoLine>Nếu cần gấp, liên hệ trưởng sàn hoặc email dưới đây.</InfoLine>
          </View>
        </View>

        <View className="flex-1" />

        {/* CTA */}
        <Pressable
          onPress={handleRetry}
          disabled={retrying}
          className="h-14 rounded-2xl flex-row items-center justify-center gap-2 mt-8"
          style={{
            backgroundColor: semantic.action.primary,
            shadowColor: semantic.action.primaryDeep,
            shadowOpacity: 0.3,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
            opacity: retrying ? 0.7 : 1,
          }}
        >
          <RefreshCw
            size={18}
            color={palette.white}
            strokeWidth={2.4}
            style={retrying ? { transform: [{ rotate: '180deg' }] } : undefined}
          />
          <Text
            style={{
              color: palette.white,
              fontFamily: 'BeVietnamPro_700Bold',
              fontSize: 16,
              letterSpacing: 0.3,
            }}
          >
            {retrying ? 'Đang kiểm tra...' : 'Thử lại'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            Linking.openURL(
              `mailto:${support}?subject=K-Agent%20maintenance%20support`
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
            {support}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function InfoLine({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-row items-start gap-2">
      <View
        className="w-1.5 h-1.5 rounded-full mt-2"
        style={{ backgroundColor: semantic.action.primary }}
      />
      <Text variant="body" className="text-text-primary flex-1" style={{ lineHeight: 22 }}>
        {children}
      </Text>
    </View>
  );
}
