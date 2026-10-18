import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from 'components/layout'
import Panel from 'components/panel'
import { useSocket } from 'lib/socket'

export default function NavPage () {
  const { connected, active } = useSocket()
  const router = useRouter()

  // Client side redirect to default map view - use shallow routing to preserve fullscreen
  useEffect(() => {
    if (typeof window !== 'undefined' && connected) {
      router.push({ pathname: '/nav/map' }, undefined, { shallow: true })
    }
  }, [connected])

  return (
    <Layout connected={connected} active={active}>
      <Panel layout='full-width' scrollable />
    </Layout>
  )
}
