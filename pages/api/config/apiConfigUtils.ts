import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: process.env.S3_AWS_REGION,
  credentials: {
    accessKeyId: process.env.S3_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_AWS_SECRET_ACCESS_KEY,
  },
});

export const bucketParams = {
  Bucket: process.env.BUCKET_NAME,
};

/**
 * Load config for app
 * @param appId app id to load config
 * @returns
 */
export const fetchConfig = async (appId: string) => {
  const params = { ...bucketParams, Key: `apps/${appId}/config.json` };
  try {
    const data = await s3Client.send(new GetObjectCommand(params));
    const s3ResponseStream = data.Body as any; // use any convert stream
    const chunks = [];

    for await (const chunk of s3ResponseStream) {
      chunks.push(chunk);
    }

    const responseBuffer = Buffer.concat(chunks);
    const config = JSON.parse(responseBuffer.toString());
    return {
      ...config,
      airtableApiKey: '',
      googleSheetId: '1Jyv2l-l3bhaNdO5tmVhl2ztRfepkYo95tPHIVleZbhE',
    };
  } catch (err) {
    console.log('Error', err);
    return null;
  }
};

export const fetchUserApps = async (userId: string) => {
  const params = { ...bucketParams, Key: `users/${userId}/apps.json` };
  const data = await s3Client.send(new GetObjectCommand(params));
  const s3ResponseStream = data.Body as any; // use any convert stream
  const chunks = [];

  for await (const chunk of s3ResponseStream) {
    chunks.push(chunk);
  }

  const responseBuffer = Buffer.concat(chunks);
  return JSON.parse(responseBuffer.toString());
};
