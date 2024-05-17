import EngineeringModifier from 'components/panels/ship/ship-status/engineering-modifer'
import { useRouter } from 'next/router'

export default function ShipModuleInspectorPanel({ module, setSelectedModule }) {
  const router = useRouter()

  if (!module) return (<div className='ship-panel__module-inspector ship-panel__module-inspector--hidden' />)

  let inspectorTitle = 'Optional Module'
  if (module.hardpoint) inspectorTitle = 'Hardpoint'
  if (module.utility) inspectorTitle = 'Utility'
  if (module.core) inspectorTitle = 'Core Module'

  return (
    <div className='inspector inspector--horizontal ship-panel__module-inspector'>
      <div className='inspector__title' onClick={() => { setSelectedModule(null) }}>
        <button className='inspector__close-button'>
          <i className='icon icarus-terminal-chevron-right' />
        </button>
        <h3>{inspectorTitle}</h3>
      </div>
      <div className='inspector__contents scrollable'>
        <div className='ship-panel__module-section text-uppercase'>
          <h2 className='text-info' data-module-name={module.name} data-fx-order='3'>
            {module.mount} {module.name}
          </h2>
          <h3 className='text-no-wrap'>
            {module.class}{module.rating} <span className='text-muted'>{module.slotName}</span>
          </h3>
          <div className='text-primary'>
            {module?.power > 0 && <p><span className='text-muted'>Power</span> {module.power} MW</p>}
            {module?.mass > 0 && <p><span className='text-muted'>Mass</span> {module.mass} T</p>}
            {module.description &&
              <p className='text-primary text-muted'>
                {module.description}
              </p>}
          </div>
        </div>
        {module.engineering &&
          <>
            <div className='ship-panel__module-section ship-panel__module-section--engineering text-uppercase'>
              <h3 className='text-muted'>Engineering</h3>
              <div className='ship-panel__module-section--engineering-tab'>
                <p className='text-primary'>
                  <span className='text-muted'>Blueprint </span>
                  <span className='text-link' onClick={() => router.push({ pathname: '/eng/blueprints', query: { symbol: module.engineering.symbol } })}>
                    <span className='text-link-text'>{module.engineering.originalName}</span>
                  </span>
                </p>
                {module.engineering.experimentalEffect &&
                  <p className='text-primary'>
                    <span className='text-muted'>experimental</span>
                    <span> {module.engineering.experimentalEffect}</span>
                  </p>}
                <p className='text-primary'>
                  <span className='text-muted'>by</span> {module.engineering.engineer}
                </p>
                <p className='text-secondary' style={{ margin: 0, fontSize: '2rem', top: '.25rem', position: 'relative' }}>
                  {[...Array(module.engineering.level)].map((j, i) =>
                    <i
                      key={`${module.name}_${module.slot}_engineering_${i}`}
                      className='icon icarus-terminal-engineering'
                    />
                  )}
                </p>
              </div>
            </div>
            <div className='ship-panel__module-section ship-panel__module-section--engineering text-uppercase'>
              <div className='ship-panel__module-section--engineering-tab'>
                {module.engineering.modifiers.map(modifier =>
                  modifier.improvement ? <EngineeringModifier module={module} modifier={modifier} /> : null
                )}
                {module.engineering.modifiers.map(modifier =>
                  !modifier.improvement ? <EngineeringModifier module={module} modifier={modifier} /> : null
                )}
              </div>
            </div>
          </>}
      </div>
    </div>
  )
}
