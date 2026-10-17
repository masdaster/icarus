// The standalone build creates cross platform (Win/Mac/Linux) build of the
// service with pkg. Unlike the full release, this build does not feature
// an installer, auto-updating or a native UI and must be configured using
// command line options.
const fs = require('fs')
const path = require('path')
const { exec } = require('@yao-pkg/pkg')
// const UPX = require('upx')({ brute: false }) // Brute on service seems to hang
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const commandLineArgs = yargs(hideBin(process.argv)).argv

const {
  DEBUG_CONSOLE: DEBUG_CONSOLE_DEFAULT,
  BUILD_DIR,
  BIN_DIR,
  DIST_DIR,
  SERVICE_STANDALONE_BUILD,
  SERVICE_ICON
} = require('./lib/build-options')

const DEBUG_CONSOLE = commandLineArgs.debug || DEBUG_CONSOLE_DEFAULT
const ENTRY_POINT = path.join(__dirname, '..', 'src', 'service', 'main.js')

;(async () => {
  clean()
  await build()
})()

function clean () {
  if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR, { recursive: true })
  if (!fs.existsSync(BIN_DIR)) fs.mkdirSync(BIN_DIR, { recursive: true })
  if (fs.existsSync(DIST_DIR)) fs.rmdirSync(DIST_DIR, { recursive: true })
}

async function build () {
  const targets = [
    { platform: 'linux', target: 'node24-linux-x64' },
    { platform: 'mac', target: 'node24-macos-x64' },
    { platform: 'windows', target: 'node24-win-x64' }
  ]

  for (const { platform, target } of targets) {
    const output = `${SERVICE_STANDALONE_BUILD}-${platform}`
    console.log(`Building ${platform} standalone with pkg (Node.js 24)...`)

    await exec([
      ENTRY_POINT,
      '--target', target,
      '--output', output,
      '--assets', path.join(BUILD_DIR, 'client/**/*'),
      '--assets', 'src/service/data/**/*'
    ])

    console.log(`Built: ${output}`)
  }

  console.log('Note: Standalone builds require data folder next to executable')
}
