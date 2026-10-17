import App from 'next/app'
import { Toaster } from 'react-hot-toast'
import { SocketProvider, eventListener } from 'lib/socket'
import { loadColorSettings, saveColorSettings } from 'components/settings'
import '../public/fonts/icarus-terminal/icarus-terminal.css'
import '../css/main.css'

// Global error handlers for debugging
if (typeof window !== 'undefined') {
  window.onerror = function (message, source, lineno, colno, error) {
    console.error('[GLOBAL ERROR]', message, 'at', source, lineno, colno)
    console.error('[GLOBAL ERROR] Stack:', error?.stack)
    window.alert('GLOBAL ERROR:\n' + message + '\n\nFile: ' + source + '\nLine: ' + lineno + '\n\nStack:\n' + (error?.stack || 'No stack'))
    return false
  }

  window.addEventListener('unhandledrejection', function (event) {
    console.error('[UNHANDLED PROMISE]', event.reason)
    window.alert('UNHANDLED PROMISE REJECTION:\n' + event.reason)
  })
}

const handleNavigationClick = (navigation, index) => {
  const button = document.querySelector(`#${navigation}Navigation button[data-${navigation}-navigation='${index}']`)
  if (button) button.click()
}

const handleKeyPress = (event) => {
  const element = document.activeElement.tagName

  // Check for focus on input elements
  if (element.toLowerCase() === 'input') {
    // If ESC is pressed, then remove focus from input
    if (event.key === 'Escape') document.body.click()

    // If UP or DOWN arrow is pressed then remove focus
    if (['ArrowUp', 'ArrowDown'].includes(event.key)) document.body.click()

    return
  }

  try {
    const key = event.key
    const isAlt = event.getModifierState('Alt')

    // Handle number keys 1-7
    if (/^[1-7]$/.test(key)) {
      const navigation = isAlt ? 'secondary' : 'primary'
      handleNavigationClick(navigation, key)
      return
    }

    // Handle arrow keys
    switch (key) {
      case 'ArrowUp':
      case 'ArrowDown': {
        const secondaryNav = document.querySelector('#secondaryNavigation')
        if (!secondaryNav) return

        const activeButton = secondaryNav.querySelector('button.button--active')
        if (!activeButton) return

        const currentIndex = parseInt(activeButton.dataset.secondaryNavigation)
        const newIndex = key === 'ArrowUp' ? currentIndex - 1 : currentIndex + 1
        handleNavigationClick('secondary', newIndex)
        return
      }
      case 'ArrowLeft':
      case 'ArrowRight': {
        const activeButton = document.querySelector('#primaryNavigation button.button--active')
        if (!activeButton) return

        const currentIndex = parseInt(activeButton.dataset.primaryNavigation)
        const newIndex = key === 'ArrowLeft' ? currentIndex - 1 : currentIndex + 1
        handleNavigationClick('primary', newIndex)
      }
    }
  } catch {
    // Silent fail for navigation errors
  }
}

export default class MyApp extends App {
  constructor (props) {
    super(props)
    this.state = { mounted: false }
    if (typeof window !== 'undefined') {
      // Load settings at startup
      loadColorSettings()

      // Update settings in this window when they are changed in another window
      window.addEventListener('storage', (event) => {
        if (event.key === 'color-settings') { loadColorSettings() }
      })

      // Update theme settings (and save them) when sync message received
      eventListener('syncMessage', (event) => {
        if (event.name === 'colorSettings') {
          const colorSettings = event.message
          document.documentElement.style.setProperty('--color-primary-r', colorSettings.primaryColor.r)
          document.documentElement.style.setProperty('--color-primary-g', colorSettings.primaryColor.g)
          document.documentElement.style.setProperty('--color-primary-b', colorSettings.primaryColor.b)
          document.documentElement.style.setProperty('--color-primary-dark-modifier', colorSettings.primaryColor.modifier)
          document.documentElement.style.setProperty('--color-secondary-r', colorSettings.secondaryColor.r)
          document.documentElement.style.setProperty('--color-secondary-g', colorSettings.secondaryColor.g)
          document.documentElement.style.setProperty('--color-secondary-b', colorSettings.secondaryColor.b)
          document.documentElement.style.setProperty('--color-secondary-dark-modifier', colorSettings.secondaryColor.modifier)
          saveColorSettings()
        }
      })

      document.addEventListener('keydown', handleKeyPress)
    }
  }

  componentDidMount () {
    this.setState({ mounted: true })
  }

  render () {
    if (!this.state.mounted) return null

    const { Component, pageProps } = this.props
    return (
      <SocketProvider>
        <div suppressHydrationWarning id='notifications' style={{ transition: '1s all ease-in-out', position: 'fixed', zIndex: 9999 }}>
          <Toaster
            position='bottom-right'
            toastOptions={{
              duration: 8000,
              className: 'notification text-uppercase text-primary',
              style: {
                borderRadius: '0',
                border: '.2rem solid var(--color-primary)',
                background: 'var(--color-background-panel)',
                color: 'var(--color-info)',
                minWidth: '300px',
                maxWidth: '420px',
                textAlign: 'left !important',
                margin: '0 1rem',
                boxShadow: '0 0 1rem black'
              }
            }}
          />
        </div>
        <Component {...pageProps} />
      </SocketProvider>
    )
  }
}
