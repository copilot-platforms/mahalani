import { useState, useEffect, useContext, useRef } from 'react';
import Layout from '../../components/Layout';
import TodoList from '../../components/TodoList';
import { AssigneeDataType, Task } from '../../components/types';
import {
  AppContext,
  AppContextType,
  ClientAppConfig,
} from '../../utils/appContext';
import { fetchConfig } from '../api/config/apiConfigUtils';
import * as _ from 'lodash';
import { useRouter } from 'next/router';
import { loadAppData } from '../api/data';
import { isDBUsingGoogleSheets } from '../../utils/googleSheetUtils';
import { authOptions } from '../api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';

type DBType = 'google_sheet' | 'airtable';
type AppPagePros = {
  clientData: AssigneeDataType | null;
  tasks: Array<Task>;
  appConfig: ClientAppConfig;
  dbType: DBType;
};

const AIRTABLE_DATA_REFRESH_TIMEOUT = 3000;
const GOOGLESHEET_DATA_REFRESH_TIMEOUT = 6000;

const formatData = (clientData: AssigneeDataType, airtableRecords: any) => {
  const formattedData: Array<Task> = airtableRecords.map((record, rank) => ({
    id: record.id,
    title: record.fields.Name || '',
    status: record.fields.Status,
    assignee: clientData,
    priority: record.fields.Priority || '',
    rank: rank,
    attachments: record.fields['Attachments'],
    description: record.fields['Description'],
    learnMoreLink: record.fields['Learn More Link'],
    clientIdRef: record.fields['Assignee - Reference Record'],
  }));
  return formattedData;
};

/**
 * This is the app page container where we can render the configuration
 * page or the app itself (which gets some client information).
 * @returns
 */

const AppPage = ({ clientData, tasks, appConfig, dbType }: AppPagePros) => {
  const router = useRouter();
  const { appId } = router.query;
  const [taskLists, setTaskList] = useState<Task[]>(tasks);
  const pendingRequestIds = useRef([]);
  const taskListRequestController = useRef(new AbortController());

  const refreshAppData = async () => {
    try {
      // check if there is any pending request
      // if we have pending requests then don't refresh the app data
      if (pendingRequestIds.current.length) {
        return;
      }

      // fetching latest task
      const getAppDataResult = await fetch(
        `/api/data?appId=${appId}&assigneeId=${clientData?.id}`,
        {
          method: 'GET',
          signal: taskListRequestController.current.signal,
        },
      );
      console.info('getAppDataResult', getAppDataResult);
      const appData = await getAppDataResult.json();
      const tasks = formatData(clientData, appData);

      setTaskList(tasks.filter((task) => !!task.title)); // filter out tasks with no title
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateAction = (id: string) => {
    taskListRequestController.current.abort('An update request is pending'); // cancel any ongoing task GET request

    const currentPendingRequestIds = [...pendingRequestIds.current];

    // update pending request ids
    pendingRequestIds.current = currentPendingRequestIds.includes(id)
      ? currentPendingRequestIds.filter((p) => p !== id) // remove id if already there
      : [...currentPendingRequestIds, id]; // add pending request id

    // renew abort controller
    taskListRequestController.current = new AbortController();
  };

  useEffect(() => {
    if (!clientData) {
      return;
    }

    const timeout =
      dbType === 'google_sheet'
        ? GOOGLESHEET_DATA_REFRESH_TIMEOUT
        : AIRTABLE_DATA_REFRESH_TIMEOUT;

    const interval = setInterval(() => {
      refreshAppData();
    }, timeout);

    // when the component unmounts, clear the interval
    return () => {
      clearInterval(interval);
    };
  }, []);

  const clientFullName = clientData
    ? `${clientData.givenName} ${clientData.familyName}`
    : '';

  return (
    <AppContext.Provider value={appConfig}>
      <Layout title="Custom App - Task Management">
        <TodoList
          title={``}
          tasks={taskLists}
          onUpdateAction={handleUpdateAction}
        />
      </Layout>
    </AppContext.Provider>
  );
};

export default AppPage;

/* 
-------------SERVER-------------------
*/

export async function getServerSideProps(context) {
  let appSetupData: AppContextType;
  const session = await getServerSession(context.req, context.res, authOptions);

  try {
    appSetupData = await fetchConfig(context.query.appId);
  } catch (error) {
    console.log('error fetching config', error);
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

  const clientId = context.query.clientId;

  const companyId = context.query.companyId;

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

  // -----------GET TASKS----------------
  let tasks: Array<Task> = [];
  try {
    const airtableData = await loadAppData(
      appSetupData,
      clientData?.id,
      session.accessToken,
    );
    tasks = formatData(clientData, airtableData);
  } catch (error) {
    console.log('error fetching tasks', error);
  }

  const appConfig = {
    controls: appSetupData.controls || '',
    defaultChannelType: appSetupData.defaultChannelType || null,
  };

  const dbType: DBType = isDBUsingGoogleSheets(appSetupData)
    ? 'google_sheet'
    : 'airtable';

  console.info('loaded tasks', tasks.length);

  // -----------PROPS-----------------------------
  return {
    props: {
      clientData,
      tasks: JSON.parse(JSON.stringify(tasks)),
      appConfig,
      dbType,
    },
  };
}
