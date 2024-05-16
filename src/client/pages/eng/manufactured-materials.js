import Layout from 'components/layout'
import Panel from 'components/panel'
import Materials from 'components/panels/eng/materials'
import animateTableEffect from 'lib/animate-table-effect'
import { EngineeringPanelNavItems } from 'lib/navigation-items'
import { eventListener, sendEvent, useSocket } from 'lib/socket'
import { useEffect, useState } from 'react'

export default function EngineeringMaterialsPage() {
  const { connected, active, ready } = useSocket()
  const [materials, setMaterials] = useState()

  useEffect(animateTableEffect)

  useEffect(async () => {
    if (!connected) return
    setMaterials(await sendEvent('getMaterials'))
  }, [connected, ready])

  useEffect(() => eventListener('newLogEntry', async (log) => {
    if (['Materials', 'MaterialCollected', 'MaterialDiscarded', 'MaterialTrade', 'EngineerCraft'].includes(log.event)) {
      setMaterials(await sendEvent('getMaterials'))
    }
  }), [])

  return (
    <Layout connected={connected} active={active} ready={ready}>
      <Panel layout='full-width' scrollable navigation={EngineeringPanelNavItems('Manufactured Materials')}>
        <h2>Manufactured Materials</h2>
        <h3 className='text-primary'>For engineering and synthesis</h3>
        <p className='text-primary'>
          Manufactured Materials are used in engineering and synthesis and can be exchanged at Manufactured Material Traders
        </p>
        {materials && <Materials materialType='Manufactured' materials={materials} />}
      </Panel>
    </Layout>
  )
}
