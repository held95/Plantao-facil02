import { PutCommand, GetCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { getDynamoDocumentClient } from '../aws/dynamo/client';
import crypto from 'crypto';
import type { SwapRequest } from '@plantao/shared';

type AuthSource = 'dynamodb' | 'mock';

const swapTable = process.env.AWS_DYNAMODB_SWAP_REQUESTS_TABLE;
const authSource: AuthSource =
  process.env.AUTH_SOURCE === 'dynamodb' ? 'dynamodb' : 'mock';

function isUsingDynamo(): boolean {
  return authSource === 'dynamodb' && !!swapTable;
}

function buildSwapPk(id: string) {
  return `SWAP#${id}`;
}

// In-memory mock store
const mockSwapRequests = new Map<string, SwapRequest>();

export const swapRepository = {
  async createSwapRequest(data: Omit<SwapRequest, 'id' | 'criadoEm'>): Promise<SwapRequest> {
    const swap: SwapRequest = {
      ...data,
      id: crypto.randomUUID(),
      criadoEm: new Date().toISOString(),
    };

    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      await client.send(
        new PutCommand({
          TableName: swapTable,
          Item: {
            pk: buildSwapPk(swap.id),
            entityType: 'SWAP_REQUEST',
            gsi1pk: `USER#${swap.solicitanteId}`,
            gsi2pk: `USER#${swap.destinatarioId}`,
            gsi3pk: `PLANTAO#${swap.plantaoOrigemId}`,
            ...swap,
          },
        })
      );
      return swap;
    }

    if (authSource === 'dynamodb' && !swapTable) {
      console.warn('[swapRepository] AWS_DYNAMODB_SWAP_REQUESTS_TABLE not set — using in-memory fallback');
    }

    mockSwapRequests.set(swap.id, swap);
    return swap;
  },

  async getById(id: string): Promise<SwapRequest | null> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      const result = await client.send(
        new GetCommand({
          TableName: swapTable,
          Key: { pk: buildSwapPk(id) },
        })
      );
      return result.Item ? (result.Item as SwapRequest) : null;
    }

    return mockSwapRequests.get(id) ?? null;
  },

  async listByUserId(userId: string): Promise<SwapRequest[]> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      const result = await client.send(
        new ScanCommand({
          TableName: swapTable,
          FilterExpression:
            'solicitanteId = :userId OR destinatarioId = :userId',
          ExpressionAttributeValues: { ':userId': userId },
        })
      );
      return (result.Items ?? []) as SwapRequest[];
    }

    return Array.from(mockSwapRequests.values()).filter(
      (s) => s.solicitanteId === userId || s.destinatarioId === userId
    );
  },

  async listByPlantaoId(plantaoId: string): Promise<SwapRequest[]> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      const result = await client.send(
        new ScanCommand({
          TableName: swapTable,
          FilterExpression:
            'plantaoOrigemId = :plantaoId OR plantaoDestinoId = :plantaoId',
          ExpressionAttributeValues: { ':plantaoId': plantaoId },
        })
      );
      return (result.Items ?? []) as SwapRequest[];
    }

    return Array.from(mockSwapRequests.values()).filter(
      (s) => s.plantaoOrigemId === plantaoId || s.plantaoDestinoId === plantaoId
    );
  },

  async updateStatus(
    id: string,
    status: SwapRequest['status'],
    resolvidoEm?: string
  ): Promise<SwapRequest | null> {
    const now = resolvidoEm ?? new Date().toISOString();

    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      try {
        const result = await client.send(
          new UpdateCommand({
            TableName: swapTable,
            Key: { pk: buildSwapPk(id) },
            UpdateExpression: 'SET #status = :status, resolvidoEm = :resolvidoEm',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: {
              ':status': status,
              ':resolvidoEm': now,
            },
            ConditionExpression: 'attribute_exists(pk)',
            ReturnValues: 'ALL_NEW',
          })
        );
        if (!result.Attributes) return null;
        return result.Attributes as SwapRequest;
      } catch (error: any) {
        if (error?.name === 'ConditionalCheckFailedException') return null;
        throw error;
      }
    }

    const swap = mockSwapRequests.get(id);
    if (!swap) return null;
    const updated: SwapRequest = { ...swap, status, resolvidoEm: now };
    mockSwapRequests.set(id, updated);
    return updated;
  },
};
