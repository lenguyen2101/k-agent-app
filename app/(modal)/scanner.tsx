import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Linking,
  Pressable,
  StatusBar,
  Vibration,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  Camera as CameraIcon,
  CheckCircle2,
  Flashlight,
  FlashlightOff,
  Info,
  X,
  Zap,
} from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { parseCccd, type CccdData } from '@/lib/cccd';
import { useScanResult } from '@/store/scanResult';
import { palette, semantic } from '@/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const FRAME_SIZE = Math.min(SCREEN_W - 64, 280);

// Debug scan — 1 mock QR string cho iOS simulator (camera simulator chỉ cho frame trắng)
const DEBUG_QR =
  '001234567890|012345678|BUI THI HUONG|15051998|NU|18 Nguyen Van Linh, Q.7, TP.HCM|15052021';

export default function Scanner() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState(false);
  const [scanned, setScanned] = useState<CccdData | null>(null);
  const setPending = useScanResult((s) => s.setPending);
  const cooldownRef = useRef(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleQr = (raw: string) => {
    if (cooldownRef.current || scanned) return;
    const data = parseCccd(raw);
    if (!data) {
      // QR detect được nhưng parser không hiểu → show raw để debug.
      cooldownRef.current = true;
      Vibration.vibrate(80);
      const preview = raw.length > 200 ? `${raw.slice(0, 200)}...` : raw;
      Alert.alert(
        'QR không đúng format CCCD',
        `Camera đọc được QR nhưng không khớp spec chuẩn (7 field ngăn "|"). Vui lòng quét QR ở mặt trước thẻ CCCD.\n\nNội dung raw:\n${preview}`,
        [
          { text: 'Thử lại', onPress: () => (cooldownRef.current = false) },
          {
            text: 'Copy raw',
            onPress: () => {
              // Dev có thể share raw string này để mình chỉnh parser
              console.log('[CCCD raw QR]', raw);
              cooldownRef.current = false;
            },
          },
        ]
      );
      return;
    }
    cooldownRef.current = true;
    Vibration.vibrate([0, 60, 40, 60]);
    setScanned(data);
  };

  const confirmAndReturn = () => {
    if (!scanned) return;
    setPending(scanned);
    router.back();
  };

  // Permission denied state
  if (permission && !permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.obsidian[900] }}>
        <StatusBar barStyle="light-content" />
        <View
          style={{
            flex: 1,
            paddingTop: insets.top + 40,
            paddingHorizontal: 24,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            className="w-20 h-20 rounded-3xl items-center justify-center mb-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <CameraIcon size={36} color={palette.obsidian[50]} strokeWidth={1.8} />
          </View>
          <Text
            style={{
              color: palette.white,
              fontFamily: 'BeVietnamPro_700Bold',
              fontSize: 22,
              textAlign: 'center',
            }}
          >
            Cần quyền Camera
          </Text>
          <Text
            variant="body"
            style={{
              color: 'rgba(255,255,255,0.75)',
              textAlign: 'center',
              marginTop: 8,
              lineHeight: 22,
            }}
          >
            K-Agent cần truy cập camera để quét QR trên mặt sau thẻ CCCD của khách.
          </Text>
          <View style={{ gap: 10, marginTop: 28, width: '100%' }}>
            <Pressable
              onPress={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}
              className="h-12 rounded-2xl items-center justify-center"
              style={{ backgroundColor: semantic.action.primary }}
            >
              <Text style={{ color: palette.white, fontFamily: 'BeVietnamPro_700Bold' }}>
                {permission.canAskAgain ? 'Cấp quyền Camera' : 'Mở Settings hệ thống'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.back()}
              className="h-12 rounded-2xl items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <Text style={{ color: palette.obsidian[50], fontFamily: 'BeVietnamPro_600SemiBold' }}>
                Đóng
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.obsidian[900] }}>
      <StatusBar barStyle="light-content" />

      <CameraView
        style={{ flex: 1 }}
        facing="back"
        enableTorch={flash}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'pdf417', 'datamatrix'],
        }}
        onBarcodeScanned={(e) => handleQr(e.data)}
      >
        {/* Top bar */}
        <View
          className="flex-row items-center justify-between px-3"
          style={{ paddingTop: insets.top + 4, paddingBottom: 10 }}
        >
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            hitSlop={8}
          >
            <X size={20} color={palette.white} />
          </Pressable>
          <Text
            style={{
              color: palette.white,
              fontFamily: 'BeVietnamPro_700Bold',
              fontSize: 16,
            }}
          >
            Quét CCCD
          </Text>
          <Pressable
            onPress={() => setFlash((f) => !f)}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: flash ? semantic.action.primary : 'rgba(0,0,0,0.5)' }}
            hitSlop={8}
          >
            {flash ? (
              <Flashlight size={18} color={palette.white} />
            ) : (
              <FlashlightOff size={18} color={palette.white} />
            )}
          </Pressable>
        </View>

        {/* Viewfinder */}
        <View className="flex-1 items-center justify-center">
          <View
            style={{
              width: FRAME_SIZE,
              height: FRAME_SIZE,
              position: 'relative',
            }}
          >
            <Corner position="tl" />
            <Corner position="tr" />
            <Corner position="bl" />
            <Corner position="br" />
          </View>
        </View>

        {/* Bottom hint + debug */}
        <View
          style={{
            paddingBottom: insets.bottom + 16,
            paddingHorizontal: 24,
            paddingTop: 20,
          }}
        >
          <View
            className="flex-row items-center gap-2 p-3 rounded-2xl"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          >
            <Info size={16} color={semantic.action.primary} />
            <Text
              variant="caption"
              style={{ color: palette.white, flex: 1, lineHeight: 18 }}
            >
              Đưa mã QR tại mặt trước CCCD vào khung để quét thông tin.
            </Text>
          </View>

          {__DEV__ && (
            <Pressable
              onPress={() => handleQr(DEBUG_QR)}
              className="mt-3 flex-row items-center justify-center gap-2 py-3 rounded-2xl"
              style={{ backgroundColor: 'rgba(247,243,237,0.12)' }}
            >
              <Zap size={14} color={palette.obsidian[50]} />
              <Text
                variant="caption"
                style={{
                  color: palette.obsidian[50],
                  fontFamily: 'BeVietnamPro_600SemiBold',
                  fontSize: 12,
                }}
              >
                DEV: Quét mẫu (Bùi Thị Hương)
              </Text>
            </Pressable>
          )}
        </View>
      </CameraView>

      {/* Success preview overlay */}
      {scanned && (
        <View
          className="absolute left-0 right-0 bottom-0"
          style={{
            paddingBottom: insets.bottom + 16,
            paddingHorizontal: 16,
            paddingTop: 16,
            backgroundColor: 'rgba(0,0,0,0.75)',
          }}
        >
          <View
            className="p-4 rounded-2xl"
            style={{ backgroundColor: palette.white }}
          >
            <View className="flex-row items-center gap-2 mb-3">
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: palette.emerald[50] }}
              >
                <CheckCircle2 size={18} color={palette.emerald[700]} strokeWidth={2.4} />
              </View>
              <Text
                style={{
                  color: palette.emerald[700],
                  fontFamily: 'BeVietnamPro_700Bold',
                  letterSpacing: 0.5,
                  fontSize: 11,
                }}
              >
                QUÉT THÀNH CÔNG
              </Text>
            </View>

            <InfoRow label="Họ tên" value={scanned.fullName} emphasis />
            <InfoRow label="CCCD" value={scanned.idNumber} />
            <InfoRow label="Ngày sinh" value={`${scanned.birthDate} · ${scanned.gender}`} />
            <InfoRow label="Địa chỉ" value={scanned.address} last />

            <View className="flex-row gap-2 mt-3">
              <Pressable
                onPress={() => {
                  cooldownRef.current = false;
                  setScanned(null);
                }}
                className="flex-1 h-11 rounded-xl items-center justify-center"
                style={{
                  backgroundColor: palette.white,
                  borderWidth: 1,
                  borderColor: semantic.border.default,
                }}
              >
                <Text
                  style={{
                    color: semantic.text.primary,
                    fontFamily: 'BeVietnamPro_600SemiBold',
                  }}
                >
                  Quét lại
                </Text>
              </Pressable>
              <Pressable
                onPress={confirmAndReturn}
                className="flex-[1.4] h-11 rounded-xl items-center justify-center"
                style={{
                  backgroundColor: semantic.action.primary,
                  shadowColor: semantic.action.primaryDeep,
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 3,
                }}
              >
                <Text
                  style={{
                    color: palette.white,
                    fontFamily: 'BeVietnamPro_700Bold',
                  }}
                >
                  Dùng thông tin này
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function Corner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const SIZE = 32;
  const THICK = 3;
  const COLOR = palette.white;
  const common: {
    position: 'absolute';
    width: number;
    height: number;
    borderColor: string;
  } = { position: 'absolute', width: SIZE, height: SIZE, borderColor: COLOR };

  const borders: Record<typeof position, {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    borderTopWidth?: number;
    borderBottomWidth?: number;
    borderLeftWidth?: number;
    borderRightWidth?: number;
    borderTopLeftRadius?: number;
    borderTopRightRadius?: number;
    borderBottomLeftRadius?: number;
    borderBottomRightRadius?: number;
  }> = {
    tl: { top: 0, left: 0, borderTopWidth: THICK, borderLeftWidth: THICK, borderTopLeftRadius: 10 },
    tr: { top: 0, right: 0, borderTopWidth: THICK, borderRightWidth: THICK, borderTopRightRadius: 10 },
    bl: { bottom: 0, left: 0, borderBottomWidth: THICK, borderLeftWidth: THICK, borderBottomLeftRadius: 10 },
    br: { bottom: 0, right: 0, borderBottomWidth: THICK, borderRightWidth: THICK, borderBottomRightRadius: 10 },
  };

  return <View style={{ ...common, ...borders[position] }} />;
}

function InfoRow({
  label,
  value,
  emphasis,
  last,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  last?: boolean;
}) {
  return (
    <View
      className="flex-row items-start py-2"
      style={{
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: semantic.border.light,
      }}
    >
      <Text
        variant="caption"
        style={{ color: semantic.text.secondary, width: 80, flexShrink: 0, fontSize: 12 }}
      >
        {label}
      </Text>
      <Text
        variant="body"
        style={{
          color: semantic.text.primary,
          flex: 1,
          fontFamily: emphasis ? 'BeVietnamPro_700Bold' : 'BeVietnamPro_500Medium',
        }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}
