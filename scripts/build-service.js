const fs = require('fs')
const path = require('path')
const { exec } = require('@yao-pkg/pkg')
const UPX = require('upx')({ brute: false }) // Brute on service seems to hang
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const commandLineArgs = yargs(hideBin(process.argv)).argv

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
const COMPRESS_FINAL_BUILD = false

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
  // pkg arguments
  const args = [
    ENTRY_POINT,
    '--target', 'node24-win-x64',
    '--output', SERVICE_UNOPTIMIZED_BUILD,
    '--assets', path.join(BUILD_DIR, 'client/**/*')
  ]

  console.log('Building with pkg (Node.js 24)...')
  await exec(args)

  console.log('Copying to final location...')
  fs.copyFileSync(SERVICE_UNOPTIMIZED_BUILD, SERVICE_FINAL_BUILD)

  // Copy data files next to exe for runtime access
  console.log('Copying service data files...')
  const dataSource = path.join(__dirname, '..', 'src', 'service', 'data')
  const dataTarget = path.join(BIN_DIR, 'data')

  if (!fs.existsSync(dataTarget)) {
    fs.mkdirSync(dataTarget, { recursive: true })
  }

  // Copy entire data directory
  const copyRecursive = (src, dest) => {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })

    fs.readdirSync(src).forEach(item => {
      const srcPath = path.join(src, item)
      const destPath = path.join(dest, item)

      if (fs.statSync(srcPath).isDirectory()) {
        copyRecursive(srcPath, destPath)
      } else {
        fs.copyFileSync(srcPath, destPath)
      }
    })
  }

  copyRecursive(dataSource, dataTarget)
  console.log(`Copied data files to ${dataTarget}`)

  // Copy client files next to exe for runtime access (pkg mode)
  console.log('Copying client files for pkg mode...')
  const clientSource = path.join(BUILD_DIR, 'client')
  const clientTarget = path.join(BIN_DIR, 'client')

  if (fs.existsSync(clientSource)) {
    copyRecursive(clientSource, clientTarget)
    console.log(`Copied client files to ${clientTarget}`)
  } else {
    console.warn('Warning: Client build directory not found. Run "npm run build:client" first.')
  }

  // Note: rcedit modifies PE headers and corrupts pkg binaries
  // Icon/VersionInfo must be set before pkg bundling or using alternative tools
  console.log('Build complete!')
  console.log('Note: Icon/VersionInfo not set (rcedit corrupts pkg binaries)')
}
