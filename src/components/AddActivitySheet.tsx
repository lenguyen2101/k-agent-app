import { useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
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
import { BottomSheetModal } from '@/components/BottomSheetModal';
import { Button } from '@/components/Button';
import { Text } from '@/components/ui/Text';
import { palette, semantic, typography } from '@/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (v: {
    type: ActivityType;
    content?: string;
    outcome?: ActivityOutcome;
    nextFollowupAt?: string;
  }) => void;
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

type FollowupPreset = { key: string; label: string; hours: number | null };
const FOLLOWUPS: FollowupPreset[] = [
  { key: 'none', label: 'Không đặt', hours: null },
  { key: '1h', label: 'Sau 1 giờ', hours: 1 },
  { key: '3h', label: 'Sau 3 giờ', hours: 3 },
  { key: 'tmr-am', label: 'Mai 9h sáng', hours: tomorrowAt(9) },
  { key: 'tmr-pm', label: 'Mai 15h', hours: tomorrowAt(15) },
  { key: 'nextweek', label: 'Tuần sau', hours: 24 * 7 },
];

function tomorrowAt(hour: number) {
  const now = new Date();
  const tmr = new Date(now);
  tmr.setDate(now.getDate() + 1);
  tmr.setHours(hour, 0, 0, 0);
  return (tmr.getTime() - now.getTime()) / 3600_000;
}

export function AddActivitySheet({ visible, onClose, onSubmit }: Props) {
  const [type, setType] = useState<ActivityType>('CALL');
  const [content, setContent] = useState('');
  const [outcome, setOutcome] = useState<ActivityOutcome | null>(null);
  const [followupKey, setFollowupKey] = useState<string>('none');

  const canSave = useMemo(() => {
    if (type === 'CALL') return outcome !== null;
    return content.trim().length > 0;
  }, [type, outcome, content]);

  const handleSave = () => {
    const followup = FOLLOWUPS.find((f) => f.key === followupKey);
    const nextFollowupAt =
      followup && followup.hours !== null
        ? new Date(Date.now() + followup.hours * 3600_000).toISOString()
        : undefined;
    onSubmit({
      type,
      content: content.trim() || undefined,
      outcome: type === 'CALL' ? outcome ?? undefined : undefined,
      nextFollowupAt,
    });
    setType('CALL');
    setContent('');
    setOutcome(null);
    setFollowupKey('none');
    onClose();
  };

  const handleClose = () => {
    setContent('');
    setOutcome(null);
    setFollowupKey('none');
    onClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={handleClose} heightPercent={0.85}>
      <View className="px-4 pt-2 pb-3 flex-row items-center justify-between">
        <Text variant="h3" className="text-text-primary">
          Thêm hoạt động
        </Text>
        <Pressable onPress={handleClose}>
          <Text
            variant="body"
            style={{ color: semantic.text.secondary, fontFamily: 'BeVietnamPro_500Medium' }}
          >
            Huỷ
          </Text>
        </Pressable>
      </View>

            <ScrollView
              className="px-4"
              style={{ flex: 1 }}
              contentContainerClassName="pb-4"
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
            >
              <SectionLabel text="Loại hoạt động" />
              <View className="flex-row flex-wrap gap-2 mt-2">
                {TYPES.map((t) => {
                  const Icon = t.icon;
                  const active = type === t.key;
                  return (
                    <Pressable
                      key={t.key}
                      onPress={() => setType(t.key)}
                      className="flex-row items-center gap-1.5 px-3 py-2 rounded-full"
                      style={{
                        backgroundColor: active ? semantic.action.primary : semantic.surface.alt,
                        borderWidth: 1,
                        borderColor: active ? semantic.action.primary : semantic.border.light,
                      }}
                    >
                      <Icon
                        size={16}
                        color={active ? palette.white : semantic.text.primary}
                        strokeWidth={2}
                      />
                      <Text
                        variant="body"
                        style={{
                          color: active ? palette.white : semantic.text.primary,
                          fontFamily: active ? 'BeVietnamPro_600SemiBold' : 'BeVietnamPro_500Medium',
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
                  <SectionLabel text="Kết quả cuộc gọi" required className="mt-5" />
                  <View className="flex-row flex-wrap gap-2 mt-2">
                    {OUTCOMES.map((o) => {
                      const active = outcome === o.key;
                      return (
                        <Pressable
                          key={o.key}
                          onPress={() => setOutcome(o.key)}
                          className="px-3 py-2 rounded-full"
                          style={{
                            backgroundColor: active ? semantic.action.primarySoft : semantic.surface.alt,
                            borderWidth: 1,
                            borderColor: active ? semantic.action.primary : semantic.border.light,
                          }}
                        >
                          <Text
                            variant="body"
                            style={{
                              color: active ? semantic.action.primaryDeep : semantic.text.primary,
                              fontFamily: active ? 'BeVietnamPro_600SemiBold' : 'BeVietnamPro_400Regular',
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

              <SectionLabel text="Nội dung / Ghi chú" className="mt-5" />
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Tóm tắt nội dung trao đổi, nhu cầu khách..."
                placeholderTextColor={semantic.text.tertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={[
                  typography['body-lg'],
                  {
                    color: semantic.text.primary,
                    borderWidth: 1,
                    borderColor: semantic.border.default,
                    borderRadius: 12,
                    padding: 12,
                    minHeight: 88,
                    marginTop: 8,
                    backgroundColor: semantic.surface.alt,
                  },
                ]}
              />

              <SectionLabel text="Đặt follow up tiếp" className="mt-5" />
              <View className="flex-row flex-wrap gap-2 mt-2">
                {FOLLOWUPS.map((f) => {
                  const active = followupKey === f.key;
                  return (
                    <Pressable
                      key={f.key}
                      onPress={() => setFollowupKey(f.key)}
                      className="flex-row items-center gap-1.5 px-3 py-2 rounded-full"
                      style={{
                        backgroundColor: active ? semantic.surface.dark : semantic.surface.alt,
                        borderWidth: 1,
                        borderColor: active ? semantic.surface.dark : semantic.border.light,
                      }}
                    >
                      {f.hours !== null && (
                        <Calendar
                          size={14}
                          color={active ? palette.white : semantic.text.tertiary}
                          strokeWidth={2}
                        />
                      )}
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
            </ScrollView>

      <View
        className="px-4 pt-3 pb-6 border-t border-border-light"
        style={{ backgroundColor: semantic.surface.card }}
      >
        <Button label="Lưu hoạt động" variant="primary" fullWidth disabled={!canSave} onPress={handleSave} />
      </View>
    </BottomSheetModal>
  );
}

function SectionLabel({
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
