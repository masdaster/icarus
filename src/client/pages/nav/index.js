import Layout from 'components/layout'
import Panel from 'components/panel'
import { useSocket } from 'lib/socket'
import Router from 'next/router'

export default function NavPage() {
  const { connected, active } = useSocket()

  // Client side redirect to default map view
  if (typeof window !== 'undefined') Router.push('/nav/map')

  return (
    <Layout connected={connected} active={active}>
      <Panel layout='full-width' scrollable />
    </Layout>
  )
}
