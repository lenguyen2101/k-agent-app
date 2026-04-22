import '../global.css';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
} from '@expo-google-fonts/be-vietnam-pro';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineBanner } from '@/components/OfflineBanner';
import {
  ensureAndroidChannel,
  registerForegroundHandler,
  registerResponseHandler,
} from '@/lib/notifications';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Notifications: foreground handler + Android channel + tap→deeplink
  useEffect(() => {
    registerForegroundHandler();
    ensureAndroidChannel();
    const unsub = registerResponseHandler((data) => {
      if (data?.type === 'LEAD_OFFER') {
        router.push('/(modal)/lead-offer');
      }
    });
    return unsub;
  }, []);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="force-update" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="maintenance" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen
          name="(modal)/lead-offer"
          options={{ presentation: 'transparentModal', animation: 'fade' }}
        />
        <Stack.Screen
          name="(modal)/image-viewer"
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
        <Stack.Screen
          name="(modal)/scanner"
          options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
        />
      </Stack>
      <OfflineBanner />
      <StatusBar style="dark" />
    </ErrorBoundary>
  );
}
