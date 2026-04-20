import { Stack } from 'expo-router';
import { semantic } from '@/theme';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: semantic.surface.background } }} />;
}
