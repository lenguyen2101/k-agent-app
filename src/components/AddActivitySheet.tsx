import { View } from 'react-native';
import { BottomSheetModal } from '@/components/BottomSheetModal';
import { ActivityForm, type ActivityFormValue } from '@/components/ActivityForm';
import { Text } from '@/components/ui/Text';
import { semantic } from '@/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (v: ActivityFormValue) => void;
};

export function AddActivitySheet({ visible, onClose, onSubmit }: Props) {
  const handleSubmit = (v: ActivityFormValue) => {
    onSubmit(v);
    onClose();
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      heightPercent={0.85}
      dismissOnBackdrop={false}
    >
      <View className="px-4 pt-2 pb-1">
        <Text variant="h3" className="text-text-primary">
          Thêm hoạt động
        </Text>
        <Text variant="caption" className="text-text-secondary mt-1">
          Ghi nhận nhanh — gọi / SMS / gặp / ghi chú
        </Text>
      </View>
      <ActivityForm
        chrome="sheet"
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </BottomSheetModal>
  );
}
