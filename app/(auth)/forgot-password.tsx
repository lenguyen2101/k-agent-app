import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Text } from '@/components/ui/Text';
import { semantic, typography } from '@/theme';

export default function ForgotPassword() {
  const [phone, setPhone] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-2">
        <Pressable onPress={() => router.back()} className="w-10 h-10 -ml-2 items-center justify-center">
          <ArrowLeft size={24} color={semantic.text.primary} />
        </Pressable>
      </View>
      <View className="flex-1 px-6 pt-4">
        <Text variant="h1" className="text-text-title mb-2">Quên mật khẩu</Text>
        <Text variant="body-lg" className="text-text-secondary mb-8">
          Nhập số điện thoại để nhận mã OTP đặt lại mật khẩu
        </Text>

        <View className="gap-4">
          <View>
            <Text variant="caption" className="text-text-primary mb-1.5">
              Số điện thoại
            </Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="0901 234 567"
              placeholderTextColor={semantic.text.tertiary}
              keyboardType="phone-pad"
              style={typography['body-lg']}
              className="border border-border rounded-md h-12 px-3 text-text-primary"
            />
          </View>

          <Button
            label="Gửi mã OTP"
            onPress={() => router.push('/(auth)/verify-otp')}
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
