import { useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Fingerprint } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/store/auth';
import { palette, semantic, typography } from '@/theme';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const signIn = useAuth((s) => s.signIn);

  const onLogin = () => {
    signIn(phone || '0901234999');
    router.replace('/(app)/(tabs)');
  };

  return (
    <LinearGradient
      colors={[...semantic.gradient.heroBrand]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <View className="flex-1 px-6 justify-center">
            <View className="items-center mb-8">
              <View
                className="w-20 h-20 rounded-2xl bg-white items-center justify-center mb-4"
                style={{
                  shadowColor: palette.black,
                  shadowOpacity: 0.25,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 8,
                }}
              >
                <Text variant="display" style={{ color: semantic.action.primary }}>KA</Text>
              </View>
              <Text variant="h1" className="text-white">K-Agent</Text>
              <Text variant="body-lg" className="text-white/85 mt-1">
                CRM cho sale Nhà ở xã hội
              </Text>
            </View>

            <View
              className="bg-white rounded-2xl p-5 gap-4"
              style={{
                shadowColor: palette.black,
                shadowOpacity: 0.18,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 12 },
                elevation: 12,
              }}
            >
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

              <View>
                <Text variant="caption" className="text-text-primary mb-1.5">
                  Mật khẩu
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor={semantic.text.tertiary}
                  secureTextEntry
                  style={typography['body-lg']}
                  className="border border-border rounded-md h-12 px-3 text-text-primary"
                />
              </View>

              <Button label="Đăng nhập" onPress={onLogin} fullWidth />

              <Button
                label="Đăng nhập bằng vân tay"
                variant="secondary"
                onPress={onLogin}
                fullWidth
                leftIcon={<Fingerprint size={18} color={semantic.text.primary} />}
              />

              <Button
                label="Quên mật khẩu?"
                variant="ghost"
                onPress={() => router.push('/(auth)/forgot-password')}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
