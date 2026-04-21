import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Building2,
  Calendar,
  MessageCircle,
  MessageSquare,
  Phone,
  StickyNote,
  type LucideIcon,
} from 'lucide-react-native';
import type { ActivityOutcome, ActivityType } from '@/types/lead';
import { Text } from '@/components/ui/Text';
import { palette, semantic, typography } from '@/theme';

export type ActivityFormValue = {
  type: ActivityType;
  content?: string;
  outcome?: ActivityOutcome;
  nextFollowupAt?: string;
};

type Props = {
  onSubmit: (value: ActivityFormValue) => void;
  submitLabel?: string;
  /** "sheet" = no safe-area bottom (BottomSheet xử lý); "screen" = add insets.bottom */
  chrome?: 'sheet' | 'screen';
  /** onCancel chỉ hiển thị ở sheet */
  onCancel?: () => void;
};

const TYPES: { key: ActivityType; label: string; icon: LucideIcon }[] = [
  { key: 'CALL', label: 'Gọi', icon: Phone },
  { key: 'SMS', label: 'SMS', icon: MessageCircle },
  { key: 'ZALO_MESSAGE', label: 'Zalo', icon: MessageSquare },
  { key: 'MEETING', label: 'Gặp', icon: Building2 },
  { key: 'NOTE', label: 'Ghi chú', icon: StickyNote },
];

const OUTCOMES: { key: ActivityOutcome; label: string }[] = [
  { key: 'REACHED', label: 'Liên lạc được' },
  { key: 'INTERESTED', label: 'Quan tâm' },
  { key: 'CALLBACK_LATER', label: 'Hẹn gọi lại' },
  { key: 'NO_ANSWER', label: 'Không bắt máy' },
  { key: 'NOT_INTERESTED', label: 'Không quan tâm' },
  { key: 'WRONG_NUMBER', label: 'Số sai' },
];

type FollowupPreset = { key: string; label: string; hoursFromNow: number | null };

const FOLLOWUPS: FollowupPreset[] = [
  { key: 'none', label: 'Không đặt', hoursFromNow: null },
  { key: '1h', label: 'Sau 1 giờ', hoursFromNow: 1 },
  { key: '3h', label: 'Sau 3 giờ', hoursFromNow: 3 },
  { key: 'tmr-am', label: 'Mai 9h sáng', hoursFromNow: tomorrowHours(9) },
  { key: 'tmr-pm', label: 'Mai 15h', hoursFromNow: tomorrowHours(15) },
  { key: 'nextweek', label: 'Tuần sau', hoursFromNow: 24 * 7 },
];

function tomorrowHours(hour: number) {
  const now = new Date();
  const tmr = new Date(now);
  tmr.setDate(now.getDate() + 1);
  tmr.setHours(hour, 0, 0, 0);
  return (tmr.getTime() - now.getTime()) / 3600_000;
}

export function ActivityForm({
  onSubmit,
  submitLabel = 'Lưu hoạt động',
  chrome = 'screen',
  onCancel,
}: Props) {
  const insets = useSafeAreaInsets();
  const [type, setType] = useState<ActivityType>('CALL');
  const [content, setContent] = useState('');
  const [outcome, setOutcome] = useState<ActivityOutcome | null>(null);
  const [followupKey, setFollowupKey] = useState<string>('none');

  const canSave = useMemo(() => {
    if (type === 'CALL') return outcome !== null;
    return content.trim().length > 0;
  }, [type, outcome, content]);

  const handleSubmit = () => {
    if (!canSave) return;
    const preset = FOLLOWUPS.find((f) => f.key === followupKey);
    const nextFollowupAt =
      preset && preset.hoursFromNow !== null
        ? new Date(Date.now() + preset.hoursFromNow * 3600_000).toISOString()
        : undefined;
    onSubmit({
      type,
      content: content.trim() || undefined,
      outcome: type === 'CALL' ? outcome ?? undefined : undefined,
      nextFollowupAt,
    });
  };

  const stickyBottom =
    chrome === 'screen' ? (insets.bottom > 0 ? insets.bottom : 12) : 28;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <SectionLabel>Loại hoạt động</SectionLabel>
        <View className="flex-row flex-wrap gap-2">
          {TYPES.map((t) => {
            const Icon = t.icon;
            const active = type === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => setType(t.key)}
                className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-full border"
                style={{
                  backgroundColor: active ? semantic.action.primary : palette.white,
                  borderColor: active ? semantic.action.primary : semantic.border.default,
                }}
              >
                <Icon
                  size={14}
                  color={active ? palette.white : semantic.text.primary}
                  strokeWidth={2}
                />
                <Text
                  variant="body"
                  style={{
                    color: active ? palette.white : semantic.text.primary,
                    fontFamily: 'BeVietnamPro_600SemiBold',
                    fontSize: 13,
                  }}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {type === 'CALL' && (
          <>
            <SectionLabel className="mt-5" required>
              Kết quả cuộc gọi
            </SectionLabel>
            <View className="flex-row flex-wrap gap-2">
              {OUTCOMES.map((o) => {
                const active = outcome === o.key;
                return (
                  <Pressable
                    key={o.key}
                    onPress={() => setOutcome(o.key)}
                    className="px-3.5 py-2 rounded-full border"
                    style={{
                      backgroundColor: active ? semantic.action.primarySoft : palette.white,
                      borderColor: active ? semantic.action.primary : semantic.border.default,
                    }}
                  >
                    <Text
                      variant="body"
                      style={{
                        color: active ? semantic.action.primaryDeep : semantic.text.primary,
                        fontFamily: 'BeVietnamPro_600SemiBold',
                        fontSize: 13,
                      }}
                    >
                      {o.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <SectionLabel className="mt-5" required={type !== 'CALL'}>
          Nội dung / Ghi chú
        </SectionLabel>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Tóm tắt nội dung trao đổi, nhu cầu khách..."
          placeholderTextColor={semantic.text.tertiary}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          style={[
            typography['body-lg'],
            {
              color: semantic.text.primary,
              borderWidth: 1,
              borderColor: semantic.border.default,
              borderRadius: 12,
              padding: 12,
              minHeight: 120,
              backgroundColor: palette.white,
            },
          ]}
        />

        <SectionLabel className="mt-5">Follow up tiếp</SectionLabel>
        <View className="flex-row flex-wrap gap-2">
          {FOLLOWUPS.map((f) => {
            const active = followupKey === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFollowupKey(f.key)}
                className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-full border"
                style={{
                  backgroundColor: active ? palette.obsidian[700] : palette.white,
                  borderColor: active ? palette.obsidian[700] : semantic.border.default,
                }}
              >
                {f.hoursFromNow !== null && (
                  <Calendar
                    size={13}
                    color={active ? palette.obsidian[50] : semantic.text.tertiary}
                  />
                )}
                <Text
                  variant="body"
                  style={{
                    color: active ? palette.obsidian[50] : semantic.text.primary,
                    fontFamily: 'BeVietnamPro_600SemiBold',
                    fontSize: 13,
                  }}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky submit */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-border-light px-4 pt-3 flex-row gap-2"
        style={{ paddingBottom: stickyBottom }}
      >
        {onCancel && (
          <Pressable
            onPress={onCancel}
            className="h-12 px-5 rounded-xl items-center justify-center"
            style={{
              borderWidth: 1,
              borderColor: semantic.border.default,
              backgroundColor: palette.white,
            }}
          >
            <Text
              variant="body"
              style={{
                color: semantic.text.primary,
                fontFamily: 'BeVietnamPro_600SemiBold',
              }}
            >
              Huỷ
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={handleSubmit}
          disabled={!canSave}
          className="flex-1 h-12 rounded-xl items-center justify-center"
          style={{
            backgroundColor: canSave ? semantic.action.primary : semantic.border.default,
            shadowColor: semantic.action.primaryDeep,
            shadowOpacity: canSave ? 0.25 : 0,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: canSave ? 4 : 0,
          }}
        >
          <Text
            variant="body"
            style={{
              color: canSave ? palette.white : semantic.text.tertiary,
              fontFamily: 'BeVietnamPro_700Bold',
            }}
          >
            {submitLabel}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function SectionLabel({
  children,
  className = '',
  required,
}: {
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <View className={`flex-row items-center gap-1 mb-2 ${className}`}>
      <Text
        variant="caption"
        style={{
          color: semantic.text.secondary,
          fontFamily: 'BeVietnamPro_700Bold',
          letterSpacing: 0.5,
        }}
      >
        {String(children).toUpperCase()}
      </Text>
      {required && (
        <Text variant="caption" style={{ color: palette.red[600] }}>
          *
        </Text>
      )}
    </View>
  );
}
