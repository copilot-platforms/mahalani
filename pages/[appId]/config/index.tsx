import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import AppSetup from '../../../components/AppSetup';
import Layout from '../../../components/Layout';
import { AirtableContext, AirtableContextType } from '../../../utils/airtableContext';
/**
 * This is the app page container where we can render the configuration
 * page or the app itself (which gets some client information).
 * @returns
 */

const AppSetupPage = () => {
  const router = useRouter();
  const { appId } = router.query;
  const [appSetupData, setAppSetupData] = useState<AirtableContextType | null>(
    null,
  );

  useEffect(() => {
    const setupData = window.localStorage.getItem(`setupData.${appId}`);
    if (setupData) {
      setAppSetupData(JSON.parse(setupData));
    }
  }, [appId]);

  const handleSetupComplete = (result: AirtableContextType) => {
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
    <AirtableContext.Provider value={appSetupData}>
      <Layout title="Home | Next.js + TypeScript Example">
        {!appSetupData && <AppSetup onSetupComplete={handleSetupComplete} />}
      </Layout>
    </AirtableContext.Provider>
  );
};

export default AppSetupPage;
