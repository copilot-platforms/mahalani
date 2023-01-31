import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import AppSetup from '../components/AppSetup';
import Layout from '../components/Layout';
import { getAirtableClient, getAllRecords } from '../utils/airtableUtils';
import TodoList from '../components/TodoList';
import { ClientDataType, Task } from '../components/types';
import { AirtableContext, AirtableContextType } from '../utils/airtableContext';

type AppPagePros = {
  clientData: ClientDataType;
};

const DATA_REFRESH_TIMEOUT = 3000;

/**
 * This is the app page container where we can render the configuration
 * page or the app itself (which gets some client information).
 * @returns
 */

const AppPage = ({ clientData }: AppPagePros) => {
  const searchId = clientData?.id ?? '';
  const router = useRouter();
  const { appId } = router.query;
  const [appSetupData, setAppSetupData] = useState<AirtableContextType | null>(
    null,
  );
  const [tasks, setTasks] = useState<any>([]);

  const loadAppData = async () => {
    const baseConstructor = getAirtableClient(
      appSetupData.apiKey,
      appSetupData.baseId,
    );
    const tableClient = baseConstructor(appSetupData.tableId);

    const airtableRecords = await getAllRecords(
      tableClient,
      `{Client ID} = "${searchId}"`,
    );

    console.info('airtableRecords', airtableRecords);

    // format the data coming from airtable to fit the task data struct
    const tasksList: Array<Task> = airtableRecords.map((record) => ({
      id: record.id,
      title: record.fields.Name,
      status: record.fields.Status,
      assignee: clientData,
    }));

    setTasks(tasksList);
  };

  useEffect(() => {
    const setupData = window.localStorage.getItem(`setupData.${appId}`);
    if (setupData) {
      setAppSetupData(JSON.parse(setupData));
    }
  }, [appId]);

  useEffect(() => {
    if (!appSetupData) {
      return;
    }

    const interval = setInterval(() => {
      loadAppData();
    }, DATA_REFRESH_TIMEOUT);

    // when the component unmounts, clear the interval
    return () => {
      clearInterval(interval);
    };
  }, [appSetupData]);

  const handleSetupComplete = (result: AirtableContextType) => {
    window.localStorage.setItem(`setupData.${appId}`, JSON.stringify(result));
    setAppSetupData(result);
  };

  return (
    <AirtableContext.Provider value={appSetupData}>
      <Layout title="Home | Next.js + TypeScript Example">
        {appSetupData && <TodoList tasks={tasks} />}
        {!appSetupData && <AppSetup onSetupComplete={handleSetupComplete} />}
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

  // -----------PROPS-----------------------------
  return {
    props: {
      clientData,
    },
  };
}
