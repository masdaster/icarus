const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const changeExe = require('changeexe')
const UPX = require('upx')({ brute: true })
const yargs = require('yargs')
const commandLineArgs = yargs.argv

const {
  DEVELOPMENT_BUILD: DEVELOPMENT_BUILD_DEFAULT,
  DEBUG_CONSOLE: DEBUG_CONSOLE_DEFAULT,
  BUILD_DIR,
  BIN_DIR,
  RESOURCES_DIR,
  APP_UNOPTIMIZED_BUILD,
  APP_OPTIMIZED_BUILD,
  APP_FINAL_BUILD,
  APP_ICON,
  APP_VERSION_INFO
} = require('./lib/build-options')

const DEVELOPMENT_BUILD = commandLineArgs.debug || DEVELOPMENT_BUILD_DEFAULT
const DEBUG_CONSOLE = commandLineArgs.debug || DEBUG_CONSOLE_DEFAULT
const COMPRESS_FINAL_BUILD = false

  ; (async () => {
    clean()
    await build()
    copy()
  })()

function clean() {
  if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR, { recursive: true })
  if (!fs.existsSync(BIN_DIR)) fs.mkdirSync(BIN_DIR, { recursive: true })
  if (fs.existsSync(APP_UNOPTIMIZED_BUILD)) fs.unlinkSync(APP_UNOPTIMIZED_BUILD)
  if (fs.existsSync(APP_OPTIMIZED_BUILD)) fs.unlinkSync(APP_OPTIMIZED_BUILD)
  if (fs.existsSync(APP_FINAL_BUILD)) fs.unlinkSync(APP_FINAL_BUILD)
}

async function build() {
  if (DEBUG_CONSOLE) {
    // Build that opens console output to a terminal
    execSync(`cd src/app && go build -o "${APP_UNOPTIMIZED_BUILD}"`)
  } else {
    execSync(`cd src/app && go build -ldflags="-H windowsgui -s -w" -o "${APP_UNOPTIMIZED_BUILD}"`)
  }

  if (DEVELOPMENT_BUILD) {
    console.log('Development build (skipping compression)')
    fs.copyFileSync(APP_UNOPTIMIZED_BUILD, APP_OPTIMIZED_BUILD)
  } else {
    if (COMPRESS_FINAL_BUILD) {
      console.log('Optimizing app build...')
      const optimisationStats = await UPX(APP_UNOPTIMIZED_BUILD)
        .output(APP_OPTIMIZED_BUILD)
        .start()
        .catch(err => {
          console.log('Error compressing build', err)
          process.exit(1)
        })
      console.log('Optimized app build', optimisationStats)
    } else {
      console.log('Compression disabled (skipping service build optimization)')
      fs.copyFileSync(APP_UNOPTIMIZED_BUILD, APP_OPTIMIZED_BUILD)
    }
  }

  // Apply icon and resource changes after optimization
  await changeExe.icon(APP_OPTIMIZED_BUILD, APP_ICON)
  await changeExe.versionInfo(APP_OPTIMIZED_BUILD, APP_VERSION_INFO)
}

function copy() {
  fs.copyFileSync(APP_OPTIMIZED_BUILD, APP_FINAL_BUILD)
  // Resources required by the app
  fs.copyFileSync(path.join(RESOURCES_DIR, 'dll', 'webview.dll'), path.join(BIN_DIR, 'webview.dll'))
  fs.copyFileSync(path.join(RESOURCES_DIR, 'dll', 'WebView2Loader.dll'), path.join(BIN_DIR, 'WebView2Loader.dll'))
  // Icon copied to bin dir as used by the terminal at runtime when spawning
  // new windows so must be shipped alongside the binary.
  // It's also an embeded resource in each executable but it's easier to access
  // as a distinct asset (which is why a lot of Win32 programs do this).
  fs.copyFileSync(APP_ICON, path.join(BIN_DIR, 'icon.ico'))
}
