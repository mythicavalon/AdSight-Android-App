import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Title,
  Paragraph,
  Checkbox,
  Divider,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types';
import { theme } from '../theme/theme';

type ConsentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Consent'>;

export default function ConsentScreen() {
  const navigation = useNavigation<ConsentScreenNavigationProp>();
  const [dataCollectionConsent, setDataCollectionConsent] = useState(false);
  const [offlineProcessingConsent, setOfflineProcessingConsent] = useState(false);
  const [updateReminderConsent, setUpdateReminderConsent] = useState(false);

  const handleAcceptConsent = async () => {
    if (!dataCollectionConsent || !offlineProcessingConsent) {
      Alert.alert(
        'Consent Required',
        'You must accept the required privacy terms to continue using AdSight.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await AsyncStorage.setItem('onboarding_complete', 'true');
      await AsyncStorage.setItem('consent_timestamp', new Date().toISOString());
      await AsyncStorage.setItem('update_reminders_enabled', updateReminderConsent.toString());
      
      // Reset the navigation stack to go to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Error saving consent:', error);
      Alert.alert('Error', 'Failed to save consent. Please try again.');
    }
  };

  const handleDeclineConsent = () => {
    Alert.alert(
      'AdSight Requires Consent',
      'AdSight requires your consent to process data locally for ad predictions. Without this consent, the app cannot function. Would you like to review the privacy terms again?',
      [
        {
          text: 'Exit App',
          style: 'destructive',
          onPress: () => {
            // In a real app, you might want to exit or go back to welcome
            navigation.goBack();
          },
        },
        {
          text: 'Review Terms',
          style: 'default',
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Title style={styles.title}>Privacy & Consent</Title>
          <Paragraph style={styles.subtitle}>
            Your privacy is our top priority
          </Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>What Data We Collect</Title>
            <Paragraph style={styles.description}>
              AdSight may collect and process the following data types locally on your device:
            </Paragraph>
            
            <View style={styles.dataList}>
              <Text style={styles.dataItem}>• Personal interests (manually entered by you)</Text>
              <Text style={styles.dataItem}>• Exported ad preferences from platforms (Facebook, Google, Amazon)</Text>
              <Text style={styles.dataItem}>• Installed apps usage statistics (with explicit permission)</Text>
              <Text style={styles.dataItem}>• Search history data (if provided by you)</Text>
              <Text style={styles.dataItem}>• Purchase history data (if provided by you)</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Why We Collect This Data</Title>
            <Paragraph style={styles.description}>
              This data is used exclusively to:
            </Paragraph>
            
            <View style={styles.dataList}>
              <Text style={styles.dataItem}>• Generate accurate ad predictions for various platforms</Text>
              <Text style={styles.dataItem}>• Provide insights into your digital advertising profile</Text>
              <Text style={styles.dataItem}>• Help you understand how your data influences ads</Text>
              <Text style={styles.dataItem}>• Improve prediction accuracy over time</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Your Privacy Guarantee</Title>
            <View style={styles.privacyList}>
              <Text style={styles.privacyItem}>🔒 All data stays on your device - never transmitted</Text>
              <Text style={styles.privacyItem}>⚡ All processing happens offline</Text>
              <Text style={styles.privacyItem}>🗑️ You can delete all data anytime</Text>
              <Text style={styles.privacyItem}>🚫 No tracking, analytics, or data collection by us</Text>
              <Text style={styles.privacyItem}>💰 Completely free - no hidden costs or data monetization</Text>
              <Text style={styles.privacyItem}>📖 Open source - you can verify our claims</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.consentCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Your Consent</Title>
            
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={dataCollectionConsent ? 'checked' : 'unchecked'}
                onPress={() => setDataCollectionConsent(!dataCollectionConsent)}
                color={theme.colors.primary}
              />
              <Text style={styles.checkboxLabel}>
                I consent to AdSight collecting and processing my data locally for ad prediction purposes. (Required)
              </Text>
            </View>

            <View style={styles.checkboxContainer}>
              <Checkbox
                status={offlineProcessingConsent ? 'checked' : 'unchecked'}
                onPress={() => setOfflineProcessingConsent(!offlineProcessingConsent)}
                color={theme.colors.primary}
              />
              <Text style={styles.checkboxLabel}>
                I understand that all data processing happens offline on my device and that no data is transmitted to external servers. (Required)
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
                I consent to receiving monthly reminders to update my data profile for better prediction accuracy. (Optional)
              </Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleAcceptConsent}
            style={[
              styles.button,
              styles.acceptButton,
              (!dataCollectionConsent || !offlineProcessingConsent) && styles.disabledButton
            ]}
            disabled={!dataCollectionConsent || !offlineProcessingConsent}
            contentStyle={styles.buttonContent}
          >
            Accept & Continue
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

        <Text style={styles.footer}>
          You can change these preferences anytime in Settings
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    color: theme.colors.text,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 5,
  },
  card: {
    marginBottom: 20,
    backgroundColor: theme.colors.cardBackground,
    elevation: 4,
  },
  consentCard: {
    marginBottom: 30,
    backgroundColor: theme.colors.cardBackground,
    elevation: 4,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  cardTitle: {
    color: theme.colors.text,
    marginBottom: 10,
    fontSize: 18,
  },
  description: {
    color: theme.colors.text,
    lineHeight: 24,
    opacity: 0.9,
    marginBottom: 10,
  },
  dataList: {
    marginTop: 10,
  },
  dataItem: {
    color: theme.colors.text,
    fontSize: 14,
    marginBottom: 6,
    opacity: 0.9,
    lineHeight: 20,
  },
  privacyList: {
    marginTop: 10,
  },
  privacyItem: {
    color: theme.colors.text,
    fontSize: 15,
    marginBottom: 8,
    opacity: 0.9,
    lineHeight: 22,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingRight: 10,
  },
  checkboxLabel: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
    opacity: 0.9,
  },
  divider: {
    marginVertical: 15,
    backgroundColor: theme.colors.borderColor,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    marginBottom: 15,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  acceptButton: {
    backgroundColor: theme.colors.success,
  },
  disabledButton: {
    backgroundColor: theme.colors.disabled,
  },
  declineButton: {
    borderColor: theme.colors.error,
  },
  declineButtonLabel: {
    color: theme.colors.error,
  },
  footer: {
    textAlign: 'center',
    color: theme.colors.text,
    opacity: 0.7,
    fontSize: 12,
    marginBottom: 20,
    fontStyle: 'italic',
  },
});