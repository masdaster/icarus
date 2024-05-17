import { eventListener, sendEvent, useSocket } from 'lib/socket'
import { useEffect, useState } from 'react'

function gameEventsToArray(gameEvents) {
  return Object.keys(gameEvents).map(event => {
    return {
      name: event,
      count: gameEvents[event]
    }
  }).sort((a, b) => a.count > b.count ? -1 : 0)
}

export default function EventTypesPanel() {
  const { connected } = useSocket()
  const [gameEvents, setGameEvents] = useState()

  useEffect(async () => {
    const message = await sendEvent('getLoadingStatus')
    setGameEvents(gameEventsToArray(message.eventTypesLoaded))
  }, [connected])

  useEffect(() => eventListener('loadingProgress', (message) => {
    setGameEvents(gameEventsToArray(message.eventTypesLoaded))
  }), [])

  return (
    <table>
      <thead>
        <tr>
          <th>Event name</th>
          <th className='text-right'>Number of events</th>
        </tr>
      </thead>
      <tbody>
        {gameEvents && gameEvents.map(event =>
          <tr key={event.name}>
            <td>{event.name}</td>
            <td className='text-right'>{event.count}</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
