import React, { ReactNode } from 'react';
import Head from 'next/head';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

type Props = {
  children?: ReactNode;
  title?: string;
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#09aa6c',
    },
    secondary: {
      main: '#19857b',
    },
  },
});

const Layout = ({ children, title = 'This is the default title' }: Props) => (
  <ThemeProvider theme={theme}>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <CssBaseline />
    {children}
  </ThemeProvider>
);

export default Layout;
