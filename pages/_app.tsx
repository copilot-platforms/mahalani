import * as React from 'react';
import { SessionProvider } from "next-auth/react"
import type { AppProps } from "next/app"

export default function App({ Component, pageProps }: AppProps): any {
  return (
    <SessionProvider
      session={pageProps.session}
    >
      <Component {...pageProps} />
    </SessionProvider>
  )
}