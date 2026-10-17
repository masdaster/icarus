const fs = require('fs')
const glob = require('glob')

// Find all JS files with async useEffect
const files = glob.sync('src/client/**/*.js')

let totalFixed = 0
const fixedFiles = []

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8')
  let modified = false
  const originalContent = content

  // Pattern: useEffect(async () => {
  // We'll use a more careful approach - only fix the pattern, not the content
  const lines = content.split('\n')
  const newLines = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check if this line has async useEffect
    if (/^\s*useEffect\(async\s*\(\)\s*=>\s*\{/.test(line)) {
      // Found async useEffect - we need to wrap the body in an IIFE
      const indent = line.match(/^(\s*)/)[1]

      // Replace async with regular function
      newLines.push(line.replace(/useEffect\(async\s*\(\)\s*=>\s*\{/, 'useEffect(() => {'))

      // Add IIFE start
      newLines.push(indent + '  (async () => {')

      // Now we need to find the closing of useEffect and add })() before it
      let braceCount = 1
      let j = i + 1
      const bodyLines = []

      while (j < lines.length && braceCount > 0) {
        const currentLine = lines[j]

        // Count braces
        for (const char of currentLine) {
          if (char === '{') braceCount++
          if (char === '}') braceCount--
        }

        if (braceCount === 0) {
          // This is the closing brace of useEffect
          // Check if it's the }, [dependencies]) pattern
          if (/^\s*\},\s*\[/.test(currentLine)) {
            // Add body lines with extra indentation
            bodyLines.forEach(bodyLine => {
              newLines.push('  ' + bodyLine)
            })
            // Close IIFE
            newLines.push(indent + '  })()')
            // Add the closing line
            newLines.push(currentLine)
          } else {
            // Just a closing brace
            bodyLines.forEach(bodyLine => {
              newLines.push('  ' + bodyLine)
            })
            newLines.push(indent + '  })()')
            newLines.push(currentLine)
          }
          i = j
          break
        } else {
          bodyLines.push(currentLine)
        }
        j++
      }

      modified = true
      totalFixed++
      fixedFiles.push(file)
    } else {
      newLines.push(line)
    }
  }

  if (modified) {
    const newContent = newLines.join('\n')
    fs.writeFileSync(file, newContent, 'utf8')
    console.log(`✓ Fixed: ${file}`)
  }
})

console.log(`\nTotal files fixed: ${totalFixed}`)
if (fixedFiles.length > 0) {
  console.log('\nFixed files:')
  fixedFiles.forEach(f => console.log(`  - ${f}`))
}
