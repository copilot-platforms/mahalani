import React, { ReactNode } from 'react';
import Head from 'next/head';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title = 'This is the default title' }: Props) => (
  <div>{children}</div>
);

export default Layout;
