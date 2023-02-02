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

type AppSetupPageProps = {
  appConfig: AppContextType | null;
  clients: any[] | null;
};

/**
 * This is the app page container where we can render the configuration
 * page or the app itself (which gets some client information).
 * @returns
 */
const AppSetupPage = ({ appConfig, clients }: AppSetupPageProps) => {
  const router = useRouter();
  const { appId } = router.query;
  const [appSetupData, setAppSetupData] = useState<AppContextType | null>(
    appConfig,
  );
  const [clientList, setClientList] = useState<any[]>(clients || []);

  const handleSetupComplete = async (result: AppContextType) => {
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
      setClientList(fetchConfigData);
    } catch (ex) {
      console.error('error fetching app config info', ex);
    }
  };

  const myRows = clientList.map((client) => ({
    id: client.id,
    clientName: `${client.givenName} ${client.familyName}`,
    url: `https://mahalani.vercel.app/${appId}?clientId=${client.id}`,
  }));

  return (
    <AppContext.Provider value={appSetupData}>
      <Layout title="App Config">
        <AdminLayout
          showTitle={false}
          description={
            appSetupData
              ? `Your app is setup! You can embed it as a Custom App in Copilot using the following url: https://mahalani.vercel.app/${appId}`
              : ''
          }
        >
          <React.Fragment>
            <AppSetup
              onSetupComplete={handleSetupComplete}
              appSetupData={appSetupData}
              clientsRows={myRows}
            />
          </React.Fragment>
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
  let clientData = null;
  try {
    appConfig = await fetchConfig(appId);

    const copilotGetReq = {
      headers: {
        'X-API-KEY': appConfig.copilotApiKey,
        'Content-Type': 'application/json',
      },
    };

    const clientRes = await fetch(
      `https://api.copilot-staging.com/v1/client`,
      copilotGetReq,
    );

    clientData = (await clientRes.json()).data;
    console.log(clientData);
  } catch (ex) {
    console.error('error fetching user apps', ex);
  }

  return {
    props: {
      appConfig,
      clients: clientData,
    },
  };
}

export default AppSetupPage;
