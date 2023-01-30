import { useRouter } from 'next/router'
import { useState, useEffect } from 'react';
import AppSetup from '../components/AppSetup';
import Layout from '../components/Layout'

type SetupCompleteResult = {
    apiKey: string;
    baseId: string;
    tableId: string;
}

/**
 * This is the app page container where we can render the configuration
 * page or the app itself (which gets some client information).
 * @returns 
 */
const AppPage = () => {
    const router = useRouter()
    const { appId } = router.query
    const [appSetupData, setAppSetupData] = useState<SetupCompleteResult | null>(null);

    useEffect(() => {
        const setupData = window.localStorage.getItem(`setupData.${appId}`);
        if (setupData) {
            setAppSetupData(JSON.parse(setupData));
        }
    }, [appId]);

    const handleSetupComplete = (result: SetupCompleteResult) => {
        window.localStorage.setItem(`setupData.${appId}`, JSON.stringify(result))
        setAppSetupData(result);
    }
    
    return (
        <Layout title="Home | Next.js + TypeScript Example">
            {appSetupData && <div>This app is setup</div>}
            {!appSetupData && <AppSetup onSetupComplete={handleSetupComplete} /> }
        </Layout>
    );
}

export default AppPage
