import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Camera,
  Check,
  Mail,
  Phone,
  ShieldCheck,
  User as UserIcon,
  Users,
} from 'lucide-react-native';
import { useAuth } from '@/store/auth';
import { Text } from '@/components/ui/Text';
import { formatPhone } from '@/lib/format';
import { palette, semantic, typography } from '@/theme';

export default function ProfileEdit() {
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const updateProfile = useAuth((s) => s.updateProfile);

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [team, setTeam] = useState(user?.team ?? '');

  const isDirty =
    fullName !== (user?.fullName ?? '') ||
    phone !== (user?.phone ?? '') ||
    email !== (user?.email ?? '') ||
    team !== (user?.team ?? '');

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert('Thiếu tên', 'Vui lòng nhập họ tên đầy đủ.');
      return;
    }
    if (!/^0\d{9}$/.test(phone.trim())) {
      Alert.alert('Số điện thoại không hợp lệ', 'SĐT phải 10 số, bắt đầu bằng 0.');
      return;
    }
    updateProfile({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      team: team.trim(),
    });
    router.back();
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View
        className="bg-white border-b border-border-light flex-row items-center px-2"
        style={{ paddingTop: insets.top + 4, paddingBottom: 10 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
          hitSlop={8}
        >
          <ArrowLeft size={22} color={semantic.text.primary} />
        </Pressable>
        <Text
          variant="h3"
          style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold', flex: 1, textAlign: 'center' }}
        >
          Thông tin cá nhân
        </Text>
        <Pressable
          onPress={handleSave}
          disabled={!isDirty}
          className="px-3 h-10 rounded-full items-center justify-center"
          style={{
            backgroundColor: isDirty ? semantic.action.primary : 'transparent',
            opacity: isDirty ? 1 : 0.3,
          }}
          hitSlop={4}
        >
          <Text
            variant="subtitle"
            style={{
              color: isDirty ? palette.white : semantic.text.tertiary,
              fontFamily: 'BeVietnamPro_700Bold',
            }}
          >
            Lưu
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Avatar picker */}
          <View className="items-center py-6">
            <View className="relative">
              <View
                className="w-24 h-24 rounded-full items-center justify-center"
                style={{
                  backgroundColor: semantic.action.primary,
                  shadowColor: semantic.action.primaryDeep,
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 6,
                }}
              >
                {/* Avatar initials — 40px intentional hero size for profile screen avatar. */}
                <Text
                  style={{
                    color: palette.white,
                    fontFamily: 'BeVietnamPro_700Bold',
                    fontSize: 40,
                  }}
                >
                  {fullName.charAt(0) || '?'}
                </Text>
              </View>
              <Pressable
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full items-center justify-center"
                style={{
                  backgroundColor: palette.white,
                  borderWidth: 2,
                  borderColor: semantic.action.primarySoft,
                }}
                onPress={() =>
                  Alert.alert('Sắp ra mắt', 'Đổi ảnh đại diện sẽ có ở phase tiếp.')
                }
              >
                <Camera size={16} color={semantic.action.primary} strokeWidth={2.2} />
              </Pressable>
            </View>
            <Text variant="caption" className="text-text-tertiary mt-2">
              Tap để đổi ảnh
            </Text>
          </View>

          {/* Form */}
          <View className="mx-4 gap-3">
            <SectionLabel>Thông tin liên hệ</SectionLabel>
            <FieldRow
              icon={<UserIcon size={16} color={semantic.text.tertiary} />}
              label="Họ và tên"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Lê Nguyên"
              autoCapitalize="words"
            />
            <FieldRow
              icon={<Phone size={16} color={semantic.text.tertiary} />}
              label="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              placeholder="0901234567"
              keyboardType="phone-pad"
              formatter={(v) => formatPhone(v)}
            />
            <FieldRow
              icon={<Mail size={16} color={semantic.text.tertiary} />}
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@k-city.vn"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="mx-4 mt-4 gap-3">
            <SectionLabel>Thông tin công việc</SectionLabel>
            <FieldRow
              icon={<Users size={16} color={semantic.text.tertiary} />}
              label="Sàn / Team"
              value={team}
              onChangeText={setTeam}
              placeholder="Sàn Q1"
              autoCapitalize="words"
            />

            <ReadOnlyRow
              icon={<ShieldCheck size={16} color={palette.emerald[700]} />}
              label="Vai trò"
              value={user?.role ?? 'SALE'}
            />

            <ReadOnlyRow
              icon={<Check size={16} color={palette.emerald[700]} />}
              label="Chứng nhận NOXH K-CITY"
              value={user?.noxhCertified ? 'Đã xác nhận' : 'Chưa xác nhận'}
              tone={user?.noxhCertified ? 'success' : 'neutral'}
            />
          </View>

          <Text variant="caption" className="text-text-tertiary text-center mt-6 px-6">
            Vai trò + chứng nhận do quản trị viên K-CITY cấp.{'\n'}Liên hệ trưởng sàn để thay đổi.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
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
  );
}

function FieldRow({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  formatter,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  formatter?: (v: string) => string;
}) {
  return (
    <View
      className="px-4 py-3 rounded-2xl"
      style={{
        backgroundColor: palette.white,
        borderWidth: 1,
        borderColor: semantic.border.light,
      }}
    >
      <View className="flex-row items-center gap-2 mb-1">
        {icon}
        <Text variant="caption" className="text-text-secondary">
          {label}
        </Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={semantic.text.tertiary}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        style={[
          typography['body-lg'],
          {
            color: semantic.text.primary,
            padding: 0,
            paddingTop: 2,
            fontFamily: 'BeVietnamPro_600SemiBold',
          },
        ]}
      />
    </View>
  );
}

function ReadOnlyRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'success' | 'neutral';
}) {
  const bg = tone === 'success' ? palette.emerald[50] : semantic.surface.alt;
  const fg = tone === 'success' ? palette.emerald[700] : semantic.text.primary;
  return (
    <View
      className="px-4 py-3 rounded-2xl flex-row items-center"
      style={{
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: tone === 'success' ? palette.emerald[50] : semantic.border.light,
      }}
    >
      <View className="flex-row items-center gap-2 flex-1">
        {icon}
        <Text variant="caption" className="text-text-secondary">
          {label}
        </Text>
      </View>
      <Text
        variant="body"
        style={{ color: fg, fontFamily: 'BeVietnamPro_700Bold' }}
      >
        {value}
      </Text>
    </View>
  );
}
