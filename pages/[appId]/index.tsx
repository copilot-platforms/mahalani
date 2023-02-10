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

type AppPagePros = {
  clientData: AssigneeDataType | null;
  tasks: Array<Task>;
  appConfig: ClientAppConfig;
};

const DATA_REFRESH_TIMEOUT = 3000;

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

const AppPage = ({ clientData, tasks, appConfig }: AppPagePros) => {
  const router = useRouter();
  const { appId } = router.query;
  const [taskLists, setTaskList] = useState<Task[]>(tasks);
  const refreshAppData = async () => {
    const triggerPoolItem = new Date().getTime();
    const getAppDataResult = await fetch(
      `/api/data?appId=${appId}&assigneeId=${clientData?.id}`,
      {
        method: 'GET',
      },
    );
    console.info('getAppDataResult', getAppDataResult);
    const appData = await getAppDataResult.json();
    const tasks = formatData(clientData, appData);

    if (triggerPoolItem < lastActionTime.current) {
      return;
    }

    setTaskList(tasks.filter((task) => !!task.title)); // filter out tasks with no title);
    lastActionTime.current = new Date().getTime();
  };

  const lastActionTime = useRef(new Date().getTime());

  const handleUpdateAction = () => {
    // track the last time the user updated an action
    lastActionTime.current = new Date().getTime();
  };

  useEffect(() => {
    if (!clientData) {
      return;
    }

    const interval = setInterval(() => {
      refreshAppData();
    }, DATA_REFRESH_TIMEOUT);

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
    const airtableData = await loadAppData(appSetupData, clientData?.id);
    tasks = formatData(clientData, airtableData);
  } catch (error) {
    console.log('error fetching tasks', error);
  }

  const appConfig = {
    controls: appSetupData.controls || '',
    defaultChannelType: appSetupData.defaultChannelType || null,
  };

  console.info('loaded tasks', tasks.length);

  // -----------PROPS-----------------------------
  return {
    props: {
      clientData,
      tasks: JSON.parse(JSON.stringify(tasks)),
      appConfig,
    },
  };
}
