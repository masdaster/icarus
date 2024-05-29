import Layout from 'components/layout'
import Panel from 'components/panel'
import ShipModuleInspectorPanel from 'components/panels/ship/ship-module-inspector-panel'
import ShipStatusPanel from 'components/panels/ship/ship-status-panel'
import { ShipPanelNavItems } from 'lib/navigation-items'
import { eventListener, sendEvent, useSocket } from 'lib/socket'
import { useEffect, useState } from 'react'

export default function ShipStatusPage() {
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
    hardpoints: false,
    flightAssist: false,
    silentRunning: false
  })

  useEffect(() => {
    async function core() {
      setShip(await sendEvent('getShipStatus'))
      setCmdrStatus(await sendEvent('getCmdrStatus'))
    }

    if (!connected) return
    core()
  }, [connected, ready])

  const toggleSwitch = async (switchName) => {
    // Only toggle switch value if we think it was successful
    const switchToggled = (['lights', 'nightVision'].includes(switchName) || cmdrStatus?.flags?.supercruise === false)
      && await sendEvent('toggleSwitch', { switchName })

    setToggleSwitches({
      ...toggleSwitches,
      [switchName]: switchToggled ? !toggleSwitches[switchName] : toggleSwitches[switchName]
    })
  }

  useEffect(() => {
    setToggleSwitches({
      lights: cmdrStatus?.flags?.lightsOn ?? false,
      nightVision: cmdrStatus?.flags?.nightVision ?? false,
      cargoHatch: cmdrStatus?.flags?.cargoScoopDeployed ?? false,
      landingGear: cmdrStatus?.flags?.landingGearDown ?? false,
      hardpoints: cmdrStatus?.flags?.hardpointsDeployed ?? false,
      flightAssist: cmdrStatus?.flags?.flightAssistOff === false ?? true,
      silentRunning: cmdrStatus?.flags?.silentRunning ?? false
    })
  }, [cmdrStatus])

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
      <Panel navigation={ShipPanelNavItems('Status')} scrollable>
        <ShipStatusPanel
          ship={ship}
          cmdrStatus={cmdrStatus}
          toggleSwitches={toggleSwitches}
          toggleSwitch={toggleSwitch}
        />
      </Panel>
      <Panel>
        <ShipModuleInspectorPanel module={selectedModule} setSelectedModule={setSelectedModule} />
      </Panel>
    </Layout>
  )
}
