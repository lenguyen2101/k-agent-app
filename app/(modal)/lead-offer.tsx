import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, ShieldCheck, Sparkles } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { incomingOffer } from '@/mock/leads';
import { Text } from '@/components/ui/Text';
import { palette, semantic } from '@/theme';

export default function LeadOfferModal() {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const offer = incomingOffer;

  useEffect(() => {
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
    return () => clearInterval(t);
  }, []);

  const progress = (secondsLeft / 60) * 100;

  return (
    <LinearGradient
      colors={[...semantic.gradient.heroBrand]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 pt-12 items-center">
          <View className="flex-row items-center gap-2 mb-6">
            <Sparkles size={20} color={palette.white} />
            <Text variant="badge" className="text-white">
              Lead mới được AI phân bổ
            </Text>
          </View>

          <View className="w-32 h-32 rounded-full bg-white/15 items-center justify-center mb-6 border-4 border-white/30">
            <Text variant="display" className="text-white">{secondsLeft}s</Text>
          </View>

          <View className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden mb-8">
            <View className="h-full bg-white rounded-full" style={{ width: `${progress}%` }} />
          </View>

          <View className="bg-white rounded-lg p-5 w-full">
            <Text variant="h2" className="text-text-title">{offer.lead.fullName}</Text>
            <Text variant="body" className="text-text-secondary mt-1">{offer.lead.phone}</Text>

            {offer.lead.noxhProfile?.ekycVerified && (
              <View className="flex-row items-center gap-1.5 mt-3 bg-status-success-bg self-start px-3 py-1.5 rounded-full">
                <ShieldCheck size={14} color={semantic.status.success} />
                <Text variant="caption" className="text-status-success" style={{ fontWeight: '600' }}>
                  eKYC từ noxh.net · {offer.lead.noxhProfile.province}
                </Text>
              </View>
            )}

            <View className="mt-4 pt-4 border-t border-border-light">
              <Text variant="badge" className="text-text-secondary mb-1">
                Quan tâm dự án
              </Text>
              <Text variant="h3" className="text-text-primary">
                {offer.lead.primaryProject.name}
              </Text>
              <View className="flex-row items-center gap-1.5 mt-1">
                <MapPin size={14} color={semantic.text.tertiary} />
                <Text variant="caption" className="text-text-tertiary">
                  {offer.lead.primaryProject.location}
                </Text>
              </View>
              <Text variant="body" className="text-text-secondary mt-2">
                Khoảng giá: {offer.lead.primaryProject.priceRange}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6 pb-8 gap-3">
          <Pressable
            onPress={() => {
              router.back();
              router.push('/(app)/leads/l1');
            }}
            className="h-14 rounded-md bg-text-primary items-center justify-center active:opacity-90"
          >
            <Text variant="button" className="text-white">NHẬN LEAD</Text>
          </Pressable>
          <Pressable
            onPress={() => router.back()}
            className="h-12 rounded-md items-center justify-center"
          >
            <Text variant="button" className="text-white/80">Từ chối</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
