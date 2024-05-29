import Layout from 'components/layout'
import Panel from 'components/panel'
import NavigationInspectorPanel from 'components/panels/nav/navigation-inspector-panel'
import NavigationSystemMapPanel from 'components/panels/nav/navigation-system-map-panel'
import { NavPanelNavItems } from 'lib/navigation-items'
import { eventListener, sendEvent, useSocket } from 'lib/socket'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function NavMapPage() {
  const router = useRouter()
  const { query } = router
  const { connected, active, ready } = useSocket()
  const [componentReady, setComponentReady] = useState(false)
  const [system, setSystem] = useState()
  const [systemObject, setSystemObject] = useState()
  const [cmdrStatus, setCmdrStatus] = useState()
  const [rescanInProgress, setRescanInProgress] = useState(false)

  const search = async (searchInput) => {
    const newSystem = await sendEvent('getSystem', { name: searchInput })
    if (!newSystem) return
    setSystemObject(null)
    setSystem(newSystem)
  }

  const getSystem = async (systemName, useCache = true) => {
    const newSystem = await sendEvent('getSystem', { name: systemName, useCache })
    if (!newSystem) return
    setSystemObject(null)
    setSystem(newSystem)
  }

  const rescanSystem = async () => {
    setRescanInProgress(true)
    const newSystem = await sendEvent('getSystem', { name: system?.name, useCache: false })
    setRescanInProgress(false)
    if (!newSystem) return
    setSystem(newSystem)
  }

  const plotRoute = async (systemName) => {
    const successful = await sendEvent('plotRoute', { systemName })
    if (successful) {
      router.push({ pathname: '/nav/route' })
    }
  }

  const setSystemObjectByName = (name) => {
    const el = document.querySelector(`[data-system-object-name="${name}" i]`)
    if (el) {
      el.focus()
    } else {
      const newSystemObject = system.objectsInSystem.filter(child => child.name.toLowerCase() === name?.toLowerCase())[0]
      setSystemObject(newSystemObject)
    }
  }

  useEffect(() => {
    async function core() {
      setCmdrStatus(await sendEvent('getCmdrStatus'))

      const newSystem = await sendEvent('getSystem', query.system ? { name: query.system, useCache: true } : { useCache: true })

      if (newSystem) {
        setSystem(newSystem)
      } else {
        // If system lookup fails (i.e. no game data), fallback to Sol system
        setSystem(await sendEvent('getSystem', { name: 'Sol', useCache: true }))
      }

      if (query.selected) {
        const newSystemObject = newSystem.objectsInSystem.filter(child => child.name.toLowerCase() === query.selected.toLowerCase())[0]
        if (!newSystemObject) return
        setSystemObject(newSystemObject)
        // TODO Highlight body on map (or, if ground facility, the nearest planet)
        // setTimeout(() => {
        //   const el = document.querySelector(`[data-system-object-name="${newSystemObject?.name}" i]`)
        //   if (el) el.focus()
        // }, 750) // Delay to allow map to render
      }

      setComponentReady(true)
    }

    if (!connected || !router.isReady) return
    core()
  }, [connected, ready, router.isReady])

  useEffect(() => eventListener('newLogEntry', async (log) => {
    if (['Location', 'FSDJump'].includes(log.event)) {
      setCmdrStatus(await sendEvent('getCmdrStatus'))
      const newSystem = await sendEvent('getSystem', { useCache: false })
      if (!newSystem) return // If no result, don't update map
      setSystemObject(null) // Clear selected object
      setSystem(newSystem)
    }
    if (['FSSDiscoveryScan', 'FSSAllBodiesFound', 'SAASignalsFound', 'FSSBodySignals', 'Scan'].includes(log.event)) {
      const newSystem = await sendEvent('getSystem', { name: system?.name, useCache: false })
      // Update system object so NavigationInspectorPanel is also updated
      if (newSystem) {
        if (systemObject?.name) {
          const newSystemObject = newSystem.objectsInSystem.filter(child => child.name.toLowerCase() === systemObject.name?.toLowerCase())[0]
          setSystemObject(newSystemObject)
        }
        setSystem(newSystem)
      }
    }
  }), [system, systemObject])

  useEffect(() => eventListener('gameStateChange', async (log) => {
    //setCmdrStatus(await sendEvent('getCmdrStatus'))
  }))


  useEffect(() => {
    if (!router.isReady) return
    const q = { ...query }
    if (system) q.system = system?.name?.toLowerCase()
    if (systemObject) {
      q.selected = systemObject?.name?.toLowerCase()
    } else {
      if (q.selected) delete q.selected
    }
    router.push({ query: q }, undefined, { shallow: true })
  }, [system, systemObject, router.isReady])

  return (
    <Layout connected={connected} active={active} ready={ready} loader={!componentReady}>
      <Panel layout='full-width' navigation={NavPanelNavItems('Map', query)} search={search} exit={system?.isCurrentLocation === false ? () => getSystem() : null}>
        <NavigationSystemMapPanel system={system} systemObject={systemObject} setSystemObject={setSystemObject} cmdrStatus={cmdrStatus} rescanSystem={rescanSystem} rescanInProgress={rescanInProgress} plotRoute={plotRoute} />
        <NavigationInspectorPanel systemObject={systemObject} setSystemObjectByName={setSystemObjectByName} />
      </Panel>
    </Layout>
  )
}
