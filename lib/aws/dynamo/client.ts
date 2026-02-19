import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

let documentClient: DynamoDBDocumentClient | null = null;

export function getDynamoDocumentClient(): DynamoDBDocumentClient {
  if (documentClient) {
    return documentClient;
  }

  const region = process.env.AWS_REGION || 'us-east-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  const client = new DynamoDBClient({
    region,
    ...(accessKeyId && secretAccessKey
      ? {
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        }
      : {}),
  });

  documentClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  });

  return documentClient;
}

