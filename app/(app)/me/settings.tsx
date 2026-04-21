import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Switch, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bell,
  Fingerprint,
  Globe,
  KeyRound,
  Moon,
  ScanFace,
  Sun,
  Volume2,
  Wifi,
} from 'lucide-react-native';
import { useAuth, type LanguageCode, type ThemeMode } from '@/store/auth';
import { getBiometricCapability, type BiometricCapability } from '@/lib/biometric';
import {
  getPushPermission,
  requestPushPermission,
  type PushPermissionStatus,
} from '@/lib/notifications';
import { Text } from '@/components/ui/Text';
import { palette, semantic } from '@/theme';

export default function AppSettingsScreen() {
  const insets = useSafeAreaInsets();
  const settings = useAuth((s) => s.settings);
  const updateSettings = useAuth((s) => s.updateSettings);
  const [biometric, setBiometric] = useState<BiometricCapability | null>(null);
  const [pushStatus, setPushStatus] = useState<PushPermissionStatus>('undetermined');

  useEffect(() => {
    getBiometricCapability().then(setBiometric);
    getPushPermission().then(setPushStatus);
  }, []);

  const handleBiometricToggle = async (next: boolean) => {
    if (!next) {
      updateSettings({ biometric: false });
      return;
    }
    if (!biometric?.supported) {
      Alert.alert('Không hỗ trợ', 'Thiết bị này không có cảm biến sinh trắc.');
      return;
    }
    if (!biometric.enrolled) {
      Alert.alert(
        `${biometric.labelVi} chưa setup`,
        `Vào Cài đặt hệ thống để thiết lập ${biometric.labelVi} trước khi bật trên K-Agent.`,
        [
          { text: 'Huỷ', style: 'cancel' },
          { text: 'Mở Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }
    updateSettings({ biometric: true });
  };

  const handlePushToggle = async (next: boolean) => {
    if (!next) {
      updateSettings({ pushEnabled: false });
      return;
    }
    const status = await requestPushPermission();
    setPushStatus(status);
    if (status === 'granted') {
      updateSettings({ pushEnabled: true });
    } else {
      Alert.alert(
        'Chưa cấp quyền thông báo',
        'Vào Cài đặt hệ thống để bật Thông báo cho K-Agent.',
        [
          { text: 'Huỷ', style: 'cancel' },
          { text: 'Mở Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const biometricLabel = biometric?.kind === 'face'
    ? 'Đăng nhập bằng Face ID'
    : biometric?.kind === 'fingerprint'
      ? 'Đăng nhập bằng Touch ID'
      : 'Đăng nhập sinh trắc';
  const BiometricIcon = biometric?.kind === 'face' ? ScanFace : Fingerprint;

  const themeOptions: { key: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { key: 'light', label: 'Sáng', icon: <Sun size={14} color={semantic.text.primary} /> },
    { key: 'dark',  label: 'Tối',  icon: <Moon size={14} color={semantic.text.primary} /> },
    { key: 'auto', label: 'Tự động', icon: <Sun size={14} color={semantic.text.primary} /> },
  ];

  const langOptions: { key: LanguageCode; label: string }[] = [
    { key: 'vi', label: 'Tiếng Việt' },
    { key: 'en', label: 'English' },
  ];

  return (
    <View className="flex-1 bg-surface">
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
          style={{
            color: semantic.text.primary,
            fontFamily: 'BeVietnamPro_700Bold',
            flex: 1,
            textAlign: 'center',
          }}
        >
          Cài đặt
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerStyle={{ paddingVertical: 16, paddingBottom: 40 }}>
        <Section title="Bảo mật">
          <ToggleRow
            icon={<BiometricIcon size={18} color={semantic.action.primaryDeep} />}
            iconBg={semantic.action.primarySoft}
            label={biometricLabel}
            subtitle={
              biometric?.supported === false
                ? 'Thiết bị không hỗ trợ sinh trắc'
                : biometric?.enrolled === false
                  ? `Chưa setup ${biometric.labelVi} trên device`
                  : 'Xác thực sinh trắc khi mở app'
            }
            value={settings.biometric && biometric?.supported === true && biometric.enrolled === true}
            disabled={biometric?.supported === false}
            onValueChange={handleBiometricToggle}
          />
          <ActionRow
            icon={<KeyRound size={18} color={palette.blue[700]} />}
            iconBg={palette.blue[50]}
            label="Đổi mật khẩu"
            subtitle="Mật khẩu đăng nhập app"
            onPress={() =>
              Alert.alert('Sắp ra mắt', 'Đổi mật khẩu sẽ có ở phase tiếp.')
            }
          />
        </Section>

        <Section title="Thông báo">
          <ToggleRow
            icon={<Bell size={18} color={palette.sienna[700]} />}
            iconBg={palette.sienna[50]}
            label="Push notification"
            subtitle={
              pushStatus === 'denied'
                ? 'Đã tắt ở Settings hệ thống'
                : 'Lead mới, follow-up, deal update'
            }
            value={settings.pushEnabled && pushStatus === 'granted'}
            onValueChange={handlePushToggle}
          />
          <ToggleRow
            icon={<Volume2 size={18} color={palette.sienna[700]} />}
            iconBg={palette.sienna[50]}
            label="Âm báo lead mới"
            subtitle="Rung + âm khi có lead AI phân bổ"
            value={settings.pushSound}
            onValueChange={(v) => updateSettings({ pushSound: v })}
            disabled={!settings.pushEnabled}
          />
        </Section>

        <Section title="Hiển thị">
          <OptionGroupRow
            icon={<Sun size={18} color={palette.sienna[700]} />}
            iconBg={palette.sienna[50]}
            label="Giao diện"
            options={themeOptions.map((o) => ({
              key: o.key,
              label: o.label,
              active: settings.theme === o.key,
              onPress: () => {
                if (o.key === 'dark' || o.key === 'auto') {
                  Alert.alert('Sắp ra mắt', 'Dark mode sẽ ra mắt ở phase tiếp.');
                  return;
                }
                updateSettings({ theme: o.key });
              },
            }))}
          />
          <OptionGroupRow
            icon={<Globe size={18} color={palette.emerald[700]} />}
            iconBg={palette.emerald[50]}
            label="Ngôn ngữ"
            options={langOptions.map((o) => ({
              key: o.key,
              label: o.label,
              active: settings.language === o.key,
              onPress: () => {
                if (o.key === 'en') {
                  Alert.alert('Sắp ra mắt', 'Bản tiếng Anh sẽ ra mắt sau.');
                  return;
                }
                updateSettings({ language: o.key });
              },
            }))}
          />
        </Section>

        <Section title="Kết nối & Offline">
          <ToggleRow
            icon={<Wifi size={18} color={palette.blue[700]} />}
            iconBg={palette.blue[50]}
            label="Đồng bộ qua 4G/5G"
            subtitle="Tắt = chỉ sync khi có WiFi"
            value={settings.syncOnCellular}
            onValueChange={(v) => updateSettings({ syncOnCellular: v })}
          />
        </Section>

        <Text variant="caption" className="text-text-tertiary text-center mt-6 px-6">
          Cài đặt lưu trên thiết bị này.{'\n'}Đăng nhập trên thiết bị khác cần setup lại.
        </Text>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-4">
      <Text
        variant="caption"
        className="px-4 mb-2"
        style={{
          color: semantic.text.secondary,
          fontFamily: 'BeVietnamPro_700Bold',
          letterSpacing: 0.5,
        }}
      >
        {title.toUpperCase()}
      </Text>
      <View
        className="mx-4 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: palette.white,
          borderWidth: 1,
          borderColor: semantic.border.light,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function RowShell({
  icon,
  iconBg,
  label,
  subtitle,
  right,
  disabled,
  onPress,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  subtitle?: string;
  right: React.ReactNode;
  disabled?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      className="flex-row items-center px-4 py-3.5"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: semantic.border.light,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <View
        className="w-9 h-9 rounded-xl items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </View>
      <View className="flex-1 ml-3 mr-3">
        <Text
          variant="body"
          style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_600SemiBold' }}
        >
          {label}
        </Text>
        {subtitle && (
          <Text variant="caption" className="text-text-secondary mt-0.5" numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
    </Pressable>
  );
}

function ToggleRow({
  value,
  onValueChange,
  disabled,
  ...rest
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <RowShell
      {...rest}
      disabled={disabled}
      right={
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{ true: semantic.action.primary, false: semantic.border.default }}
          thumbColor={palette.white}
          ios_backgroundColor={semantic.border.default}
        />
      }
    />
  );
}

function ActionRow({
  onPress,
  ...rest
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <RowShell
      {...rest}
      onPress={onPress}
      right={
        <View className="w-7 h-7 items-center justify-center">
          <Text
            style={{
              color: semantic.text.tertiary,
              fontSize: 18,
            }}
          >
            ›
          </Text>
        </View>
      }
    />
  );
}

function OptionGroupRow({
  icon,
  iconBg,
  label,
  options,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  options: { key: string; label: string; active: boolean; onPress: () => void }[];
}) {
  return (
    <View
      className="px-4 py-3.5"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: semantic.border.light,
      }}
    >
      <View className="flex-row items-center gap-3">
        <View
          className="w-9 h-9 rounded-xl items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </View>
        <Text
          variant="body"
          style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_600SemiBold' }}
        >
          {label}
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-2 mt-3 ml-12">
        {options.map((o) => (
          <Pressable
            key={o.key}
            onPress={o.onPress}
            className="px-3.5 h-9 rounded-full items-center justify-center border"
            style={{
              backgroundColor: o.active ? semantic.action.primary : palette.white,
              borderColor: o.active ? semantic.action.primary : semantic.border.default,
            }}
          >
            <Text
              variant="body"
              style={{
                color: o.active ? palette.white : semantic.text.secondary,
                fontFamily: 'BeVietnamPro_600SemiBold',
                fontSize: 13,
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
