import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from 'components/layout'
import Panel from 'components/panel'
import { useSocket } from 'lib/socket'

export default function EngineeringPage () {
  const { connected, active } = useSocket()
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined' && connected) {
      router.push({ pathname: '/eng/blueprints' }, undefined, { shallow: true })
    }
  }, [connected])

  return (
    <Layout connected={connected} active={active}>
      <Panel layout='full-width' scrollable />
    </Layout>
  )
}
