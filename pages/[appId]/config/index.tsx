import { getServerSession } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import AppSetup from '../../../components/AppSetup';
import Layout from '../../../components/Layout';
import DataTable from '../../../components/DataTable';
import { AppContext, AppContextType } from '../../../utils/appContext';
import { authOptions } from '../../api/auth/[...nextauth]';
import { fetchConfig } from '../../api/config/apiConfigUtils';
import { AdminLayout } from '../../../components/AdminLayout';
import { Typography, Box, Button } from '@mui/material';

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

  const handleSetupComplete = (result: AppContextType) => {
    fetch(`/api/config`, {
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
  };

/* Here we need to keep in mind that we name the param clientId or companyId based on default settings. For our test portal
this will work, but for default companies portals we need to change param name to company. Also might be moot point because
at the moment the company will not connect to custom app in the portal.
*/
  const isCompany = false
  
  const setRowsForDefaultChannelType = () => {
    let paramName = 'clientId'
    isCompany ? paramName = 'companyId' : null

    return (assignees || []).map((assignee) => ({
      id: assignee.id,
      clientName: assignee.givenName? `${assignee.givenName} ${assignee.familyName}`: assignee.name,
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
              ? `Your app is setup! You can embed it as a Custom App in Copilot using the following url: https://mahalani.vercel.app/${appId}`
              : ''
          }
        >
          <React.Fragment>
            <AppSetup
              onSetupComplete={handleSetupComplete}
              appSetupData={appSetupData}
              clientsRows={setRowsForDefaultChannelType()}
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
  let assigneeData = null;
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

    const companyRes = await fetch(
      `https://api.copilot-staging.com/v1/company`,
      copilotGetReq
    )

    // get all companies from a portal
    const allCompanies = (await companyRes.json()).data; 

    // create list of valid companies
    const companyData = []
    const companyList = await allCompanies.forEach((company) => {
      company.name.length > 0 ? companyData.push(company): null
    })

    // concatenate assignees and companies
    assigneeData = (await clientRes.json()).data.concat(companyData);
    console.log(`all data: ${assigneeData}`);
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
