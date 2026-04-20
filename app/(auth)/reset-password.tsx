import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Text } from '@/components/ui/Text';
import { semantic, typography } from '@/theme';

export default function ResetPassword() {
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-2">
        <Pressable onPress={() => router.back()} className="w-10 h-10 -ml-2 items-center justify-center">
          <ArrowLeft size={24} color={semantic.text.primary} />
        </Pressable>
      </View>
      <View className="flex-1 px-6 pt-4">
        <Text variant="h1" className="text-text-title mb-2">Đặt mật khẩu mới</Text>
        <Text variant="body-lg" className="text-text-secondary mb-8">
          Mật khẩu tối thiểu 8 ký tự
        </Text>

        <View className="gap-4">
          <View>
            <Text variant="caption" className="text-text-primary mb-1.5">Mật khẩu mới</Text>
            <TextInput
              value={pw1}
              onChangeText={setPw1}
              secureTextEntry
              placeholder="Nhập mật khẩu mới"
              placeholderTextColor={semantic.text.tertiary}
              style={typography['body-lg']}
              className="border border-border rounded-md h-12 px-3 text-text-primary"
            />
          </View>
          <View>
            <Text variant="caption" className="text-text-primary mb-1.5">Xác nhận lại</Text>
            <TextInput
              value={pw2}
              onChangeText={setPw2}
              secureTextEntry
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor={semantic.text.tertiary}
              style={typography['body-lg']}
              className="border border-border rounded-md h-12 px-3 text-text-primary"
            />
          </View>

          <Button label="Hoàn tất" onPress={() => router.replace('/(auth)/login')} fullWidth />
        </View>
      </View>
    </SafeAreaView>
  );
}
