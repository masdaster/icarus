import { useState, useEffect } from 'react'
import packageJson from '../../../package.json'

function ColorPicker ({ visible, toggleVisible = () => {} }) {
  const [primaryColor, setPrimaryColor] = useState(getPrimaryColorAsHex())
  const [primaryColorModifier, setPrimaryColorModifier] = useState(getPrimaryColorModifier())
  const [secondaryColor, setSecondaryColor] = useState(getSecondaryColorAsHex())
  const [secondaryColorModifier, setSecondaryColorModifier] = useState(getSecondaryColorModifier())

  // Update this component if another window updates the theme settings
  const storageEventHandler = (event) => {
    if (event.key === 'color-settings') {
      setPrimaryColor(getPrimaryColorAsHex())
      setPrimaryColorModifier(getPrimaryColorModifier())
      setSecondaryColor(getSecondaryColorAsHex())
      setSecondaryColorModifier(getSecondaryColorModifier())
    }
  }

  useEffect(() => {
    window.addEventListener('storage', storageEventHandler)
    return () => window.removeEventListener('storage', storageEventHandler)
  }, [])

  return (
    <div className='modal-dialog' style={{ display: visible ? 'block' : 'none' }}>
      <h3 className='text-primary'>Theme</h3>
      <hr />

      <p style={{ fontSize: '1rem' }}>
        You can select a primary and secondary theme color and adjust the contrast for each color using the sliders.
      </p>

      <table className='table--layout' style={{ background: 'var(--color-background-panel-translucent)' }}>
        <tbody>
          <tr>
            <td style={{ paddingLeft: '.5rem' }}>
              <button className='button--active text-no-wrap' style={{ pointerEvents: 'none' }}>
                <i className='icon icarus-terminal-color-picker' /> Text <span className='text-muted'>Muted</span>
              </button>
              <br />
              <button className='text-no-wrap' style={{ pointerEvents: 'none' }}>
                <i className='icon icarus-terminal-color-picker' /> Text <span className='text-muted'>Muted</span>
              </button>
            </td>
            <td className='text-center'>
              <input
                id='primaryColorPicker' name='primaryColorPicker' value={primaryColor} type='color'
                style={{ marginTop: '.5rem', padding: 0, background: 'transparent', border: 'none', height: '4rem', width: '4rem' }}
                onChange={(event) => {
                  setPrimaryColor(event.target.value)
                  const color = hex2rgb(event.target.value)
                  document.documentElement.style.setProperty('--color-primary-r', color.r)
                  document.documentElement.style.setProperty('--color-primary-g', color.g)
                  document.documentElement.style.setProperty('--color-primary-b', color.b)
                  saveColorSettings()
                }}
              />
              <br />
              <input
                type='range' min='1' max='255' value={primaryColorModifier} style={{ width: '10rem' }}
                onChange={(event) => {
                  setPrimaryColorModifier(event.target.value)
                  document.documentElement.style.setProperty('--color-primary-dark-modifier', event.target.value)
                  saveColorSettings()
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <table className='table--layout' style={{ background: 'var(--color-background-panel-translucent)' }}>
        <tbody>
          <tr>
            <td style={{ paddingLeft: '.5rem' }}>
              <button className='button--secondary button--active text-no-wrap' style={{ pointerEvents: 'none' }}>
                <i className='icon icarus-terminal-color-picker' /> Text <span className='text-muted'>Muted</span>
              </button>
              <br />
              <button className='button--secondary text-no-wrap' style={{ pointerEvents: 'none' }}>
                <i className='icon icarus-terminal-color-picker' /> Text <span className='text-muted'>Muted</span>
              </button>
            </td>
            <td className='text-center'>
              <input
                id='secondaryColorPicker' name='secondaryColorPicker' value={secondaryColor} type='color'
                style={{ marginTop: '.5rem', padding: 0, background: 'transparent', border: 'none', height: '4rem', width: '4rem' }}
                onChange={(event) => {
                  setSecondaryColor(event.target.value)
                  const color = hex2rgb(event.target.value)
                  document.documentElement.style.setProperty('--color-secondary-r', color.r)
                  document.documentElement.style.setProperty('--color-secondary-g', color.g)
                  document.documentElement.style.setProperty('--color-secondary-b', color.b)
                  saveColorSettings()
                }}
              />
              <br />
              <input
                type='range' min='1' max='255' value={secondaryColorModifier} style={{ width: '10rem' }}
                onChange={(event) => {
                  setSecondaryColorModifier(event.target.value)
                  document.documentElement.style.setProperty('--color-secondary-dark-modifier', event.target.value)
                  saveColorSettings()
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{ fontSize: '1rem' }}>
        Settings apply to all terminals on this computer / device. Different devices can be configured to use different colors.
      </p>

      <hr style={{ margin: '1rem 0 .5rem 0' }} />
      <button
        className='text-info' onClick={() => {
          try {
            loadDefaultColorSettings()
            setPrimaryColor(getPrimaryColorAsHex())
            setPrimaryColorModifier(getPrimaryColorModifier())
            setSecondaryColor(getSecondaryColorAsHex())
            setSecondaryColorModifier(getSecondaryColorModifier())
            window.localStorage.removeItem('color-settings')
            document.activeElement.blur()
          } catch (err) {
            console.error('Unable to reset color settings', err)
          }
        }}
      >
        Reset to defaults
      </button>
      <button className='float-right' onClick={toggleVisible}>
        Close
      </button>
    </div>
  )
}

const hex2rgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

const rgb2hex = (r, g, b) => {
  const rgb = (r << 16) | (g << 8) | b
  return '#' + rgb.toString(16).padStart(6, 0)
}

const getPrimaryColorAsHex = () => {
  if (typeof document === 'undefined') return null
  const r = window.getComputedStyle(document.documentElement).getPropertyValue('--color-primary-r')
  const g = window.getComputedStyle(document.documentElement).getPropertyValue('--color-primary-g')
  const b = window.getComputedStyle(document.documentElement).getPropertyValue('--color-primary-b')
  return rgb2hex(r, g, b)
}

const getSecondaryColorAsHex = () => {
  if (typeof document === 'undefined') return null
  const r = window.getComputedStyle(document.documentElement).getPropertyValue('--color-secondary-r')
  const g = window.getComputedStyle(document.documentElement).getPropertyValue('--color-secondary-g')
  const b = window.getComputedStyle(document.documentElement).getPropertyValue('--color-secondary-b')
  return rgb2hex(r, g, b)
}

const getPrimaryColorModifier = () => {
  if (typeof document === 'undefined') return null
  return parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--color-primary-dark-modifier'))
}

const getSecondaryColorModifier = () => {
  if (typeof document === 'undefined') return null
  return parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--color-secondary-dark-modifier'))
}

const saveColorSettings = () => {
  const colorSettings = {
    version: packageJson.version,
    primaryColor: {
      r: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--color-primary-r')),
      g: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--color-primary-g')),
      b: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--color-primary-b')),
      modifier: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--color-primary-dark-modifier'))
    },
    secondaryColor: {
      r: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--color-secondary-r')),
      g: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--color-secondary-g')),
      b: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--color-secondary-b')),
      modifier: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--color-secondary-dark-modifier'))
    }
  }
  try {
    window.localStorage.setItem('color-settings', JSON.stringify({ ...colorSettings, timestamp: Date.now() }))
  } catch (err) {
    console.error('Unable to save color settings to localStorage', err)
  }
}

const loadColorSettings = () => {
  try {
    const colorSettings = JSON.parse(window.localStorage.getItem('color-settings'))
    if (!colorSettings) return loadDefaultColorSettings() // If no save settings, load defaults
    // If older than v0.3.6 then erase color settings and load defaults as
    // breaking theme changes in v0.3.6
    if (!colorSettings.version || compareVersions('0.3.6', colorSettings.version) === 1) {
      window.localStorage.removeItem('color-settings')
      return loadDefaultColorSettings()
    }

    document.documentElement.style.setProperty('--color-primary-r', colorSettings.primaryColor.r)
    document.documentElement.style.setProperty('--color-primary-g', colorSettings.primaryColor.g)
    document.documentElement.style.setProperty('--color-primary-b', colorSettings.primaryColor.b)
    document.documentElement.style.setProperty('--color-primary-dark-modifier', colorSettings.primaryColor.modifier)
    document.documentElement.style.setProperty('--color-secondary-r', colorSettings.secondaryColor.r)
    document.documentElement.style.setProperty('--color-secondary-g', colorSettings.secondaryColor.g)
    document.documentElement.style.setProperty('--color-secondary-b', colorSettings.secondaryColor.b)
    document.documentElement.style.setProperty('--color-secondary-dark-modifier', colorSettings.secondaryColor.modifier)
  } catch (err) {
    console.error('Unable to read color settings from localStorage', err)
    return loadDefaultColorSettings()
  }
}

const loadDefaultColorSettings = () => {
  const defaultPrimaryColor = {
    r: window.getComputedStyle(document.documentElement).getPropertyValue('--color-default-primary-r'),
    g: window.getComputedStyle(document.documentElement).getPropertyValue('--color-default-primary-g'),
    b: window.getComputedStyle(document.documentElement).getPropertyValue('--color-default-primary-b')
  }

  document.documentElement.style.setProperty('--color-primary-r', defaultPrimaryColor.r)
  document.documentElement.style.setProperty('--color-primary-g', defaultPrimaryColor.g)
  document.documentElement.style.setProperty('--color-primary-b', defaultPrimaryColor.b)

  const defaultPrimaryColorModifier = window.getComputedStyle(document.documentElement).getPropertyValue('--color-default-primary-dark-modifier')
  document.documentElement.style.setProperty('--color-primary-dark-modifier', defaultPrimaryColorModifier)

  const defaultSecondaryColor = {
    r: window.getComputedStyle(document.documentElement).getPropertyValue('--color-default-secondary-r'),
    g: window.getComputedStyle(document.documentElement).getPropertyValue('--color-default-secondary-g'),
    b: window.getComputedStyle(document.documentElement).getPropertyValue('--color-default-secondary-b')
  }

  document.documentElement.style.setProperty('--color-secondary-r', defaultSecondaryColor.r)
  document.documentElement.style.setProperty('--color-secondary-g', defaultSecondaryColor.g)
  document.documentElement.style.setProperty('--color-secondary-b', defaultSecondaryColor.b)

  const defaultSecondaryColorModifier = window.getComputedStyle(document.documentElement).getPropertyValue('--color-default-secondary-dark-modifier')
  document.documentElement.style.setProperty('--color-secondary-dark-modifier', defaultSecondaryColorModifier)
}

// Returns: 1 = v1 is bigger, 0 = same version, -1 = v1 is smaller
function compareVersions (v1, v2) {
  const v1Parts = v1.split('.')
  const v2Parts = v2.split('.')
  const length = Math.max(v1Parts.length, v2Parts.length)
  for (let i = 0; i < length; i++) {
    const value = (parseInt(v1Parts[i]) || 0) - (parseInt(v2Parts[i]) || 0)
    if (value < 0) return -1
    if (value > 0) return 1
  }
  return 0
}

module.exports = {
  ColorPicker,
  loadColorSettings,
  loadDefaultColorSettings
}