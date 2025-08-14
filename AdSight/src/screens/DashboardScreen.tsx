import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Title,
  Paragraph,
  ProgressBar,
  Chip,
  FAB,
} from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PredictionEngine } from '../services/PredictionEngine';
import { Platform, UserProfile, AdPrediction } from '../types';
import { theme } from '../theme/theme';
import { MainDrawerParamList } from '../types';

type DashboardRouteProp = RouteProp<MainDrawerParamList, 'Dashboard'>;

const platformIcons: { [key in Platform]: string } = {
  facebook: '📘',
  instagram: '📷',
  google: '🔍',
  youtube: '📺',
  tiktok: '🎵',
  linkedin: '💼',
  amazon: '📦',
};

const platformNames: { [key in Platform]: string } = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  google: 'Google Search',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  amazon: 'Amazon',
};

export default function DashboardScreen() {
  const route = useRoute<DashboardRouteProp>();
  const navigation = useNavigation();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('facebook');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [prediction, setPrediction] = useState<AdPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const predictionEngine = new PredictionEngine();

  useEffect(() => {
    if (route.params?.platform) {
      setSelectedPlatform(route.params.platform);
    }
    loadUserProfile();
  }, [route.params]);

  useEffect(() => {
    if (userProfile) {
      generatePredictions();
    }
  }, [userProfile, selectedPlatform]);

  const loadUserProfile = async () => {
    try {
      const profileData = await AsyncStorage.getItem('user_profile');
      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      } else {
        // Create a simulated profile for demo purposes
        const simulatedProfile = predictionEngine.createSimulatedProfile('tech_enthusiast');
        setUserProfile(simulatedProfile);
        await AsyncStorage.setItem('user_profile', JSON.stringify(simulatedProfile));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fallback to simulated profile
      setUserProfile(predictionEngine.createSimulatedProfile('tech_enthusiast'));
    }
  };

  const generatePredictions = async () => {
    if (!userProfile) return;
    
    setIsLoading(true);
    try {
      const newPrediction = predictionEngine.generatePredictions(userProfile, selectedPlatform);
      setPrediction(newPrediction);
    } catch (error) {
      console.error('Error generating predictions:', error);
      Alert.alert('Error', 'Failed to generate predictions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile();
    setRefreshing(false);
  };

  const handleCreateProfile = () => {
    navigation.navigate('DataInput' as never);
  };

  const handleTrySimulated = () => {
    Alert.alert(
      'Try Simulated Profiles',
      'Select a profile type to see example predictions:',
      [
        {
          text: 'Tech Enthusiast',
          onPress: () => createSimulatedProfile('tech_enthusiast'),
        },
        {
          text: 'Fashion Lover',
          onPress: () => createSimulatedProfile('fashion_lover'),
        },
        {
          text: 'Fitness Focused',
          onPress: () => createSimulatedProfile('fitness_focused'),
        },
        {
          text: 'Business Professional',
          onPress: () => createSimulatedProfile('business_professional'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const createSimulatedProfile = async (type: 'tech_enthusiast' | 'fashion_lover' | 'fitness_focused' | 'business_professional') => {
    const simulatedProfile = predictionEngine.createSimulatedProfile(type);
    setUserProfile(simulatedProfile);
    await AsyncStorage.setItem('user_profile', JSON.stringify(simulatedProfile));
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.7) return theme.colors.success;
    if (confidence >= 0.4) return theme.colors.warning;
    return theme.colors.error;
  };

  if (!userProfile) {
    return (
      <View style={styles.emptyContainer}>
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Title style={styles.emptyTitle}>Welcome to AdSight!</Title>
            <Paragraph style={styles.emptyText}>
              To get started with ad predictions, you need to set up your profile with interests, 
              app usage, and preferences.
            </Paragraph>
            
            <View style={styles.emptyActions}>
              <Button
                mode="contained"
                onPress={handleCreateProfile}
                style={styles.primaryButton}
                contentStyle={styles.buttonContent}
              >
                Create Your Profile
              </Button>
              
              <Button
                mode="outlined"
                onPress={handleTrySimulated}
                style={styles.secondaryButton}
                contentStyle={styles.buttonContent}
              >
                Try Simulated Profile
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Platform Selector */}
        <Card style={styles.platformCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Select Platform</Title>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.platformSelector}>
                {(Object.keys(platformIcons) as Platform[]).map((platform) => (
                  <Chip
                    key={platform}
                    icon={() => <Text style={styles.chipIcon}>{platformIcons[platform]}</Text>}
                    selected={selectedPlatform === platform}
                    onPress={() => setSelectedPlatform(platform)}
                    style={[
                      styles.platformChip,
                      selectedPlatform === platform && styles.selectedChip,
                    ]}
                    textStyle={[
                      styles.chipText,
                      selectedPlatform === platform && styles.selectedChipText,
                    ]}
                  >
                    {platformNames[platform]}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Current Profile Info */}
        <Card style={styles.profileCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Current Profile</Title>
            <View style={styles.profileInfo}>
              <Text style={styles.profileLabel}>Profile: {userProfile.name}</Text>
              <Text style={styles.profileLabel}>Interests: {userProfile.interests.length}</Text>
              <Text style={styles.profileLabel}>Apps: {userProfile.installedApps.length}</Text>
              <Text style={styles.profileLabel}>Searches: {userProfile.searches.length}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Predictions */}
        {prediction && (
          <>
            {/* Confidence Score */}
            <Card style={styles.confidenceCard}>
              <Card.Content>
                <Title style={styles.sectionTitle}>Prediction Confidence</Title>
                <View style={styles.confidenceContainer}>
                  <Text style={styles.confidenceText}>
                    {Math.round(prediction.confidence * 100)}%
                  </Text>
                  <ProgressBar
                    progress={prediction.confidence}
                    color={getConfidenceColor(prediction.confidence)}
                    style={styles.progressBar}
                  />
                </View>
              </Card.Content>
            </Card>

            {/* Ad Categories */}
            <Card style={styles.categoriesCard}>
              <Card.Content>
                <Title style={styles.sectionTitle}>
                  Predicted Ad Categories for {platformNames[selectedPlatform]}
                </Title>
                
                {prediction.categories.map((category, index) => (
                  <View key={index} style={styles.categoryItem}>
                    <View style={styles.categoryHeader}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryProbability}>
                        {Math.round(category.probability * 100)}%
                      </Text>
                    </View>
                    <ProgressBar
                      progress={category.probability}
                      color={theme.colors.primary}
                      style={styles.categoryProgress}
                    />
                    
                    <View style={styles.exampleContainer}>
                      <Text style={styles.exampleTitle}>Example Ads:</Text>
                      {category.examples.slice(0, 2).map((example, exampleIndex) => (
                        <Text key={exampleIndex} style={styles.exampleText}>
                          • {example}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              </Card.Content>
            </Card>

            {/* Reasoning */}
            <Card style={styles.reasoningCard}>
              <Card.Content>
                <Title style={styles.sectionTitle}>Why These Predictions?</Title>
                {prediction.reasoning.map((reason, index) => (
                  <Text key={index} style={styles.reasoningText}>
                    • {reason}
                  </Text>
                ))}
              </Card.Content>
            </Card>
          </>
        )}

        {isLoading && (
          <Card style={styles.loadingCard}>
            <Card.Content>
              <Text style={styles.loadingText}>Generating predictions...</Text>
              <ProgressBar indeterminate color={theme.colors.primary} />
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="refresh"
        onPress={() => generatePredictions()}
        label="Refresh"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  emptyCard: {
    backgroundColor: theme.colors.cardBackground,
    elevation: 4,
  },
  emptyTitle: {
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  emptyText: {
    color: theme.colors.text,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 20,
    lineHeight: 24,
  },
  emptyActions: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    borderColor: theme.colors.primary,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  platformCard: {
    backgroundColor: theme.colors.cardBackground,
    elevation: 4,
    marginBottom: 15,
  },
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: 15,
  },
  platformSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  platformChip: {
    backgroundColor: theme.colors.accent,
  },
  selectedChip: {
    backgroundColor: theme.colors.primary,
  },
  chipIcon: {
    fontSize: 16,
  },
  chipText: {
    color: theme.colors.text,
  },
  selectedChipText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: theme.colors.cardBackground,
    elevation: 4,
    marginBottom: 15,
  },
  profileInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  profileLabel: {
    color: theme.colors.text,
    fontSize: 14,
    opacity: 0.8,
  },
  confidenceCard: {
    backgroundColor: theme.colors.cardBackground,
    elevation: 4,
    marginBottom: 15,
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceText: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    width: '100%',
  },
  categoriesCard: {
    backgroundColor: theme.colors.cardBackground,
    elevation: 4,
    marginBottom: 15,
  },
  categoryItem: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  categoryProbability: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryProgress: {
    height: 6,
    borderRadius: 3,
    marginBottom: 10,
  },
  exampleContainer: {
    marginTop: 8,
  },
  exampleTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    opacity: 0.8,
  },
  exampleText: {
    color: theme.colors.text,
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 2,
  },
  reasoningCard: {
    backgroundColor: theme.colors.cardBackground,
    elevation: 4,
    marginBottom: 15,
  },
  reasoningText: {
    color: theme.colors.text,
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  loadingCard: {
    backgroundColor: theme.colors.cardBackground,
    elevation: 4,
    marginBottom: 15,
  },
  loadingText: {
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});