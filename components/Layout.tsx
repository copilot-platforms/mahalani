import React, { ReactNode } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { createTheme, ThemeProvider } from '@mui/material';

type Props = {
  children?: ReactNode
  title?: string
}

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

const Layout = ({ children, title = 'This is the default title' }: Props) => (
    <ThemeProvider theme={theme}>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <header>
        <nav>
          <Link href="/">Home</Link> | <Link href="/about">About</Link> |{' '}
          <Link href="/users">Users List</Link> |{' '}
          <a href="/api/users">Users API</a>
        </nav>
      </header>
      {children}
      <footer>
        <hr />
        <span>I'm here to stay (Footer)</span>
      </footer>
  </ThemeProvider>
)

export default Layout
