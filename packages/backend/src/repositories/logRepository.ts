import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getDynamoDocumentClient } from '../aws/dynamo/client';
import crypto from 'crypto';

type AuthSource = 'dynamodb' | 'mock';

const logsTable = process.env.AWS_DYNAMODB_LOGS_TABLE;
const authSource: AuthSource =
  process.env.AUTH_SOURCE === 'dynamodb' ? 'dynamodb' : 'mock';

function isUsingDynamo(): boolean {
  return authSource === 'dynamodb' && !!logsTable;
}

export interface LogEntry {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

// In-memory mock
const mockLogs: LogEntry[] = [];

export const logRepository = {
  async createLogEntry({
    userId,
    action,
    entityType,
    entityId,
    details,
  }: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: Record<string, unknown>;
  }): Promise<LogEntry> {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      userId,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    };

    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      await client.send(
        new PutCommand({
          TableName: logsTable,
          Item: {
            pk: `LOG#${entry.id}`,
            recordType: 'LOG',
            gsi1pk: `USER#${userId}`,
            gsi2pk: `ENTITY#${entityType}#${entityId}`,
            ...entry,
          },
        })
      );
      return entry;
    }

    if (authSource === 'dynamodb' && !logsTable) {
      console.warn('[logRepository] AWS_DYNAMODB_LOGS_TABLE not set — using in-memory fallback');
    }

    mockLogs.push(entry);
    return entry;
  },

  async listByEntityId(entityType: string, entityId: string): Promise<LogEntry[]> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      const result = await client.send(
        new ScanCommand({
          TableName: logsTable,
          FilterExpression: 'entityType = :et AND entityId = :eid',
          ExpressionAttributeValues: {
            ':et': entityType,
            ':eid': entityId,
          },
        })
      );
      return (result.Items ?? []) as LogEntry[];
    }

    return mockLogs.filter((l) => l.entityType === entityType && l.entityId === entityId);
  },

  async listRecentByUserId(userId: string, limit = 50): Promise<LogEntry[]> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      const result = await client.send(
        new ScanCommand({
          TableName: logsTable,
          FilterExpression: 'userId = :userId',
          ExpressionAttributeValues: { ':userId': userId },
          Limit: limit,
        })
      );
      return (result.Items ?? []) as LogEntry[];
    }

    return mockLogs
      .filter((l) => l.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  },
};
