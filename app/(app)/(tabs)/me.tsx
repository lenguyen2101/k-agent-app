import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import {
  Award,
  Bell,
  CheckCircle2,
  ChevronRight,
  Fingerprint,
  Info,
  LogOut,
  RefreshCw,
  Settings as SettingsIcon,
  ShieldCheck,
  TrendingUp,
  UserCog,
} from 'lucide-react-native';
import { useAuth } from '@/store/auth';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/ui/Text';
import { leads } from '@/mock/leads';
import { incomeSummary } from '@/mock/income';
import { syncSummary } from '@/mock/sync';
import { formatPhone, formatVNDCompact } from '@/lib/format';
import { palette, semantic } from '@/theme';

export default function Me() {
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  const settings = useAuth((s) => s.settings);

  const onLogout = () => {
    signOut();
    router.replace('/(auth)/login');
  };

  const activeLeads = leads.filter(
    (l) => l.status !== 'CLOSED_WON' && l.status !== 'CLOSED_LOST' && l.status !== 'ON_HOLD'
  ).length;
  const wonLeads = leads.filter((l) => l.status === 'CLOSED_WON' || l.status === 'CONTRACTED').length;

  const pendingSyncTotal =
    syncSummary.pendingCount + syncSummary.failedCount + syncSummary.conflictCount;

  return (
    <Screen>
      <ScrollView contentContainerClassName="pb-10">
        {/* Hero profile card */}
        <View
          className="mx-4 mt-2 p-5 rounded-3xl"
          style={{
            backgroundColor: semantic.action.primarySoft,
            borderWidth: 1,
            borderColor: palette.sienna[100],
            shadowColor: semantic.action.primaryDeep,
            shadowOpacity: 0.08,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
            elevation: 3,
          }}
        >
          <View className="flex-row items-center gap-4">
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{
                backgroundColor: semantic.action.primary,
                shadowColor: semantic.action.primaryDeep,
                shadowOpacity: 0.3,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 3,
              }}
            >
              <Text
                variant="h1"
                style={{ color: palette.white, fontFamily: 'BeVietnamPro_700Bold' }}
              >
                {user?.fullName.charAt(0) ?? '?'}
              </Text>
            </View>
            <View className="flex-1">
              <Text
                variant="h2"
                style={{ color: semantic.action.primaryDeep, fontFamily: 'BeVietnamPro_700Bold' }}
                numberOfLines={1}
              >
                {user?.fullName}
              </Text>
              <Text variant="body" className="text-text-secondary mt-0.5">
                {user?.phone ? formatPhone(user.phone) : ''}
              </Text>
              <View className="flex-row items-center gap-1.5 mt-2">
                <View
                  className="flex-row items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: palette.white }}
                >
                  <Award size={11} color={semantic.action.primary} />
                  <Text
                    variant="caption"
                    style={{
                      color: semantic.action.primaryDeep,
                      fontFamily: 'BeVietnamPro_700Bold',
                      fontSize: 11,
                    }}
                  >
                    Tân binh
                  </Text>
                </View>
                <Text variant="caption" className="text-text-tertiary">
                  · {user?.team ?? 'Sàn Q1'}
                </Text>
              </View>
            </View>
          </View>

          {user?.noxhCertified && (
            <View
              className="flex-row items-center gap-1.5 mt-3 self-start px-2.5 py-1 rounded-full"
              style={{ backgroundColor: palette.emerald[50] }}
            >
              <ShieldCheck size={13} color={palette.emerald[700]} />
              <Text
                variant="caption"
                style={{
                  color: palette.emerald[700],
                  fontFamily: 'BeVietnamPro_600SemiBold',
                  fontSize: 11,
                }}
              >
                Đã chứng nhận NOXH K-CITY
              </Text>
            </View>
          )}

          {/* Stats strip */}
          <View
            className="flex-row mt-4 pt-4 gap-3"
            style={{ borderTopWidth: 1, borderTopColor: palette.sienna[100] }}
          >
            <StatCell label="Lead đang chăm" value={activeLeads} />
            <StatDivider />
            <StatCell label="Deal chốt" value={wonLeads} accent="emerald" />
            <StatDivider />
            <StatCell
              label="Thu nhập ròng"
              value={formatVNDCompact(incomeSummary.netTotal)}
              isString
            />
          </View>
        </View>

        {/* Income shortcut card (featured) */}
        <Pressable
          onPress={() => router.push('/(app)/income')}
          className="mx-4 mt-4 p-4 rounded-2xl flex-row items-center gap-3"
          style={{
            backgroundColor: palette.obsidian[700],
            shadowColor: palette.obsidian[900],
            shadowOpacity: 0.2,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        >
          <View
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(247,243,237,0.12)' }}
          >
            <TrendingUp size={20} color={palette.obsidian[50]} strokeWidth={2.2} />
          </View>
          <View className="flex-1">
            <Text
              variant="caption"
              style={{ color: palette.obsidian[200], fontSize: 11 }}
            >
              Thu nhập của tôi
            </Text>
            <Text
              variant="h3"
              style={{
                color: palette.obsidian[50],
                fontFamily: 'BeVietnamPro_700Bold',
              }}
            >
              Tổng kết thu nhập & hoa hồng
            </Text>
          </View>
          <ChevronRight size={18} color={palette.obsidian[200]} />
        </Pressable>

        {/* Main menu */}
        <MenuSection title="Tài khoản">
          <MenuItem
            icon={<UserCog size={18} color={semantic.text.primary} />}
            label="Thông tin cá nhân"
            onPress={() => router.push('/(app)/me/profile')}
          />
          <MenuItem
            icon={<Bell size={18} color={semantic.text.primary} />}
            label="Thông báo"
            badge={settings.pushEnabled ? undefined : 'Đã tắt'}
            onPress={() => router.push('/(app)/notifications')}
          />
        </MenuSection>

        <MenuSection title="Dữ liệu & Bảo mật">
          <MenuItem
            icon={<SettingsIcon size={18} color={semantic.text.primary} />}
            label="Cài đặt"
            detail={settings.biometric ? 'Đã bật Face ID' : 'Chưa bật Face ID'}
            onPress={() => router.push('/(app)/me/settings')}
          />
          <MenuItem
            icon={<RefreshCw size={18} color={semantic.text.primary} />}
            label="Đồng bộ dữ liệu"
            detail={
              pendingSyncTotal > 0
                ? `${pendingSyncTotal} đang chờ`
                : 'Tất cả đã sync'
            }
            urgent={pendingSyncTotal > 0}
            onPress={() => router.push('/(app)/me/sync-status')}
          />
        </MenuSection>

        <MenuSection title="Khác">
          <MenuItem
            icon={<Info size={18} color={semantic.text.primary} />}
            label="Về ứng dụng"
            detail="K-Agent v1.0.0"
            onPress={() => router.push('/(app)/me/about')}
          />
        </MenuSection>

        {/* Logout */}
        <Pressable
          onPress={onLogout}
          className="mx-4 mt-5 flex-row items-center justify-center gap-2 h-12 rounded-2xl"
          style={{
            borderWidth: 1,
            borderColor: palette.red[100],
            backgroundColor: palette.white,
          }}
        >
          <LogOut size={17} color={palette.red[600]} />
          <Text
            variant="body"
            style={{ color: palette.red[600], fontFamily: 'BeVietnamPro_700Bold' }}
          >
            Đăng xuất
          </Text>
        </Pressable>

        <Text variant="caption" className="text-text-tertiary text-center mt-4 px-6">
          Build 2026.4.21 · K-CITY Broker Platform
        </Text>
      </ScrollView>
    </Screen>
  );
}

function StatCell({
  label,
  value,
  accent,
  isString,
}: {
  label: string;
  value: number | string;
  accent?: 'emerald';
  isString?: boolean;
}) {
  const color = accent === 'emerald' ? palette.emerald[700] : semantic.action.primaryDeep;
  return (
    <View className="flex-1">
      <Text variant="caption" className="text-text-secondary" numberOfLines={1}>
        {label}
      </Text>
      <Text
        variant="h3"
        style={{ color, fontFamily: 'BeVietnamPro_700Bold', marginTop: 2 }}
        numberOfLines={1}
      >
        {isString ? value : value}
      </Text>
    </View>
  );
}

function StatDivider() {
  return <View style={{ width: 1, backgroundColor: palette.sienna[100] }} />;
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-5">
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

function MenuItem({
  icon,
  label,
  detail,
  badge,
  urgent,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  detail?: string;
  badge?: string;
  urgent?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3.5 active:bg-surface-hover"
      style={{
        borderBottomWidth: 1,
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
      {urgent && (
        <View
          className="px-2 py-0.5 rounded-full mr-2"
          style={{ backgroundColor: palette.red[50] }}
        >
          <Text
            variant="caption"
            style={{
              color: palette.red[600],
              fontFamily: 'BeVietnamPro_700Bold',
              fontSize: 11,
            }}
          >
            {detail}
          </Text>
        </View>
      )}
      {!urgent && detail && (
        <Text variant="caption" className="text-text-tertiary mr-2" numberOfLines={1}>
          {detail}
        </Text>
      )}
      {badge && (
        <View
          className="px-2 py-0.5 rounded-full mr-2"
          style={{ backgroundColor: palette.slate[100] }}
        >
          <Text
            variant="caption"
            style={{
              color: palette.slate[600],
              fontFamily: 'BeVietnamPro_600SemiBold',
              fontSize: 11,
            }}
          >
            {badge}
          </Text>
        </View>
      )}
      <ChevronRight size={18} color={semantic.text.tertiary} />
    </Pressable>
  );
}
