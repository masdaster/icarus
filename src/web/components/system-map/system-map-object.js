import Icons from 'lib/icons'

const USE_ICONS_FOR_PLANETS = false
const SHOW_LABELS = true

// TODO This has been ported to JSX but would be easier to maintain if each
// type of object was refactored out into it's own component
export default function SystemMapObject ({ systemObject, setSystemObject }) {
  const CLICKABLE_AREA_PADDING = 250
  const MAX_LABEL_WIDTH = 3000

  // Draw for Planets and Stars
  if (['Planet', 'Star'].includes(systemObject?.type)) {
    // If USE_ICONS_FOR_PLANETS is set, use alternate icon shape
    if (USE_ICONS_FOR_PLANETS) {
      const CORRECT_FOR_IMAGE_OFFSET = 140
      const x = (systemObject._x - 500)
      const y = (systemObject._y - 500)
      const h = systemObject._r * 2
      const w = systemObject._r * 2

      const h2 = systemObject._r + (CLICKABLE_AREA_PADDING * 2)
      const w2 = systemObject._r + (CLICKABLE_AREA_PADDING * 2)

      return (
        <>
          <svg
            preserveAspectRatio='xMinYMid meet'
            x={x}
            y={y}
            height={h}
            width={w}
            className='navigation-panel__planet'
          >
            {Icons.Planet}
          </svg>
          {/* Transparent interactive overlay for icon (as transparent SVG parts not clickable) */}
          <rect
            x={x - CORRECT_FOR_IMAGE_OFFSET}
            y={y - CORRECT_FOR_IMAGE_OFFSET}
            height={h2}
            width={w2}
            onFocus={() => setSystemObject(systemObject)}
            tabIndex='0'
            className='navigation-panel__station'
            data-type={systemObject.type}
            data-detail={encodeObjectDetail(systemObject)}
            opacity='0.85'
          />
        </>
      )
    } else {
      const x = systemObject._x
      const y = systemObject._y
      const r = systemObject._r

      // An image is used underneath the main SVG to easily add a texture to
      // the planet (could be done without foreignObject, but this is simpler)
      // const imgH = (systemObject._r) * 2
      // const imgW = (systemObject._r) * 2
      // const imgX = (systemObject._x - (imgW / 2))
      // const imgY = (systemObject._y - (imgH / 2))

      const textNameContents = truncateString(systemObject.label, (systemObject.orbitsStar ? 10 : 20))
      const textNameXOffset = textNameContents.length * 120 // Roughly center text

      // Check wider is no wider than planet (so they don't overlap)
      const textNameXLength = systemObject.orbitsStar || textNameContents.length <= 10
        ? textNameXOffset * 2 > MAX_LABEL_WIDTH ? MAX_LABEL_WIDTH : false
        : textNameXOffset * 2 > MAX_LABEL_WIDTH ? MAX_LABEL_WIDTH : textNameXOffset * 2

      const textNameX = systemObject.orbitsStar ? x - textNameXOffset : x + (r * 1) + 200
      const textNameY = systemObject.orbitsStar ? y - (r * 1) - 700 : y - 100

      const textDistanceContents = `${systemObject.distanceToArrival.toFixed(0)} Ls`
      const textDistanceX = systemObject.orbitsStar ? textNameX : x + (r * 1) + 200
      const textDistanceY = systemObject.orbitsStar ? y - (r * 1) - 300 : y + 300

      return (
        <>
          {(systemObject.atmosphereType && systemObject.atmosphereType !== 'No atmosphere') &&
            <circle
              className='navigation-panel__planet-atmosphere'
              cx={x - 0}
              cy={y - 0}
              r={r + 70}
            />}
          {SHOW_LABELS === true &&
            <>
              <text
                className='navigation-panel__planet-name-text'
                x={textNameX}
                y={textNameY}
                textLength={textNameXLength !== false ? `${textNameXLength}px` : null}
                lengthAdjust='spacingAndGlyphs'
              >
                {textNameContents}
              </text>
              <text
                className='navigation-panel__planet-distance-text'
                x={textDistanceX}
                y={textDistanceY}
              >
                {textDistanceContents}
              </text>
            </>}
          <circle
            id={`navigation-panel__${systemObject.id}`}
            className='system-object'
            data-landable={systemObject.isLandable}
            data-type={systemObject.type}
            data-sub-type={systemObject.subType}
            data-small={!!systemObject._small}
            data-atmosphere={systemObject.atmosphereType}
            data-detail={encodeObjectDetail(systemObject)}
            tabIndex='0'
            cx={x}
            cy={y}
            r={r}
            onFocus={() => setSystemObject(systemObject)}
          />
          <circle
            className='navigation-panel__planet-surface'
            cx={x}
            cy={y}
            r={r}
            fill='url(#svg-pattern__planet-surface)'
          />
          {systemObject.rings &&
            <>
              <defs>
                <mask
                  id={`planet-ring-mask-${systemObject.id}`}
                  className='navigation-panel__planet-ring-mask'
                >
                  <ellipse
                    cx={x}
                    cy={y}
                    rx={r * 2}
                    ry={r / 3}
                    fill='white'
                  />
                  <ellipse
                    cx={x}
                    cy={y - (r / 5)}
                    rx={r}
                    ry={r / 3}
                    fill='black'
                  />
                  <ellipse
                    cx={x}
                    cy={y - (r / 15)}
                    rx={r * 1.2}
                    ry={r / 5}
                    fill='black'
                  />
                </mask>
              </defs>
              <ellipse
                className='navigation-panel__planet-ring'
                cx={x}
                cy={y}
                rx={r * 2}
                ry={r / 3}
                mask={`url(#planet-ring-mask-${systemObject.id})`}
                opacity='1'
              />
              <ellipse
                className='navigation-panel__planet-ring'
                cx={x}
                cy={y - (r / 80)}
                rx={r * 1.85}
                ry={r / 4.2}
                mask={`url(#planet-ring-mask-${systemObject.id})`}
                opacity='.25'
              />
            </>}
        </>
      )
    }
  } else {
    // Draw systemObjects that are not planets or stars using icons
    const CORRECT_FOR_IMAGE_OFFSET = 70

    const r = systemObject._r

    // const x = systemObject._x - (r / 2) - CLICKABLE_AREA_PADDING
    // const y = systemObject._y - (r / 2) - CLICKABLE_AREA_PADDING
    // const height = r + (CLICKABLE_AREA_PADDING * 2)
    // const width = r + (CLICKABLE_AREA_PADDING * 2)

    const imageH = r * 2
    const imageW = imageH
    const imageY = (systemObject._y - (r / 2)) - CORRECT_FOR_IMAGE_OFFSET
    const imageX = (systemObject._x - (r / 2)) - CORRECT_FOR_IMAGE_OFFSET

    const textNameContents = truncateString(systemObject.label, (systemObject.orbitsStar ? 10 : 20))
    const textNameXOffset = textNameContents.length * 120 // Roughly center text

    const textNameXLength = systemObject.orbitsStar || textNameContents.length <= 10
      ? textNameXOffset * 2 > MAX_LABEL_WIDTH ? MAX_LABEL_WIDTH : false
      : textNameXOffset * 2 > MAX_LABEL_WIDTH ? MAX_LABEL_WIDTH : textNameXOffset * 2

    const textNameX = systemObject.orbitsStar ? systemObject._x - textNameXOffset : systemObject._x + (r * 1) + 200
    const textNameY = systemObject.orbitsStar ? systemObject._y - (r * 1) - 700 : systemObject._y - 100

    const textDistanceContents = `${systemObject.distanceToArrival.toFixed(0)} Ls`
    const textDistanceXOffset = textDistanceContents.length * 95 // Roughly center text
    const textDistanceX = systemObject.orbitsStar ? systemObject._x - textDistanceXOffset : systemObject._x + (r * 1) + 200
    const textDistanceY = systemObject.orbitsStar ? systemObject._y - (r * 1) - 300 : systemObject._y + 300

    return (
      <>
        {/* Transparent interactive overlay for icon (as transparent SVG parts not clickable) */}
        <circle
          cx={systemObject._x}
          cy={systemObject._y}
          r={systemObject._r - 50}
          onFocus={() => setSystemObject(systemObject)}
          tabIndex='0'
          className='navigation-panel__station'
          data-type={systemObject.type}
          data-detail={encodeObjectDetail(systemObject)}
        />
        {/*  Inline SVG icon (loaded from string so can be easily styled) */}
        <svg
          className='navigation-panel__station-icon icon'
          x={imageX}
          y={imageY}
          h={imageH * 10}
          w={imageW * 10}
        >
          {Icons[systemObject.type]}
        </svg>
        {SHOW_LABELS === true &&
          <>
            <text
              className='navigation-panel__planet-name-text'
              x={textNameX}
              y={textNameY}
              textLength={textNameXLength !== false ? `${textNameXLength}px` : null}
              lengthAdjust='spacingAndGlyphs'
            >{textNameContents}
            </text>
            <text
              className='navigation-panel__planet-distance-text'
              x={textDistanceX}
              y={textDistanceY}
            >{textDistanceContents}
            </text>
          </>}
      </>
    )
  }
}

function truncateString (string, maxLength) {
  if (string.length > maxLength) {
    return `${string.substring(0, maxLength - 1)}…`
  }
  return string
}

function encodeObjectDetail (systemObject) {
  // return encodeURI(JSON.stringify(systemObject))
}