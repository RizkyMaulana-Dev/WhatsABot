const path = require('path');
const express = require('express');
const { create } = require('@open-wa/wa-automate');
const { commands } = require('./plugins');

const app = express();
app.use(express.json());
const PORT = 2785;

let client;
let botActive = true;
const recentMessages = [];

async function initWA() {
  client = await create({
    sessionId: 'WhatsABot',
    authTimeout: 60,
    blockCrashLogs: true,
    disableSpins: true,
    headless: true,
    hostNotificationLang: 'ID_ID',
    logConsole: false,
    qrTimeout: 0,
    useChrome: false,
  });

  client.onQrCode((qr) => console.log('[QR]', qr.slice(0, 40) + '...'));
  client.onStateChange((state) => console.log('[STATE]', state));
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
}

const ok = (res, data) => res.json({ ok: true, ...data });
const err = (res, e) => res.status(500).json({ ok: false, error: e.message });

app.get('/api/status', (req, res) => {
  if (!client) return ok(res, { connected: false, state: 'starting', botActive });
  ok(res, { connected: client.getState ? ['CONNECTED', 'OPENING'].includes(client.getState?.() || 'CONNECTED') : true, state: client.getState?.() || 'UNKNOWN', botActive });
});

app.get('/api/qr', async (req, res) => {
  try { ok(res, { qr: await client.getQrCode() }); } catch (e) { err(res, e); }
});

app.get('/api/pairing-code', async (req, res) => {
  try { ok(res, { code: await client.requestPairingCode(req.query.phone) }); } catch (e) { err(res, e); }
});

app.post('/api/disconnect', async (req, res) => {
  try { await client.kill(); client = null; ok(res, {}); } catch (e) { err(res, e); }
});

app.post('/api/reconnect', async (req, res) => {
  try { if (!client) await initWA(); ok(res, {}); } catch (e) { err(res, e); }
});

app.post('/api/bot/toggle', (req, res) => {
  botActive = !botActive;
  ok(res, { botActive });
});

app.post('/api/send', async (req, res) => {
  try { await client.sendText(req.body.to, req.body.text); ok(res, {}); } catch (e) { err(res, e); }
});

app.get('/api/messages', (req, res) => ok(res, { messages: recentMessages }));

app.use(express.static(path.join(__dirname, '..', 'web')));

app.listen(PORT, () => {
  console.log(`WhatsABot server on http://localhost:${PORT}`);
  initWA().catch(e => console.error('[WA INIT]', e.message));
});

process.on('SIGINT', async () => {
  try { await client?.kill(); } catch {}
  process.exit();
});
