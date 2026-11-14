import { OpenWAClient, SessionResponse, SendTextRequest } from '@rmyndharis/openwa';

const OPENWA_BASE_URL = __DEV__ ? 'http://10.0.2.2:2785' : 'https://your-openwa-domain.com';
const OPENWA_API_KEY = 'owa_k1_your_api_key_here';

export const openwaClient = new OpenWAClient({
  baseUrl: OPENWA_BASE_URL,
  apiKey: OPENWA_API_KEY,
  timeoutMs: 30000,
});

export interface WhatsAppSession {
  id: string;
  name: string;
  status: string;
  phone?: string | null;
  pushName?: string | null;
}

export async function createSession(name: string): Promise<SessionResponse> {
  return openwaClient.sessions.create({ name });
}

export async function startSession(sessionId: string): Promise<SessionResponse> {
  return openwaClient.sessions.start(sessionId);
}

export async function getQrCode(sessionId: string): Promise<string> {
  const result = await openwaClient.sessions.getQrCode(sessionId);
  return result.qrCode;
}

export async function sendTextMessage(
  sessionId: string,
  chatId: string,
  text: string
): Promise<{ messageId: string }> {
  const body: SendTextRequest = { chatId, text };
  return openwaClient.messages.sendText(sessionId, body);
}

export async function listSessions(): Promise<WhatsAppSession[]> {
  const sessions = await openwaClient.sessions.list();
  return sessions.map(s => ({
    id: s.id,
    name: s.name,
    status: s.status,
    phone: s.phone,
    pushName: s.pushName,
  }));
}

export async function getSessionStatus(sessionId: string): Promise<SessionResponse> {
  return openwaClient.sessions.get(sessionId);
}