import { NextApiRequest, NextApiResponse } from 'next'
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth/next"
import { s3Client, bucketParams } from './apiConfigUtils';
import { authOptions } from "../auth/[...nextauth]"



const handleGetConfig = (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({})
}

const handlePostConfig = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    // no session found so return a 400
    res.status(400).end();
    return;
  }

  const userEmail = session.user.email

  // get input from the request body and save it to the storage
  // in s3
  const { body } = req;
  const configId = body.id;
  if (!configId) {
    return res.status(400).end();
  }
  
  // save the userId with the associated appId
  const userConfigUploadParams = { ...bucketParams, Key: `users/${userEmail}/apps.json`, Body: JSON.stringify([
    configId,
  ]) };
  try {
    const data = await s3Client.send(new PutObjectCommand(userConfigUploadParams));
    console.log("Success", data);
    res.status(200).json(data);
  } catch (err) {
    console.log("Error", err);
    res.status(500).end();
  }

  
  const uploadParams = { ...bucketParams, Key: `apps/${configId}/config.json`, Body: JSON.stringify(body) };
  try {
    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log("Success", data);
    res.status(200).json(data);
  } catch (err) {
    console.log("Error", err);
    res.status(500).end();
  }
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET':
      return handleGetConfig(req, res)
    case 'POST':
      return handlePostConfig(req, res)
    default:
      return res.status(405).end()
  }
}

export default handler
