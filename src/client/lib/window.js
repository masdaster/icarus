function isWindowsApp () { return (typeof window !== 'undefined' && typeof window.edDataIcarus_version === 'function') }
function isWindowFullScreen () { if (isWindowsApp()) { return window.edDataIcarus_isFullScreen() } }
function isWindowPinned () { if (isWindowsApp()) { return window.edDataIcarus_isPinned() } }
function openReleaseNotes () { if (isWindowsApp()) { return window.edDataIcarus_openReleaseNotes() } }
function openTerminalInBrowser () { if (isWindowsApp()) { return window.edDataIcarus_openTerminalInBrowser() } }

function appVersion () {
  if (isWindowsApp()) { return window.edDataIcarus_version() }
  return null
}

function newWindow () {
  if (isWindowsApp()) { return window.edDataIcarus_newWindow() }

  window.open(`//${window.location.host}`)
}

function closeWindow () {
  if (isWindowsApp()) { return window.edDataIcarus_quit() }

  window.close()
}

async function checkForUpdate () {
  if (isWindowsApp()) {
    try {
      return JSON.parse(await window.edDataIcarus_checkForUpdate())
    } catch {}
    return null
  }
}

function installUpdate () {
  if (isWindowsApp()) { return window.edDataIcarus_installUpdate() }
}

async function toggleFullScreen () {
  if (isWindowsApp()) { return await window.edDataIcarus_toggleFullScreen() }

  if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.webkitCurrentFullScreenElement) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen()
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen()
    }
    return true
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    }
    return false
  }
}

async function togglePinWindow () {
  if (isWindowsApp()) { return await window.edDataIcarus_togglePinWindow() }
}

export {
  isWindowsApp,
  isWindowFullScreen,
  isWindowPinned,
  openReleaseNotes,
  openTerminalInBrowser,
  appVersion,
  newWindow,
  closeWindow,
  toggleFullScreen,
  togglePinWindow,
  checkForUpdate,
  installUpdate
}
