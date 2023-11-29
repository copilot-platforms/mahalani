import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Training as TrainingIframe } from '../../../components/Training/Training';
import { PageLoader } from '../../../components/PageLoader';
import { EmptyPage } from '../../../components/EmptyPage';

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
    if (!appId) return;
    loadClientInfo();
  }, [clientId, appId]);

  const clientCollection =
    clientInfo?.customFields?.collection?.length > 0
      ? clientInfo.customFields?.collection[0]
      : '';

  function handleRenderIframe() {
    const defaultEmptyPage = (
      <EmptyPage
        title="Capital One"
        description="Front Desk Training is displayed to the client based on their Premier or Lifestyle Collection tag."
      />
    );

    if (!clientCollection) {
      return defaultEmptyPage;
    }

    switch (clientCollection) {
      case LIFESTYLE_COLLECTION:
        return <TrainingIframe trainingType="lc" />;
      case PREMIER_COLLECTION:
        return <TrainingIframe trainingType="pc" />;
      default:
        return defaultEmptyPage;
    }
  }

  if (loading) {
    return <PageLoader />;
  }

  return <div>{handleRenderIframe()}</div>;
};

export default Training;
