/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Text, Button, ActivityIndicator, Alert, ScrollView, TextInput } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { openwaClient, createSession, startSession, getQrCode, sendTextMessage, listSessions, WhatsAppSession } from './src/services/openwa';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [chatId, setChatId] = useState('628123456789@c.us');
  const [messageText, setMessageText] = useState('Hello from WhatsABot!');

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await listSessions();
      setSessions(data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load sessions. Is OpenWA running?\n' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleCreateSession = async () => {
    setLoading(true);
    try {
      const session = await createSession(`session-${Date.now()}`);
      await startSession(session.id);
      const qr = await getQrCode(session.id);
      setQrCode(qr);
      setSelectedSessionId(session.id);
      loadSessions();
      Alert.alert('Session Created', 'Scan QR code to link WhatsApp');
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedSessionId) return Alert.alert('Error', 'Select a session first');
    setLoading(true);
    try {
      const result = await sendTextMessage(selectedSessionId, chatId, messageText);
      Alert.alert('Sent', `Message ID: ${result.messageId}`);
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = (id: string) => {
    setSelectedSessionId(id);
    setQrCode(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WhatsABot</Text>
      <Text style={styles.subtitle}>OpenWA WhatsApp Client</Text>

      {loading && <ActivityIndicator size="large" style={styles.loading} />}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sessions</Text>
        {sessions.length === 0 ? (
          <Text style={styles.empty}>No sessions. Create one below.</Text>
        ) : (
          <ScrollView style={styles.list} horizontal showsHorizontalScrollIndicator={false}>
            {sessions.map(s => (
              <Button
                key={s.id}
                title={`${s.name} (${s.status})`}
                onPress={() => handleSelectSession(s.id)}
                color={selectedSessionId === s.id ? '#007AFF' : '#333'}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.section}>
        <Button title="Create Session" onPress={handleCreateSession} disabled={loading} />
      </View>

      {qrCode && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QR Code (scan with WhatsApp)</Text>
          <Text style={styles.qrText}>{qrCode.substring(0, 80)}...</Text>
          <Text style={styles.hint}>Full data URL: data:image/png;base64,...</Text>
        </View>
      )}

      {selectedSessionId && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send Message</Text>
          <TextInput
            style={styles.input}
            placeholder="Chat ID (e.g., 628123456789@c.us)"
            value={chatId}
            onChangeText={setChatId}
          />
          <TextInput
            style={styles.input}
            placeholder="Message text"
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <Button title="Send Message" onPress={handleSendMessage} disabled={loading} />
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.hint}>
          OpenWA API: {__DEV__ ? 'http://10.0.2.2:2785' : 'https://your-domain.com'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  loading: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  empty: {
    color: '#999',
    fontStyle: 'italic',
  },
  list: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  qrText: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
});

export default App;
