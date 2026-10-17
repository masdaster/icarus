import { useEffect } from 'react'
import Layout from 'components/layout'
import Panel from 'components/panel'
import { useSocket } from 'lib/socket'

export default function IndexPage () {
  const { connected, active } = useSocket()

  // Client side redirect - wait for socket to be ready
  useEffect(() => {
    console.log('[INDEX] useEffect triggered, connected:', connected)
    try {
      if (connected) {
        console.log('[INDEX] Connected! Redirecting to /nav/map')
        window.location.href = '/nav/map'
        console.log('[INDEX] Redirect initiated')
      } else {
        console.log('[INDEX] Not connected yet, waiting...')
      }
    } catch (error) {
      console.error('[INDEX] ERROR in useEffect:', error)
      if (typeof window !== 'undefined') window.alert('INDEX ERROR: ' + error.message + '\n' + error.stack)
    }
  }, [connected])

  console.log('[INDEX] Rendering, connected:', connected, 'active:', active)

  return (
    <Layout connected={connected} active={active}>
      <Panel layout='full-width' scrollable />
    </Layout>
  )
}
