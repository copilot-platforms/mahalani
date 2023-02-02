import router from 'next/router'
import { nanoid } from 'nanoid'
import { useSession, signIn } from "next-auth/react"  

import Layout from '../components/Layout'
import { Button } from '@mui/material';
import { useEffect } from 'react';
import { getServerSession } from 'next-auth';
import { fetchUserApps } from './api/config/apiConfigUtils';
import { authOptions } from './api/auth/[...nextauth]';

const IndexPage = () => {
  const { data: session } = useSession();

  /**
   * when there is a session object with a valid email
   * we know the user has logged in so we can create
   * a appId, with that appId redirect the user to the config
   * page where they can submit their airtable api key and other info
   */
  useEffect(() => {
    if (!session) {
      return;
    }

    if (session.user.email) {
      // create app id
      // redirect to config page
      // window.location.href = '/config';
      const appId = nanoid(10);
      router.push(`/${appId}/config`);
    }
  }, [session]);

  return (
    <Layout>
      <h1>Client Task Management</h1>
      <p>
        This is an app for client task management that can be embedded in your Copilot dashboard.
      </p>
      {!session && (
        <Button
          onClick={() => signIn()}
          color="primary"
        >
          Get Started
        </Button>
      )}
    </Layout>
  );
}

export async function getServerSideProps({ req, res }) {
  const session = await getServerSession(req, res, authOptions);

  try {
    const userEmail = session.user.email
    const userAppIds = await fetchUserApps(userEmail);
    console.log('userApps', userAppIds);

    if (userAppIds.length > 0) {
      const appId = userAppIds[0];
      return {
        redirect: {
          destination: `/${appId}/config`,
          permanent: false,
        },
      };
    }
  } catch (ex) {
    console.error('error fetching user apps', ex)
  }

  return {
    props: {}, // will be passed to the page component as props
  };
}

export default IndexPage
