const fs = require('fs')
const path = require('path')

module.exports = class Data {
  constructor (asset) {
    this.asset = asset
    // For pkg: data files are copied next to the exe
    // For dev: use relative path from lib folder
    const isPkg = typeof process.pkg !== 'undefined'
    const dataPath = isPkg
      ? path.join(path.dirname(process.execPath), 'data', `${asset}.json`)
      : path.join(__dirname, '..', 'data', `${asset}.json`)

    this.data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  }

  getBySymbol (itemSymbol) {
    let result
    Object.values(this.data).some(item => {
      if (item?.symbol?.toLowerCase() === itemSymbol?.toLowerCase()) {
        result = item
        return true
      }
      return false
    })

    // if (!result) console.error('Lookup failed', this.asset, itemSymbol)

    return result
  }
}
