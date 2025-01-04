const { UNKNOWN_VALUE } = require('../../../shared/consts')
const DataLoader = require('../data')
const engineersWithLocation = new DataLoader('engineers').data

class Engineers {
  constructor({ eliteLog, eliteJson }) {
    this.eliteLog = eliteLog
    this.eliteJson = eliteJson
    return this
  }

  async getEngineers() {
    const engineersWithProgress = await this.#getEngineersWithProgress()

    if (!engineersWithProgress) return null

    // Get all engineers the Cmdr knows about, and add location information
    const engineers = engineersWithProgress.map(engineer => {
      const engineerWithLocation = engineersWithLocation.filter(e => Number(e.id) === Number(engineer.EngineerID))[0]

      if (!engineerWithLocation) console.log('No location data for engineer', engineer)

      return {
        id: engineer.EngineerID,
        name: engineer.Engineer,
        description: engineerWithLocation.description,
        system: {
          address: engineerWithLocation?.systemAddress ?? UNKNOWN_VALUE,
          name: engineerWithLocation?.systemName ?? UNKNOWN_VALUE,
          position: engineerWithLocation?.systemPosition ?? UNKNOWN_VALUE
        },
        marketId: engineerWithLocation?.marketId ?? UNKNOWN_VALUE,
        progress: {
          status: engineer.Progress ?? UNKNOWN_VALUE,
          rank: engineer?.Rank ?? 0,
          rankProgress: engineer?.RankProgress ?? 0
        }
      }
    })

    // Add any and all engineers the Cmdr doesn't know about yet to the list
    // of engineers
    engineersWithLocation.forEach(engineer => {
      const engineerWithProgress = engineers.filter(e => Number(e.id) === Number(engineer.id))[0]
      if (!engineerWithProgress) {
        engineers.push({
          id: engineer.id,
          name: engineer.name,
          description: engineer.description,
          system: {
            address: engineer?.systemAddress ?? UNKNOWN_VALUE,
            name: engineer?.systemName ?? UNKNOWN_VALUE,
            position: engineer?.systemPosition ?? UNKNOWN_VALUE
          },
          marketId: engineer?.marketId ?? UNKNOWN_VALUE,
          progress: {
            status: UNKNOWN_VALUE,
            rank: 0,
            rankProgress: 0
          }
        })
      }
    })

    engineers.sort((a, b) => a.name.localeCompare(b.name))

    return engineers
  }

  async #getEngineersWithProgress() {
    const engineersWithProgressUpdates = []
    for (const event of await this.eliteLog.getEvents('EngineerProgress')) {
      if (!!event?.Engineers) {
        const engineersWithProgress = event.Engineers;
        for (const engineerWithProgressUpdate of engineersWithProgressUpdates) {
          const engineerWithProgress = engineersWithProgress.find(engineerWithProgress => engineerWithProgress.EngineerID == engineerWithProgressUpdate.EngineerID)
          engineerWithProgress.Progress = engineerWithProgressUpdate.Progress
          engineerWithProgress.Rank = engineerWithProgressUpdate.Rank
          engineerWithProgress.RankProgress = engineerWithProgressUpdate.RankProgress
        }
        return engineersWithProgress
      } else {
        engineersWithProgressUpdates.push({
          Engineer: event?.Engineer,
          EngineerID: event?.EngineerID,
          Progress: event?.Progress,
          Rank: event?.Rank,
          RankProgress: event?.RankProgress
        })
      }
    }
  }
}

module.exports = Engineers
