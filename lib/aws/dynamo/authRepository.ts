import {
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { mockUsers } from '@/lib/data/mockUsers';
import { getDynamoDocumentClient } from './client';
import {
  AuthUserRecord,
  PendingUserSummary,
  UserApprovalStatus,
} from '@/types/authUser';

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

seedMockAuthUsers();

function seedMockAuthUsers() {
  if (mockAuthUsers.size > 0) {
    return;
  }

  for (const user of mockUsers) {
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
      createdAt: user.createdAt || now,
      updatedAt: now,
      approvedAt: user.ativo ? now : undefined,
      approvedBy: user.ativo ? 'seed' : undefined,
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
        ExpressionAttributeValues: {
          ':gsi1pk': `EMAIL#${emailLower}`,
        },
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
  if (!scan.Items || scan.Items.length === 0) {
    return null;
  }
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

    if (isUsingDynamo()) {
      return findByEmailInDynamo(emailLower);
    }

    for (const user of mockAuthUsers.values()) {
      if (user.emailLower === emailLower) {
        return user;
      }
    }
    return null;
  },

  async findById(userId: string): Promise<AuthUserRecord | null> {
    if (isUsingDynamo()) {
      return findByIdInDynamo(userId);
    }

    return mockAuthUsers.get(userId) || null;
  },

  async createPendingUser({
    email,
    passwordHash,
  }: {
    email: string;
    passwordHash: string;
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
            id: user.id,
            email: user.email,
            emailLower: user.emailLower,
            nome: user.nome,
            role: user.role,
            status: user.status,
            passwordHash: user.passwordHash,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
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
          ExpressionAttributeValues: {
            ':pending': 'pendente_aprovacao',
          },
        })
      );
      const users: PendingUserSummary[] = (scan.Items || [])
        .map(mapDynamoUser)
        .map(toPendingSummary);
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

        if (!result.Attributes) {
          return null;
        }
        return mapDynamoUser(result.Attributes);
      } catch (error: any) {
        if (error?.name === 'ConditionalCheckFailedException') {
          return null;
        }
        throw error;
      }
    }

    const user = mockAuthUsers.get(userId);
    if (!user) {
      return null;
    }
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

        if (!result.Attributes) {
          return null;
        }
        return mapDynamoUser(result.Attributes);
      } catch (error: any) {
        if (error?.name === 'ConditionalCheckFailedException') {
          return null;
        }
        throw error;
      }
    }

    const user = mockAuthUsers.get(userId);
    if (!user) {
      return null;
    }
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
    if (!tokenId || !secret) {
      return null;
    }

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
      if (!item) {
        return null;
      }
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
    if (!item) {
      return null;
    }
    if (item.usedAt || item.expiresAt <= nowEpoch || item.tokenHash !== expectedHash) {
      return null;
    }
    mockResetTokens.set(tokenId, {
      ...item,
      usedAt: nowIso,
    });
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
            ExpressionAttributeValues: {
              ':passwordHash': passwordHash,
              ':updatedAt': now,
            },
            ConditionExpression: 'attribute_exists(pk)',
          })
        );
        return true;
      } catch (error: any) {
        if (error?.name === 'ConditionalCheckFailedException') {
          return false;
        }
        throw error;
      }
    }

    const user = mockAuthUsers.get(userId);
    if (!user) {
      return false;
    }
    mockAuthUsers.set(userId, {
      ...user,
      passwordHash,
      updatedAt: now,
    });
    return true;
  },
};
