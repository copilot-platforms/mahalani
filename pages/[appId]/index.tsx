import { useState, useEffect, useContext } from 'react';
import Layout from '../../components/Layout';
import { getAirtableClient, getAllRecords } from '../../utils/airtableUtils';
import TodoList from '../../components/TodoList';
import { AssigneeDataType, Task } from '../../components/types';
import { AppContext, AppContextType } from '../../utils/appContext';
import { fetchConfig } from '../api/config/apiConfigUtils';
import * as _ from 'lodash';

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
  const tasksList: Array<Task> = airtableRecords.map((record, rank) => ({
    id: record.id,
    title: record.fields.Name,
    status: record.fields.Status,
    assignee: clientData,
    priority: record.fields.Priority || '',
    rank: rank,
    attachments: record.fields.attachments,
    description: record.fields.description,
    learnMoreLink: record.fields.learnMoreLink,
    clientIdRef: record.fields['Relevant Client ID'],
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

    setTaskList(tasks.filter((task) => !!task.title)); // filter out tasks with no title
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

  const clientFullName = clientData
    ? `${clientData.givenName} ${clientData.familyName}`
    : '';

  return (
    <AppContext.Provider value={appSetupData}>
      <Layout title="Home | Next.js + TypeScript Example">
        <TodoList title={`${clientFullName}'s tasks`} tasks={taskLists} />
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
      `https://api.copilot-staging.com/v1/client/${clientId}`,
      copilotGetReq,
    );

    clientData = await clientRes.json();

    // call company endpoint if  no data returned for client
    if (checkDataLength(clientData) <= 0) {
      const clientCompanyRes = await fetch(
        `https://api.copilot-staging.com/v1/company/${clientId}`,
        copilotGetReq,
      );

      clientData = await clientCompanyRes.json();
    }
  } else if (companyId !== undefined) {
    const companyRes = await fetch(
      `https://api.copilot-staging.com/v1/company/${companyId}`,
      copilotGetReq,
    );
    clientData = await companyRes.json();

    // call client endpoint if  no data returned for company
    if (checkDataLength(clientData) <= 0) {
      const clientCompanyRes = await fetch(
        `https://api.copilot-staging.com/v1/client/${companyId}`,
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
    tasks = await loadAppData(appSetupData, clientData);
  } catch (error) {
    console.log('error fetching tasks', error);
  }

  // -----------PROPS-----------------------------
  return {
    props: {
      clientData,
      tasks: JSON.parse(JSON.stringify(tasks)),
      appSetupData,
    },
  };
}
