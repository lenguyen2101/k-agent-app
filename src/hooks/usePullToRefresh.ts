import { useCallback, useState } from 'react';
import { semantic } from '@/theme';

// Hook dùng chung cho pull-to-refresh trên Home / Lead / Rổ hàng.
// Mock 700ms delay cho feedback visual; khi có API thì pass `onRefresh` = fetch real.
// Trả về props object để spread vào ScrollView / FlatList:
//   <ScrollView refreshing={...} onRefresh={...} />
//   <FlatList refreshing={...} onRefresh={...} />
export function usePullToRefresh(onRefresh?: () => Promise<void> | void) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return {
    refreshing,
    onRefresh: handleRefresh,
    // Dùng cho ScrollView cần RefreshControl riêng để customize màu;
    // FlatList có thể dùng luôn `refreshing` + `onRefresh` props trực tiếp (sẽ dùng
    // default iOS indicator). Muốn match brand tint → dùng `refreshControl`.
    tintColor: semantic.action.primary,
    colors: [semantic.action.primary] as const,
  };
}
