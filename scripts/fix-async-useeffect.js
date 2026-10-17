const fs = require('fs')
const glob = require('glob')

// Find all JS files in src/client
const files = glob.sync('src/client/**/*.js')

let totalFixed = 0
const fixedFiles = []

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8')

  // Check if file has async useEffect
  if (/useEffect\(async\s*\(\)\s*=>\s*{/.test(content)) {
    console.log(`Found async useEffect in: ${file}`)
    fixedFiles.push(file)
    totalFixed++
  }
})

console.log(`\n========================================`)
console.log(`Total files with async useEffect: ${totalFixed}`)
console.log(`========================================\n`)

if (totalFixed > 0) {
  console.log('Files to fix:')
  fixedFiles.forEach(file => console.log(`  - ${file}`))
  console.log('\nThese files need manual review to properly handle async operations.')
  console.log('Use one of these patterns:')
  console.log('  1. Wrap in async IIFE: useEffect(() => { (async () => { ... })() }, [])')
  console.log('  2. Use .then(): useEffect(() => { fetchData().then(...) }, [])')
}
