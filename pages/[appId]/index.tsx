import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import { AssigneeDataType, Task } from '../../components/types';
import { AppContext, ClientAppConfig } from '../../utils/appContext';
import { useRouter } from 'next/router';
import { PageLoader } from '../../components/PageLoader';
import dynamic from 'next/dynamic';

const TodoList = dynamic(() => import('../../components/TodoList'));

export type DBType = 'google_sheet' | 'airtable';
type AppPagePros = {
  clientData: AssigneeDataType | null;
  tasks: Array<Task>;
  appConfig: ClientAppConfig;
  dbType: DBType;
};

const AIRTABLE_DATA_REFRESH_TIMEOUT = 3000;
const GOOGLESHEET_DATA_REFRESH_TIMEOUT = 6000;

export const formatData = (
  clientData: AssigneeDataType,
  airtableRecords: any,
) => {
  const formattedData: Array<Task> = airtableRecords?.map((record, rank) => ({
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

const AppPage = ({}: AppPagePros) => {
  const [initialData, setInitialData] = useState<AppPagePros>({
    clientData: null,
    appConfig: {
      controls: {
        allowAddingItems: true,
        allowingUpdatingDetails: false,
        allowUpdatingStatus: false,
      },
      defaultChannelType: 'client',
    },
    dbType: 'airtable',
    tasks: [],
  });
  const [loading, setLoading] = useState(true);
  const { clientData, appConfig, dbType } = initialData;

  const router = useRouter();
  const { appId, clientId, companyId } = router.query;
  const [taskLists, setTaskList] = useState<Task[]>([]);
  const pendingRequestIds = useRef([]);
  const taskListRequestController = useRef(new AbortController());

  const refreshAppData = async (data: AssigneeDataType) => {
    try {
      // check if there is any pending request
      // if we have pending requests then don't refresh the app data
      if (pendingRequestIds.current.length) {
        return;
      }

      // fetching latest task
      const getAppDataResult = await fetch(
        `/api/data?appId=${appId}&assigneeId=${data?.id}`,
        {
          method: 'GET',
          signal: taskListRequestController.current.signal,
        },
      );
      console.info('getAppDataResult', getAppDataResult);
      const appData = await getAppDataResult.json();
      const tasks = formatData(data, appData);

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

  const loadInitialData = async () => {
    console.time('Client initial data load');
    setLoading(true);
    const query = new URLSearchParams({
      appId: appId as string,
      clientId: clientId as string,
      companyId: companyId as string,
    });
    try {
      const res = await fetch('/api/initial-data?' + query, {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
        },
      });
      const data = await res.json();
      await refreshAppData(data.clientData);
      setInitialData(data);
    } catch (error) {
      console.error('Error fetching initial data', error);
    } finally {
      setLoading(false);
    }
    console.timeEnd('Client initial data load');
  };

  useEffect(() => {
    if (!appId) return;
    loadInitialData();
  }, [appId]);

  useEffect(() => {
    if (!clientData || !appId) {
      return;
    }

    const timeout =
      dbType === 'google_sheet'
        ? GOOGLESHEET_DATA_REFRESH_TIMEOUT
        : AIRTABLE_DATA_REFRESH_TIMEOUT;

    const interval = setInterval(() => {
      refreshAppData(clientData);
    }, timeout);

    // when the component unmounts, clear the interval
    return () => {
      clearInterval(interval);
    };
  }, [appId, clientData, dbType]);

  return (
    <AppContext.Provider value={appConfig}>
      <Layout title="Custom App - Task Management">
        {loading ? <PageLoader /> : null}
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
