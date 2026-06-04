import './styles/offline-banner.css';

const DEFAULT_HEALTH_URL = '/api/v1/status';
const RETRY_INTERVAL_MS = 10_000;

let intervalId: ReturnType<typeof setInterval> | null = null;

function getBanner(): HTMLElement | null {
  return document.querySelector('[data-testid="offline-banner"]');
}

function showBanner(): void {
  if (getBanner()) return;
  const banner = document.createElement('div');
  banner.setAttribute('data-testid', 'offline-banner');
  banner.textContent = 'Website is offline';
  banner.className = 'offline-banner';
  document.body.insertBefore(banner, document.body.firstChild);
}

function hideBanner(): void {
  getBanner()?.remove();
}

async function checkHealth(url: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    return res.ok;
  } catch {
    return false;
  }
}

export async function startConnectivityWatch(healthUrl = DEFAULT_HEALTH_URL): Promise<void> {
  if (intervalId !== null) return;

  const online = await checkHealth(healthUrl);
  if (online) return;

  showBanner();
  intervalId = setInterval(async () => {
    const recovered = await checkHealth(healthUrl);
    if (recovered) {
      hideBanner();
      clearInterval(intervalId!);
      intervalId = null;
    }
  }, RETRY_INTERVAL_MS);
}

export function stopConnectivityWatch(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  hideBanner();
}
