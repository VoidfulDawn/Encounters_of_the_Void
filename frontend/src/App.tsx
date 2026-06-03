import { useState, useEffect } from 'react'
import '@material/web/labs/card/filled-card.js'
import type { HalHome } from './types/HalHome'

function App() {
  const [status, setStatus] = useState<string>('Loading...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/v1/home')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: HalHome = await res.json()
        setStatus(data.status)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }
    load()
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Encounters of the Void</h1>
      {error ? (
        <p className="error">{error}</p>
      ) : (
        <md-filled-card style={{ padding: '1.5rem', maxWidth: '480px' }}>
          <p data-testid="status-message">{status}</p>
        </md-filled-card>
      )}
    </div>
  )
}

export default App
