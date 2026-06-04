import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConnectivityWatch, stopConnectivityWatch } from './connectivity'

beforeEach(() => {
  vi.useFakeTimers()
  document.body.innerHTML = ''
})

afterEach(() => {
  stopConnectivityWatch()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('connectivity', () => {
  it('shows banner on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await startConnectivityWatch('/api/v1/status')
    const banner = document.querySelector('[data-testid="offline-banner"]')
    expect(banner).not.toBeNull()
    expect(banner?.textContent).toBe('Website is offline')
  })

  it('shows banner on HTTP 503', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))
    await startConnectivityWatch('/api/v1/status')
    expect(document.querySelector('[data-testid="offline-banner"]')).not.toBeNull()
  })

  it('shows no banner on HTTP 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }))
    await startConnectivityWatch('/api/v1/status')
    expect(document.querySelector('[data-testid="offline-banner"]')).toBeNull()
  })

  it('removes banner on recovery without reload', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, status: 200 })
    vi.stubGlobal('fetch', fetchMock)

    await startConnectivityWatch('/api/v1/status')
    expect(document.querySelector('[data-testid="offline-banner"]')).not.toBeNull()

    await vi.advanceTimersByTimeAsync(10_000)
    expect(document.querySelector('[data-testid="offline-banner"]')).toBeNull()
  })

  it('only creates one banner when called twice', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await startConnectivityWatch('/api/v1/status')
    await startConnectivityWatch('/api/v1/status')
    expect(document.querySelectorAll('[data-testid="offline-banner"]').length).toBe(1)
  })

  it('clears interval on recovery so no further retries run', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, status: 200 })
    vi.stubGlobal('fetch', fetchMock)

    await startConnectivityWatch('/api/v1/status')
    await vi.advanceTimersByTimeAsync(10_000)  // trigger retry → recovery

    // Interval should be cleared — no more fetch calls on subsequent timer ticks
    await vi.advanceTimersByTimeAsync(10_000)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
