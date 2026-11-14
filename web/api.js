// API client for WhatsABot backend (global, loaded before inline script)
const BASE = '/api';

async function apiRequest(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
  return res.json();
}

const api = {
  status: () => apiRequest('/status'),
  qr: () => apiRequest('/qr'),
  pairingCode: (phone) => apiRequest(`/pairing-code?phone=${encodeURIComponent(phone)}`),
  disconnect: () => apiRequest('/disconnect', { method: 'POST' }),
  reconnect: () => apiRequest('/reconnect', { method: 'POST' }),
  toggleBot: () => apiRequest('/bot/toggle', { method: 'POST' }),
  sendText: (to, text) => apiRequest('/send', { method: 'POST', body: JSON.stringify({ to, text }) }),
  messages: () => apiRequest('/messages'),
};