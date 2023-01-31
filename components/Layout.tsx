import React, { ReactNode } from 'react';
import Head from 'next/head';
import { createTheme, ThemeProvider, CssBaseline, Box } from '@mui/material';

type Props = {
  children?: ReactNode;
  title?: string;
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
  },
});

const Layout = ({ children, title = 'Client Todo List' }: Props) => (
  <ThemeProvider theme={theme}>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <CssBaseline />
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
      }}
    >
      {children}
    </Box>
  </ThemeProvider>
);

export default Layout;
