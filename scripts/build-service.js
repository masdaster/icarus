const fs = require('fs')
const path = require('path')
const { compile } = require('nexe')
//const changeExe = require('changeexe')
const UPX = require('upx')({ brute: false }) // Brute on service seems to hang
const yargs = require('yargs')
const commandLineArgs = yargs.argv

const {
  DEVELOPMENT_BUILD: DEVELOPMENT_BUILD_DEFAULT,
  DEBUG_CONSOLE: DEBUG_CONSOLE_DEFAULT,
  BUILD_DIR,
  BIN_DIR,
  SERVICE_UNOPTIMIZED_BUILD,
  SERVICE_OPTIMIZED_BUILD,
  SERVICE_FINAL_BUILD,
  SERVICE_ICON,
  SERVICE_VERSION_INFO
} = require('./lib/build-options')

const DEVELOPMENT_BUILD = commandLineArgs.debug || DEVELOPMENT_BUILD_DEFAULT
const DEBUG_CONSOLE = commandLineArgs.debug || DEBUG_CONSOLE_DEFAULT
const ENTRY_POINT = path.join(__dirname, '..', 'src', 'service', 'main.js')
const COMPRESS_FINAL_BUILD = true

;(async () => {
  clean()
  await build()
})()

function clean () {
  if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR, { recursive: true })
  if (!fs.existsSync(BIN_DIR)) fs.mkdirSync(BIN_DIR, { recursive: true })
  if (fs.existsSync(SERVICE_UNOPTIMIZED_BUILD)) fs.unlinkSync(SERVICE_UNOPTIMIZED_BUILD)
  if (fs.existsSync(SERVICE_OPTIMIZED_BUILD)) fs.unlinkSync(SERVICE_OPTIMIZED_BUILD)
  if (fs.existsSync(SERVICE_FINAL_BUILD)) fs.unlinkSync(SERVICE_FINAL_BUILD)
}

async function build () {
  await compile({
    name: 'ICARUS Service',
    ico: SERVICE_ICON,
    input: ENTRY_POINT,
    output: SERVICE_UNOPTIMIZED_BUILD,
    target: 'windows-x86-14.15.3', // from https://github.com/nexe/nexe/releases/tag/v3.3.3
    resources: [
      path.join(BUILD_DIR, 'client'), // Include web client
      'src/service/data' // Include dynamically loaded JSON files
    ],
    debug: DEBUG_CONSOLE,
    build: false,
    bundle: true,
    runtime: {
      nodeConfigureOpts: ['--fully-static']
    },
    // https://github.com/nodejs/node/blob/master/src/res/node.rc
    rc: SERVICE_VERSION_INFO
  })

  //await changeExe.icon(SERVICE_UNOPTIMIZED_BUILD, SERVICE_ICON)
  //await changeExe.versionInfo(SERVICE_UNOPTIMIZED_BUILD, SERVICE_VERSION_INFO)

  if (DEVELOPMENT_BUILD) {
    console.log('Development build (skipping compression)')
    fs.copyFileSync(SERVICE_UNOPTIMIZED_BUILD, SERVICE_FINAL_BUILD)
  } else {
    if (COMPRESS_FINAL_BUILD) {
      console.log('Optimizing service build...')
      const optimisationStats = await UPX(SERVICE_UNOPTIMIZED_BUILD)
        .output(SERVICE_OPTIMIZED_BUILD)
        .start()
      fs.copyFileSync(SERVICE_OPTIMIZED_BUILD, SERVICE_FINAL_BUILD)
      console.log('Optimized service build', optimisationStats)
    } else {
      console.log('Compression disabled (skipping service build optimization)')
      fs.copyFileSync(SERVICE_UNOPTIMIZED_BUILD, SERVICE_FINAL_BUILD)
    }
  }
}
