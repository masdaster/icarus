import { useEffect } from 'react'
import Layout from 'components/layout'
import Panel from 'components/panel'
import { useSocket } from 'lib/socket'

export default function NavPage () {
  const { connected, active } = useSocket()

  // Client side redirect to default map view
  useEffect(() => {
    if (typeof window !== 'undefined') window.location.href = '/nav/map'
  }, [])

  return (
    <Layout connected={connected} active={active}>
      <Panel layout='full-width' scrollable />
    </Layout>
  )
}
