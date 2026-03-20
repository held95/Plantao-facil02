import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { DocumentoComLeitura } from '../lib/api/documentos';

interface DocumentItemProps {
  documento: DocumentoComLeitura;
  onPress: (documento: DocumentoComLeitura) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function DocumentItem({ documento, onPress }: DocumentItemProps) {
  return (
    <TouchableOpacity
      style={[styles.container, !documento.lido && styles.unread]}
      onPress={() => onPress(documento)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <View style={[styles.iconBox, !documento.lido && styles.iconBoxUnread]}>
          <Text style={[styles.iconText, !documento.lido && styles.iconTextUnread]}>PDF</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {documento.titulo}
          </Text>
          {!documento.lido && <View style={styles.dot} />}
        </View>

        {documento.descricao ? (
          <Text style={styles.description} numberOfLines={1}>
            {documento.descricao}
          </Text>
        ) : null}

        <View style={styles.meta}>
          <Text style={styles.metaText}>{formatDate(documento.uploadedAt)}</Text>
          <Text style={styles.metaSep}> • </Text>
          <Text style={styles.metaText}>{formatBytes(documento.tamanhoBytes)}</Text>
          {documento.uploadedByNome ? (
            <>
              <Text style={styles.metaSep}> • </Text>
              <Text style={styles.metaText} numberOfLines={1}>
                {documento.uploadedByNome}
              </Text>
            </>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  unread: {
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
  },
  iconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxUnread: {
    backgroundColor: '#dbeafe',
  },
  iconText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6b7280',
  },
  iconTextUnread: {
    color: '#2563eb',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginLeft: 6,
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  metaSep: {
    fontSize: 11,
    color: '#d1d5db',
  },
});
