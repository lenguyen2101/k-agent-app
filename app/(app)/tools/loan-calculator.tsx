import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { LoanCalculator } from '@/components/LoanCalculator';
import { Text } from '@/components/ui/Text';
import { semantic } from '@/theme';

// Full-page loan calculator. Nhận optional ?price= query để prefill giá căn
// khi mở từ Unit type detail CTA.
export default function LoanCalculatorScreen() {
  const insets = useSafeAreaInsets();
  const { price } = useLocalSearchParams<{ price?: string }>();
  const initialPrincipal = price ? parseInt(price, 10) || undefined : undefined;

  return (
    <View className="flex-1 bg-surface">
      <View
        className="bg-white border-b border-border-light flex-row items-center px-2"
        style={{ paddingTop: insets.top + 4, paddingBottom: 10 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
          hitSlop={8}
        >
          <ArrowLeft size={22} color={semantic.text.primary} />
        </Pressable>
        <View className="w-10" />
        <View className="flex-1 items-center">
          <Text
            variant="h3"
            style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
          >
            Tính vay ngân hàng
          </Text>
        </View>
        <View className="w-10" />
      </View>

      <LoanCalculator initialPrincipal={initialPrincipal} />
    </View>
  );
}
