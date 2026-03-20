import {
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDynamoDocumentClient } from '../aws/dynamo/client';
import type {
  AuthUserRecord,
  PendingUserSummary,
  UserApprovalStatus,
} from '@plantao/shared';

// Mock users seeded from shared data — avoids dependency on Next.js env
const MOCK_USERS_SEED = [
  { id: '1', email: 'helder@plantaofacil.com', nome: 'Hélder Corrêa', role: 'coordenador' as const, ativo: true, telefone: '(11) 98765-4321' },
  { id: '2', email: 'carlos@plantaofacil.com', nome: 'Dr. Carlos Silva', role: 'medico' as const, ativo: true, telefone: '(11) 97654-3210' },
  { id: '3', email: 'maria@plantaofacil.com', nome: 'Dra. Maria Santos', role: 'medico' as const, ativo: true, telefone: '(11) 96543-2109' },
  { id: '4', email: 'joao@plantaofacil.com', nome: 'Dr. João Costa', role: 'coordenador' as const, ativo: true, telefone: '+5511930975140' },
  { id: '5', email: 'pedro@plantaofacil.com', nome: 'Dr. Pedro Henrique Alves', role: 'medico' as const, ativo: true, telefone: '+5511976448582' },
];

type AuthSource = 'dynamodb' | 'mock';

type ResetTokenRow = {
  pk: string;
  tokenId: string;
  userId: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: number;
  usedAt?: string;
};

const usersTable = process.env.AWS_DYNAMODB_USERS_TABLE;
const resetTable = process.env.AWS_DYNAMODB_RESET_TABLE;
const usersEmailIndex = process.env.AWS_DYNAMODB_USERS_EMAIL_GSI || 'email-index';
const authSource: AuthSource =
  process.env.AUTH_SOURCE === 'dynamodb' ? 'dynamodb' : 'mock';

const mockAuthUsers = new Map<string, AuthUserRecord>();
const mockResetTokens = new Map<string, ResetTokenRow>();
// push tokens storage: userId -> Set<token>
const mockPushTokens = new Map<string, Set<string>>();

seedMockAuthUsers();

function seedMockAuthUsers() {
  if (mockAuthUsers.size > 0) return;

  for (const user of MOCK_USERS_SEED) {
    const now = new Date().toISOString();
    const emailLower = normalizeEmail(user.email);
    mockAuthUsers.set(user.id, {
      id: user.id,
      email: user.email,
      emailLower,
      nome: user.nome,
      role: user.role,
      status: user.ativo ? 'aprovado' : 'rejeitado',
      passwordHash: bcrypt.hashSync('senha123', 10),
      createdAt: now,
      updatedAt: now,
      approvedAt: user.ativo ? now : undefined,
      approvedBy: user.ativo ? 'seed' : undefined,
      telefone: user.telefone,
      pushTokens: [],
    });
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getDefaultNomeByEmail(email: string): string {
  const username = email.split('@')[0] || 'medico';
  return username
    .split(/[._-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function isUsingDynamo(): boolean {
  return authSource === 'dynamodb';
}

function buildUserPk(userId: string): string {
  return `USER#${userId}`;
}

function buildResetPk(tokenId: string): string {
  return `RESET#${tokenId}`;
}

function toPendingSummary(user: AuthUserRecord): PendingUserSummary {
  return {
    id: user.id,
    email: user.email,
    nome: user.nome,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

function hashSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

function ensureDynamoConfig() {
  if (!usersTable || !resetTable) {
    throw new Error(
      'Missing DynamoDB table configuration. Set AWS_DYNAMODB_USERS_TABLE and AWS_DYNAMODB_RESET_TABLE.'
    );
  }
}

function mapDynamoUser(item: any): AuthUserRecord {
  return {
    id: item.id,
    email: item.email,
    emailLower: item.emailLower,
    nome: item.nome,
    role: item.role,
    status: item.status as UserApprovalStatus,
    passwordHash: item.passwordHash,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    approvedAt: item.approvedAt,
    approvedBy: item.approvedBy,
    telefone: item.telefone,
    pushTokens: item.pushTokens || [],
  };
}

async function findByEmailInDynamo(emailLower: string): Promise<AuthUserRecord | null> {
  ensureDynamoConfig();
  const client = getDynamoDocumentClient();

  try {
    const query = await client.send(
      new QueryCommand({
        TableName: usersTable,
        IndexName: usersEmailIndex,
        KeyConditionExpression: 'gsi1pk = :gsi1pk',
        ExpressionAttributeValues: { ':gsi1pk': `EMAIL#${emailLower}` },
        Limit: 1,
      })
    );
    if (query.Items && query.Items.length > 0) {
      return mapDynamoUser(query.Items[0]);
    }
  } catch (error) {
    console.warn(
      `[authRepository] Email GSI query failed (${usersEmailIndex}). Falling back to scan.`,
      error
    );
  }

  const scan = await client.send(
    new ScanCommand({
      TableName: usersTable,
      FilterExpression: 'emailLower = :emailLower',
      ExpressionAttributeValues: { ':emailLower': emailLower },
      Limit: 1,
    })
  );
  if (!scan.Items || scan.Items.length === 0) return null;
  return mapDynamoUser(scan.Items[0]);
}

async function findByIdInDynamo(userId: string): Promise<AuthUserRecord | null> {
  ensureDynamoConfig();
  const client = getDynamoDocumentClient();
  const result = await client.send(
    new GetCommand({
      TableName: usersTable,
      Key: { pk: buildUserPk(userId) },
    })
  );
  return result.Item ? mapDynamoUser(result.Item) : null;
}

export const authUserRepository = {
  source(): AuthSource {
    return authSource;
  },

  async findByEmail(email: string): Promise<AuthUserRecord | null> {
    const emailLower = normalizeEmail(email);
    if (isUsingDynamo()) return findByEmailInDynamo(emailLower);
    for (const user of mockAuthUsers.values()) {
      if (user.emailLower === emailLower) return user;
    }
    return null;
  },

  async findById(userId: string): Promise<AuthUserRecord | null> {
    if (isUsingDynamo()) return findByIdInDynamo(userId);
    return mockAuthUsers.get(userId) || null;
  },

  async createPendingUser({
    email,
    passwordHash,
    telefone,
    emailOptIn,
    smsOptIn,
    pushOptIn,
    privacyAcceptedAt,
  }: {
    email: string;
    passwordHash: string;
    telefone?: string;
    emailOptIn?: boolean;
    smsOptIn?: boolean;
    pushOptIn?: boolean;
    privacyAcceptedAt?: string;
  }): Promise<AuthUserRecord> {
    const now = new Date().toISOString();
    const emailLower = normalizeEmail(email);
    const id = crypto.randomUUID();
    const user: AuthUserRecord = {
      id,
      email: emailLower,
      emailLower,
      nome: getDefaultNomeByEmail(emailLower),
      role: 'medico',
      status: 'pendente_aprovacao',
      passwordHash,
      createdAt: now,
      updatedAt: now,
      pushTokens: [],
      ...(telefone ? { telefone } : {}),
      ...(emailOptIn !== undefined ? { emailOptIn } : {}),
      ...(smsOptIn !== undefined ? { smsOptIn } : {}),
      ...(pushOptIn !== undefined ? { pushOptIn } : {}),
      ...(privacyAcceptedAt ? { privacyAcceptedAt } : {}),
    };

    if (isUsingDynamo()) {
      ensureDynamoConfig();
      const client = getDynamoDocumentClient();
      await client.send(
        new PutCommand({
          TableName: usersTable,
          Item: {
            pk: buildUserPk(id),
            entityType: 'USER',
            gsi1pk: `EMAIL#${emailLower}`,
            ...user,
          },
          ConditionExpression: 'attribute_not_exists(pk)',
        })
      );
      return user;
    }

    mockAuthUsers.set(id, user);
    return user;
  },

  async listPendingUsers(): Promise<PendingUserSummary[]> {
    if (isUsingDynamo()) {
      ensureDynamoConfig();
      const client = getDynamoDocumentClient();
      const scan = await client.send(
        new ScanCommand({
          TableName: usersTable,
          FilterExpression: '#status = :pending',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: { ':pending': 'pendente_aprovacao' },
        })
      );
      const users = (scan.Items || []).map(mapDynamoUser).map(toPendingSummary);
      return users.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    return Array.from(mockAuthUsers.values())
      .filter((user) => user.status === 'pendente_aprovacao')
      .map(toPendingSummary)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async approveUser(userId: string, approvedBy: string): Promise<AuthUserRecord | null> {
    const now = new Date().toISOString();

    if (isUsingDynamo()) {
      ensureDynamoConfig();
      const client = getDynamoDocumentClient();
      try {
        const result = await client.send(
          new UpdateCommand({
            TableName: usersTable,
            Key: { pk: buildUserPk(userId) },
            UpdateExpression:
              'SET #status = :approved, approvedAt = :approvedAt, approvedBy = :approvedBy, updatedAt = :updatedAt',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: {
              ':approved': 'aprovado',
              ':approvedAt': now,
              ':approvedBy': approvedBy,
              ':updatedAt': now,
            },
            ConditionExpression: 'attribute_exists(pk)',
            ReturnValues: 'ALL_NEW',
          })
        );
        if (!result.Attributes) return null;
        return mapDynamoUser(result.Attributes);
      } catch (error: any) {
        if (error?.name === 'ConditionalCheckFailedException') return null;
        throw error;
      }
    }

    const user = mockAuthUsers.get(userId);
    if (!user) return null;
    const updated: AuthUserRecord = {
      ...user,
      status: 'aprovado',
      approvedAt: now,
      approvedBy,
      updatedAt: now,
    };
    mockAuthUsers.set(userId, updated);
    return updated;
  },

  async rejectUser(userId: string, approvedBy: string): Promise<AuthUserRecord | null> {
    const now = new Date().toISOString();

    if (isUsingDynamo()) {
      ensureDynamoConfig();
      const client = getDynamoDocumentClient();
      try {
        const result = await client.send(
          new UpdateCommand({
            TableName: usersTable,
            Key: { pk: buildUserPk(userId) },
            UpdateExpression:
              'SET #status = :rejected, approvedBy = :approvedBy, updatedAt = :updatedAt REMOVE approvedAt',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: {
              ':rejected': 'rejeitado',
              ':approvedBy': approvedBy,
              ':updatedAt': now,
            },
            ConditionExpression: 'attribute_exists(pk)',
            ReturnValues: 'ALL_NEW',
          })
        );
        if (!result.Attributes) return null;
        return mapDynamoUser(result.Attributes);
      } catch (error: any) {
        if (error?.name === 'ConditionalCheckFailedException') return null;
        throw error;
      }
    }

    const user = mockAuthUsers.get(userId);
    if (!user) return null;
    const updated: AuthUserRecord = {
      ...user,
      status: 'rejeitado',
      approvedBy,
      approvedAt: undefined,
      updatedAt: now,
    };
    mockAuthUsers.set(userId, updated);
    return updated;
  },

  async listAllActiveUsers(): Promise<AuthUserRecord[]> {
    if (isUsingDynamo()) {
      ensureDynamoConfig();
      const client = getDynamoDocumentClient();
      const scan = await client.send(
        new ScanCommand({
          TableName: usersTable,
          FilterExpression: '#status = :aprovado',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: { ':aprovado': 'aprovado' },
        })
      );
      return (scan.Items || []).map(mapDynamoUser);
    }
    return Array.from(mockAuthUsers.values()).filter((u) => u.status === 'aprovado');
  },

  async createPasswordResetToken({
    userId,
    ttlMinutes,
  }: {
    userId: string;
    ttlMinutes: number;
  }): Promise<string> {
    const tokenId = crypto.randomUUID();
    const secret = crypto.randomBytes(32).toString('hex');
    const rawToken = `${tokenId}.${secret}`;
    const tokenHash = hashSecret(secret);
    const createdAt = new Date().toISOString();
    const expiresAt = Math.floor(Date.now() / 1000) + ttlMinutes * 60;

    const row: ResetTokenRow = {
      pk: buildResetPk(tokenId),
      tokenId,
      userId,
      tokenHash,
      createdAt,
      expiresAt,
    };

    if (isUsingDynamo()) {
      ensureDynamoConfig();
      const client = getDynamoDocumentClient();
      await client.send(
        new PutCommand({
          TableName: resetTable,
          Item: row,
          ConditionExpression: 'attribute_not_exists(pk)',
        })
      );
      return rawToken;
    }

    mockResetTokens.set(tokenId, row);
    return rawToken;
  },

  async consumeValidPasswordResetToken(rawToken: string): Promise<string | null> {
    const [tokenId, secret] = rawToken.split('.');
    if (!tokenId || !secret) return null;

    const expectedHash = hashSecret(secret);
    const nowIso = new Date().toISOString();
    const nowEpoch = Math.floor(Date.now() / 1000);

    if (isUsingDynamo()) {
      ensureDynamoConfig();
      const client = getDynamoDocumentClient();
      const current = await client.send(
        new GetCommand({
          TableName: resetTable,
          Key: { pk: buildResetPk(tokenId) },
        })
      );

      const item = current.Item as ResetTokenRow | undefined;
      if (!item) return null;
      if (item.usedAt || item.expiresAt <= nowEpoch || item.tokenHash !== expectedHash) {
        return null;
      }

      try {
        await client.send(
          new UpdateCommand({
            TableName: resetTable,
            Key: { pk: buildResetPk(tokenId) },
            UpdateExpression: 'SET usedAt = :usedAt',
            ExpressionAttributeValues: { ':usedAt': nowIso },
            ConditionExpression: 'attribute_not_exists(usedAt)',
          })
        );
      } catch {
        return null;
      }
      return item.userId;
    }

    const item = mockResetTokens.get(tokenId);
    if (!item) return null;
    if (item.usedAt || item.expiresAt <= nowEpoch || item.tokenHash !== expectedHash) {
      return null;
    }
    mockResetTokens.set(tokenId, { ...item, usedAt: nowIso });
    return item.userId;
  },

  async updatePassword(userId: string, passwordHash: string): Promise<boolean> {
    const now = new Date().toISOString();

    if (isUsingDynamo()) {
      ensureDynamoConfig();
      const client = getDynamoDocumentClient();
      try {
        await client.send(
          new UpdateCommand({
            TableName: usersTable,
            Key: { pk: buildUserPk(userId) },
            UpdateExpression: 'SET passwordHash = :passwordHash, updatedAt = :updatedAt',
            ExpressionAttributeValues: { ':passwordHash': passwordHash, ':updatedAt': now },
            ConditionExpression: 'attribute_exists(pk)',
          })
        );
        return true;
      } catch (error: any) {
        if (error?.name === 'ConditionalCheckFailedException') return false;
        throw error;
      }
    }

    const user = mockAuthUsers.get(userId);
    if (!user) return false;
    mockAuthUsers.set(userId, { ...user, passwordHash, updatedAt: now });
    return true;
  },

  // ── Push token management ──────────────────────────────────────────────────

  async registerPushToken(userId: string, token: string, platform: string): Promise<void> {
    if (isUsingDynamo()) {
      ensureDynamoConfig();
      const client = getDynamoDocumentClient();
      // Store token in user record's pushTokens list (set semantics via ADD)
      await client.send(
        new UpdateCommand({
          TableName: usersTable,
          Key: { pk: buildUserPk(userId) },
          UpdateExpression: 'ADD pushTokens :token',
          ExpressionAttributeValues: { ':token': new Set([token]) },
          ConditionExpression: 'attribute_exists(pk)',
        })
      );
      return;
    }

    const user = mockAuthUsers.get(userId);
    if (!user) return;
    const tokens = new Set(user.pushTokens || []);
    tokens.add(token);
    mockAuthUsers.set(userId, { ...user, pushTokens: Array.from(tokens) });

    // Also track in separate mock map for efficient batch lookup
    if (!mockPushTokens.has(userId)) {
      mockPushTokens.set(userId, new Set());
    }
    mockPushTokens.get(userId)!.add(token);
  },

  async removePushToken(userId: string, token: string): Promise<void> {
    if (isUsingDynamo()) {
      ensureDynamoConfig();
      const client = getDynamoDocumentClient();
      await client.send(
        new UpdateCommand({
          TableName: usersTable,
          Key: { pk: buildUserPk(userId) },
          UpdateExpression: 'DELETE pushTokens :token',
          ExpressionAttributeValues: { ':token': new Set([token]) },
        })
      );
      return;
    }

    const user = mockAuthUsers.get(userId);
    if (!user) return;
    const tokens = new Set(user.pushTokens || []);
    tokens.delete(token);
    mockAuthUsers.set(userId, { ...user, pushTokens: Array.from(tokens) });
    mockPushTokens.get(userId)?.delete(token);
  },

  async deleteUserData(userId: string): Promise<void> {
    const now = new Date().toISOString();
    const anonymizedEmail = `deleted-${userId}@anonimizado.invalid`;
    const anonymizedNome = 'Usuario Anonimizado';

    if (isUsingDynamo()) {
      ensureDynamoConfig();
      const client = getDynamoDocumentClient();
      await client.send(
        new UpdateCommand({
          TableName: usersTable,
          Key: { pk: buildUserPk(userId) },
          UpdateExpression:
            'SET #email = :email, emailLower = :emailLower, nome = :nome, telefone = :none, #status = :deleted, updatedAt = :updatedAt REMOVE passwordHash, pushTokens',
          ExpressionAttributeNames: {
            '#email': 'email',
            '#status': 'status',
          },
          ExpressionAttributeValues: {
            ':email': anonymizedEmail,
            ':emailLower': anonymizedEmail,
            ':nome': anonymizedNome,
            ':none': null,
            ':deleted': 'deletado',
            ':updatedAt': now,
          },
          ConditionExpression: 'attribute_exists(pk)',
        })
      );
      return;
    }

    const user = mockAuthUsers.get(userId);
    if (!user) return;
    mockAuthUsers.set(userId, {
      ...user,
      email: anonymizedEmail,
      emailLower: anonymizedEmail,
      nome: anonymizedNome,
      telefone: undefined,
      passwordHash: '',
      pushTokens: [],
      updatedAt: now,
      status: 'rejeitado',
    });
    mockPushTokens.delete(userId);
  },

  async getPushTokensByUsers(
    userIds: string[]
  ): Promise<Array<{ userId: string; token: string }>> {
    if (isUsingDynamo()) {
      const results: Array<{ userId: string; token: string }> = [];
      for (const userId of userIds) {
        const user = await findByIdInDynamo(userId);
        if (user?.pushTokens) {
          for (const token of user.pushTokens) {
            results.push({ userId, token });
          }
        }
      }
      return results;
    }

    const results: Array<{ userId: string; token: string }> = [];
    for (const userId of userIds) {
      const user = mockAuthUsers.get(userId);
      if (user?.pushTokens) {
        for (const token of user.pushTokens) {
          results.push({ userId, token });
        }
      }
    }
    return results;
  },
};
