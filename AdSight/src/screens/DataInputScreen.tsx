import React, { useState, useEffect } from 'react';
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
  TextInput,
  Chip,
  Divider,
  Switch,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { UserProfile, Platform } from '../types';
import { theme } from '../theme/theme';

const platformNames: { [key in Platform]: string } = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  google: 'Google',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  amazon: 'Amazon',
};

export default function DataInputScreen() {
  const navigation = useNavigation();
  const [profileName, setProfileName] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [currentInterest, setCurrentInterest] = useState('');
  const [adPreferences, setAdPreferences] = useState<{ [key: string]: string[] }>({});
  const [currentAdPref, setCurrentAdPref] = useState('');
  const [selectedPlatformForAds, setSelectedPlatformForAds] = useState<Platform>('facebook');
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [currentSearch, setCurrentSearch] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<string[]>([]);
  const [currentPurchase, setCurrentPurchase] = useState('');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadExistingProfile();
  }, []);

  const loadExistingProfile = async () => {
    try {
      const profileData = await AsyncStorage.getItem('user_profile');
      if (profileData) {
        const profile: UserProfile = JSON.parse(profileData);
        setProfileName(profile.name);
        setInterests(profile.interests);
        setAdPreferences(profile.adPreferences);
        setSearchQueries(profile.searches.map(s => s.query));
        setPurchaseItems(profile.purchases.map(p => p.item));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const addInterest = () => {
    if (currentInterest.trim() && !interests.includes(currentInterest.trim())) {
      setInterests([...interests, currentInterest.trim()]);
      setCurrentInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const addAdPreference = () => {
    if (currentAdPref.trim()) {
      const platformPrefs = adPreferences[selectedPlatformForAds] || [];
      if (!platformPrefs.includes(currentAdPref.trim())) {
        setAdPreferences({
          ...adPreferences,
          [selectedPlatformForAds]: [...platformPrefs, currentAdPref.trim()]
        });
        setCurrentAdPref('');
      }
    }
  };

  const removeAdPreference = (platform: Platform, preference: string) => {
    const platformPrefs = adPreferences[platform] || [];
    setAdPreferences({
      ...adPreferences,
      [platform]: platformPrefs.filter(p => p !== preference)
    });
  };

  const addSearchQuery = () => {
    if (currentSearch.trim() && !searchQueries.includes(currentSearch.trim())) {
      setSearchQueries([...searchQueries, currentSearch.trim()]);
      setCurrentSearch('');
    }
  };

  const removeSearchQuery = (query: string) => {
    setSearchQueries(searchQueries.filter(q => q !== query));
  };

  const addPurchaseItem = () => {
    if (currentPurchase.trim() && !purchaseItems.includes(currentPurchase.trim())) {
      setPurchaseItems([...purchaseItems, currentPurchase.trim()]);
      setCurrentPurchase('');
    }
  };

  const removePurchaseItem = (item: string) => {
    setPurchaseItems(purchaseItems.filter(i => i !== item));
  };

  const saveProfile = async () => {
    if (!profileName.trim()) {
      Alert.alert('Error', 'Please enter a profile name');
      return;
    }

    if (interests.length === 0) {
      Alert.alert('Error', 'Please add at least one interest');
      return;
    }

    setIsLoading(true);
    try {
      const profile: UserProfile = {
        id: `user_${Date.now()}`,
        name: profileName.trim(),
        interests,
        demographics: {},
        adPreferences: adPreferences as { [platform in Platform]?: string[] },
        installedApps: [], // This would be populated by app usage detection
        searches: searchQueries.map(query => ({
          query,
          platform: 'google' as Platform,
          timestamp: new Date()
        })),
        purchases: purchaseItems.map(item => ({
          item,
          category: 'general',
          platform: 'amazon' as Platform,
          timestamp: new Date()
        })),
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      await AsyncStorage.setItem('user_profile', JSON.stringify(profile));
      await AsyncStorage.setItem('update_reminders_enabled', enableNotifications.toString());

      Alert.alert(
        'Success',
        'Your profile has been saved! You can now view ad predictions.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Dashboard')
          }
        ]
      );
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleData = () => {
    Alert.alert(
      'Load Sample Data',
      'This will replace your current data with sample information. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Continue',
          onPress: () => {
            setProfileName('Sample User Profile');
            setInterests(['technology', 'programming', 'fitness', 'travel', 'photography']);
            setAdPreferences({
              facebook: ['tech gadgets', 'fitness equipment', 'travel deals'],
              google: ['programming courses', 'tech reviews', 'workout plans'],
              amazon: ['electronics', 'books', 'fitness gear']
            });
            setSearchQueries(['best programming laptop 2024', 'workout routines', 'travel photography tips']);
            setPurchaseItems(['wireless headphones', 'programming books', 'fitness tracker']);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Name */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Profile Information</Title>
            <TextInput
              label="Profile Name"
              value={profileName}
              onChangeText={setProfileName}
              style={styles.textInput}
              theme={{ colors: { primary: theme.colors.primary } }}
              placeholder="Enter a name for this profile"
            />
            
            <Button
              mode="outlined"
              onPress={loadSampleData}
              style={styles.sampleButton}
              labelStyle={styles.sampleButtonLabel}
            >
              Load Sample Data
            </Button>
          </Card.Content>
        </Card>

        {/* Interests */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Your Interests</Title>
            <Text style={styles.description}>
              Add topics you're interested in. These help predict relevant ad categories.
            </Text>
            
            <View style={styles.inputRow}>
              <TextInput
                label="Add Interest"
                value={currentInterest}
                onChangeText={setCurrentInterest}
                style={styles.flexTextInput}
                theme={{ colors: { primary: theme.colors.primary } }}
                placeholder="e.g., technology, cooking, fitness"
                onSubmitEditing={addInterest}
              />
              <Button
                mode="contained"
                onPress={addInterest}
                style={styles.addButton}
                contentStyle={styles.addButtonContent}
              >
                Add
              </Button>
            </View>

            <View style={styles.chipContainer}>
              {interests.map((interest, index) => (
                <Chip
                  key={index}
                  onClose={() => removeInterest(interest)}
                  style={styles.chip}
                  textStyle={styles.chipText}
                >
                  {interest}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Ad Preferences */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Platform Ad Preferences</Title>
            <Text style={styles.description}>
              Add ad categories or topics you've seen or are interested in for each platform.
            </Text>

            <View style={styles.platformSelector}>
              <Text style={styles.platformLabel}>Select Platform:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.platformChips}>
                  {(Object.keys(platformNames) as Platform[]).map((platform) => (
                    <Chip
                      key={platform}
                      selected={selectedPlatformForAds === platform}
                      onPress={() => setSelectedPlatformForAds(platform)}
                      style={[
                        styles.platformChip,
                        selectedPlatformForAds === platform && styles.selectedPlatformChip
                      ]}
                      textStyle={[
                        styles.chipText,
                        selectedPlatformForAds === platform && styles.selectedChipText
                      ]}
                    >
                      {platformNames[platform]}
                    </Chip>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputRow}>
              <TextInput
                label={`Add ${platformNames[selectedPlatformForAds]} Ad Preference`}
                value={currentAdPref}
                onChangeText={setCurrentAdPref}
                style={styles.flexTextInput}
                theme={{ colors: { primary: theme.colors.primary } }}
                placeholder="e.g., tech gadgets, fashion, food delivery"
                onSubmitEditing={addAdPreference}
              />
              <Button
                mode="contained"
                onPress={addAdPreference}
                style={styles.addButton}
                contentStyle={styles.addButtonContent}
              >
                Add
              </Button>
            </View>

            {Object.keys(adPreferences).map((platform) => (
              <View key={platform} style={styles.platformSection}>
                <Text style={styles.platformSectionTitle}>
                  {platformNames[platform as Platform]}
                </Text>
                <View style={styles.chipContainer}>
                  {(adPreferences[platform] || []).map((pref, index) => (
                    <Chip
                      key={index}
                      onClose={() => removeAdPreference(platform as Platform, pref)}
                      style={styles.chip}
                      textStyle={styles.chipText}
                    >
                      {pref}
                    </Chip>
                  ))}
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Search History */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Search History (Optional)</Title>
            <Text style={styles.description}>
              Add search queries you've made. This helps improve prediction accuracy.
            </Text>

            <View style={styles.inputRow}>
              <TextInput
                label="Add Search Query"
                value={currentSearch}
                onChangeText={setCurrentSearch}
                style={styles.flexTextInput}
                theme={{ colors: { primary: theme.colors.primary } }}
                placeholder="e.g., best smartphone 2024, healthy recipes"
                onSubmitEditing={addSearchQuery}
              />
              <Button
                mode="contained"
                onPress={addSearchQuery}
                style={styles.addButton}
                contentStyle={styles.addButtonContent}
              >
                Add
              </Button>
            </View>

            <View style={styles.chipContainer}>
              {searchQueries.map((query, index) => (
                <Chip
                  key={index}
                  onClose={() => removeSearchQuery(query)}
                  style={styles.chip}
                  textStyle={styles.chipText}
                >
                  {query}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Purchase History */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Purchase History (Optional)</Title>
            <Text style={styles.description}>
              Add items you've purchased online. This helps predict shopping-related ads.
            </Text>

            <View style={styles.inputRow}>
              <TextInput
                label="Add Purchase Item"
                value={currentPurchase}
                onChangeText={setCurrentPurchase}
                style={styles.flexTextInput}
                theme={{ colors: { primary: theme.colors.primary } }}
                placeholder="e.g., wireless headphones, yoga mat, cookbook"
                onSubmitEditing={addPurchaseItem}
              />
              <Button
                mode="contained"
                onPress={addPurchaseItem}
                style={styles.addButton}
                contentStyle={styles.addButtonContent}
              >
                Add
              </Button>
            </View>

            <View style={styles.chipContainer}>
              {purchaseItems.map((item, index) => (
                <Chip
                  key={index}
                  onClose={() => removePurchaseItem(item)}
                  style={styles.chip}
                  textStyle={styles.chipText}
                >
                  {item}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Notification Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Notification Settings</Title>
            
            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>Profile Update Reminders</Text>
                <Text style={styles.switchDescription}>
                  Get monthly reminders to update your profile for better predictions
                </Text>
              </View>
              <Switch
                value={enableNotifications}
                onValueChange={setEnableNotifications}
                color={theme.colors.primary}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Save Button */}
        <Button
          mode="contained"
          onPress={saveProfile}
          loading={isLoading}
          disabled={isLoading}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
          labelStyle={styles.saveButtonLabel}
        >
          {isLoading ? 'Saving Profile...' : 'Save Profile & Generate Predictions'}
        </Button>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  card: {
    backgroundColor: theme.colors.cardBackground,
    elevation: 4,
    marginBottom: 15,
  },
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: 10,
  },
  description: {
    color: theme.colors.text,
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 15,
    lineHeight: 20,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 15,
    gap: 10,
  },
  flexTextInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
  },
  addButtonContent: {
    paddingVertical: 5,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    backgroundColor: theme.colors.accent,
  },
  chipText: {
    color: theme.colors.text,
  },
  platformSelector: {
    marginBottom: 15,
  },
  platformLabel: {
    color: theme.colors.text,
    fontSize: 14,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  platformChips: {
    flexDirection: 'row',
    gap: 8,
  },
  platformChip: {
    backgroundColor: theme.colors.accent,
  },
  selectedPlatformChip: {
    backgroundColor: theme.colors.primary,
  },
  selectedChipText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  platformSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderColor,
  },
  platformSectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  switchTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  switchDescription: {
    color: theme.colors.text,
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
  },
  sampleButton: {
    borderColor: theme.colors.primary,
    marginTop: 10,
  },
  sampleButtonLabel: {
    color: theme.colors.primary,
  },
  saveButton: {
    backgroundColor: theme.colors.success,
    marginTop: 20,
    marginBottom: 10,
  },
  saveButtonContent: {
    paddingVertical: 12,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 30,
  },
});