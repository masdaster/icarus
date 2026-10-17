import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import { ShipPanelNavItems } from 'lib/navigation-items'
import Layout from 'components/layout'
import Panel from 'components/panel'
import ShipModulesPanel from 'components/panels/ship/ship-modules-panel'
import ShipModuleInspectorPanel from 'components/panels/ship/ship-module-inspector-panel'

function ShipStatusPageContent () {
  const { connected, active, ready } = useSocket()
  const [ship, setShip] = useState()
  const [selectedModule, setSelectedModule] = useState()
  const [cmdrStatus, setCmdrStatus] = useState()

  // Using state for toggle switches like this allow us to have the UI
  // respond immediately to the input from the user, even if it takes the game
  // API a second or two to callback and update us with the new state.
  // It also means that even if they do go out of sync, the UI in ICARUS
  // Terminal will correctly reflect the in game state after a second or two.
  const [toggleSwitches, setToggleSwitches] = useState({
    lights: false,
    nightVision: false,
    cargoHatch: false,
    landingGear: false,
    hardpoints: false
  })

  useEffect(() => {
    if (!connected) return
    Promise.all([
      sendEvent('getShipStatus'),
      sendEvent('getCmdrStatus')
    ]).then(([ship, cmdrStatus]) => {
      setShip(ship)
      setCmdrStatus(cmdrStatus)
    })
  }, [connected, ready])

  const toggleSwitch = async (switchName) => {

    /*
    // Only toggle switch value if we think it was successful
    const switchToggled = await sendEvent('toggleSwitch', { switchName })

    setToggleSwitches({
      ...toggleSwitches,
      [switchName]: switchToggled ? !toggleSwitches[switchName] : toggleSwitches[switchName]
    })
    */
  }

  useEffect(() => {
    setToggleSwitches({
      lights: cmdrStatus?.flags?.lightsOn ?? false,
      nightVision: cmdrStatus?.flags?.nightVision ?? false,
      cargoHatch: cmdrStatus?.flags?.cargoScoopDeployed ?? false,
      landingGear: cmdrStatus?.flags?.landingGearDown ?? false,
      hardpoints: cmdrStatus?.flags?.hardpointsDeployed ?? false
    })
  }, [cmdrStatus])

  useEffect(() => {
    return eventListener('gameStateChange', async () => {
      setShip(await sendEvent('getShipStatus'))
      setCmdrStatus(await sendEvent('getCmdrStatus'))
    })
  }, [])

  useEffect(() => {
    return eventListener('newLogEntry', async (log) => {
      setShip(await sendEvent('getShipStatus'))
      if (['Location', 'FSDJump'].includes(log.event)) {
        setCmdrStatus(await sendEvent('getCmdrStatus'))
      }
    })
  }, [])

  return (
    <Layout connected={connected} active={active} ready={ready} className='ship-panel'>
      <Panel navigation={ShipPanelNavItems('Modules')} scrollable>
        <ShipModulesPanel
          ship={ship}
          cmdrStatus={cmdrStatus}
          toggleSwitches={toggleSwitches}
          toggleSwitch={toggleSwitch}
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

export default dynamic(() => Promise.resolve(ShipStatusPageContent), {
  ssr: false,
  loading: () => null
})
