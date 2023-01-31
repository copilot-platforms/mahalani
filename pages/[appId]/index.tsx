import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getAirtableClient, getAllRecords } from '../../utils/airtableUtils';
import TodoList from '../../components/TodoList';
import { ClientDataType, Task } from '../../components/types';
import { AirtableContext, AirtableContextType } from '../../utils/airtableContext';
import { fetchConfig } from '../api/config/apiConfigUtils';

type AppPagePros = {
  clientData: ClientDataType;
  tasks: Array<Task>;
  appSetupData: AirtableContextType;
};

const DATA_REFRESH_TIMEOUT = 3000;

const loadAppData = async (appData: AirtableContextType, clientData: ClientDataType) => {
    const baseConstructor = getAirtableClient(
        appData.apiKey,
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
        assignee: clientData,
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
    }

    useEffect(() => {
        if (!appSetupData) {
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

  return (
    <AirtableContext.Provider value={appSetupData}>
      <Layout title="Home | Next.js + TypeScript Example">
        <TodoList tasks={taskLists} />
      </Layout>
    </AirtableContext.Provider>
  );
};

export default AppPage;

/* 
-------------SERVER-------------------
*/

export async function getServerSideProps(context) {
  // HEADERS
  const copilotGetReq = {
    // method: 'GET',
    headers: {
      'X-API-KEY': process.env.COPILOT_API_KEY,
      'Content-Type': 'application/json',
    },
  };

  let clientData;

  // -------------PORTAL API-------------------

  // SET PORTAL CLIENT OR COMPANY ID FROM PARAMS

  const clientId = context.query.clientId;
  console.log(`clientId: ${clientId}`);

  const companyId = context.query.companyId;
  console.log(`companyId: ${companyId}`);

  // console.log(`copilot key: ${process.env.COPILOT_API_KEY}`)

  if (clientId !== undefined) {
    const clientRes = await fetch(
      `https://api.copilot-staging.com/v1/client/${clientId}`,
      copilotGetReq,
    );

    clientData = await clientRes.json();
    console.log(`CLIENT DATA: ${JSON.stringify(clientData)}`);
  } else if (companyId !== undefined) {
    const companyRes = await fetch(
      `https://api.copilot-staging.com/v1/company/${companyId}`,
      copilotGetReq,
    );
    // const companyData = await companyRes.json()
    // searchId = companyData.name
  } else {
    console.log('No ID Found');
  }
  
  // -----------GET APP CONFIG AND DATA----------------
  let appSetupData: AirtableContextType;
  let tasks: Array<Task> = [];
  try {
    appSetupData = await fetchConfig(context.query.appId);
    tasks = await loadAppData(appSetupData, clientData);    
  } catch (error) {
    console.log('error fetching config', error);
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
