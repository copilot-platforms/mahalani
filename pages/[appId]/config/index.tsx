import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import AppSetup from '../../../components/AppSetup';
import Layout from '../../../components/Layout';
import { AppContext, AppContextType } from '../../../utils/appContext';
/**
 * This is the app page container where we can render the configuration
 * page or the app itself (which gets some client information).
 * @returns
 */

const AppSetupPage = () => {
  const router = useRouter();
  const { appId } = router.query;
  const [appSetupData, setAppSetupData] = useState<AppContextType | null>(
    null,
  );

  useEffect(() => {
    const setupData = window.localStorage.getItem(`setupData.${appId}`);
    if (setupData) {
      setAppSetupData(JSON.parse(setupData));
    }
  }, [appId]);

  const handleSetupComplete = (result: AppContextType) => {
    window.localStorage.setItem(`setupData.${appId}`, JSON.stringify(result));
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
      </Layout>
    </AppContext.Provider>
  );
};

export default AppSetupPage;
