import { NextApiRequest, NextApiResponse } from 'next'
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth/next"
import { s3Client, bucketParams, fetchConfig } from './apiConfigUtils';
import { authOptions } from "../auth/[...nextauth]"
import { AppContextType } from '../../../utils/appContext';

export const loadAssignees = async (appConfig: AppContextType) => {
  let assigneeData = null;
  try {
    const copilotGetReq = {
      headers: {
        'X-API-KEY': appConfig.copilotApiKey,
        'Content-Type': 'application/json',
      },
    };

    const clientRes = await fetch(
      `https://api.copilot-staging.com/v1/client`,
      copilotGetReq,
    );

    const companyRes = await fetch(
      `https://api.copilot-staging.com/v1/company`,
      copilotGetReq
    )

    // get all companies from a portal
    const allCompanies = (await companyRes.json()).data;

    // create list of valid companies
    const companyData = []
    allCompanies.forEach((company) => {
      company.name.length > 0 ? companyData.push(company) : null
    })

    // concatenate assignees and companies
    assigneeData = (await clientRes.json()).data.concat(companyData);
  } catch (ex) {
    console.error('error fetching user apps', ex);
  }
  return assigneeData;
}

/**
 * Get the config data for a given app id
 * @param req next api request
 * @param res next api response
 * @returns relevant app data for a given app id
 */
const handleGetConfig = async (req: NextApiRequest, res: NextApiResponse) => {
  // get appId from req query
  const { appId } = req.query;
  if (!appId) {
    return res.status(400).end();
  }

  // config is found with key information that can be used to query
  // clients backend for data
  try {
    const configData = await fetchConfig(appId as string);
    const assigneeData = await loadAssignees(configData);
    res.status(200).json(assigneeData)
  } catch (ex) {
    console.log(ex);
  }

  return res.status(400).end();
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
