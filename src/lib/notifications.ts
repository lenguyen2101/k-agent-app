import {
  getPermissionsAsync,
  requestPermissionsAsync,
  scheduleNotificationAsync,
  setNotificationHandler,
  AndroidImportance,
  setNotificationChannelAsync,
  type NotificationResponse,
  addNotificationResponseReceivedListener,
  SchedulableTriggerInputTypes,
} from 'expo-notifications';
import { Platform } from 'react-native';

export type PushPermissionStatus = 'granted' | 'denied' | 'undetermined';

// Handler — quyết định foreground behavior. Hiện full alert + sound + badge khi nhận.
export function registerForegroundHandler() {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// Android yêu cầu notification channel trước khi schedule.
export async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await setNotificationChannelAsync('lead-offers', {
    name: 'Lead mới',
    importance: AndroidImportance.MAX,
    vibrationPattern: [0, 400, 200, 400],
    lightColor: '#C8603C',
    sound: 'default',
  });
}

export async function getPushPermission(): Promise<PushPermissionStatus> {
  const { status } = await getPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

export async function requestPushPermission(): Promise<PushPermissionStatus> {
  await ensureAndroidChannel();
  const { status } = await requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowSound: true,
      allowBadge: true,
    },
  });
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

// Mock lead offer push — schedule local notification để demo "Lead mới đến" Grab-style.
// Data payload dùng khi user tap → mở màn lead-offer.
export async function scheduleDemoLeadOfferPush(delaySeconds = 3) {
  await ensureAndroidChannel();
  await scheduleNotificationAsync({
    content: {
      title: '🔥 Lead mới được AI phân bổ',
      body: 'Bùi Thị Hương · NOXH Sky Garden Q9 — Tap để nhận trong 60s',
      data: { type: 'LEAD_OFFER', offerId: 'offer-1' },
      sound: 'default',
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: delaySeconds,
      channelId: 'lead-offers',
    },
  });
}

// Tap handler — đăng ký trong root layout. Callback nhận payload data.
export function registerResponseHandler(onTap: (data: NotificationResponse['notification']['request']['content']['data']) => void) {
  const sub = addNotificationResponseReceivedListener((response) => {
    onTap(response.notification.request.content.data);
  });
  return () => sub.remove();
}
