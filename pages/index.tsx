import router from 'next/router'
import { nanoid } from 'nanoid'
import { useSession, signIn } from "next-auth/react"  
import Image from 'next/image'
import CopilotLogo from '../assets/Copilot_Icon_Circle.png';
import Layout from '../components/Layout'
import { Button } from '@mui/material';
import React from 'react';
import { getServerSession } from 'next-auth';
import { fetchUserApps } from './api/config/apiConfigUtils';
import { authOptions } from './api/auth/[...nextauth]';
import { AdminLayout } from '../components/AdminLayout';
import { Box } from '@mui/system';

const IndexPage = () => {
  const { data: session } = useSession();

  return (
    <Layout>
      <AdminLayout
        description="This is an app for client task management that can be embedded in your Copilot dashboard."
      >
        {!session && (
          <React.Fragment>
            <Button
              onClick={() => signIn("cognito")}
              color="primary"
              variant="contained"
            >
              Sign in with Copilot
            </Button>
            <Box mt={1}>
              <Button
                onClick={() => signIn("google")}
                color="primary"
              >
                Sign in with Google
              </Button>
            </Box>
          </React.Fragment>
        )}
      </AdminLayout>
    </Layout>
  );
}

export async function getServerSideProps({ req, res }) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return {
      props: {}, // will be passed to the page component as props
    }
  }

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

  // no user app was found so we should create a new app id for the user and redirect them to the config page
  const appId = nanoid(10);
  return {
    redirect: {
      destination: `/${appId}/config`,
      permanent: false,
    },
  };
}

export default IndexPage
