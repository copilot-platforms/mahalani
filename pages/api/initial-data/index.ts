import { NextApiRequest, NextApiResponse } from 'next';
import { AppContextType } from '../../../utils/appContext';
import { fetchConfig } from '../config/apiConfigUtils';
import { DBType } from '../../[appId]';
import { isDBUsingGoogleSheets } from '../../../utils/googleSheetUtils';

//check if data returned
const checkDataLength = (dataObj) => {
  let dataLength;
  dataObj.data
    ? (dataLength = Object.keys(dataObj.data).length)
    : Object.keys(dataObj).length;
  dataObj.code === 'not_found' ? (dataLength = 0) : null;
  return dataLength;
};

const handleLoadInitialData = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  let appSetupData: AppContextType;

  try {
    appSetupData = await fetchConfig(req.query.appId as string);
  } catch (error) {
    console.error('error fetching config', error);
  }

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
  const clientId = req.query.clientId;

  const companyId = req.query.companyId;

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
  const appConfig = {
    controls: appSetupData.controls || '',
    defaultChannelType: appSetupData.defaultChannelType || null,
  };

  const dbType: DBType = isDBUsingGoogleSheets(appSetupData)
    ? 'google_sheet'
    : 'airtable';

  // -----------PROPS-----------------------------
  res.json({
    clientData,
    appConfig,
    dbType,
  });
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET':
      return handleLoadInitialData(req, res);
    default:
      return res.status(405).end();
  }
};

export default handler;
