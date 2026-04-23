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
      <Stack.Screen name="leads/[id]" />
      <Stack.Screen name="leads/[id]/edit" />
      <Stack.Screen name="leads/[id]/activities/new" />
      <Stack.Screen name="leads/new" />
      <Stack.Screen name="listings/[id]" />
      <Stack.Screen name="listings/[id]/request-cooperation" />
      <Stack.Screen name="listings/saved" />
      <Stack.Screen name="listings/primary/[projectId]" />
      <Stack.Screen name="listings/primary/[projectId]/tower/[towerId]" />
      <Stack.Screen name="listings/primary/[projectId]/unit/[unitId]" />
      <Stack.Screen name="booking" />
      <Stack.Screen name="bookings/index" />
      <Stack.Screen name="bookings/[id]" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="chat/[conversationId]" />
      <Stack.Screen name="income/index" />
      <Stack.Screen name="income/transactions" />
      <Stack.Screen name="income/network" />
      <Stack.Screen name="income/[transactionId]" />
      <Stack.Screen name="me/profile" />
      <Stack.Screen name="me/settings" />
      <Stack.Screen name="me/sync-status" />
      <Stack.Screen name="me/about" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
