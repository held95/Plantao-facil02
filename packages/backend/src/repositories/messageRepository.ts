import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { getDynamoDocumentClient, messagesTable } from '../aws/dynamo/client';

export interface MensagemAnexo {
  nome: string;
  tamanhoBytes: number;
  mimeType: string;
  dados: string; // base64 em modo mock
}

export interface Mensagem {
  id: string;
  fromUserId: string;
  fromNome: string;
  toUserId: string;
  toNome: string;
  assunto: string;
  corpo: string;
  anexo?: MensagemAnexo;
  lido: boolean;
  criadoEm: string;
}

export type CreateMensagemInput = Omit<Mensagem, 'id' | 'lido' | 'criadoEm'>;

type AuthSource = 'dynamodb' | 'mock';
const authSource: AuthSource =
  process.env.AUTH_SOURCE === 'dynamodb' ? 'dynamodb' : 'mock';

function isUsingDynamo(): boolean {
  return authSource === 'dynamodb' && !!messagesTable;
}

// In-memory store — used when AUTH_SOURCE=mock
const store = new Map<string, Mensagem>();

const buildPk = (id: string) => `MENSAGEM#${id}`;
const buildInboxGsi = (userId: string) => `INBOX#${userId}`;
const buildSentGsi = (userId: string) => `SENT#${userId}`;

export const messageRepository = {
  async create(input: CreateMensagemInput): Promise<Mensagem> {
    const id = crypto.randomUUID();
    const criadoEm = new Date().toISOString();
    const mensagem: Mensagem = { id, ...input, lido: false, criadoEm };

    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      await client.send(new PutCommand({
        TableName: messagesTable!,
        Item: {
          pk: buildPk(id),
          gsi1pk: buildInboxGsi(input.toUserId),
          gsi1sk: criadoEm,
          gsi2pk: buildSentGsi(input.fromUserId),
          gsi2sk: criadoEm,
          ...mensagem,
        },
      }));
    } else {
      store.set(id, mensagem);
    }
    return mensagem;
  },

  async listInbox(userId: string): Promise<Mensagem[]> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      const result = await client.send(new QueryCommand({
        TableName: messagesTable!,
        IndexName: 'inbox-index',
        KeyConditionExpression: 'gsi1pk = :gsi1pk',
        ExpressionAttributeValues: { ':gsi1pk': buildInboxGsi(userId) },
        ScanIndexForward: false,
      }));
      return (result.Items ?? []) as Mensagem[];
    }
    return [...store.values()]
      .filter(m => m.toUserId === userId)
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  },

  async listSent(userId: string): Promise<Mensagem[]> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      const result = await client.send(new QueryCommand({
        TableName: messagesTable!,
        IndexName: 'sent-index',
        KeyConditionExpression: 'gsi2pk = :gsi2pk',
        ExpressionAttributeValues: { ':gsi2pk': buildSentGsi(userId) },
        ScanIndexForward: false,
      }));
      return (result.Items ?? []) as Mensagem[];
    }
    return [...store.values()]
      .filter(m => m.fromUserId === userId)
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  },

  async getById(id: string): Promise<Mensagem | null> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      const result = await client.send(new GetCommand({
        TableName: messagesTable!,
        Key: { pk: buildPk(id) },
      }));
      return (result.Item as Mensagem) ?? null;
    }
    return store.get(id) ?? null;
  },

  async markAsRead(id: string): Promise<void> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      await client.send(new UpdateCommand({
        TableName: messagesTable!,
        Key: { pk: buildPk(id) },
        UpdateExpression: 'SET lido = :true',
        ExpressionAttributeValues: { ':true': true },
      }));
    } else {
      const m = store.get(id);
      if (m) store.set(id, { ...m, lido: true });
    }
  },

  async countUnread(userId: string): Promise<number> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      const result = await client.send(new QueryCommand({
        TableName: messagesTable!,
        IndexName: 'inbox-index',
        KeyConditionExpression: 'gsi1pk = :gsi1pk',
        FilterExpression: 'lido = :false',
        ExpressionAttributeValues: {
          ':gsi1pk': buildInboxGsi(userId),
          ':false': false,
        },
        Select: 'COUNT',
      }));
      return result.Count ?? 0;
    }
    return [...store.values()].filter(m => m.toUserId === userId && !m.lido).length;
  },

  async deleteById(id: string): Promise<void> {
    if (isUsingDynamo()) {
      const client = getDynamoDocumentClient();
      await client.send(new DeleteCommand({
        TableName: messagesTable!,
        Key: { pk: buildPk(id) },
      }));
    } else {
      store.delete(id);
    }
  },
};
