import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, ProgressBar, Text, Title } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { InferenceEngineV2 } from '../intelligence/InferenceEngineV2';
import { InferenceResult, InferenceSnapshot } from '../intelligence/v2Types';
import { MainDrawerParamList, Platform } from '../types';
import { profileRepository } from '../storage/ProfileRepository';
import { theme } from '../theme/theme';

type Route = RouteProp<MainDrawerParamList, 'Evidence'>;

const platforms: Platform[] = ['facebook', 'instagram', 'google', 'youtube', 'tiktok', 'linkedin', 'amazon'];

const platformLabels: Record<Platform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  google: 'Google',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  amazon: 'Amazon',
};

export default function EvidenceExplorerScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const [platform, setPlatform] = useState<Platform>(route.params?.platform ?? 'facebook');
  const [snapshot, setSnapshot] = useState<InferenceSnapshot | null>(null);
  const [selected, setSelected] = useState<InferenceResult | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const profile = await profileRepository.get();
    setHasProfile(Boolean(profile));
    if (!profile) {
      setSnapshot(null);
      setSelected(null);
      return;
    }

    const generated = new InferenceEngineV2().generate(profile, platform);
    setSnapshot(generated);
    setSelected((current) =>
      current ? generated.results.find((item) => item.categoryId === current.categoryId) ?? generated.results[0] : generated.results[0],
    );
  }, [platform]);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  if (!hasProfile) {
    return (
      <View style={styles.empty}>
        <Title style={styles.title}>Evidence Explorer</Title>
        <Text style={styles.body}>
          Import or enter your own data first. AdSight will then show exactly which signals support each inference.
        </Text>
        <Button mode="contained" onPress={() => navigation.navigate('DataInput' as never)}>
          Add my data
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <Title style={styles.title}>Why might this be shown?</Title>
        <Text style={styles.body}>
          This is AdSight's local inference. It is not a view into a platform's private advertiser targeting system.
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.platforms}>
          {platforms.map((item) => (
            <Chip key={item} selected={item === platform} onPress={() => setPlatform(item)}>
              {platformLabels[item]}
            </Chip>
          ))}
        </ScrollView>

        {snapshot?.results.slice(0, 6).map((result) => (
          <Card
            key={result.categoryId}
            style={[styles.card, selected?.categoryId === result.categoryId && styles.selectedCard]}
            onPress={() => setSelected(result)}
          >
            <Card.Content>
              <View style={styles.row}>
                <Text style={styles.category}>{result.categoryName}</Text>
                <Text style={styles.score}>{Math.round(result.score * 100)}%</Text>
              </View>
              <ProgressBar progress={result.score} style={styles.progress} />
              <Text style={styles.meta}>
                Confidence {Math.round(result.confidence * 100)}% · Data quality {Math.round(result.dataQuality * 100)}%
              </Text>
            </Card.Content>
          </Card>
        ))}

        {selected && (
          <Card style={styles.evidenceCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Evidence for {selected.categoryName}</Title>
              {selected.evidence.length === 0 ? (
                <Text style={styles.body}>No matching evidence was found. That absence is meaningful and should not be turned into a confident guess.</Text>
              ) : (
                selected.evidence.map((item) => (
                  <View key={item.signalId} style={styles.evidenceItem}>
                    <View style={styles.row}>
                      <Chip compact>{item.signalType.replace('_', ' ')}</Chip>
                      <Text style={styles.contribution}>+{item.contribution.toFixed(2)}</Text>
                    </View>
                    <Text style={styles.evidenceValue}>{item.value}</Text>
                    <Text style={styles.meta}>{item.source}</Text>
                    <Text style={styles.explanation}>{item.explanation}</Text>
                    <Divider style={styles.divider} />
                  </View>
                ))
              )}

              {selected.uncertainty.length > 0 && (
                <View style={styles.uncertainty}>
                  <Text style={styles.uncertaintyTitle}>What could make this wrong?</Text>
                  {selected.uncertainty.map((item) => (
                    <Text key={item} style={styles.meta}>• {item}</Text>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        <Text style={styles.footer}>Model {snapshot?.modelVersion} · Generated locally</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, paddingBottom: 40 },
  empty: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.colors.background },
  title: { color: theme.colors.text, marginBottom: 8 },
  body: { color: theme.colors.text, opacity: 0.78, lineHeight: 22, marginBottom: 16 },
  platforms: { gap: 8, paddingBottom: 14 },
  card: { backgroundColor: theme.colors.cardBackground, marginBottom: 10 },
  selectedCard: { borderWidth: 1, borderColor: theme.colors.primary },
  evidenceCard: { backgroundColor: theme.colors.cardBackground, marginTop: 8 },
  sectionTitle: { color: theme.colors.text, marginBottom: 14, fontSize: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  category: { color: theme.colors.text, fontWeight: '700', flex: 1 },
  score: { color: theme.colors.primary, fontWeight: '700' },
  progress: { height: 7, marginTop: 10, marginBottom: 8 },
  meta: { color: theme.colors.text, opacity: 0.62, fontSize: 12, lineHeight: 18 },
  evidenceItem: { paddingVertical: 8 },
  contribution: { color: theme.colors.success, fontWeight: '700' },
  evidenceValue: { color: theme.colors.text, fontSize: 15, fontWeight: '600', marginTop: 8 },
  explanation: { color: theme.colors.text, opacity: 0.78, lineHeight: 20, marginTop: 4 },
  divider: { marginTop: 12 },
  uncertainty: { marginTop: 8, padding: 12, borderRadius: 10, backgroundColor: theme.colors.surface },
  uncertaintyTitle: { color: theme.colors.text, fontWeight: '700', marginBottom: 6 },
  footer: { color: theme.colors.text, opacity: 0.5, fontSize: 11, textAlign: 'center', marginTop: 18 },
});
