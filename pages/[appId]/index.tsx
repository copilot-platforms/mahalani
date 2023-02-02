import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getAirtableClient, getAllRecords } from '../../utils/airtableUtils';
import TodoList from '../../components/TodoList';
import { AssigneeDataType, Task } from '../../components/types';
import { AppContext, AppContextType } from '../../utils/appContext';
import { fetchConfig } from '../api/config/apiConfigUtils';

type AppPagePros = {
  clientData: AssigneeDataType | null;
  tasks: Array<Task>;
  appSetupData: AppContextType;
};

const DATA_REFRESH_TIMEOUT = 3000;

const loadAppData = async (
  appData: AppContextType,
  clientData: AssigneeDataType,
) => {
  const baseConstructor = getAirtableClient(
    appData.airtableApiKey,
    appData.baseId,
  );
  const tableClient = baseConstructor(appData.tableId);

  const airtableRecords = await getAllRecords(
    tableClient,
    appData.viewId,
    `{Client ID} = "${clientData.id}"`,
  );

  console.info('airtableRecords', airtableRecords);

  // format the data coming from airtable to fit the task data struct
  const tasksList: Array<Task> = airtableRecords.map((record) => ({
    id: record.id,
    title: record.fields.Name,
    status: record.fields.Status,
  }));
  return tasksList;
};

/**
 * This is the app page container where we can render the configuration
 * page or the app itself (which gets some client information).
 * @returns
 */

const AppPage = ({ clientData, tasks, appSetupData }: AppPagePros) => {
  const [taskLists, setTaskList] = useState<Task[]>(tasks);

  const refreshAppData = async () => {
    const tasks = await loadAppData(appSetupData, clientData);
    setTaskList(tasks);
  };

  useEffect(() => {
    if (!appSetupData || !clientData) {
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

  // if assignee object has name property (company), name displayed is company, client if not
  const assigneeName = clientData.name ? clientData.name : `${clientData.givenName} ${clientData.familyName}`;

  return (
    <AppContext.Provider value={appSetupData}>
      <Layout title="Home | Next.js + TypeScript Example">
        <TodoList title={`${assigneeName}'s tasks`} tasks={taskLists} />

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

  if (clientId !== undefined) {
    const clientRes = await fetch(
      `https://api.copilot-staging.com/v1/client/${clientId}`,
      copilotGetReq,
    );

    clientData = await clientRes.json(); 
    // console.log(`client data: ${JSON.stringify(clientData)}`)

    // check if receiving empty object from client response
    let checkDataLength 

    clientData.data? checkDataLength = Object.keys(clientData.data).length : Object.keys(clientData).length

    // call company endpoint in case if no data returned for client
    if (checkDataLength <= 0){
    const clientCompanyRes = await fetch(
      `https://api.copilot-staging.com/v1/company/${clientId}`,
      copilotGetReq,
    );

    clientData = await clientCompanyRes.json()
    }
  } else if (companyId !== undefined) {
    const companyRes = await fetch(
      `https://api.copilot-staging.com/v1/company/${companyId}`,
      copilotGetReq,
    );
    clientData = await companyRes.json()
    // searchId = companyData.name
  } else {
    console.log('No ID Found');
  }

  // -----------GET TASKS----------------
  let tasks: Array<Task> = [];
  try {
    tasks = await loadAppData(appSetupData, clientData);
  } catch (error) {
    console.log('error fetching tasks', error);
  }

  // -----------PROPS-----------------------------
  return {
    props: {
      clientData,
      tasks,
      appSetupData,
    },
  };
}
