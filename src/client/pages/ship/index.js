import Layout from 'components/layout'
import Panel from 'components/panel'
import { useSocket } from 'lib/socket'
import Router from 'next/router'

export default function ShipPage() {
  const { connected, active } = useSocket()

  if (typeof window !== 'undefined') Router.push('/ship/status')

  return (
    <Layout connected={connected} active={active}>
      <Panel layout='full-width' scrollable />
    </Layout>
  )
}
