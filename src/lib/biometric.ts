import {
  authenticateAsync,
  hasHardwareAsync,
  isEnrolledAsync,
  supportedAuthenticationTypesAsync,
  AuthenticationType,
} from 'expo-local-authentication';

export type BiometricKind = 'face' | 'fingerprint' | 'iris' | 'none';

export type BiometricCapability = {
  supported: boolean;      // hardware có hỗ trợ
  enrolled: boolean;       // user đã setup biometric trên device chưa
  kind: BiometricKind;     // loại (Face ID / Touch ID / Iris)
  labelVi: string;         // nhãn tiếng Việt
};

export async function getBiometricCapability(): Promise<BiometricCapability> {
  const supported = await hasHardwareAsync();
  if (!supported) {
    return { supported: false, enrolled: false, kind: 'none', labelVi: 'Sinh trắc học' };
  }
  const enrolled = await isEnrolledAsync();
  const types = await supportedAuthenticationTypesAsync();

  let kind: BiometricKind = 'none';
  let labelVi = 'Sinh trắc học';
  if (types.includes(AuthenticationType.FACIAL_RECOGNITION)) {
    kind = 'face';
    labelVi = 'Face ID';
  } else if (types.includes(AuthenticationType.FINGERPRINT)) {
    kind = 'fingerprint';
    labelVi = 'Touch ID';
  } else if (types.includes(AuthenticationType.IRIS)) {
    kind = 'iris';
    labelVi = 'Iris Scan';
  }

  return { supported, enrolled, kind, labelVi };
}

export async function authenticateBiometric(reason: string): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await authenticateAsync({
      promptMessage: reason,
      cancelLabel: 'Huỷ',
      fallbackLabel: 'Dùng mật khẩu',
      disableDeviceFallback: false,
    });
    if (result.success) return { success: true };
    return { success: false, error: result.error ?? 'cancelled' };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'unknown' };
  }
}
