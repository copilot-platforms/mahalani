import { NextApiRequest, NextApiResponse } from 'next'
import { fetchConfig } from '../config/apiConfigUtils';
import { addRecord, getAirtableClient, getAllRecords, updateRecord } from '../../../utils/airtableUtils';
import { AppContextType } from '../../../utils/appContext';


export const loadAppData = async (
  appData: AppContextType,
  clientId: string,
) => {
  const baseConstructor = getAirtableClient(
    appData.airtableApiKey,
    appData.baseId,
  );
  const tableClient = baseConstructor(appData.tableId);

  const airtableRecords = await getAllRecords(
    tableClient,
    appData.viewId,
    `{Client ID} = "${clientId}"`,
  );

  console.info('num airtableRecords', airtableRecords.length);

  return airtableRecords;
};


/**
 * Get the config data for a given app id
 * @param req next api request
 * @param res next api response
 * @returns relevant app data for a given app id
 */
const handleGetData = async (req: NextApiRequest, res: NextApiResponse) => {
  // get appId from req query
  const { assigneeId, appId } = req.query;
  if (!assigneeId || !appId) {
    return res.status(400).end();
  }

  // config is found with key information that can be used to query
  // clients backend for data
  try {
    const appConfigData = await fetchConfig(appId as string)
    const appData = await loadAppData(appConfigData, assigneeId as string);
    res.status(200).json(appData)
  } catch (ex) {
    console.log(ex);
  }

  return res.status(400).end();
}

const handlePostData = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const appSetupData = await fetchConfig(req.query.appId as string);

    // Get the airtable rest client instance
    const airtableClient = getAirtableClient(
      appSetupData.airtableApiKey,
      appSetupData.baseId,
    );

    const tableClient = airtableClient(appSetupData.tableId);
    const record = await addRecord(tableClient, req.body);
    res.status(200).json(record);
  } catch (ex) {
    console.error('Error updating record', ex);
  }
  return res.status(500).end();
}

const handlePatchData = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const appSetupData = await fetchConfig(req.query.appId as string);

    // Get the airtable rest client instance
    const airtableClient = getAirtableClient(
      appSetupData.airtableApiKey,
      appSetupData.baseId,
    );

    const tableClient = airtableClient(appSetupData.tableId);
    const record = await updateRecord(tableClient, req.query.recordId as string, req.body);
    res.status(200).json(record);
  } catch (ex) {
    console.error('Error updating record', ex);
  }
  return res.status(500).end();
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET':
      return handleGetData(req, res)
    case 'PATCH':
      return handlePatchData(req, res)
    case 'POST':
      return handlePostData(req, res)
    default:
      return res.status(405).end()
  }
}

export default handler
