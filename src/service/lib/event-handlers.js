const os = require('os')
const fs = require('fs')
const path = require('path')
const pjXML = require('pjxml')
const keysender = require('keysender')
const { UNKNOWN_VALUE } = require('../../shared/consts')

const { BROADCAST_EVENT: broadcastEvent } = global

const TARGET_WINDOW_TITLE = 'Elite - Dangerous (CLIENT)'
const KEYBINDS_DIR = path.join(os.homedir(), 'AppData', 'Local', 'Frontier Developments', 'Elite Dangerous', 'Options', 'Bindings')

// Prefer Keybinds v4.1 file
// TODO Check what version of game player has active
const KEYBINDS_FILE_V3 = path.join(KEYBINDS_DIR, 'Custom.3.0.binds')
const KEYBINDS_FILE_V4 = path.join(KEYBINDS_DIR, 'Custom.4.0.binds')
const KEYBINDS_FILE_V4_1 = path.join(KEYBINDS_DIR, 'Custom.4.1.binds')

// Map ICARUS Terminal names to in-game keybind names
const KEYBINDS_MAP = {
  lights: 'ShipSpotLightToggle',
  nightVision: 'NightVisionToggle',
  landingGear: 'LandingGearToggle',
  cargoHatch: 'ToggleCargoScoop',
  hardpoints: 'DeployHardpointToggle',
  flightAssist: 'ToggleFlightAssist',
  silentRunning: 'ToggleButtonUpInput'
}

// FIXME Refactor Preferences handling into a singleton
const PREFERENCES_DIR = path.join(os.homedir(), 'AppData', 'Local', 'ICARUS Terminal')
const PREFERENCES_FILE = path.join(PREFERENCES_DIR, 'Preferences.json')

const System = require('./event-handlers/system')
const ShipStatus = require('./event-handlers/ship-status')
const Materials = require('./event-handlers/materials')
const Blueprints = require('./event-handlers/blueprints')
const Engineers = require('./event-handlers/engineers')
const Inventory = require('./event-handlers/inventory')
const CmdrStatus = require('./event-handlers/cmdr-status')
const NavRoute = require('./event-handlers/nav-route')
const TextToSpeech = require('./event-handlers/text-to-speech')

class EventHandlers {
  constructor({ eliteLog, eliteJson }) {
    this.eliteLog = eliteLog
    this.eliteJson = eliteJson

    this.system = new System({ eliteLog })
    this.shipStatus = new ShipStatus({ eliteLog, eliteJson })
    this.materials = new Materials({ eliteLog, eliteJson })
    this.engineers = new Engineers({ eliteLog, eliteJson })
    this.inventory = new Inventory({ eliteLog, eliteJson })
    this.cmdrStatus = new CmdrStatus({ eliteLog, eliteJson })

    // These handlers depend on calls to other handlers
    this.blueprints = new Blueprints({ engineers: this.engineers, materials: this.materials, shipStatus: this.shipStatus })
    this.navRoute = new NavRoute({ eliteLog, eliteJson, system: this.system })
    this.textToSpeech = new TextToSpeech({ eliteLog, eliteJson, cmdrStatus: this.cmdrStatus, shipStatus: this.shipStatus })

    return this
  }

  // logEventHandler is fired on every in-game log event
  logEventHandler(logEvent) {
    this.textToSpeech.logEventHandler(logEvent)
  }

  gameStateChangeHandler(event) {
    this.textToSpeech.gameStateChangeHandler(event)
  }

  // Return handlers for events that are fired from the client
  getEventHandlers() {
    if (!this.eventHandlers) {
      this.eventHandlers = {
        getCmdr: async () => {
          const [LoadGame] = await this.eliteLog.getEvent('LoadGame')
          return {
            commander: LoadGame?.Commander ?? UNKNOWN_VALUE,
            credits: LoadGame?.Credits ?? UNKNOWN_VALUE
          }
        },
        getLogEntries: async ({ count = 100, timestamp }) => {
          if (timestamp) {
            return await this.eliteLog.getFromTimestamp(timestamp)
          } else {
            return await this.eliteLog.getNewest(count)
          }
        },
        getSystem: (args) => this.system.getSystem(args),
        getShipStatus: (args) => this.shipStatus.getShipStatus(args),
        getMaterials: (args) => this.materials.getMaterials(args),
        getInventory: (args) => this.inventory.getInventory(args),
        getEngineers: (args) => this.engineers.getEngineers(args),
        getCmdrStatus: (args) => this.cmdrStatus.getCmdrStatus(args),
        getBlueprints: (args) => this.blueprints.getBlueprints(args),
        getNavRoute: (args) => this.navRoute.getNavRoute(args),
        getPreferences: () => {
          return fs.existsSync(PREFERENCES_FILE) ? JSON.parse(fs.readFileSync(PREFERENCES_FILE)) : {}
        },
        setPreferences: (preferences) => {
          if (!fs.existsSync(PREFERENCES_DIR)) fs.mkdirSync(PREFERENCES_DIR, { recursive: true })
          fs.writeFileSync(PREFERENCES_FILE, JSON.stringify(preferences))
          broadcastEvent('syncMessage', { name: 'preferences' })
          return preferences
        },
        getVoices: () => this.textToSpeech.getVoices(),
        // getCodexEntries: () => {
        //   return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'codex', '_index.json')))
        // },
        // getCodexEntry: ({name}) => {
        //   const codexIndex = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'codex', '_index.json'))).index
        //   if (codexIndex[name]) {
        //     return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'codex', `${codexIndex[name]}.json`)))
        //   } else {
        //     return null
        //   }
        // },
        testMessage: ({ name, message }) => {
          // Method to simulate messages, intended for developers
          if (name !== 'testMessage') broadcastEvent(name, message)
        },
        testVoice: ({ voice }) => {
          // Escape voice name when passing as text as precaution to clean
          // input (NB: voice name argument is checked internally)
          const text = `Voice assistant will use ${voice.replace(/[^a-z0-9 -]/gi, '')}`
          this.textToSpeech.speak(text, voice, true)
        },
        toggleSwitch: async ({ switchName }) => {
          // TODO Refactor this out into a dedicated library
          try {
            let KEYBINDS_FILE
            const KEYBIND_XML_ELEMENT = KEYBINDS_MAP[switchName]

            if (fs.existsSync(KEYBINDS_FILE_V4_1)) {
              KEYBINDS_FILE = KEYBINDS_FILE_V4_1
            } else if (fs.existsSync(KEYBINDS_FILE_V4)) {
              KEYBINDS_FILE = KEYBINDS_FILE_V4
            } else if (fs.existsSync(KEYBINDS_FILE_V3)) {
              KEYBINDS_FILE = KEYBINDS_FILE_V3
            }

            const keyBinds = fs.readFileSync(KEYBINDS_FILE).toString()

            const doc = pjXML.parse(keyBinds)
            const primaryElement = doc.select(`//${KEYBIND_XML_ELEMENT}/Primary`)
            const primaryKey = convertEliteDangerousKeyBindingToInputKey(primaryElement?.attributes?.Key)
            const primaryElementModifier = doc.select(`//${KEYBIND_XML_ELEMENT}/Primary/Modifier`)
            const secondaryElement = doc.select(`//${KEYBIND_XML_ELEMENT}/Secondary`)
            const secondaryKey = convertEliteDangerousKeyBindingToInputKey(secondaryElement?.attributes?.Key)
            const secondaryElementModifier = doc.select(`//${KEYBIND_XML_ELEMENT}/Secondary/Modifier`)

            let keyToSend, modifierKey
            if (primaryElement?.attributes?.Device === 'Keyboard') {
              keyToSend = primaryKey.toLowerCase()
              modifierKey = primaryElementModifier?.attributes?.Key.replace(/^Key_/, '').toLowerCase()
            } else if (secondaryElement?.attributes?.Device === 'Keyboard') {
              keyToSend = secondaryKey.toLowerCase()
              modifierKey = secondaryElementModifier?.attributes?.Key.replace(/^Key_/, '').toLowerCase()
            } else {
              console.log('No keyboard binding available for', KEYBINDS_MAP[switchName], "to toggle switch", switchName)
              return false
            }

            if (modifierKey) {
              if (modifierKey.includes('shift')) modifierKey = 'shift'
              else if (modifierKey.includes('control')) modifierKey = 'ctrl'
              else if (modifierKey.includes('alt')) modifierKey = 'alt'
              else {
                console.log('Modifier key', modifierKey, 'for binding ', KEYBINDS_MAP[switchName], "to toggle switch", switchName, 'is not supported')
                return false
              }
            }

            // Set up hardware reference
            const hardware = new keysender.Hardware(TARGET_WINDOW_TITLE)

            // Trigger key input
            if (modifierKey) {
              console.log('Sending key', keyToSend, 'with modifier', modifierKey, 'for binding ', KEYBINDS_MAP[switchName], 'to toggle switch', switchName)
              await hardware.keyboard.sendKey([modifierKey, keyToSend])
            } else {
              console.log('Sending key', keyToSend, 'for binding ', KEYBINDS_MAP[switchName], 'to toggle switch', switchName)
              await hardware.keyboard.sendKey(keyToSend)
            }
            return true
          } catch (e) {
            console.error('ERROR_SENDING_KEY', switchName, e.toString())
            return false
          }
        }
      }
    }
    return this.eventHandlers
  }
}

function convertEliteDangerousKeyBindingToInputKey(rawKeyValue) {
  const key = rawKeyValue.replace(/^Key_/, '').toUpperCase()
  // TODO I'm very sure there are more of these special cases.
  // I'm not sure why Elite does keybindings this way or how many
  // special cases there are. I hope someone has reverse engineered it
  // already.
  if (key === 'semicolon') return ';'
  if (key === 'rightbracket') return ']'
  if (key === 'leftbracket') return '['
  if (key === 'hash') return '#'
  if (key === 'backslash') return '\\'
  return key
}

module.exports = EventHandlers
