import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { BookingForm } from '@/components/BookingForm';
import { Text } from '@/components/ui/Text';
import { semantic } from '@/theme';

// Booking flow route duy nhất — nhận tất cả initial values qua query params.
// Entry points:
// - Lead detail "Tạo booking cho khách" → leadId
// - Primary project detail "Booking giữ chỗ" → projectId
// - Tower detail "Booking toà này" → projectId + towerId
// - Unit type detail "Booking căn này" / tap available unit → projectId + unitId (+ unitCode)
//
// Nếu không có projectId → BookingForm hiển thị step 1 picker dự án.
export default function BookingScreen() {
  const params = useLocalSearchParams<{
    leadId?: string;
    projectId?: string;
    towerId?: string;
    unitId?: string;
    unitCode?: string;
  }>();
  const insets = useSafeAreaInsets();

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
            Booking giữ chỗ
          </Text>
        </View>
        <View className="w-10" />
      </View>

      <BookingForm
        initialProjectId={params.projectId}
        initialTowerId={params.towerId}
        initialUnitId={params.unitId}
        initialUnitCode={params.unitCode}
        initialLeadId={params.leadId}
        lockLead={!!params.leadId}
        onClose={() => router.back()}
      />
    </View>
  );
}
