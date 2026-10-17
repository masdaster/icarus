const os = require('os')
const fs = require('fs')
const path = require('path')
const Package = require('../../../package.json')

const PREFERENCES_FILE = 'Preferences.json'

class Preferences {
  getPreferences () {
    const prefsPath = path.join(this.preferencesDir(), PREFERENCES_FILE)
    if (!fs.existsSync(prefsPath)) return {}
    try {
      return JSON.parse(fs.readFileSync(prefsPath, 'utf8'))
    } catch (e) {
      console.error('Error reading preferences:', e)
      return {}
    }
  }

  savePreferences (preferencesObject) {
    const prefsDir = this.preferencesDir()
    const prefsPath = path.join(prefsDir, PREFERENCES_FILE)
    // Ensure directory exists
    if (!fs.existsSync(prefsDir)) {
      fs.mkdirSync(prefsDir, { recursive: true })
    }
    preferencesObject.version = Package.version
    try {
      fs.writeFileSync(prefsPath, JSON.stringify(preferencesObject, null, 2))
      return true
    } catch (e) {
      console.error('Error saving preferences:', e)
      return false
    }
  }

  preferencesDir () {
    switch (os.platform()) {
      case 'win32': // Windows (all versions)
        return path.join(os.homedir(), 'AppData', 'Local', 'EDData Icarus')
      case 'darwin': // Mac OS
        return path.join(os.homedir(), 'Library', 'EDData Icarus')
      default: // Default to a location for some other form of unix
        return path.join(os.homedir(), '.eddata-icarus')
    }
  }
}

module.exports = new Preferences()
