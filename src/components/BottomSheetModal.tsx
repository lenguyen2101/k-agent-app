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
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { X } from 'lucide-react-native';
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
  /** Fires khi exit animation hoàn tất + Modal unmount. Dùng để serialize
   * mở Modal kế tiếp — tránh stack 2 Modal native (iOS chỉ 1 UIViewController
   * present tại một lúc, stack gây freeze). */
  onClosed?: () => void;
};

// Exit animation duration — match với Reanimated SlideOutDown để Modal không
// unmount sớm trước khi sheet slide xuống xong.
const EXIT_DURATION_MS = 260;

export function BottomSheetModal({
  visible,
  onClose,
  children,
  heightPercent,
  onClosed,
}: Props) {
  const { height: screenHeight } = useWindowDimensions();
  const { top: safeTop } = useSafeAreaInsets();
  const [kbHeight, setKbHeight] = useState(0);

  // Delayed unmount — khi visible=false, giữ Modal mounted đủ lâu để Reanimated
  // SlideOutDown chạy xong. Nếu unmount ngay → exit animation bị cut. Khi
  // unmount xong fire onClosed để parent serialize action kế tiếp.
  const [mounted, setMounted] = useState(visible);
  useEffect(() => {
    if (visible) {
      setMounted(true);
    } else if (mounted) {
      const t = setTimeout(() => {
        setMounted(false);
        onClosed?.();
      }, EXIT_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [visible, mounted, onClosed]);

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
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Backdrop fade + sheet slide điều khiển hoàn toàn bằng Reanimated.
            Modal animationType="none" để RN không can thiệp. `visible && ...`
            trigger Animated.View unmount → exit animation chạy. Modal giữ
            mounted thêm EXIT_DURATION_MS trước khi thật sự tháo khỏi tree. */}
        {visible && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(EXIT_DURATION_MS)}
            className="flex-1 justify-end"
            style={{ backgroundColor: semantic.surface.overlay }}
          >
            <Animated.View
              entering={SlideInDown.duration(280)}
              exiting={SlideOutDown.duration(EXIT_DURATION_MS)}
            >
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
              {/* Top chrome — handle bar center + X button absolute right.
                  Both tap → close. User có 2 affordance rõ ràng: drag handle
                  bar (iOS native feel) + X button (explicit close). */}
              <View className="pt-3 pb-2">
                <Pressable
                  onPress={onClose}
                  hitSlop={10}
                  className="items-center"
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
                <Pressable
                  onPress={onClose}
                  hitSlop={8}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: 10,
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: semantic.surface.alt,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={15} color={semantic.text.secondary} strokeWidth={2.4} />
                </Pressable>
              </View>
              {children}
            </View>
            </Animated.View>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}
