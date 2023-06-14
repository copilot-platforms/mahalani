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
  console.log('Fetching config of appId', appId);
  const params = { ...bucketParams, Key: `apps/${appId}/config.json` };
  try {
    const data = await s3Client.send(new GetObjectCommand(params));
    const s3ResponseStream = data.Body as any; // use any convert stream
    const chunks = [];

    for await (const chunk of s3ResponseStream) {
      chunks.push(chunk);
    }

    const responseBuffer = Buffer.concat(chunks);
    console.log('Response buffer is ready');
    const config = JSON.parse(responseBuffer.toString());
    console.log('Our config is ready to return', config);
    return config;
  } catch (err) {
    console.log('Error', err);
    throw new Error('Failed fetching the config');
    // return null;
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
