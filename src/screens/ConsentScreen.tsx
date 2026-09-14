import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Checkbox, Divider, Paragraph, Text, Title } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { theme } from '../theme/theme';
import { settingsRepository } from '../storage/SettingsRepository';
import { NotificationService } from '../services/NotificationService';

type ConsentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Consent'>;

type ConsentRowProps = {
  checked: boolean;
  onPress: () => void;
  children: React.ReactNode;
  required?: boolean;
};

function ConsentRow({ checked, onPress, children, required }: ConsentRowProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={({ pressed }) => [styles.consentRow, pressed && styles.consentRowPressed]}
    >
      <Checkbox
        status={checked ? 'checked' : 'unchecked'}
        onPress={onPress}
        color={theme.colors.success}
        uncheckedColor={theme.colors.checkboxUnchecked}
      />
      <View style={styles.consentCopy}>
        <Text style={styles.consentLabel}>{children}</Text>
        <Text style={styles.consentMeta}>{required ? 'Required' : 'Optional'}</Text>
      </View>
    </Pressable>
  );
}

export default function ConsentScreen() {
  const navigation = useNavigation<ConsentScreenNavigationProp>();
  const [dataCollectionConsent, setDataCollectionConsent] = useState(false);
  const [offlineProcessingConsent, setOfflineProcessingConsent] = useState(false);
  const [updateReminderConsent, setUpdateReminderConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAcceptConsent = async () => {
    if (!dataCollectionConsent || !offlineProcessingConsent) {
      Alert.alert(
        'Consent Required',
        'Please select both required consent options before continuing.',
        [{ text: 'OK' }],
      );
      return;
    }

    try {
      setSubmitting(true);
      await settingsRepository.setBoolean('onboarding_complete', true);
      await settingsRepository.setString('consent_timestamp', new Date().toISOString());
      await settingsRepository.setBoolean('update_reminders_enabled', updateReminderConsent);

      if (updateReminderConsent) {
        await NotificationService.getInstance().scheduleProfileUpdateReminder();
      }

      navigation.reset({ index: 0, routes: [{ name: 'Main' as never }] });
    } catch (error) {
      console.error('Error saving consent:', error);
      Alert.alert('Error', 'Failed to save your privacy choices. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeclineConsent = () => {
    Alert.alert(
      'AdSight Requires Consent',
      'AdSight requires your consent to process data locally for ad analysis. Without this consent, the app cannot function. Would you like to review the privacy terms again?',
      [
        { text: 'Exit App', style: 'destructive', onPress: () => navigation.goBack() },
        { text: 'Review Terms', style: 'default' },
      ],
    );
  };

  return (
    <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brandMark} accessibilityLabel="AdSight">
            <Text style={styles.brandMarkText}>A</Text>
          </View>
          <Title style={styles.title}>Privacy & Consent</Title>
          <Paragraph style={styles.subtitle}>Your data stays under your control</Paragraph>
        </View>

        <Card style={styles.card} mode="contained">
          <Card.Content>
            <Title style={styles.cardTitle}>What AdSight can process</Title>
            <Paragraph style={styles.description}>
              Only information you provide or explicitly import, such as interests, ad preferences, search history, purchase history, and app-usage data.
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card} mode="contained">
          <Card.Content>
            <Title style={styles.cardTitle}>Why it is used</Title>
            <Paragraph style={styles.description}>
              AdSight uses your information locally to build an explainable advertising profile and show the evidence behind each inference.
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.consentCard} mode="contained">
          <Card.Content>
            <View style={styles.sectionHeadingRow}>
              <Title style={styles.cardTitle}>Your choices</Title>
              <Text style={styles.requiredHint}>2 required</Text>
            </View>

            <ConsentRow
              checked={dataCollectionConsent}
              onPress={() => setDataCollectionConsent((value) => !value)}
              required
            >
              I consent to AdSight processing information I provide locally for advertising-profile analysis.
            </ConsentRow>

            <ConsentRow
              checked={offlineProcessingConsent}
              onPress={() => setOfflineProcessingConsent((value) => !value)}
              required
            >
              I understand that core analysis is designed to run locally on this device.
            </ConsentRow>

            <Divider style={styles.divider} />

            <ConsentRow
              checked={updateReminderConsent}
              onPress={() => setUpdateReminderConsent((value) => !value)}
            >
              I want optional reminders to refresh my profile.
            </ConsentRow>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleAcceptConsent}
            style={styles.acceptButton}
            buttonColor={theme.colors.success}
            textColor="#08120a"
            disabled={submitting || !dataCollectionConsent || !offlineProcessingConsent}
            loading={submitting}
            contentStyle={styles.buttonContent}
          >
            {submitting ? 'Saving…' : 'Accept & Continue'}
          </Button>
          <Button
            mode="outlined"
            onPress={handleDeclineConsent}
            style={styles.declineButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.declineButtonLabel}
          >
            Decline
          </Button>
        </View>

        <Text style={styles.footer}>You can change these preferences anytime in Settings.</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 28, paddingBottom: 32 },
  header: { alignItems: 'center', marginBottom: 22 },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    marginBottom: 12,
  },
  brandMarkText: { color: '#ffffff', fontSize: 28, fontWeight: '800' },
  title: { fontSize: 27, color: theme.colors.text, textAlign: 'center', fontWeight: '700' },
  subtitle: { fontSize: 15, color: theme.colors.text, opacity: 0.72, textAlign: 'center', marginTop: 2 },
  card: { marginBottom: 14, backgroundColor: theme.colors.cardBackground, borderRadius: 18 },
  consentCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 18,
    borderColor: theme.colors.borderColor,
    borderWidth: 1,
  },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  requiredHint: { color: theme.colors.success, fontSize: 12, fontWeight: '700' },
  cardTitle: { color: theme.colors.text, marginBottom: 7, fontSize: 18 },
  description: { color: theme.colors.text, opacity: 0.82, lineHeight: 21, fontSize: 14 },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  consentRowPressed: { backgroundColor: 'rgba(255,255,255,0.06)' },
  consentCopy: { flex: 1, paddingTop: 5, paddingLeft: 7 },
  consentLabel: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  consentMeta: { color: theme.colors.checkboxUnchecked, fontSize: 11, marginTop: 3, fontWeight: '600' },
  divider: { marginVertical: 10, backgroundColor: theme.colors.borderColor },
  buttonContainer: { paddingTop: 2 },
  acceptButton: { borderRadius: 14, marginBottom: 10 },
  declineButton: { borderColor: theme.colors.error, borderRadius: 14 },
  buttonContent: { minHeight: 52 },
  declineButtonLabel: { color: theme.colors.error },
  footer: { textAlign: 'center', color: theme.colors.text, opacity: 0.55, fontSize: 11, marginTop: 14, marginBottom: 4 },
});
