import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { PageLoader } from '../../../components/PageLoader';
import { LIFESTYLE_COLLECTION, PREMIER_COLLECTION, PageQuery } from '../trainings';
import { CollectionForm } from '../../../components/Form';

const Forms = () => {
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
        return <CollectionForm formType="lc" />;
      } else if (clientCollection === PREMIER_COLLECTION) {
        return <CollectionForm formType="pc" />;
      } else {
        return <h1>No forms are currently assigned.</h1>;
      }
    } else {
      return <h1>No forms are currently assigned.</h1>;
    }
  }

  if(loading) {
    return <PageLoader/>
  }

  return <div>{handleRenderIframe()}</div>;
};

export default Forms;
