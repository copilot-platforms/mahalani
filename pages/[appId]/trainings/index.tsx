import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  Training as TrainingIframe,
} from '../../../components/Training/Training';
import { PageLoader } from '../../../components/PageLoader';

export type PageQuery = {
  appId: string;
  clientId: string;
  companyId: string;
};

export const LIFESTYLE_COLLECTION = 'lifestyleCollection';
export const PREMIER_COLLECTION = 'premierCollection';

const Training = () => {
  const [loading, setLoading] = useState(true);
  const [clientInfo, setClientInfo] = useState(null);
  const router = useRouter();
  const { appId, clientId, companyId } = router.query as PageQuery;

  const loadClientInfo = async () => {
    setLoading(true);
    const query = new URLSearchParams({
      appId: appId,
      clientId: clientId,
      companyId: companyId,
    });
    try {
      const res = await fetch('/api/client-info?' + query, {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
        },
      });
      const data = await res.json();
      if (data) {
        setClientInfo(data);
      }
    } catch (error) {
      console.error('Error fetching client info', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!appId || !clientId) return;
    loadClientInfo();
  }, [clientId, appId]);

  const clientCollection =
    clientInfo?.customFields?.collection?.length > 0
      ? clientInfo.customFields?.collection[0]
      : '';

  function handleRenderIframe() {
    if (clientCollection) {
      if (clientCollection === LIFESTYLE_COLLECTION) {
        return <TrainingIframe trainingType="lc" />;
      } else if (clientCollection === PREMIER_COLLECTION) {
        return <TrainingIframe trainingType="pc" />;
      } else {
        return <h1>No trainings are currently assigned.</h1>;
      }
    } else {
      console.log('client not tagged');
      return <h1>No trainings are currently assigned.</h1>;
    }
  }

  if(loading) {
    return <PageLoader/>
  }

  return <div>{handleRenderIframe()}</div>;
};

export default Training;
