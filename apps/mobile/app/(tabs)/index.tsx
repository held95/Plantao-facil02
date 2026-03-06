import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import type { Plantao } from '@plantao/shared';
import { apiClient } from '../../lib/api/client';

export default function PlantoesList() {
  const [plantoes, setPlantoes] = useState<Plantao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchPlantoes(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await apiClient.get<{ plantoes: Plantao[] }>('/plantoes');
      setPlantoes(response.data.plantoes || []);
    } catch (error) {
      console.error('Failed to fetch plantões:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchPlantoes();
  }, []);

  function renderPlantao({ item }: { item: Plantao }) {
    return (
      <View style={styles.card}>
        <Text style={styles.hospital}>{item.hospital}</Text>
        <Text style={styles.especialidade}>{item.especialidade}</Text>
        <Text style={styles.info}>
          {item.data} • {item.horarioInicio}–{item.horarioFim}
        </Text>
        <Text style={styles.valor}>R$ {item.valor.toFixed(2)}</Text>
        <Text style={styles.vagas}>
          {item.vagasDisponiveis}/{item.vagasTotal} vagas
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <FlatList
      data={plantoes}
      keyExtractor={(item) => item.id}
      renderItem={renderPlantao}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchPlantoes(true)}
          tintColor="#2563eb"
        />
      }
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Nenhum plantão disponível.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  hospital: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  especialidade: {
    fontSize: 14,
    color: '#2563eb',
    marginBottom: 8,
  },
  info: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  valor: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4,
  },
  vagas: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});
