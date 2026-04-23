import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { palette, semantic } from '@/theme';
import { truthLabels, truthsScore, type FourTruths } from '@/types/listing';

type Props = {
  truths: FourTruths;
};

// Full-width premium banner "Đạt N/4 thật" cho ListingDetail.
// Gradient brand sienna rectangle (squared), 4 check chip bên phải.
export function FourTruthsBanner({ truths }: Props) {
  const score = truthsScore(truths);
  const keys: (keyof FourTruths)[] = ['photo', 'person', 'home', 'price'];

  return (
    <LinearGradient
      colors={[...semantic.gradient.heroBrand]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
      }}
    >
      <Text
        variant="subtitle"
        style={{ color: palette.white, fontFamily: 'BeVietnamPro_700Bold' }}
      >
        Đạt {score}/4 thật
      </Text>

      <View className="flex-row items-center gap-3 flex-1 justify-end">
        {keys.map((k) => {
          const ok = truths[k];
          return (
            <View key={k} className="flex-row items-center gap-1">
              <View
                className="w-4 h-4 rounded-full items-center justify-center"
                style={{
                  backgroundColor: ok
                    ? 'rgba(255,255,255,0.22)'
                    : 'rgba(10,9,8,0.28)',
                }}
              >
                {ok ? (
                  <Check size={11} color={palette.white} strokeWidth={3.5} />
                ) : (
                  <X size={11} color={palette.white} strokeWidth={3} />
                )}
              </View>
              <Text
                variant="caption"
                style={{
                  color: ok ? palette.white : 'rgba(247,243,237,0.55)',
                  fontFamily: 'BeVietnamPro_500Medium',
                  textDecorationLine: ok ? 'none' : 'line-through',
                }}
              >
                {truthLabels[k]}
              </Text>
            </View>
          );
        })}
      </View>
    </LinearGradient>
  );
}

// Compact pill for ListingCard — just "4/4 thật" badge
export function FourTruthsPill({ truths }: Props) {
  const score = truthsScore(truths);
  const full = score === 4;
  return (
    <View
      className="flex-row items-center gap-1 px-2 py-1 rounded-full"
      style={{
        backgroundColor: full ? semantic.action.primaryDeep : palette.obsidian[700],
      }}
    >
      <Check size={11} color={palette.white} strokeWidth={3.5} />
      <Text
        variant="caption"
        style={{ color: palette.white, fontFamily: 'BeVietnamPro_700Bold' }}
      >
        {score}/4 thật
      </Text>
    </View>
  );
}
