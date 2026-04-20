import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
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
import { extractLeadFromAudio, type ExtractedLead } from '@/lib/gemini';
import { useLeads, findProjectById } from '@/store/leads';
import { projects } from '@/mock/projects';
import type { Project } from '@/types/lead';
import { Button } from '@/components/Button';
import { Text } from '@/components/ui/Text';
import { palette, semantic, typography } from '@/theme';

type Phase = 'permission' | 'recording' | 'processing' | 'preview' | 'error';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreated: (leadId: string) => void;
};

const UNIT_TYPES = ['Studio', '1PN', '2PN', '3PN'] as const;

type FollowupPreset = { key: string; label: string; hours: number | null };
const FOLLOWUPS: FollowupPreset[] = [
  { key: 'none', label: 'Không đặt', hours: null },
  { key: '1h', label: 'Sau 1 giờ', hours: 1 },
  { key: '3h', label: 'Sau 3 giờ', hours: 3 },
  { key: 'tmr-am', label: 'Mai 9h sáng', hours: tomorrowHours(9) },
  { key: 'tmr-pm', label: 'Mai 15h', hours: tomorrowHours(15) },
  { key: 'nextweek', label: 'Tuần sau', hours: 24 * 7 },
];

function tomorrowHours(hour: number) {
  const now = new Date();
  const tmr = new Date(now);
  tmr.setDate(now.getDate() + 1);
  tmr.setHours(hour, 0, 0, 0);
  return (tmr.getTime() - now.getTime()) / 3600_000;
}

function formatDuration(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VoiceLeadModal({ visible, onClose, onCreated }: Props) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const createLead = useLeads((s) => s.createLead);

  const [phase, setPhase] = useState<Phase>('permission');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);

  const [extracted, setExtracted] = useState<ExtractedLead | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [units, setUnits] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [followupKey, setFollowupKey] = useState('none');

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
    transform: [{ scale: 1 + pulse.value * 0.18 }],
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
        setErrorMsg('Cần quyền ghi âm để tạo lead bằng voice. Vào Cài đặt → cấp quyền Microphone.');
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
      if (!uri) throw new Error('Không có file audio để xử lý');
      setPhase('processing');
      const result = await extractLeadFromAudio(uri);
      setExtracted(result);
      setFullName(result.fullName ?? '');
      setPhone(result.phone ?? '');
      const matched = findProjectById(result.projectId);
      setProject(matched ?? null);
      setUnits(result.unitTypeInterests);
      setNotes(result.notes ?? '');
      setFollowupKey('none');
      setPhase('preview');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Xử lý audio thất bại');
      setPhase('error');
    }
  }, [recorder, stopTimer]);

  const reset = useCallback(() => {
    stopTimer();
    setPhase('permission');
    setErrorMsg(null);
    setElapsedMs(0);
    setExtracted(null);
    setFullName('');
    setPhone('');
    setProject(null);
    setUnits([]);
    setNotes('');
    setFollowupKey('none');
  }, [stopTimer]);

  useEffect(() => {
    if (visible) {
      startRecording();
    } else {
      reset();
    }
    return () => stopTimer();
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    if (phase === 'recording') {
      recorder.stop().catch(() => {});
      stopTimer();
    }
    onClose();
  };

  const canSave = fullName.trim().length > 0 && /^0\d{9}$/.test(phone.trim()) && !!project;

  const handleSave = () => {
    if (!project) return;
    const followup = FOLLOWUPS.find((f) => f.key === followupKey);
    const nextFollowupAt =
      extracted?.followupHours != null && followupKey === 'none'
        ? new Date(Date.now() + extracted.followupHours * 3600_000).toISOString()
        : followup && followup.hours !== null
          ? new Date(Date.now() + followup.hours * 3600_000).toISOString()
          : undefined;

    const lead = createLead({
      fullName: fullName.trim(),
      phone: phone.trim(),
      primaryProject: project,
      source: 'OTHER',
      unitTypeInterests: units.length > 0 ? units : undefined,
      notes: notes.trim() || undefined,
      nextFollowupAt,
    });
    onCreated(lead.id);
    onClose();
  };

  const toggleUnit = (u: string) => {
    setUnits((prev) => (prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]));
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose} presentationStyle="pageSheet">
      <View className="flex-1 bg-surface">
        <View className="flex-row items-center justify-between px-4 pt-6 pb-3 border-b border-border-light">
          <View>
            <Text variant="h3" className="text-text-primary">
              {phase === 'preview' ? 'Xác nhận thông tin' : 'Tạo lead bằng voice'}
            </Text>
            <Text variant="caption" className="text-text-secondary mt-0.5">
              {phase === 'recording' && 'Nói tự nhiên — AI sẽ hiểu'}
              {phase === 'processing' && 'Đang phân tích...'}
              {phase === 'preview' && 'Chỉnh sửa nếu cần trước khi lưu'}
              {phase === 'error' && 'Có lỗi xảy ra'}
              {phase === 'permission' && 'Chuẩn bị microphone...'}
            </Text>
          </View>
          <Pressable
            onPress={handleClose}
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: semantic.surface.alt }}
          >
            <X size={18} color={semantic.text.primary} />
          </Pressable>
        </View>

        {(phase === 'permission' || phase === 'recording') && (
          <View className="flex-1 items-center justify-center px-6">
            <Animated.View
              style={[
                {
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  backgroundColor: semantic.action.primarySoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                pulseStyle,
              ]}
            >
              <View
                className="w-24 h-24 rounded-full items-center justify-center"
                style={{ backgroundColor: semantic.action.primary }}
              >
                <Mic size={40} color={palette.white} strokeWidth={2.2} />
              </View>
            </Animated.View>

            <Text
              variant="display"
              style={{
                color: semantic.text.primary,
                fontSize: 36,
                lineHeight: 44,
                marginTop: 32,
                fontFamily: 'BeVietnamPro_700Bold',
              }}
            >
              {formatDuration(elapsedMs)}
            </Text>
            <Text variant="body" className="text-text-secondary mt-2 text-center">
              {phase === 'recording'
                ? 'Ví dụ: "Khách tên Nam, số 0901234567, quan tâm Sky Garden 2PN, hẹn chiều mai"'
                : 'Cấp quyền microphone...'}
            </Text>
          </View>
        )}

        {phase === 'processing' && (
          <View className="flex-1 items-center justify-center px-6">
            <ActivityIndicator size="large" color={semantic.action.primary} />
            <Text variant="h3" className="text-text-primary mt-4">
              Đang xử lý
            </Text>
            <Text variant="body" className="text-text-secondary mt-1 text-center">
              Vài giây thôi, bạn nhé...
            </Text>
          </View>
        )}

        {phase === 'error' && (
          <View className="flex-1 items-center justify-center px-6">
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: semantic.urgency.bg }}
            >
              <AlertCircle size={32} color={semantic.urgency.fg} />
            </View>
            <Text variant="h3" className="text-text-primary mt-4 text-center">
              Không xử lý được
            </Text>
            <Text variant="body" className="text-text-secondary mt-2 text-center">
              {errorMsg ?? 'Lỗi không xác định'}
            </Text>
            <View className="w-full mt-6 gap-2">
              <Button label="Thử lại" variant="primary" fullWidth onPress={startRecording} />
              <Button label="Đóng" variant="secondary" fullWidth onPress={handleClose} />
            </View>
          </View>
        )}

        {phase === 'preview' && extracted && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1"
          >
            <ScrollView
              className="flex-1"
              contentContainerClassName="px-4 py-4 pb-28"
              keyboardShouldPersistTaps="handled"
            >
              {extracted.transcript && (
                <View
                  className="p-3 rounded-2xl mb-4"
                  style={{ backgroundColor: semantic.surface.alt }}
                >
                  <Text
                    variant="caption"
                    style={{ color: semantic.text.secondary, fontFamily: 'BeVietnamPro_600SemiBold', letterSpacing: 0.5 }}
                  >
                    BẠN VỪA NÓI
                  </Text>
                  <Text variant="body" className="text-text-primary mt-1" style={{ fontStyle: 'italic' }}>
                    "{extracted.transcript}"
                  </Text>
                </View>
              )}

              <FieldLabel text="Họ tên" required />
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nguyễn Văn A"
                placeholderTextColor={semantic.text.tertiary}
                style={inputStyle}
              />

              <FieldLabel text="Số điện thoại" required className="mt-4" />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="0901234567"
                placeholderTextColor={semantic.text.tertiary}
                keyboardType="phone-pad"
                style={inputStyle}
              />

              <FieldLabel text="Dự án quan tâm" required className="mt-4" />
              {extracted.projectHint && !project && (
                <Text variant="caption" className="text-status-warning mb-1">
                  AI gợi ý: "{extracted.projectHint}" — chọn dự án tương ứng bên dưới
                </Text>
              )}
              <View className="flex-row flex-wrap gap-2 mt-1">
                {projects.map((p) => {
                  const active = project?.id === p.id;
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => setProject(p)}
                      className="px-3 py-2 rounded-full"
                      style={{
                        backgroundColor: active ? semantic.action.primary : semantic.surface.alt,
                        borderWidth: 1,
                        borderColor: active ? semantic.action.primary : semantic.border.light,
                      }}
                    >
                      <Text
                        variant="body"
                        style={{
                          color: active ? palette.white : semantic.text.primary,
                          fontFamily: active ? 'BeVietnamPro_600SemiBold' : 'BeVietnamPro_400Regular',
                        }}
                      >
                        {p.shortName}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <FieldLabel text="Loại căn quan tâm" className="mt-4" />
              <View className="flex-row flex-wrap gap-2 mt-1">
                {UNIT_TYPES.map((u) => {
                  const active = units.includes(u);
                  const allowed = !project || project.unitTypes.includes(u);
                  return (
                    <Pressable
                      key={u}
                      onPress={() => allowed && toggleUnit(u)}
                      className="px-3 py-2 rounded-full"
                      style={{
                        backgroundColor: active ? semantic.action.primarySoft : semantic.surface.alt,
                        borderWidth: 1,
                        borderColor: active ? semantic.action.primary : semantic.border.light,
                        opacity: allowed ? 1 : 0.35,
                      }}
                    >
                      <Text
                        variant="body"
                        style={{
                          color: active ? semantic.action.primaryDeep : semantic.text.primary,
                          fontFamily: active ? 'BeVietnamPro_600SemiBold' : 'BeVietnamPro_400Regular',
                        }}
                      >
                        {u}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <FieldLabel text="Follow up tiếp" className="mt-4" />
              {extracted.followupHours != null && (
                <Text variant="caption" className="text-status-info mb-1">
                  AI đặt mặc định: {Math.round(extracted.followupHours)} giờ nữa
                </Text>
              )}
              <View className="flex-row flex-wrap gap-2 mt-1">
                {FOLLOWUPS.map((f) => {
                  const active = followupKey === f.key;
                  return (
                    <Pressable
                      key={f.key}
                      onPress={() => setFollowupKey(f.key)}
                      className="px-3 py-2 rounded-full"
                      style={{
                        backgroundColor: active ? semantic.surface.dark : semantic.surface.alt,
                        borderWidth: 1,
                        borderColor: active ? semantic.surface.dark : semantic.border.light,
                      }}
                    >
                      <Text
                        variant="body"
                        style={{
                          color: active ? palette.white : semantic.text.primary,
                          fontFamily: active ? 'BeVietnamPro_600SemiBold' : 'BeVietnamPro_400Regular',
                        }}
                      >
                        {f.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <FieldLabel text="Ghi chú" className="mt-4" />
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Nhu cầu, gia cảnh, thu nhập..."
                placeholderTextColor={semantic.text.tertiary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={[inputStyle, { minHeight: 84 }]}
              />
            </ScrollView>

            <View
              className="px-4 pt-3 pb-6 border-t border-border-light"
              style={{ backgroundColor: semantic.surface.card }}
            >
              <Button
                label="Lưu lead"
                variant="primary"
                fullWidth
                disabled={!canSave}
                onPress={handleSave}
              />
            </View>
          </KeyboardAvoidingView>
        )}

        {phase === 'recording' && (
          <View className="px-6 pb-8 pt-4 border-t border-border-light" style={{ backgroundColor: semantic.surface.card }}>
            <Pressable
              onPress={stopAndProcess}
              className="w-full h-14 rounded-2xl flex-row items-center justify-center gap-2"
              style={{ backgroundColor: semantic.surface.dark }}
            >
              <Square size={20} color={palette.white} fill={palette.white} />
              <Text variant="button" style={{ color: palette.white, fontFamily: 'BeVietnamPro_600SemiBold' }}>
                Dừng và phân tích
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

const inputStyle = {
  ...typography['body-lg'],
  color: semantic.text.primary,
  borderWidth: 1,
  borderColor: semantic.border.default,
  borderRadius: 12,
  padding: 12,
  marginTop: 6,
  backgroundColor: semantic.surface.alt,
};

function FieldLabel({
  text,
  required,
  className = '',
}: {
  text: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <View className={`flex-row items-center gap-1 ${className}`}>
      <Text
        variant="caption"
        style={{ color: semantic.text.secondary, fontFamily: 'BeVietnamPro_600SemiBold', letterSpacing: 0.5 }}
      >
        {text.toUpperCase()}
      </Text>
      {required && (
        <Text variant="caption" style={{ color: semantic.urgency.fg }}>
          *
        </Text>
      )}
    </View>
  );
}
