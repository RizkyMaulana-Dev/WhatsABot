const path = require('path');
const QRCode = require('qrcode');
const express = require('express');
const { create, setCliOutputSink } = require('@open-wa/wa-automate');
const { commands } = require('./plugins');

const app = express();
app.use(express.json());
const PORT = 2785;

let client;           // wa-automate Client (methods: sendText, onMessage, getState, kill, requestPairingCode)
let botActive = true;
const recentMessages = [];
let clientReady = false;
let waState = 'starting';
let qrDataUrl = null;
let lastPairingCode = null;

const commonConfig = {
  sessionId: 'WhatsABot',
  authTimeout: 60,
  blockCrashLogs: true,
  disableSpins: true,
  headless: true,
  hostNotificationLang: 'id-id',
  logConsole: false,
  qrTimeout: 0,
  useChrome: false,
  chromiumArgs: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  sessionData: 'WhatsABot-session',
  sessionDataBucketAuth: false,
};

function installSink() {
  const sink = {
    write: (e) => { if (e.level !== 'debug') console.log(e.message); },
    status: () => {},
    qr: (payload) => {
      const raw = payload.qr;
      QRCode.toDataURL(raw, { width: 260, margin: 1 }, (e, url) => {
        if (!e) qrDataUrl = url;
        else console.error('[QR-ERR]', e.message);
      });
    }
  };
  setCliOutputSink(sink);
}

async function initWA() {
  try {
    waState = 'starting';
    qrDataUrl = null;

    installSink();

    // create() resolves after auth; QR captured via sink
    client = await create(commonConfig);
    
    clientReady = true;
    waState = 'connected';
    console.log('[WA] Connected and ready');

    client.onStateChanged((state) => {
      console.log('[STATE]', state);
      waState = state;
      clientReady = state === 'CONNECTED' || state === 'OPENING';
    });

    client.onMessage(async (message) => {
      recentMessages.unshift({
        id: message.id,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        sender: message.sender?.pushname || message.from,
        preview: message.body.slice(0, 80),
      });
      if (recentMessages.length > 20) recentMessages.pop();
      if (!botActive || !message.body.startsWith('.')) return;
      const trigger = message.body.split(' ')[0].toLowerCase();
      const cmd = commands[trigger];
      if (cmd) {
        console.log('[CMD]', trigger, 'from', message.from);
        try { await cmd.execute(client, message); } catch (e) { console.error('[CMD-ERR]', e.message); }
      }
    });
  } catch (e) {
    console.error('[WA INIT ERROR]', e.message);
    clientReady = false;
    waState = 'failed';
  }
}

const ok = (res, data) => res.json({ ok: true, ...data });
const err = (res, e) => res.status(500).json({ ok: false, error: e.message });

app.get('/api/status', (req, res) => {
  ok(res, { connected: clientReady, state: waState, botActive, hasQr: !!qrDataUrl });
});

app.get('/api/qr', (req, res) => ok(res, { qr: qrDataUrl }));

// Pairing via phone number is unsupported by current WhatsApp Web (window.linkCode removed).
// Always steer to the QR flow.
app.get('/api/pairing-code', (req, res) => {
  err(res, new Error('Pairing via nomor tidak didukung WhatsApp Web — silakan scan QR'));
});

app.post('/api/disconnect', async (req, res) => {
  if (!client) return ok(res, {});
  try { await client.kill(); client = null; clientReady = false; qrDataUrl = null; waState = 'disconnected'; ok(res, {}); } catch (e) { err(res, e); }
});

app.post('/api/reconnect', async (req, res) => {
  try { if (!client) initWA(); ok(res, {}); } catch (e) { err(res, e); }
});

app.post('/api/bot/toggle', (req, res) => {
  botActive = !botActive;
  ok(res, { botActive });
});

app.post('/api/send', async (req, res) => {
  if (!client || !client.sendText) return err(res, new Error('Not connected'));
  try { await client.sendText(req.body.to, req.body.text); ok(res, {}); } catch (e) { err(res, e); }
});

app.get('/api/messages', (req, res) => ok(res, { messages: recentMessages }));

app.use(express.static(path.join(__dirname, '..', 'web')));

app.listen(PORT, () => {
  console.log(`WhatsABot server on http://localhost:${PORT}`);
  console.log('Scan the QR in the dashboard to connect WhatsApp');
  initWA().catch(e => console.error('[INIT]', e.message));
});

process.on('SIGINT', async () => {
  try { await client?.kill(); } catch {}
  process.exit();
});