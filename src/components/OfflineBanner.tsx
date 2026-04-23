import { useEffect, useState } from 'react';
import { View } from 'react-native';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { CloudOff, RefreshCw } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { palette, semantic } from '@/theme';

// Sticky banner hiện khi device offline. Lắng NetInfo.addEventListener.
// Phase integrate: wire với mutation queue để show số pending đang chờ sync.

export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state: NetInfoState) => {
      // `isConnected === false` chắc chắn offline.
      // `isInternetReachable === false` = có wifi nhưng không lên được internet.
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOffline(offline);
    });
    NetInfo.fetch().then((state) => {
      setIsOffline(state.isConnected === false || state.isInternetReachable === false);
    });
    return () => unsub();
  }, []);

  const spin = useSharedValue(0);
  useEffect(() => {
    if (isOffline) {
      spin.value = withRepeat(
        withTiming(1, { duration: 1800, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      spin.value = 0;
    }
  }, [isOffline, spin]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  if (!isOffline) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(220)}
      exiting={FadeOutUp.duration(180)}
      style={{
        position: 'absolute',
        top: insets.top,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingHorizontal: 12,
        paddingTop: 4,
      }}
      pointerEvents="box-none"
    >
      <View
        className="flex-row items-center gap-2.5 px-3.5 py-2.5 rounded-2xl"
        style={{
          backgroundColor: palette.obsidian[700],
          shadowColor: palette.obsidian[900],
          shadowOpacity: 0.25,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <View
          className="w-8 h-8 rounded-full items-center justify-center"
          style={{ backgroundColor: 'rgba(247,243,237,0.12)' }}
        >
          <CloudOff size={16} color={palette.obsidian[50]} strokeWidth={2.2} />
        </View>
        <View className="flex-1">
          <Text
            variant="caption"
            style={{ color: palette.obsidian[50], fontFamily: 'BeVietnamPro_700Bold' }}
            numberOfLines={1}
          >
            Đang offline
          </Text>
          <Text
            variant="caption"
            style={{
              color: palette.obsidian[200],
              fontFamily: 'BeVietnamPro_500Medium',
              marginTop: 1,
            }}
            numberOfLines={1}
          >
            Mọi thay đổi sẽ tự đồng bộ khi có mạng
          </Text>
        </View>
        <Animated.View style={spinStyle}>
          <RefreshCw size={14} color={semantic.action.primary} strokeWidth={2.4} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}
