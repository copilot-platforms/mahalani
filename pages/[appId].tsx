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

/* 
-------------SERVER-------------------
*/

export async function getServerSideProps(context) {

  // HEADERS
  const copilotGetReq = {
    // method: 'GET',
    headers: {
      "X-API-KEY": process.env.COPILOT_API_KEY,
      "Content-Type": "application/json"
    }
  }

  let clientId
  let companyId
  let searchId

  // -------------PORTAL API-------------------

  // SET PORTAL CLIENT OR COMPANY ID FROM PARAMS

  clientId = context.query.clientId
  console.log(`clientId: ${clientId}`)

  companyId = context.query.companyId
  console.log(`companyId: ${companyId}`)

  console.log(`copilot key: ${process.env.COPILOT_API_KEY}`)

  if (clientId !== undefined) {
    const clientRes = await fetch(`https://api.copilot-staging.com/v1/client/${clientId}`, copilotGetReq)
    
    const clientData = await clientRes.json()
    console.log(`CLIENT DATA: ${clientData}`)
    searchId = clientData.id
  } else if (companyId !== undefined) {
    const companyRes = await fetch(`https://api.copilot-staging.com/v1/company/${companyId}`, copilotGetReq)
    // const companyData = await companyRes.json()
    // searchId = companyData.name
  } else {
    console.log('No ID Found')
  }

  console.log(`searchId: ${searchId}`)


  // -------------AIRTABLE API -------------------



  // -----------PROPS-----------------------------
  return {
    props: {
      // searchId: searchId,
    }
  }
}

