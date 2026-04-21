import { Pressable, ScrollView, Switch, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronRight,
  PhoneCall,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react-native';
import { useAuth } from '@/store/auth';
import { leads } from '@/mock/leads';
import { LeadCard } from '@/components/LeadCard';
import { HeroStatsCard, type PipelineSegment } from '@/components/HeroStatsCard';
import { QuickActionRow, type QuickAction } from '@/components/QuickActionRow';
import { SalesProfileHeader } from '@/components/SalesProfileHeader';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/ui/Text';
import { isOverdue } from '@/lib/format';
import { statusToGroup } from '@/types/lead';
import { palette, semantic } from '@/theme';

export default function Home() {
  const user = useAuth((s) => s.user);
  const isOnline = useAuth((s) => s.isOnline);
  const toggleOnline = useAuth((s) => s.toggleOnline);

  const overdueLeads = leads.filter(
    (l) => isOverdue(l.nextFollowupAt) && l.status !== 'CLOSED_WON' && l.status !== 'CLOSED_LOST'
  );
  const newLeads = leads.filter((l) => l.status === 'NEW');
  const dealsThisMonth = leads.filter(
    (l) => l.status === 'DEPOSITED' || l.status === 'CONTRACTED' || l.status === 'CLOSED_WON'
  );

  const pipeline: PipelineSegment[] = (['new', 'engaged', 'midfunnel', 'closing', 'won'] as const).map(
    (group) => {
      const count = leads.filter((l) => statusToGroup[l.status] === group).length;
      const color = semantic.leadGroup[group].dot;
      const labelMap = {
        new: 'Mới',
        engaged: 'Đang trao đổi',
        midfunnel: 'Hẹn/Xem',
        closing: 'Chốt',
        won: 'Thành công',
      } as const;
      return { key: group, label: labelMap[group], count, color };
    }
  );

  const quickActions: QuickAction[] = [
    {
      key: 'new-lead',
      label: 'Lead mới',
      icon: Users,
      badge: newLeads.length || undefined,
      onPress: () => router.push('/(app)/(tabs)/leads'),
    },
    {
      key: 'call',
      label: 'Gọi nhanh',
      icon: PhoneCall,
      onPress: () => router.push('/(app)/(tabs)/leads'),
    },
    {
      key: 'share',
      label: 'Giới thiệu',
      icon: Share2,
    },
    {
      key: 'income',
      label: 'Thu nhập',
      icon: TrendingUp,
      onPress: () => router.push('/(app)/income'),
    },
  ];

  return (
    <Screen>
      <ScrollView className="flex-1" contentContainerClassName="pb-8">
        <SalesProfileHeader
          name={user?.fullName ?? ''}
          team={user?.team}
          tier="Tân binh"
          unreadCount={overdueLeads.length}
          onBellPress={() => router.push('/(app)/notifications')}
        />

        <View className="px-4 pt-1">
          <QuickActionRow actions={quickActions} />
        </View>

        <View className="px-4 pt-5">
          <HeroStatsCard
            title="Trung tâm điều khiển"
            subtitle="Tổng quan hoạt động hôm nay"
            pipeline={pipeline}
            stats={[
              { label: 'Lead mới', value: newLeads.length, tone: 'accent' },
              { label: 'Quá hạn FU', value: overdueLeads.length, tone: 'urgent' },
              { label: 'Đã chốt', value: dealsThisMonth.length, tone: 'success' },
            ]}
          />
        </View>

        <View className="mx-4 mt-4 p-4 rounded-2xl bg-surface-card border border-border-light flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: isOnline ? palette.emerald[100] : semantic.surface.alt }}
            >
              <View
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: isOnline ? palette.emerald[500] : semantic.text.tertiary }}
              />
            </View>
            <View className="flex-1">
              <Text variant="h3" className="text-text-primary">
                {isOnline ? 'Đang nhận lead' : 'Tạm tắt nhận lead'}
              </Text>
              <Text variant="caption" className="text-text-secondary mt-0.5">
                {isOnline ? 'AI sẽ gửi lead mới cho bạn' : 'Bật để bắt đầu nhận lead'}
              </Text>
            </View>
          </View>
          <Switch
            value={isOnline}
            onValueChange={toggleOnline}
            trackColor={{ true: palette.emerald[100], false: semantic.border.default }}
            thumbColor={isOnline ? palette.emerald[500] : palette.white}
            ios_backgroundColor={semantic.border.default}
          />
        </View>

        <Pressable onPress={() => router.push('/(modal)/lead-offer')} className="mx-4 mt-4">
          <View
            className="rounded-2xl overflow-hidden"
            style={{
              shadowColor: semantic.action.primaryDeep,
              shadowOpacity: 0.25,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 6,
            }}
          >
            <LinearGradient
              colors={[...semantic.gradient.heroBrand]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <View
                className="w-11 h-11 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(247,243,237,0.18)' }}
              >
                <Sparkles size={22} color={palette.white} strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text variant="h3" style={{ color: palette.white }}>
                  Demo: Lead mới đến!
                </Text>
                <Text variant="caption" style={{ color: 'rgba(247,243,237,0.85)', marginTop: 2 }}>
                  Tap để xem màn hình nhận lead
                </Text>
              </View>
              <ChevronRight size={20} color={palette.white} />
            </LinearGradient>
          </View>
        </Pressable>

        <View className="mt-6 px-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text variant="h3" className="text-text-primary">
              Cần follow up hôm nay
            </Text>
            {overdueLeads.length > 0 && (
              <Pressable onPress={() => router.push('/(app)/(tabs)/leads')}>
                <Text variant="caption" style={{ color: semantic.action.primary, fontFamily: 'BeVietnamPro_500Medium' }}>
                  Xem tất cả
                </Text>
              </Pressable>
            )}
          </View>
          <View className="gap-3">
            {overdueLeads.length === 0 ? (
              <View className="bg-surface-card rounded-2xl border border-border-light p-6 items-center">
                <Text variant="body" className="text-text-secondary">
                  Chưa có lead nào quá hạn
                </Text>
              </View>
            ) : (
              overdueLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onPress={() => router.push(`/(app)/leads/${lead.id}`)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
