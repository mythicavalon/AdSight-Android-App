import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Paragraph, Text, TextInput, Title } from 'react-native-paper';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';

import { Platform, UserProfile, MainDrawerParamList } from '../types';
import { profileRepository } from '../storage';
import { settingsRepository } from '../storage/SettingsRepository';
import { theme } from '../theme/theme';

type Navigation = DrawerNavigationProp<MainDrawerParamList, 'DataInput'>;
const platforms: Platform[] = ['facebook', 'instagram', 'google', 'youtube', 'tiktok', 'linkedin', 'amazon'];

export default function V2DataInputScreen() {
  const navigation = useNavigation<Navigation>();
  const [name, setName] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interest, setInterest] = useState('');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [preference, setPreference] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('facebook');
  const [searches, setSearches] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [purchases, setPurchases] = useState<string[]>([]);
  const [purchase, setPurchase] = useState('');
  const [saving, setSaving] = useState(false);

  const add = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>, clear: React.Dispatch<React.SetStateAction<string>>) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setter((items) => items.includes(trimmed) ? items : [...items, trimmed]);
    clear('');
  };

  const save = async () => {
    if (!name.trim()) return Alert.alert('Profile name required', 'Give this local profile a name first.');
    if (interests.length === 0) return Alert.alert('Add an interest', 'Add at least one interest so AdSight has evidence to work with.');

    setSaving(true);
    try {
      const now = new Date();
      const adPreferences = platforms.reduce((all, platform) => {
        all[platform] = platform === selectedPlatform ? preferences : [];
        return all;
      }, {} as { [platform in Platform]?: string[] });
      const profile: UserProfile = {
        id: `user_${Date.now()}`,
        name: name.trim(),
        interests,
        demographics: {},
        adPreferences,
        installedApps: [],
        searches: searches.map((query) => ({ query, platform: 'google', timestamp: now })),
        purchases: purchases.map((item) => ({ item, category: 'general', platform: 'amazon', timestamp: now })),
        createdAt: now,
        lastUpdated: now,
      };
      await profileRepository.save(profile);
      await settingsRepository.setBoolean('update_reminders_enabled', true);
      Alert.alert('Profile saved', 'Your data is stored locally. AdSight can now generate evidence-backed estimates.', [
        { text: 'View profile', onPress: () => navigation.navigate({ name: 'Dashboard' }) },
      ]);
    } catch (error) {
      console.error('Profile save failed:', error);
      Alert.alert('Could not save', 'AdSight could not save your local profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Title style={styles.title}>Your advertising profile</Title>
      <Paragraph style={styles.muted}>Enter only information you choose to provide. AdSight uses it locally to estimate advertising interests.</Paragraph>

      <Card style={styles.card}><Card.Content>
        <TextInput label="Profile name" value={name} onChangeText={setName} style={styles.input} />
        <Text style={styles.section}>Interests</Text>
        <View style={styles.row}>
          <TextInput label="Add an interest" value={interest} onChangeText={setInterest} onSubmitEditing={() => add(interest, setInterests, setInterest)} style={styles.flexInput} />
          <Button mode="contained" onPress={() => add(interest, setInterests, setInterest)}>Add</Button>
        </View>
        <View style={styles.chips}>{interests.map((item) => <Chip key={item} onClose={() => setInterests((items) => items.filter((value) => value !== item))}>{item}</Chip>)}</View>
      </Card.Content></Card>

      <Card style={styles.card}><Card.Content>
        <Text style={styles.section}>Platform preference</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {platforms.map((platform) => <Chip key={platform} selected={selectedPlatform === platform} onPress={() => setSelectedPlatform(platform)}>{platform}</Chip>)}
        </ScrollView>
        <View style={styles.row}>
          <TextInput label="Add preference" value={preference} onChangeText={setPreference} onSubmitEditing={() => add(preference, setPreferences, setPreference)} style={styles.flexInput} />
          <Button mode="contained" onPress={() => add(preference, setPreferences, setPreference)}>Add</Button>
        </View>
        <View style={styles.chips}>{preferences.map((item) => <Chip key={item} onClose={() => setPreferences((items) => items.filter((value) => value !== item))}>{item}</Chip>)}</View>
      </Card.Content></Card>

      <Card style={styles.card}><Card.Content>
        <Text style={styles.section}>Searches (optional)</Text>
        <View style={styles.row}>
          <TextInput label="Add a search" value={search} onChangeText={setSearch} onSubmitEditing={() => add(search, setSearches, setSearch)} style={styles.flexInput} />
          <Button mode="contained" onPress={() => add(search, setSearches, setSearch)}>Add</Button>
        </View>
        <View style={styles.chips}>{searches.map((item) => <Chip key={item} onClose={() => setSearches((items) => items.filter((value) => value !== item))}>{item}</Chip>)}</View>
      </Card.Content></Card>

      <Card style={styles.card}><Card.Content>
        <Text style={styles.section}>Purchases (optional)</Text>
        <View style={styles.row}>
          <TextInput label="Add a purchase" value={purchase} onChangeText={setPurchase} onSubmitEditing={() => add(purchase, setPurchases, setPurchase)} style={styles.flexInput} />
          <Button mode="contained" onPress={() => add(purchase, setPurchases, setPurchase)}>Add</Button>
        </View>
        <View style={styles.chips}>{purchases.map((item) => <Chip key={item} onClose={() => setPurchases((items) => items.filter((value) => value !== item))}>{item}</Chip>)}</View>
      </Card.Content></Card>

      <Button mode="contained" loading={saving} disabled={saving} onPress={save} contentStyle={styles.save}>Save locally</Button>
      <Text style={styles.footnote}>No simulated profile is created automatically.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40, backgroundColor: theme.colors.background },
  title: { color: theme.colors.text, marginBottom: 8 },
  muted: { color: theme.colors.text, opacity: 0.72, lineHeight: 21, marginBottom: 12 },
  card: { backgroundColor: theme.colors.cardBackground, marginTop: 12 },
  input: { backgroundColor: theme.colors.surface, marginBottom: 16 },
  section: { color: theme.colors.text, fontWeight: '700', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  flexInput: { flex: 1, backgroundColor: theme.colors.surface },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 10 },
  save: { paddingVertical: 8 },
  footnote: { color: theme.colors.text, opacity: 0.55, textAlign: 'center', marginTop: 12 },
});
