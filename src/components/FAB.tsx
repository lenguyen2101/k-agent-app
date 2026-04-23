import { Pressable, type PressableProps } from 'react-native';
import { type LucideIcon } from 'lucide-react-native';
import { palette, semantic } from '@/theme';

// Floating Action Button — unified style cho các tab chính (Home/Lead/Chat).
// Bottom-right floating, sienna gradient, shadow đồng bộ. KHÔNG customize
// size/position/color per call site — giữ nhất quán brand identity cross-tab.

type Props = {
  icon: LucideIcon;
  onPress: () => void;
} & Omit<PressableProps, 'onPress' | 'style' | 'children'>;

export function FAB({ icon: Icon, onPress, ...rest }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        position: 'absolute',
        right: 20,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: semantic.action.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: semantic.action.primaryDeep,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
      }}
      {...rest}
    >
      <Icon size={24} color={palette.white} strokeWidth={2.2} />
    </Pressable>
  );
}
