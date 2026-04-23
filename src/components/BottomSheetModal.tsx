import { useEffect, useState, type ReactNode } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { palette, semantic } from '@/theme';

// Bottom sheet với overlay fade + sheet slide riêng biệt.
// - Modal animationType="fade" → overlay fade in/out (không slide)
// - Sheet inside dùng Reanimated SlideInDown/SlideOutDown → slide riêng
//
// 2 mode height:
// - Auto (mặc định): sheet wrap content (menu nhỏ — CreateLeadMenu 2 item). maxHeight cap.
// - Fixed `heightPercent`: sheet chiếm % screen cố định (form dài cần ScrollView flex:1 + footer stick đáy).
//
// Keyboard handling — 2 lớp:
// 1. KeyboardAvoidingView behavior="padding" OUTER → đẩy sheet lên trên keyboard
// 2. Dynamic cap height theo keyboard: khi keyboard mở, sheet fixed height bị co theo
//    available space (screen - keyboard - safeTop) để không bị đẩy khỏi top visible.

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** @deprecated — backdrop tap mặc định KHÔNG dismiss (user dễ lỡ tay trong form).
   * Đóng sheet qua tap handle bar ở top hoặc CTA bên trong. Prop giữ lại cho
   * backward compat nhưng effectively no-op. */
  dismissOnBackdrop?: boolean;
  heightPercent?: number;
};

export function BottomSheetModal({
  visible,
  onClose,
  children,
  heightPercent,
}: Props) {
  const { height: screenHeight } = useWindowDimensions();
  const { top: safeTop } = useSafeAreaInsets();
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e) => setKbHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener(hideEvent, () => setKbHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Available space cho sheet = screen - keyboard - safeTop - 10px breathing above status bar.
  // KAV đã đẩy sheet trên keyboard, nên chỉ cần cap height để sheet không overflow lên top.
  const availableForSheet = screenHeight - kbHeight - safeTop - 10;
  const fixedHeight = heightPercent
    ? Math.min(screenHeight * heightPercent, availableForSheet)
    : undefined;
  const autoMaxHeight = availableForSheet;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Backdrop = View thường (không Pressable) → tap vùng ngoài sheet không
            dismiss. User phải chủ động tap handle bar hoặc CTA trong content để
            đóng. An toàn hơn khi đang điền form dở. */}
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: semantic.surface.overlay }}
        >
          <Animated.View entering={SlideInDown.duration(280)} exiting={SlideOutDown.duration(220)}>
            {/* KHÔNG dùng Pressable hoặc onStartShouldSetResponder ở sheet wrapper —
                sẽ steal touch responder từ ScrollView bên trong, gây scroll stuck. */}
            <View
              className="bg-surface rounded-t-2xl overflow-hidden"
              style={{
                height: fixedHeight,
                maxHeight: fixedHeight ?? autoMaxHeight,
                shadowColor: palette.obsidian[900],
                shadowOpacity: 0.2,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: -4 },
                elevation: 12,
              }}
            >
              {/* Handle bar = Pressable → tap để đóng. Hit area nới rộng qua
                  padding top/bottom + hitSlop cho dễ chạm. */}
              <Pressable
                onPress={onClose}
                hitSlop={10}
                className="items-center pt-3 pb-2"
              >
                <View
                  style={{
                    width: 44,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: semantic.border.strong,
                  }}
                />
              </Pressable>
              {children}
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
