import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Fingerprint, ScanFace } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { KAgentLogo } from '@/components/KAgentLogo';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/store/auth';
import { authenticateBiometric, getBiometricCapability, type BiometricCapability } from '@/lib/biometric';
import { palette, semantic, typography } from '@/theme';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [biometric, setBiometric] = useState<BiometricCapability | null>(null);
  const [authing, setAuthing] = useState(false);
  const signIn = useAuth((s) => s.signIn);
  const settings = useAuth((s) => s.settings);

  useEffect(() => {
    getBiometricCapability().then(setBiometric);
  }, []);

  const biometricAvailable =
    biometric?.supported && biometric?.enrolled && settings.biometric;

  const onLogin = () => {
    signIn(phone || '0901234999');
    router.replace('/(app)/(tabs)');
  };

  const onBiometric = async () => {
    if (!biometric) return;
    setAuthing(true);
    const result = await authenticateBiometric(`Dùng ${biometric.labelVi} để đăng nhập K-Agent`);
    setAuthing(false);
    if (result.success) {
      signIn('0901234999');
      router.replace('/(app)/(tabs)');
      return;
    }
    if (result.error && result.error !== 'cancelled' && result.error !== 'user_cancel') {
      Alert.alert(
        `${biometric.labelVi} không thành công`,
        'Vui lòng thử lại hoặc dùng mật khẩu.'
      );
    }
  };

  const BioIcon = biometric?.kind === 'face' ? ScanFace : Fingerprint;

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
                className="mb-4"
                style={{
                  shadowColor: palette.black,
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 10,
                  borderRadius: 20,
                }}
              >
                <KAgentLogo size={80} />
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

              {biometricAvailable && (
                <Button
                  label={authing ? 'Đang xác thực...' : `Đăng nhập bằng ${biometric!.labelVi}`}
                  variant="secondary"
                  onPress={onBiometric}
                  disabled={authing}
                  fullWidth
                  leftIcon={<BioIcon size={18} color={semantic.text.primary} />}
                />
              )}

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
