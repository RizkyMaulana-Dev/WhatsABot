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
let waPhone = null;
let waPushname = null;

const commonConfig = {
  sessionId: 'WhatsABot',
  authTimeout: 120,
  blockCrashLogs: true,
  disableSpins: true,
  headless: true,
  hostNotificationLang: 'id-id',
  logConsole: false,
  qrTimeout: 0,
  useChrome: false,
  chromiumArgs: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  sessionDataPath: path.join(__dirname, '..', '.wa-sessions'),
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

    // Real phone number of the connected account
    try {
      const me = await client.getMe();
      if (me) {
        waPhone = me.id?.user ? '+' + me.id.user : (me.phoneNumber || me.wid?.user || '');
        if (me.pushname) waPushname = me.pushname;
      }
      if (!waPhone) {
        const wapi = await client.evaluate(() => window.Store?.Me?.wid?.user || window.WAPI?.getMe?.()?.wid?.user || '');
        if (wapi) waPhone = '+' + String(wapi).replace(/[^0-9]/g, '');
      }
    } catch (e) { console.error('[ME]', e.message); }
    console.log('[WA] Phone:', waPhone, waPushname ? `(${waPushname})` : '');

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
  ok(res, { connected: clientReady, state: waState, botActive, hasQr: !!qrDataUrl, phoneNumber: waPhone || null, pushname: waPushname || null });
});

app.get('/api/qr', (req, res) => ok(res, { qr: qrDataUrl }));

// Pairing via phone number is unsupported by current WhatsApp Web (window.linkCode removed).
// Always steer to the QR flow.
app.get('/api/pairing-code', (req, res) => {
  err(res, new Error('Pairing via nomor tidak didukung WhatsApp Web — silakan scan QR'));
});

// Live chats with last message
app.get('/api/chats', async (req, res) => {
  if (!clientReady || !client) return err(res, new Error('Not connected'));
  try {
    // getAllChatsWithMessages may not exist; fallback to getAllChats + loadMessages
    let chats = [];
    if (typeof client.getAllChatsWithMessages === 'function') {
      chats = await client.getAllChatsWithMessages({ limit: 50 });
    } else if (typeof client.getAllChats === 'function') {
      chats = await client.getAllChats({ limit: 50 });
      // load messages for each chat
      for (const chat of chats) {
        try {
          const msgs = await client.getMessages(chat.id || chat.wid, { limit: 1 });
          chat.lastMessage = msgs[0] || null;
        } catch (e) { chat.lastMessage = null; }
      }
    } else {
      // last resort: evaluate WAPI
      const wapiChats = await client.evaluate(() => window.Store?.Chat?.models?.map(c => ({
        id: c.id._serialized,
        name: c.name || c.contact?.pushname || c.contact?.name || c.contact?.shortName || 'Unknown',
        isGroup: c.isGroup,
        lastMessage: c.lastMsg ? { body: c.lastMsg.body, timestamp: c.lastMsg.t, fromMe: c.lastMsg.fromMe, sender: c.lastMsg.senderObj?.pushname } : null,
        unreadCount: c.unreadCount || 0,
      })) || []);
      chats = wapiChats;
    }
    // Map to consistent shape
    const mapped = chats.map(c => ({
      id: c.id || c.wid || c.id?._serialized,
      name: c.name || c.contact?.pushname || c.contact?.name || c.contact?.shortName || 'Unknown',
      isGroup: !!c.isGroup,
      unreadCount: c.unreadCount || 0,
      lastMessage: c.lastMessage ? {
        body: c.lastMessage.body || c.lastMessage.text || '',
        time: c.lastMessage.timestamp ? new Date(c.lastMessage.timestamp * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        fromMe: c.lastMessage.fromMe,
        sender: c.lastMessage.sender || c.lastMessage.senderObj?.pushname
      } : null
    }));
    ok(res, { chats: mapped });
  } catch (e) {
    console.error('[CHATS]', e.message);
    err(res, e);
  }
});

// Chat messages for a specific chat
app.get('/api/chat/:id/messages', async (req, res) => {
  if (!clientReady || !client) return err(res, new Error('Not connected'));
  try {
    const chatId = req.params.id;
    let msgs = [];
    if (typeof client.getMessages === 'function') {
      msgs = await client.getMessages(chatId, { limit: 100 });
    } else if (typeof client.getChatMessages === 'function') {
      msgs = await client.getChatMessages(chatId, { limit: 100 });
    } else {
      msgs = await client.evaluate((id) => {
        const chat = window.Store?.Chat?.get(id);
        if (!chat) return [];
        return Array.from(chat.msgs?.models || []).slice(-100).map(m => ({
          id: m.id._serialized,
          body: m.body,
          timestamp: m.t,
          fromMe: m.fromMe,
          sender: m.senderObj?.pushname
        }));
      }, chatId);
    }
    const mapped = msgs.map(m => ({
      id: m.id || m.id?._serialized,
      body: m.body,
      time: m.timestamp ? new Date(m.timestamp * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      fromMe: m.fromMe,
      sender: m.sender
    }));
    ok(res, { messages: mapped });
  } catch (e) {
    console.error('[CHAT-MESSAGES]', e.message);
    err(res, e);
  }
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