import { NextApiRequest, NextApiResponse } from 'next';
import { AppContextType } from '../../../utils/appContext';
import { fetchConfig } from '../config/apiConfigUtils';
import { Task } from '../../../components/types';
import { loadAppData } from '../data';
import { DBType, formatData } from '../../[appId]';
import { isDBUsingGoogleSheets } from '../../../utils/googleSheetUtils';

console.time('initial data request start')

const handleLoadInitialData = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  let appSetupData: AppContextType;
  console.log('start load data')

  console.time('fetchConfig')
  try {
    appSetupData = await fetchConfig(req.query.appId as string);
  } catch (error) {
    console.log('error fetching config', error);
  }
  console.timeEnd('fetchConfig')

  // HEADERS
  const copilotGetReq = {
    // method: 'GET',
    headers: {
      'X-API-KEY': appSetupData.copilotApiKey,
      'Content-Type': 'application/json',
    },
  };

  let clientData = null;

  // -------------COPILOT API-------------------

  // SET COPILOT CLIENT OR COMPANY ID FROM PARAMS
  console.time('copilotFetch')
  const clientId = req.query.clientId;

  const companyId = req.query.companyId;

  //check if data returned
  const checkDataLength = (dataObj) => {
    let dataLength;
    dataObj.data
      ? (dataLength = Object.keys(dataObj.data).length)
      : Object.keys(dataObj).length;
    dataObj.code === 'not_found' ? (dataLength = 0) : null;
    return dataLength;
  };

  if (clientId !== undefined) {
    const clientRes = await fetch(
      `https://api-beta.copilot.com/v1/client/${clientId}`,
      copilotGetReq,
    );

    clientData = await clientRes.json();

    // call company endpoint if  no data returned for client
    if (checkDataLength(clientData) <= 0) {
      const clientCompanyRes = await fetch(
        `https://api-beta.copilot.com/v1/company/${clientId}`,
        copilotGetReq,
      );

      clientData = await clientCompanyRes.json();
    }
  } else if (companyId !== undefined) {
    const companyRes = await fetch(
      `https://api-beta.copilot.com/v1/company/${companyId}`,
      copilotGetReq,
    );
    clientData = await companyRes.json();

    // call client endpoint if  no data returned for company
    if (checkDataLength(clientData) <= 0) {
      const clientCompanyRes = await fetch(
        `https://api-beta.copilot.com/v1/client/${companyId}`,
        copilotGetReq,
      );

      clientData = await clientCompanyRes.json();
    }
  } else {
    console.log('No ID Found');
  }
  console.timeEnd('copilotFetch')

  // -----------GET TASKS----------------
  console.time('loadAppData')
  let tasks: Array<Task> = [];
  try {
    const airtableData = await loadAppData(appSetupData, clientData?.id);
    tasks = formatData(clientData, airtableData);
  } catch (error) {
    console.log('error fetching tasks', error);
  }
  console.timeEnd('loadAppData')

  const appConfig = {
    controls: appSetupData.controls || '',
    defaultChannelType: appSetupData.defaultChannelType || null,
  };

  const dbType: DBType = isDBUsingGoogleSheets(appSetupData)
    ? 'google_sheet'
    : 'airtable';

  console.info('loaded tasks', tasks.length);

  // -----------PROPS-----------------------------
  res.json({
    clientData,
    tasks: JSON.parse(JSON.stringify(tasks)),
    appConfig,
    dbType,
  });
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  console.timeEnd('initial data request start')
  switch (req.method) {
    case 'GET':
      return handleLoadInitialData(req, res);
    default:
      return res.status(405).end();
  }
};

export default handler;
