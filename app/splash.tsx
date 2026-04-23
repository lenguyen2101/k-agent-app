import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { KAgentLogo } from '@/components/KAgentLogo';
import { Text } from '@/components/ui/Text';
import { useAppStatus } from '@/store/appStatus';
import { useAuth } from '@/store/auth';
import { palette, semantic } from '@/theme';

// In-app splash — chạy hydrate async (đọc MMKV + fetch status) rồi route.
// Native splash (app.json) hide ngay sau fonts loaded, màn này take over
// để mask quá trình init + kiểm tra force-update / maintenance.

export default function Splash() {
  const insets = useSafeAreaInsets();
  const hydrated = useAppStatus((s) => s.hydrated);
  const hydrate = useAppStatus((s) => s.hydrate);
  const onboardingCompleted = useAppStatus((s) => s.onboardingCompleted);
  const forceUpdate = useAppStatus((s) => s.forceUpdate);
  const maintenance = useAppStatus((s) => s.maintenance);
  const user = useAuth((s) => s.user);

  const pulse = useSharedValue(0);

  useEffect(() => {
    hydrate();
    pulse.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [hydrate, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.08 }],
    opacity: 0.7 + pulse.value * 0.3,
  }));

  const nextHref = useMemo(() => {
    if (!hydrated) return null;
    if (maintenance.active) return '/maintenance' as const;
    if (forceUpdate.required) return '/force-update' as const;
    if (!onboardingCompleted) return '/(auth)/onboarding' as const;
    if (user) return '/(app)/(tabs)' as const;
    return '/(auth)/login' as const;
  }, [hydrated, maintenance.active, forceUpdate.required, onboardingCompleted, user]);

  if (nextHref) return <Redirect href={nextHref} />;

  return (
    <LinearGradient
      colors={[...semantic.gradient.heroBrand]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ paddingBottom: insets.bottom + 40 }}
      >
        <Animated.View
          style={[
            pulseStyle,
            {
              shadowColor: palette.obsidian[900],
              shadowOpacity: 0.35,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 14 },
              elevation: 10,
              borderRadius: 28,
            },
          ]}
        >
          <KAgentLogo size={112} />
        </Animated.View>

        {/* Splash brand wordmark: 34px — oversize intentional, only screen in app with this. */}
        <Text
          style={{
            color: palette.white,
            fontFamily: 'BeVietnamPro_700Bold',
            fontSize: 34,
            lineHeight: 42,
            marginTop: 24,
            letterSpacing: 0.5,
          }}
        >
          K-Agent
        </Text>
        <Text
          variant="body"
          style={{
            color: 'rgba(255,255,255,0.85)',
            marginTop: 6,
            fontFamily: 'BeVietnamPro_500Medium',
          }}
        >
          CRM mobile cho sale BĐS K-CITY
        </Text>
      </View>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: insets.bottom + 16,
          alignItems: 'center',
        }}
      >
        <Text
          variant="caption"
          style={{
            color: 'rgba(255,255,255,0.65)',
            fontFamily: 'BeVietnamPro_500Medium',
          }}
        >
          v1.0.0 · Đang khởi động...
        </Text>
      </View>
    </LinearGradient>
  );
}
