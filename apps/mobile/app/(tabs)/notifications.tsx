import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { apiClient } from '../../lib/api/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface NotificacaoDocumento {
  id: string;
  plantaoId: string;
  titulo: string;
  uploadedAt: string;
  uploadedByNome?: string;
  lido: boolean;
}

async function fetchNotificacoes(): Promise<{
  unreadCount: number;
  recentes: NotificacaoDocumento[];
}> {
  const response = await apiClient.get('/notificacoes/documentos');
  return response.data;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `${diffMin}min atras`;
  if (diffH < 24) return `${diffH}h atras`;
  return `${diffD}d atras`;
}

export default function NotificationsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['mobile', 'notificacoes'],
    queryFn: fetchNotificacoes,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const notificacoes = data?.recentes ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Carregando notificacoes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erro ao carregar notificacoes.</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>
            {unreadCount} {unreadCount === 1 ? 'notificacao nao lida' : 'notificacoes nao lidas'}
          </Text>
        </View>
      )}
      <FlatList
        data={notificacoes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.item, !item.lido && styles.itemUnread]}>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.titulo}
              </Text>
              {item.uploadedByNome ? (
                <Text style={styles.itemSub}>por {item.uploadedByNome}</Text>
              ) : null}
              <Text style={styles.itemTime}>{formatDate(item.uploadedAt)}</Text>
            </View>
            {!item.lido && <View style={styles.dot} />}
          </View>
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhuma notificacao</Text>
            <Text style={styles.emptySub}>Suas notificacoes aparecerao aqui.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 15,
    color: '#dc2626',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  unreadBanner: {
    backgroundColor: '#dbeafe',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#bfdbfe',
  },
  unreadBannerText: {
    fontSize: 13,
    color: '#1e40af',
    fontWeight: '600',
    textAlign: 'center',
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  itemUnread: {
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  itemSub: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  itemTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginLeft: 8,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
