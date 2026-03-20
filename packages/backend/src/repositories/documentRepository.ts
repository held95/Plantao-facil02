import {
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  BatchGetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { getDynamoDocumentClient } from '../aws/dynamo/client';
import type { PlantaoDocumento, DocumentRead } from '@plantao/shared';

type AuthSource = 'dynamodb' | 'mock';

const documentsTable = process.env.AWS_DYNAMODB_DOCUMENTS_TABLE;
const readsTable = process.env.AWS_DYNAMODB_DOCUMENT_READS_TABLE;
const authSource: AuthSource =
  process.env.AUTH_SOURCE === 'dynamodb' ? 'dynamodb' : 'mock';

function isUsingDynamo(): boolean {
  return authSource === 'dynamodb' && !!documentsTable;
}

function buildDocumentPk(id: string) {
  return `DOCUMENT#${id}`;
}
function buildReadPk(documentId: string) {
  return `READ#${documentId}`;
}
function buildReadSk(userId: string) {
  return `USER#${userId}`;
}
function buildPlantaoGsi(plantaoId: string) {
  return `PLANTAO#${plantaoId}`;
}

// In-memory mock stores
const mockDocuments = new Map<string, PlantaoDocumento>();
const mockDocumentReads = new Map<string, DocumentRead>();

// Seed mock documents
const seedDoc: PlantaoDocumento = {
  id: 'doc-mock-1',
  plantaoId: '1',
  titulo: 'Escala de Plantões - Julho 2025',
  descricao: 'Escala completa dos plantões do mês de julho.',
  fileName: 'escala-julho-2025.pdf',
  s3Key: 'documents/doc-mock-1/escala-julho-2025.pdf',
  s3Bucket: 'mock-bucket',
  mimeType: 'application/pdf',
  tamanhoBytes: 204800,
  uploadedBy: 'user-coord-1',
  uploadedByNome: 'Coordenador',
  uploadedAt: new Date(Date.now() - 3600000).toISOString(),
  status: 'ativo',
};
mockDocuments.set(seedDoc.id, seedDoc);

export const documentRepository = {
  async createDocument(doc: PlantaoDocumento): Promise<PlantaoDocumento> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      await client.send(
        new PutCommand({
          TableName: documentsTable,
          Item: {
            pk: buildDocumentPk(doc.id),
            sk: 'METADATA',
            entityType: 'DOCUMENT',
            gsi1pk: buildPlantaoGsi(doc.plantaoId),
            gsi2pk: `USER#${doc.uploadedBy}`,
            ...doc,
          },
        })
      );
      return doc;
    }

    if (authSource === 'dynamodb' && !documentsTable) {
      console.warn('[documentRepository] AWS_DYNAMODB_DOCUMENTS_TABLE not set — using in-memory fallback');
    }

    mockDocuments.set(doc.id, doc);
    return doc;
  },

  async getDocumentById(id: string): Promise<PlantaoDocumento | null> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      const result = await client.send(
        new GetCommand({
          TableName: documentsTable,
          Key: { pk: buildDocumentPk(id), sk: 'METADATA' },
        })
      );
      return result.Item ? (result.Item as PlantaoDocumento) : null;
    }

    return mockDocuments.get(id) ?? null;
  },

  async listByPlantaoId(
    plantaoId: string,
    filters?: { q?: string; desde?: string; ate?: string; includeArchived?: boolean }
  ): Promise<PlantaoDocumento[]> {
    const includeArchived = filters?.includeArchived ?? false;

    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      const result = await client.send(
        new QueryCommand({
          TableName: documentsTable,
          IndexName: 'plantaoId-index',
          KeyConditionExpression: 'gsi1pk = :gsi1pk',
          ExpressionAttributeValues: { ':gsi1pk': buildPlantaoGsi(plantaoId) },
          ScanIndexForward: false,
        })
      );
      let items = (result.Items ?? []) as PlantaoDocumento[];
      if (!includeArchived) {
        items = items.filter((d) => d.status === 'ativo');
      }
      if (filters?.q) {
        const q = filters.q.toLowerCase();
        items = items.filter(
          (d) =>
            d.titulo.toLowerCase().includes(q) ||
            (d.descricao?.toLowerCase().includes(q) ?? false)
        );
      }
      if (filters?.desde) {
        items = items.filter((d) => d.uploadedAt >= filters.desde!);
      }
      if (filters?.ate) {
        items = items.filter((d) => d.uploadedAt <= filters.ate!);
      }
      return items;
    }

    let items = Array.from(mockDocuments.values()).filter(
      (d) => d.plantaoId === plantaoId
    );
    if (!includeArchived) {
      items = items.filter((d) => d.status === 'ativo');
    }
    if (filters?.q) {
      const q = filters.q.toLowerCase();
      items = items.filter(
        (d) =>
          d.titulo.toLowerCase().includes(q) ||
          (d.descricao?.toLowerCase().includes(q) ?? false)
      );
    }
    if (filters?.desde) {
      items = items.filter((d) => d.uploadedAt >= filters.desde!);
    }
    if (filters?.ate) {
      items = items.filter((d) => d.uploadedAt <= filters.ate!);
    }
    return items;
  },

  async archiveDocument(id: string): Promise<PlantaoDocumento | null> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      try {
        const result = await client.send(
          new UpdateCommand({
            TableName: documentsTable,
            Key: { pk: buildDocumentPk(id), sk: 'METADATA' },
            UpdateExpression: 'SET #status = :archived',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: { ':archived': 'arquivado' },
            ConditionExpression: 'attribute_exists(pk)',
            ReturnValues: 'ALL_NEW',
          })
        );
        if (!result.Attributes) return null;
        return result.Attributes as PlantaoDocumento;
      } catch (error: any) {
        if (error?.name === 'ConditionalCheckFailedException') return null;
        throw error;
      }
    }

    const doc = mockDocuments.get(id);
    if (!doc) return null;
    const updated: PlantaoDocumento = { ...doc, status: 'arquivado' };
    mockDocuments.set(id, updated);
    return updated;
  },

  async createVersion(
    parentId: string,
    newDoc: PlantaoDocumento
  ): Promise<{ newVersion: PlantaoDocumento; oldDoc: PlantaoDocumento | null }> {
    const oldDoc = await this.getDocumentById(parentId);

    if (oldDoc) {
      // Mark old doc as versao_anterior
      if (isUsingDynamo()) {
        const client = getDynamoDocumentClient();
        await client.send(
          new UpdateCommand({
            TableName: documentsTable,
            Key: { pk: buildDocumentPk(parentId), sk: 'METADATA' },
            UpdateExpression: 'SET #status = :s',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: { ':s': 'versao_anterior' },
          })
        );
      } else {
        mockDocuments.set(parentId, { ...oldDoc, status: 'versao_anterior' });
      }
    }

    const newDocWithVersion: PlantaoDocumento = {
      ...newDoc,
      parentId,
      version: (oldDoc?.version ?? 1) + 1,
    };

    await this.createDocument(newDocWithVersion);
    return { newVersion: newDocWithVersion, oldDoc };
  },

  async listVersionsByParentId(parentId: string): Promise<PlantaoDocumento[]> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      const result = await client.send(
        new ScanCommand({
          TableName: documentsTable,
          FilterExpression: 'parentId = :parentId OR id = :parentId',
          ExpressionAttributeValues: { ':parentId': parentId },
        })
      );
      return (result.Items ?? []) as PlantaoDocumento[];
    }

    return Array.from(mockDocuments.values()).filter(
      (d) => d.id === parentId || d.parentId === parentId
    );
  },

  async createDocumentBatch(docs: PlantaoDocumento[]): Promise<PlantaoDocumento[]> {
    const results: PlantaoDocumento[] = [];
    for (const doc of docs) {
      if (isUsingDynamo()) {
        const client = getDynamoDocumentClient();
        await client.send(
          new PutCommand({
            TableName: documentsTable,
            Item: {
              pk: buildDocumentPk(doc.id),
              sk: 'METADATA',
              entityType: 'DOCUMENT',
              gsi1pk: buildPlantaoGsi(doc.plantaoId),
              gsi2pk: `USER#${doc.uploadedBy}`,
              ...doc,
            },
          })
        );
      } else {
        mockDocuments.set(doc.id, doc);
      }
      results.push(doc);
    }
    return results;
  },

  async listUploadedAfter(since: string): Promise<PlantaoDocumento[]> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      const result = await client.send(
        new ScanCommand({
          TableName: documentsTable,
          FilterExpression: 'entityType = :et AND uploadedAt > :since',
          ExpressionAttributeValues: { ':et': 'DOCUMENT', ':since': since },
        })
      );
      return (result.Items ?? []) as PlantaoDocumento[];
    }

    return Array.from(mockDocuments.values()).filter(
      (d) => d.uploadedAt > since && d.status === 'ativo'
    );
  },

  async markAsRead(documentId: string, userId: string): Promise<DocumentRead> {
    const read: DocumentRead = {
      documentId,
      userId,
      visualizadoAt: new Date().toISOString(),
    };

    if (isUsingDynamo() && readsTable) {
      const client = getDynamoDocumentClient();
      await client.send(
        new PutCommand({
          TableName: readsTable,
          Item: {
            pk: buildReadPk(documentId),
            sk: buildReadSk(userId),
            entityType: 'DOCUMENT_READ',
            gsi1pk: `USER#${userId}`,
            gsi1sk: read.visualizadoAt,
            ...read,
          },
        })
      );
      return read;
    }

    mockDocumentReads.set(`${documentId}#${userId}`, read);
    return read;
  },

  async getReadStatus(documentId: string, userId: string): Promise<DocumentRead | null> {
    if (isUsingDynamo() && readsTable) {
      const client = getDynamoDocumentClient();
      const result = await client.send(
        new GetCommand({
          TableName: readsTable,
          Key: { pk: buildReadPk(documentId), sk: buildReadSk(userId) },
        })
      );
      return result.Item ? (result.Item as DocumentRead) : null;
    }

    return mockDocumentReads.get(`${documentId}#${userId}`) ?? null;
  },

  async getReadStatusBatch(
    documentIds: string[],
    userId: string
  ): Promise<Map<string, DocumentRead>> {
    const result = new Map<string, DocumentRead>();
    if (documentIds.length === 0) return result;

    if (isUsingDynamo() && readsTable) {
      const client = getDynamoDocumentClient();
      // DynamoDB BatchGetItem supports up to 100 keys per request
      const BATCH_SIZE = 100;
      for (let i = 0; i < documentIds.length; i += BATCH_SIZE) {
        const chunk = documentIds.slice(i, i + BATCH_SIZE);
        const keys = chunk.map((documentId) => ({
          pk: buildReadPk(documentId),
          sk: buildReadSk(userId),
        }));
        const response = await client.send(
          new BatchGetCommand({
            RequestItems: {
              [readsTable]: { Keys: keys },
            },
          })
        );
        const items = response.Responses?.[readsTable] ?? [];
        for (const item of items) {
          const read = item as DocumentRead;
          result.set(read.documentId, read);
        }
      }
      return result;
    }

    // Mock mode: in-memory lookup
    for (const documentId of documentIds) {
      const read = mockDocumentReads.get(`${documentId}#${userId}`);
      if (read) result.set(documentId, read);
    }
    return result;
  },
};
