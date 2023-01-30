import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'

const AppPage = () => {
    const router = useRouter()
  const { appId } = router.query
    
    return (
  <Layout title="Home | Next.js + TypeScript Example">
    <h1>Hello App: {appId} 👋</h1>
    <p>
      <Link href="/about">About</Link>
    </p>
  </Layout>
);
}

export default AppPage
