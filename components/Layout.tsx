import React, { ReactNode } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { createTheme, ThemeProvider } from '@mui/material';
import { Inter } from '@next/font/google';
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

const inter = Inter({ subsets: ['latin'] });

const Layout = ({ children, title = 'This is the default title' }: Props) => (
  <ThemeProvider theme={theme}>
    <div className={inter.className}>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      {children}
    </div>
  </ThemeProvider>
);

export default Layout;
