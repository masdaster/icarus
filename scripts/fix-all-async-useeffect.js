const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Find all JS files with async useEffect
const files = glob.sync('src/client/**/*.js')

let totalFixed = 0

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8')
  let modified = false

  // Pattern: useEffect(async () => {
  const asyncUseEffectRegex = /useEffect\(async\s*\(\)\s*=>\s*\{/g

  if (asyncUseEffectRegex.test(content)) {
    console.log(`Fixing: ${file}`)

    // Replace async useEffect with IIFE wrapper
    content = content.replace(
      /useEffect\(async\s*\(\)\s*=>\s*\{/g,
      'useEffect(() => {\n    (async () => {'
    )

    // Now we need to close the IIFE before the useEffect closes
    // This is tricky - we need to find the matching closing brace
    // For now, let's use a simpler approach: find }, [) pattern and add })() before it
    content = content.replace(
      /(\n\s*)\},\s*\[/g,
      '$1  })()\n  }, ['
    )

    modified = true
    totalFixed++
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8')
    console.log(`  ✓ Fixed`)
  }
})

console.log(`\nTotal files fixed: ${totalFixed}`)
