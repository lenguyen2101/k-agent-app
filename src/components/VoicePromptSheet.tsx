import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, View } from 'react-native';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { AlertCircle, Mic, Square, X } from 'lucide-react-native';
import { transcribeAudio } from '@/lib/gemini';
import { Text } from '@/components/ui/Text';
import { palette, semantic } from '@/theme';

type Phase = 'idle' | 'recording' | 'processing' | 'error';

type Props = {
  visible: boolean;
  onClose: () => void;
  onTranscript: (text: string) => void;
  title?: string;
  hint?: string;
};

function formatDuration(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Lightweight voice-to-text modal. Dùng chung cho mọi nơi cần voice input
// (chat prompt, lead notes, activity content...). Record → Gemini transcribe → callback.
export function VoicePromptSheet({
  visible,
  onClose,
  onTranscript,
  title = 'Nói câu hỏi của bạn',
  hint = 'AI sẽ chuyển giọng nói thành text tự động',
}: Props) {
  // LOW_QUALITY preset cho voice-to-text — file nhỏ (~32kbps vs ~128kbps) →
  // upload nhanh hơn, Gemini vẫn transcribe tốt kể cả audio nén.
  const recorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);
  const [phase, setPhase] = useState<Phase>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);

  const pulse = useSharedValue(0);

  useEffect(() => {
    if (phase === 'recording') {
      pulse.value = withRepeat(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulse.value = withTiming(0, { duration: 200 });
    }
  }, [phase, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.2 }],
    opacity: 1 - pulse.value * 0.3,
  }));

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    setErrorMsg(null);
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setErrorMsg('Cần quyền ghi âm. Vào Cài đặt → cấp quyền Microphone.');
        setPhase('error');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      startedAtRef.current = Date.now();
      setElapsedMs(0);
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startedAtRef.current);
      }, 200);
      setPhase('recording');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Không bắt đầu được ghi âm');
      setPhase('error');
    }
  }, [recorder]);

  const stopAndProcess = useCallback(async () => {
    stopTimer();
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) throw new Error('Không có file audio');
      setPhase('processing');
      const text = await transcribeAudio(uri);
      if (!text.trim()) {
        throw new Error('Không nghe rõ giọng, thử lại');
      }
      onTranscript(text.trim());
      onClose();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Xử lý audio thất bại');
      setPhase('error');
    }
  }, [recorder, stopTimer, onTranscript, onClose]);

  const handleClose = useCallback(() => {
    if (phase === 'recording') {
      recorder.stop().catch(() => {});
      stopTimer();
    }
    setPhase('idle');
    setErrorMsg(null);
    setElapsedMs(0);
    onClose();
  }, [phase, recorder, stopTimer, onClose]);

  // Auto start khi mở sheet.
  useEffect(() => {
    if (visible) {
      startRecording();
    } else {
      stopTimer();
      setPhase('idle');
    }
    return () => stopTimer();
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: semantic.surface.overlay }}
      >
        <View
          className="w-full max-w-md p-6 rounded-3xl"
          style={{
            backgroundColor: palette.white,
            shadowColor: palette.obsidian[900],
            shadowOpacity: 0.3,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 12 },
            elevation: 12,
          }}
        >
          {/* Close */}
          <Pressable
            onPress={handleClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full items-center justify-center z-10"
            style={{ backgroundColor: semantic.surface.alt }}
            hitSlop={8}
          >
            <X size={18} color={semantic.text.primary} />
          </Pressable>

          <View className="items-center pt-2">
            <Text variant="h3" className="text-text-primary text-center">
              {title}
            </Text>
            <Text variant="caption" className="text-text-secondary text-center mt-1">
              {hint}
            </Text>
          </View>

          {/* Visual */}
          <View className="items-center py-8">
            {phase === 'recording' && (
              <>
                <Animated.View
                  style={[
                    {
                      width: 120,
                      height: 120,
                      borderRadius: 60,
                      backgroundColor: semantic.action.primarySoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                    pulseStyle,
                  ]}
                >
                  <View
                    className="w-20 h-20 rounded-full items-center justify-center"
                    style={{ backgroundColor: semantic.action.primary }}
                  >
                    <Mic size={36} color={palette.white} strokeWidth={2.2} />
                  </View>
                </Animated.View>
                <Text
                  variant="h2"
                  style={{
                    color: semantic.action.primaryDeep,
                    fontFamily: 'BeVietnamPro_700Bold',
                    marginTop: 16,
                  }}
                >
                  {formatDuration(elapsedMs)}
                </Text>
                <Text variant="caption" className="text-text-secondary mt-1">
                  Đang nghe...
                </Text>
              </>
            )}

            {phase === 'processing' && (
              <>
                <View
                  className="w-28 h-28 rounded-full items-center justify-center"
                  style={{ backgroundColor: semantic.action.primarySoft }}
                >
                  <ActivityIndicator size="large" color={semantic.action.primary} />
                </View>
                <Text
                  variant="body"
                  className="text-text-primary mt-4"
                  style={{ fontFamily: 'BeVietnamPro_600SemiBold' }}
                >
                  AI đang nghe...
                </Text>
                <Text variant="caption" className="text-text-secondary mt-1">
                  Thường 2-3 giây
                </Text>
              </>
            )}

            {phase === 'error' && (
              <>
                <View
                  className="w-28 h-28 rounded-full items-center justify-center"
                  style={{ backgroundColor: palette.red[50] }}
                >
                  <AlertCircle size={36} color={palette.red[600]} strokeWidth={2} />
                </View>
                <Text variant="body" className="text-text-primary mt-4 text-center" style={{ fontFamily: 'BeVietnamPro_600SemiBold' }}>
                  {errorMsg ?? 'Có lỗi xảy ra'}
                </Text>
              </>
            )}

            {phase === 'idle' && (
              <View className="w-28 h-28 rounded-full items-center justify-center" style={{ backgroundColor: semantic.surface.alt }}>
                <Mic size={36} color={semantic.text.tertiary} />
              </View>
            )}
          </View>

          {/* Actions */}
          {phase === 'recording' && (
            <Pressable
              onPress={stopAndProcess}
              className="h-12 rounded-xl flex-row items-center justify-center gap-2"
              style={{
                backgroundColor: semantic.text.primary,
              }}
            >
              <Square size={14} color={palette.white} fill={palette.white} />
              <Text variant="body" style={{ color: palette.white, fontFamily: 'BeVietnamPro_700Bold' }}>
                Dừng & chuyển text
              </Text>
            </Pressable>
          )}

          {phase === 'error' && (
            <Pressable
              onPress={startRecording}
              className="h-12 rounded-xl items-center justify-center"
              style={{ backgroundColor: semantic.action.primary }}
            >
              <Text variant="body" style={{ color: palette.white, fontFamily: 'BeVietnamPro_700Bold' }}>
                Thử lại
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}
