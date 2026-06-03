import { useState, useEffect } from 'react'
import '@material/web/all.js'
import type { HalHome } from './types/HalHome'

function App() {
  const [status, setStatus] = useState<string>('Loading...')

  useEffect(() => {
    fetch('/api/v1/home')
      .then(res => res.json())
      .then((data: HalHome) => setStatus(data.status))
      .catch(() => setStatus('Failed to load status.'))
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Encounters of the Void</h1>
      <md-filled-card style={{ padding: '1.5rem', maxWidth: '480px' }}>
        <p data-testid="status-message">{status}</p>
      </md-filled-card>
    </div>
  )
}

export default App
