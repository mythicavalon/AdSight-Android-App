import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Paragraph, Text, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

import { deleteDatabase } from '../storage/Database';
import { MainDrawerParamList } from '../types';
import { theme } from '../theme/theme';

type Navigation = DrawerNavigationProp<MainDrawerParamList, 'Settings'>;

export default function V2SettingsScreen() {
  const navigation = useNavigation<Navigation>();
  const [deleting, setDeleting] = useState(false);

  const deleteAllData = () => {
    Alert.alert(
      'Delete all AdSight data?',
      'This removes the local profile, inference history, consent state, encrypted database, and database key from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteDatabase();
              Alert.alert('Data deleted', 'All local AdSight data and its encryption key have been deleted. Restart the app to begin again.');
            } catch (error) {
              console.error('Data deletion failed:', error);
              Alert.alert('Could not delete data', 'AdSight could not complete local data deletion. Please try again.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Title style={styles.title}>Privacy Center</Title>
      <Paragraph style={styles.muted}>
        AdSight keeps the profile and inference data it manages on this device. You control what information is provided.
      </Paragraph>

      <Card style={styles.card}><Card.Content>
        <Text style={styles.heading}>Local storage</Text>
        <Paragraph style={styles.muted}>
          Profile data is stored in the local encrypted database. Its key is protected by platform secure storage.
        </Paragraph>
        <Button mode="contained" onPress={() => navigation.navigate('Dashboard')}>Back to profile</Button>
      </Card.Content></Card>

      <Card style={styles.dangerCard}><Card.Content>
        <Text style={styles.heading}>Delete everything</Text>
        <Paragraph style={styles.muted}>
          Permanently remove AdSight's local database and encryption key. A fresh launch will return to onboarding.
        </Paragraph>
        <Button mode="contained" buttonColor={theme.colors.error} textColor="#fff" loading={deleting} disabled={deleting} onPress={deleteAllData}>
          Delete all local data
        </Button>
      </Card.Content></Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40, backgroundColor: theme.colors.background, flexGrow: 1 },
  title: { color: theme.colors.text, marginBottom: 8 },
  muted: { color: theme.colors.text, opacity: 0.72, lineHeight: 21, marginBottom: 12 },
  card: { backgroundColor: theme.colors.cardBackground, marginTop: 16 },
  dangerCard: { backgroundColor: theme.colors.cardBackground, marginTop: 16, borderWidth: 1, borderColor: theme.colors.error },
  heading: { color: theme.colors.text, fontSize: 17, fontWeight: '700', marginBottom: 8 },
});
