import Layout from 'components/layout'
import Panel from 'components/panel'
import ShipModuleInspectorPanel from 'components/panels/ship/ship-module-inspector-panel'
import ShipModulesPanel from 'components/panels/ship/ship-modules-panel'
import { ShipPanelNavItems } from 'lib/navigation-items'
import { eventListener, sendEvent, useSocket } from 'lib/socket'
import { useEffect, useState } from 'react'

export default function ShipStatusPage() {
  const { connected, active, ready } = useSocket()
  const [ship, setShip] = useState()
  const [selectedModule, setSelectedModule] = useState()
  const [cmdrStatus, setCmdrStatus] = useState()

  useEffect(() => {
    async function core() {
      setShip(await sendEvent('getShipStatus'))
      setCmdrStatus(await sendEvent('getCmdrStatus'))
    }

    if (!connected) return
    core()
  }, [connected, ready])

  useEffect(() => eventListener('gameStateChange', async () => {
    setShip(await sendEvent('getShipStatus'))
    setCmdrStatus(await sendEvent('getCmdrStatus'))
  }), [])

  useEffect(() => eventListener('newLogEntry', async (log) => {
    setShip(await sendEvent('getShipStatus'))
    if (['Location', 'FSDJump'].includes(log.event)) {
      setCmdrStatus(await sendEvent('getCmdrStatus'))
    }
  }), [])

  return (
    <Layout connected={connected} active={active} ready={ready} className='ship-panel'>
      <Panel navigation={ShipPanelNavItems('Modules')} scrollable>
        <ShipModulesPanel
          ship={ship}
          cmdrStatus={cmdrStatus}
          selectedModule={selectedModule}
          setSelectedModule={setSelectedModule}
        />
      </Panel>
      <Panel>
        <ShipModuleInspectorPanel module={selectedModule} setSelectedModule={setSelectedModule} />
      </Panel>
    </Layout>
  )
}
