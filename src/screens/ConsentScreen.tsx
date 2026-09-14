import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, Title, Paragraph, Checkbox, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { theme } from '../theme/theme';
import { settingsRepository } from '../storage/SettingsRepository';
import { NotificationService } from '../services/NotificationService';

type ConsentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Consent'>;

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
        'You must accept the required privacy terms to continue using AdSight.',
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Title style={styles.title}>Privacy & Consent</Title>
          <Paragraph style={styles.subtitle}>Your data stays under your control</Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>What AdSight Can Process</Title>
            <Paragraph style={styles.description}>
              AdSight processes only information you provide or explicitly import. Examples include interests, exported ad preferences, search history, purchase history, and app-usage data you choose to provide.
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Why</Title>
            <Paragraph style={styles.description}>
              The information is used locally to build an explainable advertising profile, show supporting evidence, and help you understand how advertising categories could be inferred from your data.
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.consentCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Your Choices</Title>
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={dataCollectionConsent ? 'checked' : 'unchecked'}
                onPress={() => setDataCollectionConsent(!dataCollectionConsent)}
                color={theme.colors.primary}
              />
              <Text style={styles.checkboxLabel}>
                I consent to AdSight processing the information I provide locally for advertising-profile analysis. (Required)
              </Text>
            </View>

            <View style={styles.checkboxContainer}>
              <Checkbox
                status={offlineProcessingConsent ? 'checked' : 'unchecked'}
                onPress={() => setOfflineProcessingConsent(!offlineProcessingConsent)}
                color={theme.colors.primary}
              />
              <Text style={styles.checkboxLabel}>
                I understand that the core analysis is designed to run locally on this device. (Required)
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.checkboxContainer}>
              <Checkbox
                status={updateReminderConsent ? 'checked' : 'unchecked'}
                onPress={() => setUpdateReminderConsent(!updateReminderConsent)}
                color={theme.colors.primary}
              />
              <Text style={styles.checkboxLabel}>
                I want optional reminders to refresh my profile. (Optional)
              </Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleAcceptConsent}
            style={[styles.button, styles.acceptButton]}
            disabled={submitting || !dataCollectionConsent || !offlineProcessingConsent}
            loading={submitting}
            contentStyle={styles.buttonContent}
          >
            {submitting ? 'Saving…' : 'Accept & Continue'}
          </Button>
          <Button
            mode="outlined"
            onPress={handleDeclineConsent}
            style={[styles.button, styles.declineButton]}
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
  scrollContent: { flexGrow: 1, padding: 20 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 40 },
  title: { fontSize: 28, color: theme.colors.text, textAlign: 'center', fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: theme.colors.text, textAlign: 'center' },
  card: { marginBottom: 20, backgroundColor: theme.colors.cardBackground },
  consentCard: { marginBottom: 30, backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.primary, borderWidth: 1 },
  cardTitle: { color: theme.colors.text, marginBottom: 10, fontSize: 18 },
  description: { color: theme.colors.text, lineHeight: 24 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15, paddingRight: 10 },
  checkboxLabel: { color: theme.colors.text, fontSize: 14, lineHeight: 20, marginLeft: 8, flex: 1 },
  divider: { marginVertical: 15, backgroundColor: theme.colors.borderColor },
  buttonContainer: { marginTop: 20 },
  button: { marginBottom: 15 },
  buttonContent: { paddingVertical: 8 },
  acceptButton: { backgroundColor: theme.colors.success },
  declineButton: { borderColor: theme.colors.error },
  declineButtonLabel: { color: theme.colors.error },
  footer: { textAlign: 'center', color: theme.colors.text, fontSize: 12, marginBottom: 20, fontStyle: 'italic' },
});
