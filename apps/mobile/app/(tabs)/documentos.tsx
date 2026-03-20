import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { DocumentItem } from '../../components/DocumentItem';
import {
  fetchDocumentosByPlantao,
  markDocumentoAsViewed,
  getDocumentoDownloadUrl,
  type DocumentoComLeitura,
} from '../../lib/api/documentos';
import { useQuery } from '@tanstack/react-query';

// Default plantao ID — in a real app this would come from navigation params or user context
const DEFAULT_PLANTAO_ID = '1';

export default function DocumentosScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: documentos = [],
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ['documentos', 'mobile', DEFAULT_PLANTAO_ID],
    queryFn: () => fetchDocumentosByPlantao(DEFAULT_PLANTAO_ID),
    staleTime: 1000 * 60 * 2,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handlePress = async (documento: DocumentoComLeitura) => {
    try {
      // Mark as viewed in background
      if (!documento.lido) {
        markDocumentoAsViewed(documento.id).catch(console.warn);
      }

      const url = await getDocumentoDownloadUrl(documento.id);
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'Nao foi possivel abrir o documento.');
      }
    } catch (err) {
      Alert.alert('Erro', 'Erro ao abrir documento. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Carregando documentos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erro ao carregar documentos.</Text>
        <Text style={styles.errorSub}>Verifique sua conexao e tente novamente.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={documentos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DocumentItem documento={item} onPress={handlePress} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563eb"
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhum documento disponivel</Text>
            <Text style={styles.emptySub}>
              Puxe para baixo para atualizar.
            </Text>
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
  list: {
    padding: 16,
    flexGrow: 1,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 4,
    textAlign: 'center',
  },
  errorSub: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
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
