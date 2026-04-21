import { Linking, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowDownToLine,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
  RotateCw,
  Shield,
  Sparkles,
  Wrench,
} from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { useAppStatus } from '@/store/appStatus';
import { palette, semantic } from '@/theme';

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '20260421';
const EAS_CHANNEL = 'preview';
const BUNDLE_ID = 'vn.kcity.agent';

export default function About() {
  const insets = useSafeAreaInsets();
  const setForceUpdate = useAppStatus((s) => s.setForceUpdate);
  const setMaintenance = useAppStatus((s) => s.setMaintenance);
  const resetOnboarding = useAppStatus((s) => s.resetOnboarding);

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
          Về ứng dụng
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* App hero */}
        <View className="items-center pt-8 pb-6">
          <View
            className="rounded-3xl overflow-hidden"
            style={{
              shadowColor: semantic.action.primaryDeep,
              shadowOpacity: 0.3,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 10 },
              elevation: 8,
            }}
          >
            <LinearGradient
              colors={[...semantic.gradient.heroBrand]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 96,
                height: 96,
                borderRadius: 28,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={46} color={palette.white} strokeWidth={2} />
            </LinearGradient>
          </View>
          <Text
            variant="h1"
            style={{
              color: semantic.action.primaryDeep,
              fontFamily: 'BeVietnamPro_700Bold',
              marginTop: 14,
            }}
          >
            K-Agent
          </Text>
          <Text variant="body" className="text-text-secondary mt-1">
            CRM mobile cho sale BĐS K-CITY
          </Text>

          <View className="flex-row items-center gap-2 mt-3">
            <View
              className="px-2.5 py-1 rounded-full"
              style={{ backgroundColor: semantic.action.primarySoft }}
            >
              <Text
                variant="caption"
                style={{
                  color: semantic.action.primaryDeep,
                  fontFamily: 'BeVietnamPro_700Bold',
                  fontSize: 11,
                }}
              >
                v{APP_VERSION}
              </Text>
            </View>
            <Text variant="caption" className="text-text-tertiary">
              Build {BUILD_NUMBER} · {EAS_CHANNEL}
            </Text>
          </View>
        </View>

        {/* Build info */}
        <Section title="Thông tin build">
          <InfoRow label="Phiên bản" value={`${APP_VERSION} (${BUILD_NUMBER})`} />
          <InfoRow label="EAS Update channel" value={EAS_CHANNEL} />
          <InfoRow label="Bundle ID" value={BUNDLE_ID} last />
        </Section>

        {/* Links */}
        <Section title="Pháp lý & Hỗ trợ">
          <LinkRow
            icon={<FileText size={18} color={semantic.text.primary} />}
            label="Điều khoản sử dụng"
            onPress={() => Linking.openURL('https://k-city.vn/terms')}
          />
          <LinkRow
            icon={<Shield size={18} color={semantic.text.primary} />}
            label="Chính sách bảo mật"
            onPress={() => Linking.openURL('https://k-city.vn/privacy')}
          />
          <LinkRow
            icon={<HelpCircle size={18} color={semantic.text.primary} />}
            label="Trung tâm trợ giúp"
            onPress={() => Linking.openURL('https://k-city.vn/help')}
          />
          <LinkRow
            icon={<Mail size={18} color={semantic.text.primary} />}
            label="Email hỗ trợ"
            detail="agent-support@k-city.vn"
            onPress={() => Linking.openURL('mailto:agent-support@k-city.vn')}
            last
          />
        </Section>

        {/* Credits */}
        <View className="mx-4 mt-5 p-5 rounded-2xl" style={{ backgroundColor: palette.obsidian[700] }}>
          <View className="flex-row items-center gap-2">
            <MessageCircle size={16} color={palette.obsidian[50]} />
            <Text
              variant="caption"
              style={{
                color: palette.obsidian[50],
                fontFamily: 'BeVietnamPro_700Bold',
                letterSpacing: 0.5,
              }}
            >
              GỬI PHẢN HỒI
            </Text>
          </View>
          <Text
            variant="body"
            className="mt-2"
            style={{ color: palette.obsidian[50] }}
          >
            Bạn muốn app tốt hơn? Gửi feedback về chức năng, bug, hoặc ý tưởng trực tiếp cho đội K-CITY.
          </Text>
          <Pressable
            onPress={() =>
              Linking.openURL(
                'mailto:product@k-city.vn?subject=K-Agent%20feedback&body=Phiên%20bản%3A%20' +
                  APP_VERSION
              )
            }
            className="flex-row items-center gap-1.5 mt-3 self-start px-3 py-2 rounded-full"
            style={{ backgroundColor: 'rgba(247,243,237,0.18)' }}
          >
            <Text
              variant="caption"
              style={{
                color: palette.obsidian[50],
                fontFamily: 'BeVietnamPro_700Bold',
              }}
            >
              Gửi email phản hồi
            </Text>
            <ExternalLink size={13} color={palette.obsidian[50]} />
          </Pressable>
        </View>

        {/* Debug / Test screens — dev-only */}
        <Section title="Test screens (dev)">
          <DebugRow
            icon={<ArrowDownToLine size={18} color={palette.sienna[700]} />}
            iconBg={palette.sienna[50]}
            label="Preview Force Update"
            onPress={() => {
              setForceUpdate({ required: true, latestVersion: '1.2.0' });
              router.push('/force-update');
            }}
          />
          <DebugRow
            icon={<Wrench size={18} color={palette.red[600]} />}
            iconBg={palette.red[50]}
            label="Preview Maintenance"
            onPress={() => {
              setMaintenance({
                active: true,
                message:
                  'K-Agent đang bảo trì định kỳ từ 23:00 — 02:00. Xin lỗi vì sự bất tiện.',
                estimatedEndAt: new Date(Date.now() + 90 * 60_000).toISOString(),
              });
              router.push('/maintenance');
            }}
          />
          <DebugRow
            icon={<RotateCw size={18} color={palette.blue[700]} />}
            iconBg={palette.blue[50]}
            label="Xem lại Onboarding"
            onPress={() => {
              resetOnboarding();
              router.replace('/splash');
            }}
            last
          />
        </Section>

        <Text variant="caption" className="text-text-tertiary text-center mt-8 px-6">
          © 2026 K-CITY Broker Platform{'\n'}
          Được xây dựng tại Việt Nam
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

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View
      className="flex-row items-center justify-between px-4 py-3"
      style={{
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: semantic.border.light,
      }}
    >
      <Text variant="body" className="text-text-secondary">
        {label}
      </Text>
      <Text
        variant="body"
        style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_600SemiBold' }}
      >
        {value}
      </Text>
    </View>
  );
}

function DebugRow({
  icon,
  iconBg,
  label,
  onPress,
  last,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3.5 active:bg-surface-hover"
      style={{
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: semantic.border.light,
      }}
    >
      <View
        className="w-9 h-9 rounded-xl items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </View>
      <Text
        variant="body"
        className="flex-1 ml-3"
        style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_500Medium' }}
      >
        {label}
      </Text>
      <ChevronRight size={18} color={semantic.text.tertiary} />
    </Pressable>
  );
}

function LinkRow({
  icon,
  label,
  detail,
  onPress,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  detail?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3.5 active:bg-surface-hover"
      style={{
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: semantic.border.light,
      }}
    >
      <View
        className="w-9 h-9 rounded-xl items-center justify-center"
        style={{ backgroundColor: semantic.surface.alt }}
      >
        {icon}
      </View>
      <Text
        variant="body"
        className="flex-1 ml-3"
        style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_500Medium' }}
      >
        {label}
      </Text>
      {detail && (
        <Text variant="caption" className="text-text-tertiary mr-2" numberOfLines={1}>
          {detail}
        </Text>
      )}
      <ChevronRight size={18} color={semantic.text.tertiary} />
    </Pressable>
  );
}
