// Script to fix React Hydration errors by adding dynamic imports with ssr: false
const fs = require('fs')
const path = require('path')

const pagesDir = path.join(__dirname, '../src/client/pages')

const pagesToFix = [
  'nav/map.js',
  'nav/list.js',
  'nav/route.js',
  'ship/status.js',
  'ship/modules.js',
  'ship/inventory.js',
  'ship/cargo.js',
  'eng/blueprints.js',
  'eng/engineers.js',
  'eng/encoded-materials.js',
  'eng/manufactured-materials.js',
  'eng/raw-materials.js',
  'eng/xeno-materials.js',
  'log.js'
]

pagesToFix.forEach(pageFile => {
  const filePath = path.join(pagesDir, pageFile)

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipped: ${pageFile} (not found)`)
    return
  }

  let content = fs.readFileSync(filePath, 'utf8')

  // Skip if already has dynamic import
  if (content.includes('import dynamic from')) {
    console.log(`⏭️  Skipped: ${pageFile} (already has dynamic)`)
    return
  }

  // Find the export default function name
  const exportMatch = content.match(/export default function (\w+)/)
  if (!exportMatch) {
    console.log(`⚠️  Skipped: ${pageFile} (no export default function found)`)
    return
  }

  const functionName = exportMatch[1]
  const newFunctionName = functionName + 'Content'

  // Add dynamic import at the top
  content = content.replace(
    /^(import .* from 'react')/m,
    "$1\nimport dynamic from 'next/dynamic'\nimport Loader from 'components/loader'"
  )

  // Rename export default function
  content = content.replace(
    `export default function ${functionName}`,
    `function ${newFunctionName}`
  )

  // Add dynamic export at the end
  content = content.replace(
    /\n}\s*$/,
    `\n}\n\nexport default dynamic(() => Promise.resolve(${newFunctionName}), {\n  ssr: false,\n  loading: () => <Loader visible />\n})\n`
  )

  fs.writeFileSync(filePath, content, 'utf8')
  console.log(`✅ Fixed: ${pageFile}`)
})

console.log('\n🎉 Done! All pages fixed.')
