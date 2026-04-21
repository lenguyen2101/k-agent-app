import { Alert, FlatList, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CloudOff,
  CloudUpload,
  GitMerge,
  RotateCw,
} from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import {
  mutationTypeLabels,
  pendingMutations,
  syncSummary,
  type PendingMutation,
  type SyncStatus,
} from '@/mock/sync';
import { formatRelativeTime } from '@/lib/format';
import { palette, semantic } from '@/theme';

const statusMeta: Record<SyncStatus, { label: string; color: string; bg: string; icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }> }> = {
  PENDING:  { label: 'Đang chờ sync',   color: palette.sienna[700], bg: palette.sienna[50],  icon: CloudUpload },
  FAILED:   { label: 'Thất bại',         color: palette.red[600],    bg: palette.red[50],      icon: AlertCircle },
  CONFLICT: { label: 'Xung đột',         color: palette.violet[700], bg: palette.violet[50],   icon: GitMerge },
  SYNCED:   { label: 'Đã sync',          color: palette.emerald[700],bg: palette.emerald[50],  icon: CheckCircle2 },
};

export default function SyncStatusScreen() {
  const insets = useSafeAreaInsets();

  const totalPending = syncSummary.pendingCount + syncSummary.failedCount + syncSummary.conflictCount;
  const allSynced = totalPending === 0;

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
          Đồng bộ dữ liệu
        </Text>
        <Pressable
          onPress={() => Alert.alert('Đang thử lại', 'Đang retry tất cả mutation đang chờ.')}
          className="w-10 h-10 items-center justify-center"
          hitSlop={8}
        >
          <RotateCw size={18} color={semantic.text.secondary} />
        </Pressable>
      </View>

      <FlatList
        data={pendingMutations}
        keyExtractor={(m) => m.id}
        ListHeaderComponent={
          <View>
            {/* Summary card */}
            <View
              className="mx-4 mt-4 p-5 rounded-2xl"
              style={{
                backgroundColor: allSynced ? palette.emerald[50] : semantic.action.primarySoft,
                borderWidth: 1,
                borderColor: allSynced ? palette.emerald[50] : palette.sienna[100],
              }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="w-12 h-12 rounded-2xl items-center justify-center"
                  style={{
                    backgroundColor: allSynced ? palette.emerald[500] : semantic.action.primary,
                  }}
                >
                  {allSynced ? (
                    <CheckCircle2 size={22} color={palette.white} strokeWidth={2.4} />
                  ) : (
                    <CloudUpload size={22} color={palette.white} strokeWidth={2.4} />
                  )}
                </View>
                <View className="flex-1">
                  <Text
                    variant="h2"
                    style={{
                      color: allSynced ? palette.emerald[700] : semantic.action.primaryDeep,
                      fontFamily: 'BeVietnamPro_700Bold',
                    }}
                  >
                    {allSynced ? 'Tất cả đã sync' : `${totalPending} mục đang chờ`}
                  </Text>
                  <Text
                    variant="caption"
                    style={{
                      color: allSynced ? palette.emerald[700] : semantic.action.primaryDeep,
                      opacity: 0.85,
                      marginTop: 2,
                    }}
                  >
                    {allSynced
                      ? 'Dữ liệu local khớp với server'
                      : 'Sẽ tự động sync khi có mạng'}
                  </Text>
                </View>
              </View>

              {!allSynced && (
                <View className="flex-row gap-2 mt-4">
                  {syncSummary.pendingCount > 0 && (
                    <StatChip
                      count={syncSummary.pendingCount}
                      label="Chờ"
                      color={palette.sienna[700]}
                      bg={palette.white}
                    />
                  )}
                  {syncSummary.failedCount > 0 && (
                    <StatChip
                      count={syncSummary.failedCount}
                      label="Lỗi"
                      color={palette.red[600]}
                      bg={palette.white}
                    />
                  )}
                  {syncSummary.conflictCount > 0 && (
                    <StatChip
                      count={syncSummary.conflictCount}
                      label="Xung đột"
                      color={palette.violet[700]}
                      bg={palette.white}
                    />
                  )}
                </View>
              )}
            </View>

            {/* Offline banner hint */}
            <View
              className="mx-4 mt-3 p-3 rounded-xl flex-row items-center gap-2"
              style={{ backgroundColor: palette.sky[50] }}
            >
              <CloudOff size={16} color={palette.sky[600]} />
              <Text variant="caption" style={{ color: palette.sky[600], flex: 1 }}>
                K-Agent lưu mọi thay đổi offline. Mutation queue persistent qua MMKV, retry tự động.
              </Text>
            </View>

            {pendingMutations.length > 0 && (
              <Text
                variant="caption"
                className="px-4 mt-5 mb-2"
                style={{
                  color: semantic.text.secondary,
                  fontFamily: 'BeVietnamPro_700Bold',
                  letterSpacing: 0.5,
                }}
              >
                CHI TIẾT ({pendingMutations.length})
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => <MutationRow mutation={item} />}
        contentContainerStyle={{ paddingBottom: 32, gap: 10 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={null}
      />
    </View>
  );
}

function StatChip({
  count,
  label,
  color,
  bg,
}: {
  count: number;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <View
      className="flex-row items-baseline gap-1 px-3 py-1.5 rounded-full"
      style={{ backgroundColor: bg }}
    >
      <Text
        style={{
          color,
          fontFamily: 'BeVietnamPro_700Bold',
          fontSize: 15,
        }}
      >
        {count}
      </Text>
      <Text
        style={{
          color,
          fontFamily: 'BeVietnamPro_500Medium',
          fontSize: 12,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function MutationRow({ mutation }: { mutation: PendingMutation }) {
  const meta = statusMeta[mutation.status];
  const Icon = meta.icon;

  return (
    <View
      className="mx-4 p-4 rounded-2xl"
      style={{
        backgroundColor: palette.white,
        borderWidth: 1,
        borderColor: mutation.status === 'CONFLICT' ? palette.violet[50] : semantic.border.light,
      }}
    >
      <View className="flex-row items-start gap-3">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: meta.bg }}
        >
          <Icon size={18} color={meta.color} strokeWidth={2.2} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              variant="caption"
              style={{
                color: meta.color,
                fontFamily: 'BeVietnamPro_700Bold',
                letterSpacing: 0.5,
                fontSize: 11,
              }}
            >
              {meta.label.toUpperCase()}
            </Text>
            <Text variant="caption" className="text-text-tertiary">·</Text>
            <Text variant="caption" className="text-text-secondary">
              {mutationTypeLabels[mutation.type]}
            </Text>
          </View>
          <Text
            variant="body"
            className="text-text-primary mt-1"
            style={{ fontFamily: 'BeVietnamPro_500Medium' }}
            numberOfLines={2}
          >
            {mutation.targetLabel}
          </Text>
          <Text variant="caption" className="text-text-tertiary mt-1">
            Queue {formatRelativeTime(mutation.queuedAt)}
            {mutation.lastAttemptAt
              ? ` · Retry ${formatRelativeTime(mutation.lastAttemptAt)}`
              : ''}
          </Text>
        </View>
      </View>

      {mutation.errorMessage && (
        <View
          className="mt-3 p-3 rounded-xl flex-row items-start gap-2"
          style={{ backgroundColor: palette.red[50] }}
        >
          <AlertTriangle size={14} color={palette.red[600]} strokeWidth={2.2} />
          <Text
            variant="caption"
            style={{ color: palette.red[600], flex: 1 }}
          >
            {mutation.errorMessage}
          </Text>
        </View>
      )}

      {mutation.conflict && (
        <View className="mt-3">
          <Text
            variant="caption"
            style={{
              color: semantic.text.secondary,
              fontFamily: 'BeVietnamPro_700Bold',
              letterSpacing: 0.5,
              fontSize: 11,
              marginBottom: 8,
            }}
          >
            XUNG ĐỘT — CHỌN GIÁ TRỊ ĐÚNG
          </Text>
          <ConflictOption
            label="Giá trị của bạn (local)"
            value={mutation.conflict.localValue}
            color={palette.blue[700]}
            bg={palette.blue[50]}
          />
          <View className="h-2" />
          <ConflictOption
            label="Giá trị server"
            value={mutation.conflict.serverValue}
            color={palette.emerald[700]}
            bg={palette.emerald[50]}
            recommended
          />
        </View>
      )}

      {(mutation.status === 'FAILED' || mutation.status === 'CONFLICT') && (
        <Pressable
          onPress={() =>
            Alert.alert(
              mutation.status === 'CONFLICT' ? 'Resolve conflict' : 'Thử lại',
              mutation.status === 'CONFLICT'
                ? 'Chọn giá trị phía trên để resolve.'
                : 'Đang thử sync lại mutation này.'
            )
          }
          className="mt-3 h-10 rounded-xl flex-row items-center justify-center gap-2"
          style={{
            backgroundColor: mutation.status === 'CONFLICT' ? palette.violet[700] : semantic.action.primary,
          }}
        >
          {mutation.status === 'CONFLICT' ? (
            <GitMerge size={14} color={palette.white} />
          ) : (
            <RotateCw size={14} color={palette.white} />
          )}
          <Text
            variant="body"
            style={{ color: palette.white, fontFamily: 'BeVietnamPro_700Bold', fontSize: 14 }}
          >
            {mutation.status === 'CONFLICT' ? 'Resolve conflict' : 'Thử lại ngay'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function ConflictOption({
  label,
  value,
  color,
  bg,
  recommended,
}: {
  label: string;
  value: string;
  color: string;
  bg: string;
  recommended?: boolean;
}) {
  return (
    <Pressable
      className="p-3 rounded-xl flex-row items-center gap-2"
      style={{
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: bg,
      }}
    >
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text
            variant="caption"
            style={{
              color,
              fontFamily: 'BeVietnamPro_700Bold',
              fontSize: 11,
              letterSpacing: 0.3,
            }}
          >
            {label.toUpperCase()}
          </Text>
          {recommended && (
            <View
              className="px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: palette.white }}
            >
              <Text
                variant="caption"
                style={{
                  color,
                  fontFamily: 'BeVietnamPro_700Bold',
                  fontSize: 9,
                  letterSpacing: 0.3,
                }}
              >
                KHUYÊN DÙNG
              </Text>
            </View>
          )}
        </View>
        <Text
          variant="body"
          className="text-text-primary mt-0.5"
          style={{ fontFamily: 'BeVietnamPro_500Medium' }}
        >
          {value}
        </Text>
      </View>
      <ChevronRight size={16} color={color} />
    </Pressable>
  );
}
