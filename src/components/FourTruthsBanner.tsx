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
// Gradient brand sienna + 4 check chip, ribbon cut ở 2 đầu (skewed tails).
export function FourTruthsBanner({ truths }: Props) {
  const score = truthsScore(truths);
  const allPassed = score === 4;
  const keys: (keyof FourTruths)[] = ['photo', 'person', 'home', 'price'];

  return (
    <View className="flex-row items-center" style={{ height: 44 }}>
      {/* Left ribbon fold */}
      <View
        style={{
          width: 14,
          height: 44,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: 28,
            height: 44,
            backgroundColor: palette.sienna[900],
            transform: [{ skewY: '-20deg' }, { translateY: 8 }],
            marginLeft: -14,
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
          }}
        />
      </View>

      {/* Main ribbon body */}
      <LinearGradient
        colors={[...semantic.gradient.heroBrand]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          height: 44,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          gap: 12,
        }}
      >
        <Text
          variant="body"
          style={{
            color: palette.white,
            fontFamily: 'BeVietnamPro_700Bold',
            fontSize: 14,
          }}
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
                    fontSize: 12,
                    textDecorationLine: ok ? 'none' : 'line-through',
                  }}
                >
                  {truthLabels[k]}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Dot indicator when not 4/4 */}
        {!allPassed && (
          <View
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: palette.white, opacity: 0.7 }}
          />
        )}
      </LinearGradient>

      {/* Right ribbon fold */}
      <View
        style={{
          width: 14,
          height: 44,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: 28,
            height: 44,
            backgroundColor: palette.sienna[900],
            transform: [{ skewY: '20deg' }, { translateY: 8 }],
            marginLeft: 0,
            borderTopRightRadius: 4,
            borderBottomRightRadius: 4,
          }}
        />
      </View>
    </View>
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
        style={{
          color: palette.white,
          fontFamily: 'BeVietnamPro_700Bold',
          fontSize: 11,
        }}
      >
        {score}/4 thật
      </Text>
    </View>
  );
}
