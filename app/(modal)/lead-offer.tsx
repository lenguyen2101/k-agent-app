import { useEffect, useMemo, useState } from 'react';
import { Pressable, Vibration, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  Building2,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react-native';
import { incomingOffer } from '@/mock/leads';
import { Text } from '@/components/ui/Text';
import { palette, semantic } from '@/theme';

const COUNTDOWN_SECONDS = 60;

export default function LeadOfferModal() {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const offer = incomingOffer;

  // Countdown + pulse vibration 2s đầu (giả lập "ring" như Grab).
  useEffect(() => {
    Vibration.vibrate([0, 400, 200, 400], false);
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          router.back();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      clearInterval(t);
      Vibration.cancel();
    };
  }, []);

  const progress = useMemo(() => secondsLeft / COUNTDOWN_SECONDS, [secondsLeft]);
  const urgent = secondsLeft <= 15;

  return (
    <LinearGradient
      colors={[...semantic.gradient.heroBrand]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        {/* Top bar: dismiss */}
        <View className="px-4 pt-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(247,243,237,0.18)' }}
            >
              <Bell size={16} color={palette.white} />
            </View>
            <Text
              variant="caption"
              style={{
                color: palette.white,
                fontFamily: 'BeVietnamPro_700Bold',
                letterSpacing: 0.8,
              }}
            >
              LEAD MỚI · AI PHÂN BỔ
            </Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(247,243,237,0.18)' }}
            hitSlop={8}
          >
            <X size={18} color={palette.white} />
          </Pressable>
        </View>

        {/* Countdown hero */}
        <View className="items-center mt-8 mb-4 px-6">
          <View
            className="w-36 h-36 rounded-full items-center justify-center"
            style={{
              backgroundColor: 'rgba(247,243,237,0.14)',
              borderWidth: 5,
              borderColor: urgent ? palette.red[500] : 'rgba(247,243,237,0.35)',
            }}
          >
            <Text
              variant="caption"
              style={{
                color: 'rgba(247,243,237,0.75)',
                fontFamily: 'BeVietnamPro_600SemiBold',
                fontSize: 11,
                letterSpacing: 1,
              }}
            >
              CÒN LẠI
            </Text>
            <Text
              style={{
                color: palette.white,
                fontFamily: 'BeVietnamPro_700Bold',
                fontSize: 52,
                lineHeight: 58,
              }}
            >
              {secondsLeft}s
            </Text>
          </View>

          <View className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden mt-6">
            <View
              className="h-full rounded-full"
              style={{
                width: `${progress * 100}%`,
                backgroundColor: urgent ? palette.red[500] : palette.white,
              }}
            />
          </View>
          <Text
            variant="caption"
            style={{
              color: 'rgba(247,243,237,0.82)',
              marginTop: 10,
              fontFamily: 'BeVietnamPro_500Medium',
            }}
          >
            {urgent ? 'Sắp hết thời gian nhận lead' : 'Bạn có 60s để nhận lead này'}
          </Text>
        </View>

        {/* Lead card */}
        <View className="mx-5 mt-2 rounded-2xl bg-white overflow-hidden"
          style={{
            shadowColor: palette.obsidian[900],
            shadowOpacity: 0.2,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          }}
        >
          <View className="p-4">
            <View className="flex-row items-center gap-3">
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: semantic.surface.brandSoft }}
              >
                <Text
                  variant="h3"
                  style={{
                    color: semantic.action.primaryDeep,
                    fontFamily: 'BeVietnamPro_700Bold',
                  }}
                >
                  {leadInitials(offer.lead.fullName)}
                </Text>
              </View>
              <View className="flex-1">
                <Text variant="h2" className="text-text-title">
                  {offer.lead.fullName}
                </Text>
                <Text variant="body" className="text-text-secondary mt-0.5">
                  {offer.lead.phone}
                </Text>
              </View>
              <View
                className="px-2.5 py-1 rounded-full"
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
                  MỚI
                </Text>
              </View>
            </View>

            {offer.lead.noxhProfile?.ekycVerified && (
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
                  eKYC từ noxh.net · {offer.lead.noxhProfile.province}
                </Text>
              </View>
            )}
          </View>

          <View
            className="px-4 py-3"
            style={{
              borderTopWidth: 1,
              borderTopColor: semantic.border.light,
              backgroundColor: semantic.surface.alt,
            }}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <Sparkles size={13} color={semantic.action.primary} />
              <Text
                variant="caption"
                style={{
                  color: semantic.action.primary,
                  fontFamily: 'BeVietnamPro_700Bold',
                  letterSpacing: 0.5,
                }}
              >
                QUAN TÂM DỰ ÁN
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Building2 size={15} color={semantic.text.primary} />
              <Text
                variant="h3"
                style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold', flex: 1 }}
                numberOfLines={1}
              >
                {offer.lead.primaryProject.name}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5 mt-1.5">
              <MapPin size={12} color={semantic.text.tertiary} />
              <Text variant="caption" className="text-text-secondary flex-1" numberOfLines={1}>
                {offer.lead.primaryProject.location}
              </Text>
            </View>
            <View
              className="flex-row items-center justify-between mt-3 pt-3"
              style={{ borderTopWidth: 1, borderTopColor: semantic.border.light }}
            >
              <Text variant="caption" className="text-text-secondary">
                Khoảng giá
              </Text>
              <Text
                variant="body"
                style={{
                  color: semantic.action.primaryDeep,
                  fontFamily: 'BeVietnamPro_700Bold',
                }}
              >
                {offer.lead.primaryProject.priceRange}
              </Text>
            </View>
          </View>
        </View>

        {/* Sticky CTAs */}
        <View className="flex-1" />
        <View className="px-5 pb-2 gap-2.5">
          <Pressable
            onPress={() => {
              router.back();
              router.push(`/(app)/leads/${offer.lead.id}`);
            }}
            className="h-14 rounded-2xl flex-row items-center justify-center gap-2"
            style={{
              backgroundColor: palette.white,
              shadowColor: palette.obsidian[900],
              shadowOpacity: 0.3,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
            }}
          >
            <Text
              variant="body"
              style={{
                color: semantic.action.primaryDeep,
                fontFamily: 'BeVietnamPro_700Bold',
                fontSize: 17,
                letterSpacing: 0.3,
              }}
            >
              NHẬN LEAD
            </Text>
            <ChevronRight size={20} color={semantic.action.primaryDeep} strokeWidth={2.5} />
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            className="h-11 rounded-2xl items-center justify-center"
          >
            <Text
              variant="body"
              style={{
                color: 'rgba(247,243,237,0.85)',
                fontFamily: 'BeVietnamPro_500Medium',
              }}
            >
              Từ chối lead này
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function leadInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();
}
