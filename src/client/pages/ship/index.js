import { useEffect } from 'react'
import Layout from 'components/layout'
import Panel from 'components/panel'
import { useSocket } from 'lib/socket'

export default function ShipPage () {
  const { connected, active } = useSocket()

  useEffect(() => {
    if (typeof window !== 'undefined') window.location.href = '/ship/status'
  }, [])

  return (
    <Layout connected={connected} active={active}>
      <Panel layout='full-width' scrollable />
    </Layout>
  )
}
