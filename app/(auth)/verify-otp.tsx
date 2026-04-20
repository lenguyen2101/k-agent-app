import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Text } from '@/components/ui/Text';
import { semantic, typography } from '@/theme';

export default function VerifyOtp() {
  const [otp, setOtp] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-2">
        <Pressable onPress={() => router.back()} className="w-10 h-10 -ml-2 items-center justify-center">
          <ArrowLeft size={24} color={semantic.text.primary} />
        </Pressable>
      </View>
      <View className="flex-1 px-6 pt-4">
        <Text variant="h1" className="text-text-title mb-2">Nhập mã OTP</Text>
        <Text variant="body-lg" className="text-text-secondary mb-8">
          Mã 6 số đã gửi tới SĐT của bạn
        </Text>

        <TextInput
          value={otp}
          onChangeText={setOtp}
          placeholder="000000"
          placeholderTextColor={semantic.text.tertiary}
          keyboardType="number-pad"
          maxLength={6}
          style={typography.h2}
          className="border border-border rounded-md h-14 px-3 text-text-primary text-center tracking-widest"
        />

        <Text variant="caption" className="text-text-secondary mt-3 text-center">
          Gửi lại mã sau 60s
        </Text>

        <View className="mt-8">
          <Button label="Xác nhận" onPress={() => router.push('/(auth)/reset-password')} fullWidth />
        </View>
      </View>
    </SafeAreaView>
  );
}
