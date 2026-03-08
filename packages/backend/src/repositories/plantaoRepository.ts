import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getDynamoDocumentClient } from '../aws/dynamo/client';
import type { Plantao } from '@plantao/shared';

type AuthSource = 'dynamodb' | 'mock';

const plantoesTable = process.env.AWS_DYNAMODB_PLANTOES_TABLE;
const authSource: AuthSource =
  process.env.AUTH_SOURCE === 'dynamodb' ? 'dynamodb' : 'mock';

function isUsingDynamo(): boolean {
  return authSource === 'dynamodb';
}

function ensureDynamoConfig() {
  if (!plantoesTable) {
    throw new Error('AWS_DYNAMODB_PLANTOES_TABLE env var not set');
  }
}

function buildPlantaoPk(id: string) {
  return `PLANTAO#${id}`;
}

// In-memory store for mock mode
const mockPlantoes = new Map<string, Plantao>();

export const plantaoRepository = {
  async createPlantao(plantao: Plantao): Promise<Plantao> {
    if (isUsingDynamo()) {
      ensureDynamoConfig();
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

    mockPlantoes.set(plantao.id, plantao);
    return plantao;
  },

  async listPlantoes(): Promise<Plantao[]> {
    if (isUsingDynamo()) {
      ensureDynamoConfig();
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
};
