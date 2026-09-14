import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Paragraph, ProgressBar, Text, Title } from 'react-native-paper';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { inferenceEngineV2 } from '../intelligence';
import { InferenceResult } from '../intelligence/v2Types';
import { Platform, UserProfile, MainDrawerParamList } from '../types';
import { profileRepository } from '../storage';
import { theme } from '../theme/theme';

type DashboardRouteProp = RouteProp<MainDrawerParamList, 'Dashboard'>;
type DashboardNavigationProp = DrawerNavigationProp<MainDrawerParamList, 'Dashboard'>;

const platforms: Array<{ id: Platform; label: string }> = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'google', label: 'Google Search' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'amazon', label: 'Amazon' },
];

export default function DashboardScreen() {
  const route = useRoute<DashboardRouteProp>();
  const navigation = useNavigation<DashboardNavigationProp>();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(route.params?.platform ?? 'facebook');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [topResult, setTopResult] = useState<InferenceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const storedProfile = await profileRepository.get();
      setProfile(storedProfile);
      if (storedProfile) {
        const results = inferenceEngineV2.generate(storedProfile, selectedPlatform);
        setTopResult(results.sort((a, b) => b.score - a.score)[0] ?? null);
      } else {
        setTopResult(null);
      }
    } catch (cause) {
      console.error('Dashboard load failed:', cause);
      setError('AdSight could not load your local profile.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPlatform]);

  useEffect(() => {
    if (route.params?.platform) setSelectedPlatform(route.params.platform);
  }, [route.params?.platform]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const refresh = () => {
    setRefreshing(true);
    void load();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ProgressBar indeterminate style={styles.loadingBar} />
        <Text style={styles.muted}>Loading your local profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Title style={styles.title}>Something went wrong</Title>
        <Paragraph style={styles.muted}>{error}</Paragraph>
        <Button mode="contained" onPress={refresh}>Try again</Button>
      </View>
    );
  }

  if (!profile) {
    return (
      <ScrollView contentContainerStyle={styles.empty}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Start with your data</Title>
            <Paragraph style={styles.muted}>
              AdSight needs data you choose to provide before it can estimate advertising interests.
              Nothing is silently simulated or added for you.
            </Paragraph>
            <Button mode="contained" onPress={() => navigation.navigate('DataInput')}>
              Create your profile
            </Button>
            <Button mode="outlined" onPress={() => navigation.navigate('Import')} style={styles.secondaryButton}>
              Import data
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  }

  const platformLabel = platforms.find((item) => item.id === selectedPlatform)?.label ?? selectedPlatform;
  const signalCount = profile.interests.length + profile.installedApps.length + profile.searches.length + profile.purchases.length;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <Title style={styles.title}>Advertising Profile</Title>
        <Paragraph style={styles.muted}>
          Local estimates based only on information you chose to provide.
        </Paragraph>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.profileName}>{profile.name}</Text>
            <View style={styles.stats}>
              <Text style={styles.stat}>Signals {signalCount}</Text>
              <Text style={styles.stat}>Interests {profile.interests.length}</Text>
              <Text style={styles.stat}>Searches {profile.searches.length}</Text>
              <Text style={styles.stat}>Purchases {profile.purchases.length}</Text>
            </View>
          </Card.Content>
        </Card>

        <Title style={styles.sectionTitle}>Platform</Title>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {platforms.map((platform) => (
            <Chip
              key={platform.id}
              selected={selectedPlatform === platform.id}
              onPress={() => setSelectedPlatform(platform.id)}
              accessibilityLabel={`View ${platform.label} estimate`}
            >
              {platform.label}
            </Chip>
          ))}
        </ScrollView>

        {topResult ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.overline}>TOP LOCAL ESTIMATE</Text>
              <Title style={styles.resultTitle}>{topResult.categoryName}</Title>
              <Text style={styles.signalStrength}>Signal strength {Math.round(topResult.score * 100)}%</Text>
              <ProgressBar progress={topResult.score} style={styles.progress} />
              <Text style={styles.muted}>
                Confidence {Math.round(topResult.confidence * 100)}% · Data quality {Math.round(topResult.dataQuality * 100)}%
              </Text>
              <Paragraph style={styles.explanation}>
                {topResult.evidence[0]?.explanation ?? 'No supporting evidence was found for this estimate.'}
              </Paragraph>
              <Button mode="contained" onPress={() => navigation.navigate('Evidence')}>
                Inspect evidence
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.resultTitle}>Not enough evidence yet</Title>
              <Paragraph style={styles.muted}>
                Add more interests, searches, purchases, or platform preferences to produce a useful estimate.
              </Paragraph>
              <Button mode="contained" onPress={() => navigation.navigate('DataInput')}>
                Add data
              </Button>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.noteCard}>
          <Card.Content>
            <Text style={styles.noteTitle}>What this means</Text>
            <Paragraph style={styles.muted}>
              AdSight estimates what could be inferred from your available data. It does not see a platform's private advertiser targeting system.
            </Paragraph>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.colors.background, gap: 16 },
  empty: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: theme.colors.background },
  loadingBar: { width: '100%' },
  title: { color: theme.colors.text, marginBottom: 8 },
  sectionTitle: { color: theme.colors.text, marginTop: 20, marginBottom: 8 },
  muted: { color: theme.colors.text, opacity: 0.72, lineHeight: 21 },
  card: { backgroundColor: theme.colors.cardBackground, marginTop: 16 },
  noteCard: { backgroundColor: theme.colors.cardBackground, marginTop: 16, marginBottom: 8 },
  secondaryButton: { marginTop: 8 },
  profileName: { color: theme.colors.text, fontSize: 22, fontWeight: '700' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  stat: { color: theme.colors.text, opacity: 0.78 },
  chips: { gap: 8, paddingVertical: 4 },
  overline: { color: theme.colors.primary, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  resultTitle: { color: theme.colors.text, marginTop: 4 },
  signalStrength: { color: theme.colors.primary, fontSize: 18, fontWeight: '700', marginVertical: 10 },
  progress: { marginBottom: 10 },
  explanation: { color: theme.colors.text, marginVertical: 12, lineHeight: 21 },
  noteTitle: { color: theme.colors.text, fontWeight: '700', marginBottom: 6 },
});
