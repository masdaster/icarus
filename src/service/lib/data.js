const fs = require('fs')
const path = require('path')

module.exports = class Data {
  constructor (asset) {
    this.asset = asset
    const dataPath = path.join(__dirname, '..', 'data', `${asset}.json`)

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
