import { getServerSession } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import AppSetup from '../../../components/AppSetup';
import Layout from '../../../components/Layout';
import { AppContext, AppContextType } from '../../../utils/appContext';
import { authOptions } from '../../api/auth/[...nextauth]';
import { fetchConfig } from '../../api/config/apiConfigUtils';
import { AdminLayout } from '../../../components/AdminLayout';
import { Box, Button } from '@mui/material';
import { AdvancedSetup } from '../../../components/AdvancedSetup';
import { loadAssignees } from '../../api/config';

type AppSetupPageProps = {
  appConfig: AppContextType | null;
  assignees: any[] | null;
};

/**
 * This is the app page container where we can render the configuration
 * page or the app itself (which gets some client information).
 * @returns
 */
const AppSetupPage = ({ appConfig, assignees }: AppSetupPageProps) => {
  const router = useRouter();
  const { appId } = router.query;
  const [appSetupData, setAppSetupData] = useState<AppContextType | null>(
    appConfig,
  );
  const [assigneeList, setAssigneeList] = useState<any[]>(assignees || []);

  const handleSaveAppConfig = async (result: AppContextType) => {
    // when app setup is complete load clients.
    try {
      await fetch(`/api/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: appId,
          ...result,
        }),
      });
      setAppSetupData(result);

      const fetchConfigDataResponse = await fetch(`/api/config?appId=${appId}`);
      const fetchConfigData = await fetchConfigDataResponse.json();
      setAssigneeList(fetchConfigData);
    } catch (ex) {
      console.error('error fetching app config info', ex);
    }
  };

  /* Changes the param name in the URLs displayed after app setup is complete based on the default channel type
  */
  const defaultChannel = appSetupData ? appSetupData.defaultChannelType : undefined // set company or client based on user input
  console.log(`app setup data: ${JSON.stringify(appSetupData)}`)

  const setRowsForDefaultChannelType = () => {
    let paramName = 'clientId'
    defaultChannel === 'companies' ? paramName = 'companyId' : null

    return (assigneeList || []).map((assignee) => ({
      id: assignee.id,
      clientName: assignee.givenName ? `${assignee.givenName} ${assignee.familyName}` : assignee.name, // if assignee is client, return full name
      url: `https://mahalani.vercel.app/${appId}?${paramName}=${assignee.id}`,
    }));
  }

  return (
    <AppContext.Provider value={appSetupData}>
      <Layout title="App Config">
        <AdminLayout
          showTitle={false}
          description={
            appSetupData
              ? 'Your app is setup! You can embed it as a Custom App in Copilot using the following url:'
              : ''
          }
          link={
            appSetupData
              ? `https://mahalani.vercel.app/${appId}`
              : ''
          }
        >
          <React.Fragment>
            <AppSetup
              onSetupComplete={handleSaveAppConfig}
              appSetupData={appSetupData}
              clientsRows={setRowsForDefaultChannelType()}
            />
          </React.Fragment>
          {appSetupData && (
            <AdvancedSetup
              appSetupData={appSetupData}
              onConfigSave={handleSaveAppConfig}
            />
          )}
          <React.Fragment>
            <Button
              onClick={() => signOut()}
              color="primary"
            >
              Log Out
            </Button>
          </React.Fragment>
        </AdminLayout>
      </Layout>
    </AppContext.Provider>
  );
};

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const { appId } = context.query;
  let appConfig: AppContextType | null = null;
  let assigneeData = null;
  try {
    appConfig = await fetchConfig(appId);
    assigneeData = await loadAssignees(appConfig)
  } catch (ex) {
    console.error('error fetching user apps', ex);
  }

  return {
    props: {
      appConfig,
      assignees: assigneeData,
    },
  };
}

export default AppSetupPage;
