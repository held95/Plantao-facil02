import { PutCommand, ScanCommand, DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { getDynamoDocumentClient } from '../aws/dynamo/client';
import type { Plantao } from '@plantao/shared';

type AuthSource = 'dynamodb' | 'mock';

const plantoesTable = process.env.AWS_DYNAMODB_PLANTOES_TABLE;
const authSource: AuthSource =
  process.env.AUTH_SOURCE === 'dynamodb' ? 'dynamodb' : 'mock';

// Use DynamoDB only if AUTH_SOURCE=dynamodb AND the table is configured
function isUsingDynamo(): boolean {
  return authSource === 'dynamodb' && !!plantoesTable;
}

function buildPlantaoPk(id: string) {
  return `PLANTAO#${id}`;
}

// In-memory store (used in mock mode or when DynamoDB table not yet configured)
const mockPlantoes = new Map<string, Plantao>();

export const plantaoRepository = {
  async createPlantao(plantao: Plantao): Promise<Plantao> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      await client.send(
        new PutCommand({
          TableName: plantoesTable,
          Item: {
            pk: buildPlantaoPk(plantao.id),
            entityType: 'PLANTAO',
            ...plantao,
          },
        })
      );
      return plantao;
    }

    if (authSource === 'dynamodb' && !plantoesTable) {
      console.warn('[plantaoRepository] AWS_DYNAMODB_PLANTOES_TABLE not set — using in-memory fallback');
    }

    mockPlantoes.set(plantao.id, plantao);
    return plantao;
  },

  async listPlantoes(): Promise<Plantao[]> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      const result = await client.send(
        new ScanCommand({
          TableName: plantoesTable,
          FilterExpression: 'entityType = :et',
          ExpressionAttributeValues: { ':et': 'PLANTAO' },
        })
      );
      return (result.Items || []) as Plantao[];
    }

    return Array.from(mockPlantoes.values());
  },

  async deleteById(id: string): Promise<void> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      await client.send(
        new DeleteCommand({
          TableName: plantoesTable,
          Key: { pk: buildPlantaoPk(id) },
        })
      );
      return;
    }
    mockPlantoes.delete(id);
  },

  async getById(id: string): Promise<Plantao | null> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      const result = await client.send(
        new GetCommand({
          TableName: plantoesTable,
          Key: { pk: buildPlantaoPk(id) },
        })
      );
      return result.Item ? (result.Item as Plantao) : null;
    }
    return mockPlantoes.get(id) ?? null;
  },

  /**
   * Returns all plantoes where a given medico is inscribed.
   * In mock mode, returns all plantoes (since there's no inscription tracking at this level).
   * In DynamoDB mode, performs a scan — replace with GSI query for production.
   */
  async listByMedicoId(medicoId: string): Promise<Plantao[]> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      const result = await client.send(
        new ScanCommand({
          TableName: plantoesTable,
          FilterExpression: 'entityType = :et AND contains(inscricoesIds, :medicoId)',
          ExpressionAttributeValues: {
            ':et': 'PLANTAO',
            ':medicoId': medicoId,
          },
        })
      );
      return (result.Items || []) as Plantao[];
    }

    // Mock: return all plantoes (no inscription tracking in mock)
    return Array.from(mockPlantoes.values());
  },

  async createBatch(plantoes: Plantao[]): Promise<Plantao[]> {
    const results: Plantao[] = [];
    for (const plantao of plantoes) {
      if (isUsingDynamo()) {
        const client = getDynamoDocumentClient();
        await client.send(
          new PutCommand({
            TableName: plantoesTable,
            Item: {
              pk: buildPlantaoPk(plantao.id),
              entityType: 'PLANTAO',
              ...plantao,
            },
          })
        );
        results.push(plantao);
      } else {
        mockPlantoes.set(plantao.id, plantao);
        results.push(plantao);
      }
    }
    return results;
  },
};
