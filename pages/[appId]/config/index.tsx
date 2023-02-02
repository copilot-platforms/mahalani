import { getServerSession } from 'next-auth';
import { signOut } from "next-auth/react"

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import AppSetup from '../../../components/AppSetup';
import Layout from '../../../components/Layout';
import { AppContext, AppContextType } from '../../../utils/appContext';
import { authOptions } from '../../api/auth/[...nextauth]';
import { fetchConfig } from '../../api/config/apiConfigUtils';
import { Button } from '@mui/material';


type AppSetupPageProps = {
  appConfig: AppContextType | null;
}

/**
 * This is the app page container where we can render the configuration
 * page or the app itself (which gets some client information).
 * @returns
 */
const AppSetupPage = ({ appConfig }: AppSetupPageProps) => {
  const router = useRouter();
  const { appId } = router.query;
  const [appSetupData, setAppSetupData] = useState<AppContextType | null>(
    appConfig
  );

  const handleSetupComplete = (result: AppContextType) => {
    fetch(`/api/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: appId,
        ...result
      }),
    })
    setAppSetupData(result);
  };

  return (
    <AppContext.Provider value={appSetupData}>
      <Layout title="Home | Next.js + TypeScript Example">
        {!appSetupData && <AppSetup onSetupComplete={handleSetupComplete} />}
        {appSetupData && (
          <div>
            <p>
              Your app is setup, you can embed this in your Copilot dashboard using the following url:
            </p>
            <p>
              {`https://mahalani.vercel.app/${appId}`}
            </p>
            <Button
              onClick={() => signOut()}
              color="primary"
            >
              Log Out
            </Button>
          </div>
        )}
      </Layout>
    </AppContext.Provider>
  );
};

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  // console.log(`config session: ${session}`)

  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }

  const { appId } = context.query
  let appConfig: AppContextType | null = null;
  try {
    appConfig = await fetchConfig(appId);
  } catch (ex) {
    console.error('error fetching user apps', ex)
  }

  return {
    props: {
      appConfig
    },
  };
}

export default AppSetupPage;
