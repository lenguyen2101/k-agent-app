import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { BottomSheetModal } from '@/components/BottomSheetModal';
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
import {
  AlertCircle,
  CalendarClock,
  CircleCheck,
  Handshake,
  Mic,
  PhoneCall,
  RotateCcw,
  Sparkles,
  Square,
  StickyNote,
} from 'lucide-react-native';
import { extractTaskFromAudio, type ExtractedTask } from '@/lib/gemini';
import { matchLeadFromHint, type LeadMatchResult } from '@/lib/leadMatch';
import { useLeads } from '@/store/leads';
import { StatusBadge } from '@/components/StatusBadge';
import { Text } from '@/components/ui/Text';
import { formatPhone } from '@/lib/format';
import { statusToGroup, type Lead } from '@/types/lead';
import { palette, semantic } from '@/theme';

// Voice-to-todo: sale dictate task ("gọi anh Bình trưa nay 11h") → AI parse
// + match lead → confirm + save. Fallback disambiguation khi hint match nhiều
// lead cùng tên.

type Phase = 'recording' | 'processing' | 'result' | 'error';

type Props = {
  visible: boolean;
  onClose: () => void;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDuration(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatScheduledVN(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400_000);

  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const timeStr = `${hh}:${mm}`;

  if (diffDays === 0) return `Hôm nay ${timeStr}`;
  if (diffDays === 1) return `Ngày mai ${timeStr}`;
  if (diffDays === -1) return `Hôm qua ${timeStr}`;

  const weekdayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const wd = weekdayNames[d.getDay()];
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  return `${wd} ${dd}/${mo} · ${timeStr}`;
}

export function VoiceTodoSheet({ visible, onClose }: Props) {
  const recorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);
  const leads = useLeads((s) => s.leads);
  const addActivity = useLeads((s) => s.addActivity);

  const [phase, setPhase] = useState<Phase>('recording');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);

  const [extracted, setExtracted] = useState<ExtractedTask | null>(null);
  const [matchResult, setMatchResult] = useState<LeadMatchResult | null>(null);
  // Nếu multi-match, user pick 1 lead → store ở đây để switch sang confirm card
  const [pickedLead, setPickedLead] = useState<Lead | null>(null);

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
    // Switch UI sang "Đang xử lý" NGAY khi user tap stop (trước khi await
    // recorder.stop() finalize file ~500ms). User cảm thấy response nhanh hơn.
    setPhase('processing');
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) throw new Error('Không có file audio để xử lý');

      const leadHints = leads.map((l) => ({
        id: l.id,
        fullName: l.fullName,
        phone: l.phone,
        projectShortName: l.primaryProject.shortName,
      }));
      const result = await extractTaskFromAudio(uri, leadHints);
      setExtracted(result);

      const match = matchLeadFromHint(leads, result.leadHint, result.leadId);
      setMatchResult(match);
      setPickedLead(null);
      setPhase('result');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Xử lý audio thất bại');
      setPhase('error');
    }
  }, [recorder, stopTimer, leads]);

  const reset = useCallback(() => {
    stopTimer();
    setPhase('recording');
    setErrorMsg(null);
    setElapsedMs(0);
    setExtracted(null);
    setMatchResult(null);
    setPickedLead(null);
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

  // Lead cuối cùng được chọn để save — ưu tiên pickedLead (user picked từ
  // disambiguation) → fallback single match từ matchResult.
  const confirmedLead = useMemo(() => {
    if (pickedLead) return pickedLead;
    if (matchResult?.kind === 'single') return matchResult.lead;
    return null;
  }, [pickedLead, matchResult]);

  const handleSave = () => {
    if (!confirmedLead || !extracted) return;
    const activityType =
      extracted.action === 'MEETING'
        ? 'MEETING'
        : extracted.action === 'NOTE'
        ? 'NOTE'
        : 'FOLLOWUP_SCHEDULED';
    const content =
      extracted.notes?.trim() ||
      extracted.transcript.trim() ||
      'Task tạo bằng voice';
    addActivity({
      leadId: confirmedLead.id,
      type: activityType,
      content,
      // Nếu có scheduledAt → set nextFollowupAt trên lead (Calendar sẽ pick up)
      nextFollowupAt: extracted.scheduledAt ?? undefined,
    });
    onClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={handleClose} heightPercent={0.88}>
      <View className="px-5 pt-1 pb-2 pr-14">
        <View className="flex-row items-center gap-1.5">
          <Sparkles size={14} color={semantic.action.primary} strokeWidth={2.4} />
          <Text
            variant="caption"
            style={{
              color: semantic.action.primaryDeep,
              fontFamily: 'BeVietnamPro_700Bold',
              letterSpacing: 0.5,
              fontSize: 11,
            }}
          >
            VOICE TASK
          </Text>
        </View>
        <Text variant="h3" className="text-text-primary mt-0.5">
          {phase === 'recording'
            ? 'Đang nghe...'
            : phase === 'processing'
            ? 'Đang xử lý'
            : phase === 'error'
            ? 'Có lỗi'
            : 'Xác nhận task'}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
      >
        {phase === 'recording' && (
          <RecordingView elapsedMs={elapsedMs} onStop={stopAndProcess} />
        )}

        {phase === 'processing' && <ProcessingView />}

        {phase === 'error' && (
          <ErrorView message={errorMsg ?? 'Đã có lỗi xảy ra'} onRetry={startRecording} />
        )}

        {phase === 'result' && extracted && matchResult && (
          <ResultView
            extracted={extracted}
            matchResult={matchResult}
            confirmedLead={confirmedLead}
            onPickLead={setPickedLead}
            onRetry={() => {
              reset();
              startRecording();
            }}
            onSave={handleSave}
          />
        )}
      </ScrollView>
    </BottomSheetModal>
  );
}

// --- Phase views ---

function RecordingView({
  elapsedMs,
  onStop,
}: {
  elapsedMs: number;
  onStop: () => void;
}) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.2 }],
    opacity: 1 - pulse.value * 0.25,
  }));

  return (
    <View className="items-center py-4">
      {/* Pulsing mic button */}
      <View className="items-center justify-center my-6">
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: semantic.action.primarySoft,
            },
            pulseStyle,
          ]}
        />
        <View
          className="w-24 h-24 rounded-full items-center justify-center"
          style={{
            backgroundColor: semantic.action.primary,
            shadowColor: semantic.action.primaryDeep,
            shadowOpacity: 0.3,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }}
        >
          <Mic size={36} color={palette.white} strokeWidth={2.2} />
        </View>
      </View>

      <Text
        variant="body"
        style={{
          color: semantic.text.primary,
          fontFamily: 'BeVietnamPro_600SemiBold',
          fontSize: 15,
          marginBottom: 4,
        }}
      >
        {formatDuration(elapsedMs)}
      </Text>
      <Text variant="caption" className="text-text-secondary text-center" style={{ maxWidth: 280 }}>
        Ví dụ: "Gọi anh Bình trưa nay 11 giờ" · "Hẹn chị Linh xem nhà thứ 7 sáng"
      </Text>

      <Pressable
        onPress={onStop}
        className="mt-8 h-12 px-6 rounded-xl flex-row items-center justify-center gap-2"
        style={{ backgroundColor: semantic.text.primary }}
      >
        <Square size={16} color={palette.white} fill={palette.white} />
        <Text
          variant="body"
          style={{ color: palette.white, fontFamily: 'BeVietnamPro_700Bold' }}
        >
          Dừng & xử lý
        </Text>
      </Pressable>
    </View>
  );
}

function ProcessingView() {
  return (
    <View className="items-center py-16">
      <ActivityIndicator size="large" color={semantic.action.primary} />
      <Text
        variant="body"
        style={{
          color: semantic.text.primary,
          fontFamily: 'BeVietnamPro_600SemiBold',
          marginTop: 14,
        }}
      >
        AI đang xử lý...
      </Text>
      <Text variant="caption" className="text-text-secondary mt-1">
        Phân tích task + tìm lead phù hợp
      </Text>
    </View>
  );
}

function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View className="items-center py-10">
      <View
        className="w-16 h-16 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: palette.red[50] }}
      >
        <AlertCircle size={28} color={palette.red[600]} strokeWidth={2} />
      </View>
      <Text
        variant="body"
        style={{
          color: semantic.text.primary,
          fontFamily: 'BeVietnamPro_700Bold',
          textAlign: 'center',
          marginBottom: 4,
        }}
      >
        Không xử lý được
      </Text>
      <Text
        variant="caption"
        className="text-text-secondary text-center"
        style={{ maxWidth: 280, lineHeight: 18 }}
      >
        {message}
      </Text>
      <Pressable
        onPress={onRetry}
        className="mt-5 h-11 px-5 rounded-xl flex-row items-center justify-center gap-2"
        style={{ backgroundColor: semantic.action.primary }}
      >
        <RotateCcw size={15} color={palette.white} strokeWidth={2.4} />
        <Text
          variant="body"
          style={{ color: palette.white, fontFamily: 'BeVietnamPro_700Bold' }}
        >
          Thử lại
        </Text>
      </Pressable>
    </View>
  );
}

function ResultView({
  extracted,
  matchResult,
  confirmedLead,
  onPickLead,
  onRetry,
  onSave,
}: {
  extracted: ExtractedTask;
  matchResult: LeadMatchResult;
  confirmedLead: Lead | null;
  onPickLead: (lead: Lead) => void;
  onRetry: () => void;
  onSave: () => void;
}) {
  // Case 1: confirm card (single match OR user đã pick từ multiple)
  if (confirmedLead) {
    return (
      <ConfirmCard
        lead={confirmedLead}
        extracted={extracted}
        onRetry={onRetry}
        onSave={onSave}
      />
    );
  }

  // Case 2: multiple matches — show disambiguation
  if (matchResult.kind === 'multiple') {
    return (
      <DisambiguationView
        candidates={matchResult.candidates}
        hint={matchResult.hint}
        transcript={extracted.transcript}
        onPick={onPickLead}
        onRetry={onRetry}
      />
    );
  }

  // Case 3: no match
  return (
    <NoMatchView
      hint={matchResult.hint}
      transcript={extracted.transcript}
      onRetry={onRetry}
    />
  );
}

function ConfirmCard({
  lead,
  extracted,
  onRetry,
  onSave,
}: {
  lead: Lead;
  extracted: ExtractedTask;
  onRetry: () => void;
  onSave: () => void;
}) {
  const isMeeting = extracted.action === 'MEETING';
  const isNote = extracted.action === 'NOTE';
  const actionLabel = isMeeting ? 'Xem nhà' : isNote ? 'Ghi chú' : 'Gọi chăm';
  const ActionIcon = isMeeting ? Handshake : isNote ? StickyNote : PhoneCall;
  const actionBg = isMeeting
    ? palette.blue[50]
    : isNote
    ? palette.slate[100]
    : palette.sienna[50];
  const actionFg = isMeeting
    ? palette.blue[700]
    : isNote
    ? palette.slate[700]
    : palette.sienna[700];
  const tint = semantic.leadGroup[statusToGroup[lead.status]];

  return (
    <View className="pt-2 pb-2">
      {/* Transcript — nho nhỏ ở top để user review */}
      <View
        className="p-3 rounded-xl"
        style={{
          backgroundColor: semantic.surface.alt,
          borderWidth: 1,
          borderColor: semantic.border.light,
        }}
      >
        <Text
          variant="caption"
          style={{
            color: semantic.text.tertiary,
            fontFamily: 'BeVietnamPro_600SemiBold',
            letterSpacing: 0.4,
            fontSize: 10,
          }}
        >
          BẠN VỪA NÓI
        </Text>
        <Text
          variant="body"
          style={{
            color: semantic.text.secondary,
            fontSize: 13,
            lineHeight: 19,
            marginTop: 4,
            fontStyle: 'italic',
          }}
        >
          "{extracted.transcript}"
        </Text>
      </View>

      {/* Lead card */}
      <View
        className="mt-4 p-4 rounded-2xl flex-row items-center gap-3"
        style={{
          backgroundColor: palette.white,
          borderWidth: 1,
          borderColor: semantic.border.light,
        }}
      >
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: tint.bg }}
        >
          <Text
            style={{
              color: tint.fg,
              fontFamily: 'BeVietnamPro_700Bold',
              fontSize: 15,
            }}
          >
            {initials(lead.fullName)}
          </Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              style={{
                color: semantic.text.primary,
                fontFamily: 'BeVietnamPro_700Bold',
                fontSize: 15,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {lead.fullName}
            </Text>
            <StatusBadge status={lead.status} />
          </View>
          <Text variant="caption" className="text-text-secondary mt-0.5" numberOfLines={1}>
            {formatPhone(lead.phone)} · {lead.primaryProject.shortName}
          </Text>
        </View>
      </View>

      {/* Task summary */}
      <View className="mt-3 gap-2">
        <View
          className="p-3 rounded-xl flex-row items-center gap-3"
          style={{
            backgroundColor: actionBg,
            borderWidth: 1,
            borderColor: semantic.border.light,
          }}
        >
          <View
            className="w-9 h-9 rounded-xl items-center justify-center"
            style={{ backgroundColor: palette.white }}
          >
            <ActionIcon size={16} color={actionFg} strokeWidth={2.4} />
          </View>
          <View className="flex-1">
            <Text
              variant="caption"
              style={{
                color: actionFg,
                fontFamily: 'BeVietnamPro_700Bold',
                fontSize: 10,
                letterSpacing: 0.4,
              }}
            >
              LOẠI TASK
            </Text>
            <Text
              style={{
                color: semantic.text.primary,
                fontFamily: 'BeVietnamPro_700Bold',
                fontSize: 14,
              }}
            >
              {actionLabel}
            </Text>
          </View>
        </View>

        {extracted.scheduledAt && (
          <View
            className="p-3 rounded-xl flex-row items-center gap-3"
            style={{
              backgroundColor: palette.emerald[50],
              borderWidth: 1,
              borderColor: palette.emerald[100],
            }}
          >
            <View
              className="w-9 h-9 rounded-xl items-center justify-center"
              style={{ backgroundColor: palette.white }}
            >
              <CalendarClock size={16} color={palette.emerald[700]} strokeWidth={2.4} />
            </View>
            <View className="flex-1">
              <Text
                variant="caption"
                style={{
                  color: palette.emerald[700],
                  fontFamily: 'BeVietnamPro_700Bold',
                  fontSize: 10,
                  letterSpacing: 0.4,
                }}
              >
                LÚC
              </Text>
              <Text
                style={{
                  color: semantic.text.primary,
                  fontFamily: 'BeVietnamPro_700Bold',
                  fontSize: 14,
                }}
              >
                {formatScheduledVN(extracted.scheduledAt)}
              </Text>
            </View>
          </View>
        )}

        {extracted.notes && (
          <View
            className="p-3 rounded-xl"
            style={{
              backgroundColor: palette.white,
              borderWidth: 1,
              borderColor: semantic.border.light,
            }}
          >
            <Text
              variant="caption"
              style={{
                color: semantic.text.tertiary,
                fontFamily: 'BeVietnamPro_700Bold',
                fontSize: 10,
                letterSpacing: 0.4,
              }}
            >
              NỘI DUNG
            </Text>
            <Text
              variant="body"
              style={{
                color: semantic.text.primary,
                fontSize: 13,
                lineHeight: 18,
                marginTop: 3,
              }}
            >
              {extracted.notes}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View className="flex-row gap-2 mt-5">
        <Pressable
          onPress={onRetry}
          className="flex-1 h-12 rounded-xl flex-row items-center justify-center gap-2 border"
          style={{
            backgroundColor: palette.white,
            borderColor: semantic.border.default,
          }}
        >
          <RotateCcw size={15} color={semantic.text.secondary} strokeWidth={2.2} />
          <Text
            variant="body"
            style={{
              color: semantic.text.primary,
              fontFamily: 'BeVietnamPro_600SemiBold',
            }}
          >
            Thử lại
          </Text>
        </Pressable>
        <Pressable
          onPress={onSave}
          className="flex-[1.4] h-12 rounded-xl flex-row items-center justify-center gap-2"
          style={{
            backgroundColor: semantic.action.primary,
            shadowColor: semantic.action.primaryDeep,
            shadowOpacity: 0.25,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        >
          <CircleCheck size={16} color={palette.white} strokeWidth={2.4} />
          <Text
            variant="body"
            style={{ color: palette.white, fontFamily: 'BeVietnamPro_700Bold' }}
          >
            Lưu vào lead
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function DisambiguationView({
  candidates,
  hint,
  transcript,
  onPick,
  onRetry,
}: {
  candidates: Lead[];
  hint: string;
  transcript: string;
  onPick: (lead: Lead) => void;
  onRetry: () => void;
}) {
  return (
    <View className="pt-2">
      <View
        className="p-3 rounded-xl"
        style={{
          backgroundColor: semantic.action.primarySoft,
          borderWidth: 1,
          borderColor: palette.sienna[100],
        }}
      >
        <Text
          variant="body"
          style={{
            color: semantic.action.primaryDeep,
            fontFamily: 'BeVietnamPro_700Bold',
            fontSize: 14,
          }}
        >
          Bạn đang nói về "{hint}" nào?
        </Text>
        <Text variant="caption" className="text-text-secondary mt-1" numberOfLines={2}>
          "{transcript}"
        </Text>
      </View>

      <View className="mt-3 gap-2">
        {candidates.map((lead) => {
          const tint = semantic.leadGroup[statusToGroup[lead.status]];
          return (
            <Pressable
              key={lead.id}
              onPress={() => onPick(lead)}
              className="p-3 rounded-2xl flex-row items-center gap-3"
              style={{
                backgroundColor: palette.white,
                borderWidth: 1,
                borderColor: semantic.border.light,
              }}
            >
              <View
                className="w-11 h-11 rounded-full items-center justify-center"
                style={{ backgroundColor: tint.bg }}
              >
                <Text
                  style={{
                    color: tint.fg,
                    fontFamily: 'BeVietnamPro_700Bold',
                    fontSize: 14,
                  }}
                >
                  {initials(lead.fullName)}
                </Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text
                    style={{
                      color: semantic.text.primary,
                      fontFamily: 'BeVietnamPro_700Bold',
                      fontSize: 14,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {lead.fullName}
                  </Text>
                  <StatusBadge status={lead.status} />
                </View>
                <Text
                  variant="caption"
                  className="text-text-secondary mt-0.5"
                  numberOfLines={1}
                >
                  {formatPhone(lead.phone)} · {lead.primaryProject.shortName}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={onRetry}
        className="mt-4 h-11 rounded-xl flex-row items-center justify-center gap-2 border"
        style={{
          backgroundColor: palette.white,
          borderColor: semantic.border.default,
        }}
      >
        <RotateCcw size={15} color={semantic.text.secondary} strokeWidth={2.2} />
        <Text
          variant="body"
          style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_600SemiBold' }}
        >
          Thử lại
        </Text>
      </Pressable>
    </View>
  );
}

function NoMatchView({
  hint,
  transcript,
  onRetry,
}: {
  hint: string;
  transcript: string;
  onRetry: () => void;
}) {
  return (
    <View className="items-center py-6">
      <View
        className="w-16 h-16 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: palette.sienna[50] }}
      >
        <AlertCircle size={28} color={semantic.action.primaryDeep} strokeWidth={2} />
      </View>
      <Text
        variant="body"
        style={{
          color: semantic.text.primary,
          fontFamily: 'BeVietnamPro_700Bold',
          fontSize: 15,
          textAlign: 'center',
          marginBottom: 6,
        }}
      >
        {hint
          ? `Không tìm thấy lead "${hint}"`
          : 'Chưa xác định được lead nào'}
      </Text>
      <Text
        variant="caption"
        className="text-text-secondary text-center"
        style={{ maxWidth: 300, lineHeight: 18 }}
      >
        {transcript ? `"${transcript}"` : 'Thử nói lại với tên khách rõ ràng hơn, ví dụ "Gọi anh Bình dự án Sky Garden sáng mai 9h".'}
      </Text>

      <Pressable
        onPress={onRetry}
        className="mt-5 h-11 px-5 rounded-xl flex-row items-center justify-center gap-2"
        style={{ backgroundColor: semantic.action.primary }}
      >
        <RotateCcw size={15} color={palette.white} strokeWidth={2.4} />
        <Text
          variant="body"
          style={{ color: palette.white, fontFamily: 'BeVietnamPro_700Bold' }}
        >
          Nói lại
        </Text>
      </Pressable>
    </View>
  );
}
