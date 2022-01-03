import { useState, useEffect } from 'react'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import { EngineeringPanelNavItems } from 'lib/navigation-items'
import Layout from 'components/layout'
import Panel from 'components/panel'
import Materials from 'components/panels/engineering/materials'

export default function EngineeringMaterialsPage () {
  const { connected, active, ready } = useSocket()
  const [materials, setMaterials] = useState()

  useEffect(async () => {
    if (!connected) return
    setMaterials(await sendEvent('getMaterials'))
  }, [connected, ready])

  useEffect(() => eventListener('newLogEntry', async (log) => {
    if (['Materials', 'MaterialCollected', 'MaterialDiscarded'].includes(log.event)) {
      setMaterials(await sendEvent('getMaterials'))
    }
  }), [])

  return (
    <Layout connected={connected} active={active} ready={ready}>
      <Panel layout='full-width' scrollable navigation={EngineeringPanelNavItems('Materials')}>
        <h1 className='text-info'>Raw Materials</h1>
        <h2 className='text-primary'>Materials for engineering and synthesis</h2>
        <hr style={{ margin: '1rem 0' }} />
        {materials && <Materials materialType='Raw' materials={materials.filter(item => item.type === 'Raw')} />}
      </Panel>
    </Layout>
  )
}