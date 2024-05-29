import { sendEvent, useSocket } from 'lib/socket'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function CodexPage() {
  const router = useRouter()
  const { query } = router
  const { connected } = useSocket()
  const [codexEntries, setCodexEntries] = useState()
  const [codexEntry, setCodexEntry] = useState()

  useEffect(() => {
    async function core() {
      if (query.name) {
        const newCodexEntry = await sendEvent('getCodexEntry', { name: query.name })
        setCodexEntry(newCodexEntry || null)
      } else {
        setCodexEntry(null)
      }

      if (!codexEntries) {
        setCodexEntries(await sendEvent('getCodexEntries'))
      }
    }

    if (!connected || !router.isReady) return
    core()
  }, [connected, router.isReady, query])

  if (codexEntry) {
    return <CodexEntry codexEntry={codexEntry} />
  } else {
    return <CodexEntries codexEntries={codexEntries} />
  }
}

function CodexEntry({ codexEntry }) {
  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>{codexEntry.title}</h1>
      <div className='text-primary' dangerouslySetInnerHTML={{ __html: codexEntry.text.replace(/\n/g, '<br/>') }} />
      <hr style={{ marginTop: '1rem' }} />
      <Link href='codex'>
        <a className='text-link text-uppercase'><span className='text-link-text'>Back</span></a>
      </Link>
    </div>
  )
}

function CodexEntries({ codexEntries }) {
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Codex</h1>
      {codexEntries && Object.keys(codexEntries.index).map(codexEntry =>
        <p>
          <Link href={`codex?name=${codexEntry}`}>
            <a className='text-link text-uppercase'><span className='text-link-text'>{codexEntry}</span></a>
          </Link>
        </p>
      )}
    </div>
  )
}
