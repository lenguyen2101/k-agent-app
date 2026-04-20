import { Pressable, View } from 'react-native';
import { ChevronRight, Mic, PencilLine } from 'lucide-react-native';
import { BottomSheetModal } from '@/components/BottomSheetModal';
import { Text } from '@/components/ui/Text';
import { palette, semantic } from '@/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onPickVoice: () => void;
  onPickForm: () => void;
};

export function CreateLeadMenu({ visible, onClose, onPickVoice, onPickForm }: Props) {
  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View className="px-4 pt-2 pb-1">
        <Text variant="h3" className="text-text-primary">
          Tạo lead mới
        </Text>
        <Text variant="caption" className="text-text-secondary mt-1">
          Chọn cách nhập thông tin khách hàng
        </Text>
      </View>

      <View className="px-4 py-3 gap-2.5">
        <LeadMenuItem
          icon={<Mic size={22} color={palette.white} strokeWidth={2} />}
          iconBg={semantic.action.primary}
          title="Tạo bằng voice"
          subtitle="Nói tự nhiên, AI tự điền form"
          badge="AI"
          onPress={() => {
            onClose();
            setTimeout(onPickVoice, 200);
          }}
        />
        <LeadMenuItem
          icon={<PencilLine size={22} color={semantic.text.primary} strokeWidth={2} />}
          iconBg={semantic.surface.alt}
          title="Điền form"
          subtitle="Nhập từng thông tin thủ công"
          onPress={() => {
            onClose();
            setTimeout(onPickForm, 200);
          }}
        />
      </View>

      <View style={{ paddingBottom: 28 }} />
    </BottomSheetModal>
  );
}

function LeadMenuItem({
  icon,
  iconBg,
  title,
  subtitle,
  badge,
  onPress,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  badge?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 p-3 rounded-2xl border border-border-light"
      style={({ pressed }) => ({
        backgroundColor: pressed ? semantic.surface.hover : semantic.surface.card,
      })}
    >
      <View
        className="w-12 h-12 rounded-xl items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text variant="body-lg" className="text-text-primary" style={{ fontFamily: 'BeVietnamPro_600SemiBold' }}>
            {title}
          </Text>
          {badge && (
            <View
              className="px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: semantic.action.primarySoft }}
            >
              <Text
                variant="badge"
                style={{ color: semantic.action.primaryDeep, fontSize: 10, lineHeight: 14 }}
              >
                {badge}
              </Text>
            </View>
          )}
        </View>
        <Text variant="caption" className="text-text-secondary mt-0.5">
          {subtitle}
        </Text>
      </View>
      <ChevronRight size={18} color={semantic.text.tertiary} />
    </Pressable>
  );
}
