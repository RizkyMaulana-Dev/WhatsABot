const path = require('path');
const express = require('express');
const { createClient } = require('@open-wa/wa-automate');
const { PuppeteerDriver } = require('@open-wa/driver-puppeteer');
const { commands } = require('./plugins');

const app = express();
app.use(express.json());
const PORT = 2785;

let core;       // @open-wa/core client object
let waClient;   // wrapper Client (methods like sendText, onMessage)
let botActive = true;
const recentMessages = [];
let clientReady = false;
let waState = 'starting';
let qrCode = null;

async function initWA() {
  try {
    const driver = new PuppeteerDriver();
    
    core = await createClient({
      sessionId: 'WhatsABot',
      driver,
      headless: true,
      browserArgs: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      allowDangerousBrowserArgs: true,
      blockCrashLogs: true,
      qrTimeoutMs: 0,
      authTimeoutMs: 120000,
      sessionDataPath: path.join(__dirname, '..', '.wa-sessions'),
      sessionData: 'WhatsABot-session',
      logConsole: false,
    });

    // Listen for QR events to capture code before auth
    core.events.on?.('launch.auth.qr.generated', (evt) => {
      if (evt?.details?.qr) {
        qrCode = evt.details.qr;
        console.log('[QR]', qrCode.slice(0, 60));
      }
    });
    
    core.events.on?.('session.state.changed', (evt) => {
      const state = evt?.details?.next || evt?.details?.state || 'UNKNOWN';
      console.log('[STATE]', state);
      waState = state;
      clientReady = state === 'READY' || state === 'CONNECTED';
      if (clientReady) {
        // Wrap the core client as a usable WhatsApp API client
        waClient = buildClient(core);
      }
    });
    
    // Start the client without awaiting - let it run in background
    core.start().catch(e => console.error('[START ERROR]', e.message));
    
  } catch (e) {
    console.error('[WA INIT ERROR]', e.message);
    clientReady = false;
  }
}

// Build a compatible wrapper around the core client
function buildClient(core) {
  const proxy = new Proxy(core, {
    get(target, prop, receiver) {
      if (prop === 'sendText') {
        return async (to, text) => target.evaluate(() => WAPI.sendMessage(to, text));
      }
      if (prop === 'getState') return () => target.getState();
      if (prop === 'kill') return () => target.stop('LOGGED_OUT');
      if (prop === 'requestPairingCode') {
        return async (phone) => {
          // Use evaluate to call the underlying function
          return target.evaluate((p) => globalThis._WAPI?.pairingRequestCode?.(p), phone);
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  });
  
  // onStateChanged: listen to session.state.changed event
  proxy.onStateChanged = (fn) => {
    core.events.on?.('session.state.changed', (evt) => fn(evt?.details?.next || evt?.details?.state || 'UNKNOWN'));
  };
  
  // onMessage: use message events
  proxy.onMessage = (fn) => {
    core.events.on?.('message', async (msg) => {
      recentMessages.unshift({
        id: msg.id,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        sender: msg.sender?.pushname || msg.from,
        preview: msg.body?.slice(0, 80),
      });
      if (recentMessages.length > 20) recentMessages.pop();
      if (!botActive || !msg.body?.startsWith('.')) return;
      const trigger = msg.body.split(' ')[0].toLowerCase();
      const cmd = commands[trigger];
      if (cmd) {
        try { await cmd.execute(proxy, msg); } catch (e) { console.error('[CMD ERR]', e.message); }
      }
      await fn(msg);
    });
  };
  
  return proxy;
}

const ok = (res, data) => res.json({ ok: true, ...data });
const err = (res, e) => res.status(500).json({ ok: false, error: e.message });

app.get('/api/status', (req, res) => {
  ok(res, { connected: clientReady, state: waState, botActive, qrAvailable: !!qrCode });
});

app.get('/api/qr', async (req, res) => {
  if (qrCode) return ok(res, { qr: qrCode });
  if (!core) return ok(res, { qr: null });
  try {
    const qr = await core.evaluate?.(() => {
      const el = document.querySelector('canvas') || document.querySelector('[data-ref] img');
      return el?.toDataURL?.() || el?.src || null;
    }).catch(() => null);
    ok(res, { qr: qr || qrCode });
  } catch { ok(res, { qr: qrCode }); }
});

app.get('/api/pairing-code', async (req, res) => {
  if (!clientReady) return err(res, new Error('Not ready - scan QR first'));
  try { ok(res, { code: await waClient.requestPairingCode(req.query.phone) }); } catch (e) { err(res, e); }
});

app.post('/api/disconnect', async (req, res) => {
  try {
    await core?.stop('LOGGED_OUT');
    core = null; waClient = null; clientReady = false; qrCode = null; waState = 'disconnected';
    ok(res, {});
  } catch (e) { err(res, e); }
});

app.post('/api/reconnect', async (req, res) => {
  try { if (!core) initWA(); ok(res, {}); } catch (e) { err(res, e); }
});

app.post('/api/bot/toggle', (req, res) => {
  botActive = !botActive;
  ok(res, { botActive });
});

app.post('/api/send', async (req, res) => {
  if (!clientReady || !waClient) return err(res, new Error('Not connected'));
  try { await waClient.sendText(req.body.to, req.body.text); ok(res, {}); } catch (e) { err(res, e); }
});

app.get('/api/messages', (req, res) => ok(res, { messages: recentMessages }));

app.use(express.static(path.join(__dirname, '..', 'web')));

app.listen(PORT, () => {
  console.log(`WhatsABot server on http://localhost:${PORT}`);
  console.log('Scanning QR code... Open http://localhost:2785 in browser');
  initWA().catch(e => console.error('[INIT]', e.message));
});

process.on('SIGINT', async () => {
  try { await core?.stop('EXIT'); } catch {}
  process.exit();
});