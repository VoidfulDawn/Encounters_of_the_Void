import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'

const mockHalResponse = {
  status: 'Everything is working.',
  _links: {
    self: { href: 'http://localhost:8080/api/v1/home' },
    status: { href: 'http://localhost:8080/api/v1/status' },
  },
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHalResponse),
    })
  )
})

describe('App', () => {
  it('displays the status message from the HAL API', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByTestId('status-message')).toHaveTextContent(
        'Everything is working.'
      )
    })
  })

  it('shows error state when fetch returns non-2xx', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    )
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText(/HTTP 500/i)).toBeInTheDocument()
    })
  })
})
