import { useState, useEffect } from 'react'
import { useSocket, sendEvent, eventListener } from 'lib/socket'
import { ShipPanelNavItems } from 'lib/navigation-items'
import Layout from 'components/layout'
import Panel from 'components/panel'
import CopyOnClick from 'components/copy-on-click'

export default function ShipInventoryPage () {
  const { connected, active, ready } = useSocket()
  const [inventory, setInventory] = useState()
  const [componentReady, setComponentReady] = useState(false)

  useEffect(async () => {
    if (!connected) return
    setInventory(await sendEvent('getInventory'))
    setComponentReady(true)
  }, [connected, ready])

  useEffect(() => eventListener('gameStateChange', async () => {
    setInventory(await sendEvent('getInventory'))
  }), [])

  useEffect(() => eventListener('newLogEntry', async () => {
    setInventory(await sendEvent('getInventory'))
  }), [])

  return (
    <Layout connected={connected} active={active} ready={ready} loader={!componentReady}>
      <Panel layout='full-width' scrollable navigation={ShipPanelNavItems('Inventory')}>
        <>
          <h2>Inventory</h2>
          <h3 className='text-primary'>
            Ship Locker
          </h3>
          <hr style={{ margin: '.5rem 0 0 0' }} />
          {inventory &&
            <>
              <LockerItems heading='Consumables' items={inventory.filter(item => item.type === 'Consumable')} />
              <LockerItems heading='Goods' items={inventory.filter(item => item.type === 'Goods')} />
              <LockerItems heading='Components' items={inventory.filter(item => item.type === 'Component')} />
              <LockerItems heading='Data' items={inventory.filter(item => item.type === 'Data')} />
            </>}
        </>
      </Panel>
    </Layout>
  )
}

function LockerItems ({ heading, items }) {
  return (
    <>
      <div className='tabs'>
        <h4 className='tab' style={{ marginTop: '1rem' }}>
          {heading}
        </h4>
      </div>
      <table className='table--animated fx-fade-in'>
        <thead>
          <tr>
            <th className='text-right' style={{ width: '3rem' }}>#</th>
            <th style={{ width: '25rem' }}>{heading.replace(/s$/, '')}</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={`inventory_${item.name}`}>
              <td className='text-right' style={{ width: '3rem' }}>{item.count}</td>
              <td style={{ width: '25rem' }}>
                <CopyOnClick>{item.name}</CopyOnClick>
              </td>
              <td>
                {item.mission > 0 && <span className='text-secondary'> {item.mission} Mission Critical</span>}
                {item.stolen > 0 && <span className='text-danger'> {item.stolen} Stolen</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}