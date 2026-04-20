import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../src/store/auth';

export default function AppLayout() {
  const user = useAuth((s) => s.user);
  if (!user) return <Redirect href="/(auth)/login" />;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerBackButtonDisplayMode: 'minimal',
        headerBackTitle: '',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="leads/[id]" options={{ headerShown: true, title: 'Chi tiết lead' }} />
      <Stack.Screen name="listings/[id]" />
      <Stack.Screen name="notifications" options={{ headerShown: true, title: 'Thông báo' }} />
    </Stack>
  );
}
