import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform as RNPlatform } from 'react-native';
import { Text, Button, Card, Title, Paragraph, List, Divider } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { theme } from '../theme/theme';

export default function ImportDataScreen() {
  const [log, setLog] = useState<string[]>([]);

  const appendLog = (line: string) => setLog(prev => [line, ...prev].slice(0, 50));

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/*', 'application/zip'],
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) return;
      const file = result.assets[0];
      appendLog(`Selected: ${file.name} (${file.size ?? 0} bytes)`);
      const uri = file.uri;
      const info = await FileSystem.getInfoAsync(uri, { size: true });
      if (!info.exists) {
        appendLog('File not found.');
        return;
      }
      if ((file.name || '').toLowerCase().includes('takeout')) {
        appendLog('Detected Google Takeout. Parsing…');
        // TODO: parse Google Ad Center / Takeout JSONs
      } else if ((file.name || '').toLowerCase().includes('facebook') || (file.name || '').toLowerCase().includes('instagram')) {
        appendLog('Detected Facebook/Instagram export. Parsing…');
        // TODO: parse AYO/Instagram JSONs
      } else if ((file.name || '').toLowerCase().includes('amazon')) {
        appendLog('Detected Amazon order history. Parsing…');
        // TODO: parse order CSV/JSON
      } else {
        appendLog('Unknown file; attempting generic JSON parse…');
        const content = await FileSystem.readAsStringAsync(uri);
        try {
          JSON.parse(content);
          appendLog('Generic JSON parsed successfully.');
        } catch {
          appendLog('Not JSON or unsupported format.');
        }
      }
    } catch (e: any) {
      appendLog(`Error: ${e?.message ?? e}`);
    }
  };

  const handleLearnShare = () => {
    appendLog('Share-sheet capture planned: add share intent receiver (Android), Image/Text parsing on-device.');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Import Your Data</Title>
            <Paragraph style={styles.description}>
              Import exports from Google, Facebook/Instagram, or Amazon to improve predictions. All parsing is performed locally on your device.
            </Paragraph>
            <Button mode="contained" onPress={handlePickFile} style={styles.primary}>Pick Export File</Button>
            <Divider style={styles.divider} />
            <List.Item
              title="Share-sheet Capture"
              description="Share links or screenshots to AdSight from other apps to classify and attribute source (planned)."
              left={(props) => <List.Icon {...props} icon="share-variant" color={theme.colors.primary} />}
              onPress={handleLearnShare}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Activity</Title>
            {log.length === 0 ? (
              <Text style={styles.muted}>No activity yet.</Text>
            ) : (
              log.map((line, idx) => (
                <Text key={idx} style={styles.logLine}>• {line}</Text>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1, padding: 15 },
  card: { backgroundColor: theme.colors.cardBackground, marginBottom: 15 },
  title: { color: theme.colors.text, marginBottom: 8 },
  description: { color: theme.colors.text, opacity: 0.9, marginBottom: 12 },
  primary: { backgroundColor: theme.colors.primary, marginTop: 8 },
  divider: { marginVertical: 12, backgroundColor: theme.colors.borderColor },
  muted: { color: theme.colors.text, opacity: 0.7 },
  logLine: { color: theme.colors.text, marginBottom: 6 },
});