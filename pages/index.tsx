import { Container, Box } from '@mui/material'
import Layout from '../components/Layout'

const IndexPage = () => (
  <Layout>
    <Container sx={{ height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Box>
          <h1>Copilot - Client Todo List</h1>
        </Box>
        <Box>
        <p>
          This is the Copilot - Client Todo List custom app. It's a simple app that allows you to create a list of tasks for a client in Airtable and
          then create a custom app in your Copilot dashboard to display the tasks for that client. Get started below by signing in with Google. You will
          be asked for your Airtable API key (which you can get from Airtable) and Copilot API Key which you can get from your Copilot dashboard.
        </p>
        </Box>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          Sign in with Google
        </Box>
      </Box>
    </Container>
  </Layout>
)

export default IndexPage
