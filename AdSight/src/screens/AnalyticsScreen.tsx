import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Title,
  ProgressBar,
  Chip,
  FAB,
  Portal,
  Modal,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PredictionEngine } from '../services/PredictionEngine';
import { Platform, UserProfile, AdPrediction } from '../types';
import { theme } from '../theme/theme';

const { width } = Dimensions.get('window');

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

export default function AnalyticsScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allPredictions, setAllPredictions] = useState<{ [platform in Platform]?: AdPrediction }>({});
  const [selectedMetric, setSelectedMetric] = useState<'confidence' | 'diversity' | 'coverage'>('confidence');
  const [showExportModal, setShowExportModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const predictionEngine = new PredictionEngine();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profileData = await AsyncStorage.getItem('user_profile');
      if (profileData) {
        const profile: UserProfile = JSON.parse(profileData);
        setUserProfile(profile);
        
        // Generate predictions for all platforms
        const predictions = predictionEngine.generateAllPredictions(profile);
        setAllPredictions(predictions);
        
        // Calculate analytics
        calculateAnalytics(profile, predictions);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const calculateAnalytics = (profile: UserProfile, predictions: { [platform in Platform]?: AdPrediction }) => {
    const analytics = {
      profileCompleteness: calculateProfileCompleteness(profile),
      platformCoverage: Object.keys(predictions).length,
      averageConfidence: calculateAverageConfidence(predictions),
      topCategories: findTopCategories(predictions),
      diversityScore: calculateDiversityScore(predictions),
      dataQuality: assessDataQuality(profile),
      trends: calculateTrends(predictions),
    };
    
    setAnalyticsData(analytics);
  };

  const calculateProfileCompleteness = (profile: UserProfile): number => {
    let score = 0;
    const maxScore = 5;
    
    if (profile.interests.length > 0) score += 1;
    if (profile.installedApps.length > 0) score += 1;
    if (profile.searches.length > 0) score += 1;
    if (profile.purchases.length > 0) score += 1;
    if (Object.keys(profile.adPreferences).length > 0) score += 1;
    
    return score / maxScore;
  };

  const calculateAverageConfidence = (predictions: { [platform in Platform]?: AdPrediction }): number => {
    const confidences = Object.values(predictions).map(p => p?.confidence || 0);
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  };

  const findTopCategories = (predictions: { [platform in Platform]?: AdPrediction }) => {
    const categoryFrequency: { [category: string]: number } = {};
    
    Object.values(predictions).forEach(prediction => {
      if (prediction) {
        prediction.categories.forEach(category => {
          categoryFrequency[category.name] = (categoryFrequency[category.name] || 0) + category.probability;
        });
      }
    });
    
    return Object.entries(categoryFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, score]) => ({ name, score }));
  };

  const calculateDiversityScore = (predictions: { [platform in Platform]?: AdPrediction }): number => {
    const allCategories = new Set<string>();
    
    Object.values(predictions).forEach(prediction => {
      if (prediction) {
        prediction.categories.forEach(category => {
          allCategories.add(category.name);
        });
      }
    });
    
    return Math.min(allCategories.size / 20, 1); // Normalize to 0-1 scale
  };

  const assessDataQuality = (profile: UserProfile) => {
    const factors = [
      { name: 'Interests', score: Math.min(profile.interests.length / 5, 1), weight: 0.3 },
      { name: 'App Usage', score: Math.min(profile.installedApps.length / 10, 1), weight: 0.2 },
      { name: 'Search History', score: Math.min(profile.searches.length / 10, 1), weight: 0.2 },
      { name: 'Purchase History', score: Math.min(profile.purchases.length / 5, 1), weight: 0.15 },
      { name: 'Ad Preferences', score: Math.min(Object.keys(profile.adPreferences).length / 3, 1), weight: 0.15 },
    ];
    
    const overallScore = factors.reduce((sum, factor) => sum + factor.score * factor.weight, 0);
    
    return { factors, overallScore };
  };

  const calculateTrends = (predictions: { [platform in Platform]?: AdPrediction }) => {
    // Simulate trend data based on predictions
    return Object.entries(predictions).map(([platform, prediction]) => ({
      platform: platform as Platform,
      confidence: prediction?.confidence || 0,
      topCategory: prediction?.categories[0]?.name || 'Unknown',
      categoryCount: prediction?.categories.length || 0,
    }));
  };

  const exportAnalytics = async () => {
    try {
      const exportData = {
        userProfile,
        predictions: allPredictions,
        analytics: analyticsData,
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
      };

      // In a real app, you would implement file export here
      console.log('Export data:', JSON.stringify(exportData, null, 2));
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting analytics:', error);
    }
  };

  const getMetricValue = (platform: Platform) => {
    const prediction = allPredictions[platform];
    if (!prediction) return 0;
    
    switch (selectedMetric) {
      case 'confidence':
        return prediction.confidence;
      case 'diversity':
        return Math.min(prediction.categories.length / 10, 1);
      case 'coverage':
        return prediction.categories.filter(cat => cat.probability > 0.3).length / 5;
      default:
        return 0;
    }
  };

  const getMetricColor = (value: number) => {
    if (value >= 0.7) return theme.colors.success;
    if (value >= 0.4) return theme.colors.warning;
    return theme.colors.error;
  };

  if (!analyticsData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Overview Cards */}
        <View style={styles.overviewGrid}>
          <Card style={styles.overviewCard}>
            <Card.Content style={styles.overviewCardContent}>
              <Text style={styles.overviewNumber}>
                {Math.round(analyticsData.profileCompleteness * 100)}%
              </Text>
              <Text style={styles.overviewLabel}>Profile Complete</Text>
            </Card.Content>
          </Card>

          <Card style={styles.overviewCard}>
            <Card.Content style={styles.overviewCardContent}>
              <Text style={styles.overviewNumber}>
                {Math.round(analyticsData.averageConfidence * 100)}%
              </Text>
              <Text style={styles.overviewLabel}>Avg Confidence</Text>
            </Card.Content>
          </Card>

          <Card style={styles.overviewCard}>
            <Card.Content style={styles.overviewCardContent}>
              <Text style={styles.overviewNumber}>
                {analyticsData.platformCoverage}
              </Text>
              <Text style={styles.overviewLabel}>Platforms</Text>
            </Card.Content>
          </Card>

          <Card style={styles.overviewCard}>
            <Card.Content style={styles.overviewCardContent}>
              <Text style={styles.overviewNumber}>
                {Math.round(analyticsData.diversityScore * 100)}%
              </Text>
              <Text style={styles.overviewLabel}>Diversity</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Platform Metrics */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Platform Analysis</Title>
            
            <View style={styles.metricSelector}>
              <Text style={styles.metricLabel}>View:</Text>
              <View style={styles.metricChips}>
                <Chip
                  selected={selectedMetric === 'confidence'}
                  onPress={() => setSelectedMetric('confidence')}
                  style={[styles.metricChip, selectedMetric === 'confidence' && styles.selectedMetricChip]}
                  textStyle={[styles.chipText, selectedMetric === 'confidence' && styles.selectedChipText]}
                >
                  Confidence
                </Chip>
                <Chip
                  selected={selectedMetric === 'diversity'}
                  onPress={() => setSelectedMetric('diversity')}
                  style={[styles.metricChip, selectedMetric === 'diversity' && styles.selectedMetricChip]}
                  textStyle={[styles.chipText, selectedMetric === 'diversity' && styles.selectedChipText]}
                >
                  Diversity
                </Chip>
                <Chip
                  selected={selectedMetric === 'coverage'}
                  onPress={() => setSelectedMetric('coverage')}
                  style={[styles.metricChip, selectedMetric === 'coverage' && styles.selectedMetricChip]}
                  textStyle={[styles.chipText, selectedMetric === 'coverage' && styles.selectedChipText]}
                >
                  Coverage
                </Chip>
              </View>
            </View>

            {(Object.keys(platformIcons) as Platform[]).map((platform) => {
              const value = getMetricValue(platform);
              return (
                <View key={platform} style={styles.platformMetric}>
                  <View style={styles.platformHeader}>
                    <Text style={styles.platformIcon}>{platformIcons[platform]}</Text>
                    <Text style={styles.platformName}>{platformNames[platform]}</Text>
                    <Text style={styles.platformValue}>{Math.round(value * 100)}%</Text>
                  </View>
                  <ProgressBar
                    progress={value}
                    color={getMetricColor(value)}
                    style={styles.platformProgress}
                  />
                </View>
              );
            })}
          </Card.Content>
        </Card>

        {/* Top Categories */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Top Ad Categories</Title>
            {analyticsData.topCategories.map((category: any, index: number) => (
              <View key={index} style={styles.categoryItem}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryScore}>
                  {Math.round(category.score * 100)}%
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Data Quality Assessment */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Data Quality</Title>
            <View style={styles.qualityOverview}>
              <Text style={styles.qualityScore}>
                {Math.round(analyticsData.dataQuality.overallScore * 100)}%
              </Text>
              <Text style={styles.qualityLabel}>Overall Quality</Text>
            </View>
            
            {analyticsData.dataQuality.factors.map((factor: any, index: number) => (
              <View key={index} style={styles.qualityFactor}>
                <View style={styles.factorHeader}>
                  <Text style={styles.factorName}>{factor.name}</Text>
                  <Text style={styles.factorScore}>
                    {Math.round(factor.score * 100)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={factor.score}
                  color={getMetricColor(factor.score)}
                  style={styles.factorProgress}
                />
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Platform Trends */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Platform Trends</Title>
            {analyticsData.trends.map((trend: any, index: number) => (
              <View key={index} style={styles.trendItem}>
                <View style={styles.trendHeader}>
                  <Text style={styles.trendIcon}>{platformIcons[trend.platform]}</Text>
                  <Text style={styles.trendPlatform}>{platformNames[trend.platform]}</Text>
                </View>
                <Text style={styles.trendCategory}>
                  Top: {trend.topCategory}
                </Text>
                <Text style={styles.trendStats}>
                  {trend.categoryCount} categories • {Math.round(trend.confidence * 100)}% confidence
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Recommendations */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Recommendations</Title>
            <View style={styles.recommendations}>
              {analyticsData.profileCompleteness < 0.8 && (
                <Text style={styles.recommendation}>
                  💡 Add more interests and preferences to improve prediction accuracy
                </Text>
              )}
              {analyticsData.averageConfidence < 0.6 && (
                <Text style={styles.recommendation}>
                  📊 Consider adding search history and purchase data for better insights
                </Text>
              )}
              {analyticsData.diversityScore < 0.5 && (
                <Text style={styles.recommendation}>
                  🎯 Explore different interest categories to see more diverse ad predictions
                </Text>
              )}
              {analyticsData.profileCompleteness >= 0.8 && analyticsData.averageConfidence >= 0.6 && (
                <Text style={styles.recommendation}>
                  ✅ Great job! Your profile provides high-quality predictions across platforms
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="export"
        onPress={() => setShowExportModal(true)}
        label="Export"
      />

      {/* Export Modal */}
      <Portal>
        <Modal
          visible={showExportModal}
          onDismiss={() => setShowExportModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Export Analytics</Title>
          <Text style={styles.modalText}>
            Export your analytics data including predictions, trends, and insights.
          </Text>
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowExportModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={exportAnalytics}
              style={styles.modalButton}
            >
              Export
            </Button>
          </View>
        </Modal>
      </Portal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  overviewCard: {
    width: (width - 45) / 2,
    marginBottom: 10,
    backgroundColor: theme.colors.cardBackground,
    elevation: 4,
  },
  overviewCardContent: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  overviewNumber: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  overviewLabel: {
    color: theme.colors.text,
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  card: {
    backgroundColor: theme.colors.cardBackground,
    elevation: 4,
    marginBottom: 15,
  },
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: 15,
  },
  metricSelector: {
    marginBottom: 20,
  },
  metricLabel: {
    color: theme.colors.text,
    fontSize: 14,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  metricChips: {
    flexDirection: 'row',
    gap: 8,
  },
  metricChip: {
    backgroundColor: theme.colors.accent,
  },
  selectedMetricChip: {
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.text,
  },
  selectedChipText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  platformMetric: {
    marginBottom: 15,
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformIcon: {
    fontSize: 18,
    marginRight: 10,
    width: 25,
  },
  platformName: {
    color: theme.colors.text,
    fontSize: 14,
    flex: 1,
  },
  platformValue: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  platformProgress: {
    height: 6,
    borderRadius: 3,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
  },
  categoryName: {
    color: theme.colors.text,
    fontSize: 14,
    flex: 1,
  },
  categoryScore: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  qualityOverview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qualityScore: {
    color: theme.colors.primary,
    fontSize: 32,
    fontWeight: 'bold',
  },
  qualityLabel: {
    color: theme.colors.text,
    fontSize: 14,
    opacity: 0.7,
  },
  qualityFactor: {
    marginBottom: 15,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  factorName: {
    color: theme.colors.text,
    fontSize: 14,
  },
  factorScore: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  factorProgress: {
    height: 6,
    borderRadius: 3,
  },
  trendItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  trendIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  trendPlatform: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  trendCategory: {
    color: theme.colors.text,
    fontSize: 14,
    marginBottom: 2,
  },
  trendStats: {
    color: theme.colors.text,
    fontSize: 12,
    opacity: 0.7,
  },
  recommendations: {
    gap: 12,
  },
  recommendation: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: theme.colors.accent,
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    color: theme.colors.text,
    marginBottom: 10,
  },
  modalText: {
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    minWidth: 80,
  },
  bottomSpacing: {
    height: 80,
  },
});