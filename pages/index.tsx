import router from 'next/router'
import { nanoid } from 'nanoid'
import { useSession, signIn } from "next-auth/react"  
import Image from 'next/image'
import CopilotLogo from '../assets/Copilot_Icon_Circle.png';
import Layout from '../components/Layout'
import { Button, Grid, Box, Typography } from '@mui/material';
import { useEffect } from 'react';
import { getServerSession } from 'next-auth';
import { fetchUserApps } from './api/config/apiConfigUtils';
import { authOptions } from './api/auth/[...nextauth]';

const IndexPage = () => {
  const { data: session } = useSession();

  return (
    <Layout>
      <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
        <Image
            src={CopilotLogo}
            alt="Copilot logo"
            width="100"
        />
        <Box mt={4}>
          <Typography variant="h2">Client Task Management</Typography>
        </Box>
        <Box mt={2}>
          <Typography variant="h6">
            This is an app for client task management that can be embedded in your Copilot dashboard.
          </Typography>
        </Box>
        <Box mt={8}>
          {!session && (
            <Button
              onClick={() => signIn()}
              color="primary"
              variant="contained"
            >
              Get Started
            </Button>
          )}
        </Box>
      </Box>
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
