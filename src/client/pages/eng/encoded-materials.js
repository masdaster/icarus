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

  useEffect(() => {
    async function core() {
      setMaterials(await sendEvent('getMaterials'))
    }

    if (!connected) return
    core()
  }, [connected, ready])

  useEffect(() => eventListener('newLogEntry', async (log) => {
    if (['Materials', 'MaterialCollected', 'MaterialDiscarded', 'MaterialTrade', 'EngineerCraft'].includes(log.event)) {
      setMaterials(await sendEvent('getMaterials'))
    }
  }), [])

  return (
    <Layout connected={connected} active={active} ready={ready}>
      <Panel layout='full-width' scrollable navigation={EngineeringPanelNavItems('Encoded Materials')}>
        <h2>Encoded Materials</h2>
        <h3 className='text-primary'>For engineering and synthesis</h3>
        <p className='text-primary'>
          Encoded Materials are used in engineering and synthesis and can be exchanged at Encoded Material Traders
        </p>
        {materials && <Materials materialType='Encoded' materials={materials} />}
      </Panel>
    </Layout>
  )
}
