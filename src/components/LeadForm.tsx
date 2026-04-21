import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'lucide-react-native';
import { projects } from '@/mock/projects';
import type { LeadSource, Project } from '@/types/lead';
import { Text } from '@/components/ui/Text';
import { palette, semantic, typography } from '@/theme';

export type LeadFormValue = {
  fullName: string;
  phone: string;
  project: Project | null;
  unitTypes: string[];
  source: LeadSource;
  notes: string;
  nextFollowupAt?: string;
};

type Props = {
  initial?: Partial<LeadFormValue>;
  submitLabel?: string;
  onSubmit: (v: LeadFormValue) => void;
  stickyBottomOffset?: number;  // để tránh sticky footer bị che
};

const UNIT_TYPES = ['Studio', '1PN', '2PN', '3PN'] as const;

const SOURCES: { key: LeadSource; label: string }[] = [
  { key: 'NOXH_PLATFORM', label: 'noxh.net' },
  { key: 'FACEBOOK_ADS', label: 'Facebook Ads' },
  { key: 'HOTLINE', label: 'Hotline' },
  { key: 'WALK_IN', label: 'Walk-in' },
  { key: 'REFERRAL', label: 'Giới thiệu' },
  { key: 'EVENT', label: 'Sự kiện' },
  { key: 'ZALO', label: 'Zalo' },
  { key: 'OTHER', label: 'Khác' },
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

// Maps an ISO timestamp back to nearest preset key, fallback to 'custom'.
function presetKeyFrom(iso?: string): string {
  if (!iso) return 'none';
  const hoursFromNow = (new Date(iso).getTime() - Date.now()) / 3600_000;
  let bestKey = 'custom';
  let bestDiff = 0.5;  // chỉ match trong ±30 phút
  for (const f of FOLLOWUPS) {
    if (f.hoursFromNow === null) continue;
    const diff = Math.abs(f.hoursFromNow - hoursFromNow);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestKey = f.key;
    }
  }
  return bestKey;
}

export function LeadForm({ initial, submitLabel = 'Lưu', onSubmit, stickyBottomOffset }: Props) {
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState(initial?.fullName ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [project, setProject] = useState<Project | null>(initial?.project ?? null);
  const [unitTypes, setUnitTypes] = useState<string[]>(initial?.unitTypes ?? []);
  const [source, setSource] = useState<LeadSource>(initial?.source ?? 'OTHER');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [followupKey, setFollowupKey] = useState<string>(
    presetKeyFrom(initial?.nextFollowupAt)
  );

  const canSave = useMemo(
    () => fullName.trim().length > 0 && /^0\d{9}$/.test(phone.trim()) && !!project,
    [fullName, phone, project]
  );

  const handleSubmit = () => {
    if (!canSave) {
      if (!fullName.trim()) {
        Alert.alert('Thiếu tên', 'Vui lòng nhập họ tên khách hàng.');
      } else if (!/^0\d{9}$/.test(phone.trim())) {
        Alert.alert('SĐT không hợp lệ', 'SĐT phải 10 số, bắt đầu bằng 0.');
      } else if (!project) {
        Alert.alert('Thiếu dự án', 'Vui lòng chọn dự án khách quan tâm.');
      }
      return;
    }

    const preset = FOLLOWUPS.find((f) => f.key === followupKey);
    const nextFollowupAt =
      preset && preset.hoursFromNow !== null
        ? new Date(Date.now() + preset.hoursFromNow * 3600_000).toISOString()
        : undefined;

    onSubmit({
      fullName: fullName.trim(),
      phone: phone.trim(),
      project,
      unitTypes,
      source,
      notes: notes.trim(),
      nextFollowupAt,
    });
  };

  const toggleUnit = (u: string) => {
    setUnitTypes((prev) => (prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        <SectionLabel>Thông tin khách</SectionLabel>
        <FieldWrap label="Họ và tên" required>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Nguyễn Văn A"
            placeholderTextColor={semantic.text.tertiary}
            autoCapitalize="words"
            style={inputStyle}
          />
        </FieldWrap>

        <FieldWrap label="Số điện thoại" required>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="0901234567"
            placeholderTextColor={semantic.text.tertiary}
            keyboardType="phone-pad"
            style={inputStyle}
          />
        </FieldWrap>

        <SectionLabel className="mt-5">Nhu cầu</SectionLabel>
        <FieldWrap label="Dự án quan tâm" required>
          <View className="flex-row flex-wrap gap-2">
            {projects.map((p) => {
              const active = project?.id === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setProject(p)}
                  className="px-3 py-2 rounded-full border"
                  style={{
                    backgroundColor: active ? semantic.action.primary : palette.white,
                    borderColor: active ? semantic.action.primary : semantic.border.default,
                  }}
                >
                  <Text
                    variant="body"
                    style={{
                      color: active ? palette.white : semantic.text.primary,
                      fontFamily: 'BeVietnamPro_600SemiBold',
                      fontSize: 13,
                    }}
                  >
                    {p.shortName}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </FieldWrap>

        <FieldWrap label="Loại căn (có thể chọn nhiều)">
          <View className="flex-row flex-wrap gap-2">
            {UNIT_TYPES.map((u) => {
              const active = unitTypes.includes(u);
              const allowed = !project || project.unitTypes.includes(u);
              return (
                <Pressable
                  key={u}
                  onPress={() => allowed && toggleUnit(u)}
                  className="px-3 py-2 rounded-full border"
                  style={{
                    backgroundColor: active ? semantic.action.primarySoft : palette.white,
                    borderColor: active ? semantic.action.primary : semantic.border.default,
                    opacity: allowed ? 1 : 0.35,
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
                    {u}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </FieldWrap>

        <FieldWrap label="Nguồn lead">
          <View className="flex-row flex-wrap gap-2">
            {SOURCES.map((s) => {
              const active = source === s.key;
              return (
                <Pressable
                  key={s.key}
                  onPress={() => setSource(s.key)}
                  className="px-3 py-2 rounded-full border"
                  style={{
                    backgroundColor: active ? semantic.action.primary : palette.white,
                    borderColor: active ? semantic.action.primary : semantic.border.default,
                  }}
                >
                  <Text
                    variant="body"
                    style={{
                      color: active ? palette.white : semantic.text.primary,
                      fontFamily: 'BeVietnamPro_600SemiBold',
                      fontSize: 13,
                    }}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </FieldWrap>

        <SectionLabel className="mt-5">Ghi chú & Follow up</SectionLabel>
        <FieldWrap label="Ghi chú">
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Nhu cầu, thu nhập, gia cảnh, chi tiết khác..."
            placeholderTextColor={semantic.text.tertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={[
              inputStyle,
              {
                minHeight: 96,
                paddingTop: 12,
              },
            ]}
          />
        </FieldWrap>

        <FieldWrap label="Follow up tiếp">
          <View className="flex-row flex-wrap gap-2">
            {FOLLOWUPS.map((f) => {
              const active = followupKey === f.key;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => setFollowupKey(f.key)}
                  className="flex-row items-center gap-1.5 px-3 py-2 rounded-full border"
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
        </FieldWrap>
      </ScrollView>

      {/* Sticky submit */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-border-light px-4 pt-3"
        style={{
          paddingBottom:
            stickyBottomOffset ?? (insets.bottom > 0 ? insets.bottom : 12),
        }}
      >
        <Pressable
          onPress={handleSubmit}
          disabled={!canSave}
          className="h-12 rounded-xl items-center justify-center"
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

const inputStyle = [
  typography['body-lg'],
  {
    color: semantic.text.primary,
    borderWidth: 1,
    borderColor: semantic.border.default,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: palette.white,
  },
];

function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <Text
      variant="caption"
      className={className}
      style={{
        color: semantic.text.secondary,
        fontFamily: 'BeVietnamPro_700Bold',
        letterSpacing: 0.5,
        marginBottom: 10,
      }}
    >
      {String(children).toUpperCase()}
    </Text>
  );
}

function FieldWrap({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4">
      <View className="flex-row items-center gap-1 mb-1.5">
        <Text
          variant="caption"
          style={{
            color: semantic.text.primary,
            fontFamily: 'BeVietnamPro_600SemiBold',
            fontSize: 13,
          }}
        >
          {label}
        </Text>
        {required && (
          <Text variant="caption" style={{ color: palette.red[600] }}>
            *
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}
