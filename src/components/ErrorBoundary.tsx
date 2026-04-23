import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { Bug, RefreshCw, Send, SquareStack } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { palette, semantic } from '@/theme';

// Global error boundary — React class component. Bắt error từ descendants.
// Phase integrate: sendLog() → Sentry.captureException(error) + device info.

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
  errorInfo: ErrorInfo | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error, errorInfo.componentStack);
    }
  }

  reset = () => {
    this.setState({ error: null, errorInfo: null });
  };

  sendLog = () => {
    const { error } = this.state;
    // eslint-disable-next-line no-console
    console.log('[ErrorBoundary] log sent:', error?.message);
    Alert.alert(
      'Đã gửi log',
      'Đội kỹ thuật K-CITY sẽ kiểm tra và phản hồi trong 24h. Cảm ơn bạn đã báo lỗi.',
      [{ text: 'OK' }]
    );
  };

  render() {
    const { error, errorInfo } = this.state;
    if (!error) return this.props.children;

    return <ErrorFallback error={error} errorInfo={errorInfo} onReset={this.reset} onSendLog={this.sendLog} />;
  }
}

function ErrorFallback({
  error,
  errorInfo,
  onReset,
  onSendLog,
}: {
  error: Error;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  onSendLog: () => void;
}) {
  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: 60 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingBottom: 40,
        }}
      >
        {/* Hero icon */}
        <View className="items-center mt-8 mb-6">
          <View
            className="w-24 h-24 rounded-3xl items-center justify-center"
            style={{
              backgroundColor: palette.red[50],
              borderWidth: 1,
              borderColor: palette.red[100],
            }}
          >
            <Bug size={40} color={palette.red[600]} strokeWidth={2} />
          </View>
        </View>

        <Text
          variant="display"
          style={{ color: semantic.text.primary, textAlign: 'center' }}
        >
          Có lỗi xảy ra
        </Text>
        <Text
          variant="body-lg"
          className="text-text-secondary text-center mt-2"
          style={{ lineHeight: 22 }}
        >
          K-Agent gặp sự cố không mong muốn. Đội kỹ thuật đã nhận được log tự động.{'\n'}
          Bạn có thể thử lại hoặc gửi thêm chi tiết cho team.
        </Text>

        {/* Error detail (dev only) */}
        {__DEV__ && (
          <View
            className="mt-6 p-3 rounded-2xl"
            style={{
              backgroundColor: palette.obsidian[700],
            }}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <SquareStack size={13} color={palette.obsidian[200]} />
              <Text variant="badge" style={{ color: palette.obsidian[200] }}>
                Chi tiết lỗi (dev)
              </Text>
            </View>
            <Text
              variant="caption"
              style={{ color: palette.red[100], fontFamily: 'BeVietnamPro_500Medium' }}
            >
              {error.message}
            </Text>
            {errorInfo?.componentStack && (
              <Text
                variant="caption"
                style={{ color: palette.obsidian[200], marginTop: 8 }}
                numberOfLines={6}
              >
                {errorInfo.componentStack.trim()}
              </Text>
            )}
          </View>
        )}

        <View className="flex-1" />

        {/* CTAs */}
        <Pressable
          onPress={onReset}
          className="h-14 rounded-2xl flex-row items-center justify-center gap-2 mt-8"
          style={{
            backgroundColor: semantic.action.primary,
            shadowColor: semantic.action.primaryDeep,
            shadowOpacity: 0.25,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        >
          <RefreshCw size={18} color={palette.white} strokeWidth={2.4} />
          <Text
            variant="button"
            style={{ color: palette.white, letterSpacing: 0.3 }}
          >
            Thử lại
          </Text>
        </Pressable>

        <Pressable
          onPress={onSendLog}
          className="h-12 rounded-2xl flex-row items-center justify-center gap-2 mt-2"
          style={{
            backgroundColor: palette.white,
            borderWidth: 1,
            borderColor: semantic.border.default,
          }}
        >
          <Send size={15} color={semantic.text.primary} strokeWidth={2.2} />
          <Text
            variant="subtitle"
            style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_600SemiBold' }}
          >
            Gửi log chi tiết cho team
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
