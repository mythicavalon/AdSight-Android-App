import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  BackHandler,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Title,
  Switch,
  List,
  Divider,
  Dialog,
  Portal,
  Paragraph,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { theme } from '../theme/theme';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [updateReminders, setUpdateReminders] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [storageSize, setStorageSize] = useState('0 KB');

  useEffect(() => {
    loadSettings();
    checkProfileExists();
    calculateStorageSize();
  }, []);

  const loadSettings = async () => {
    try {
      const reminders = await AsyncStorage.getItem('update_reminders_enabled');
      if (reminders !== null) {
        setUpdateReminders(reminders === 'true');
      }
      
      const darkModeEnabled = await AsyncStorage.getItem('dark_mode_enabled');
      if (darkModeEnabled !== null) {
        setDarkMode(darkModeEnabled === 'true');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const checkProfileExists = async () => {
    try {
      const profile = await AsyncStorage.getItem('user_profile');
      setProfileExists(profile !== null);
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  const calculateStorageSize = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      // Convert bytes to readable format
      if (totalSize < 1024) {
        setStorageSize(`${totalSize} B`);
      } else if (totalSize < 1024 * 1024) {
        setStorageSize(`${(totalSize / 1024).toFixed(1)} KB`);
      } else {
        setStorageSize(`${(totalSize / (1024 * 1024)).toFixed(1)} MB`);
      }
    } catch (error) {
      console.error('Error calculating storage size:', error);
    }
  };

  const toggleUpdateReminders = async () => {
    try {
      const newValue = !updateReminders;
      setUpdateReminders(newValue);
      await AsyncStorage.setItem('update_reminders_enabled', newValue.toString());
      
      if (newValue) {
        await setupNotifications();
      } else {
        await cancelNotifications();
      }
    } catch (error) {
      console.error('Error toggling update reminders:', error);
    }
  };

  const setupNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        // Schedule monthly reminder
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'AdSight Profile Update',
            body: 'Update your profile to keep predictions accurate!',
            sound: true,
          },
          trigger: {
            seconds: 60 * 60 * 24 * 30, // 30 days
            repeats: true,
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          },
        });
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const cancelNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const newValue = !darkMode;
      setDarkMode(newValue);
      await AsyncStorage.setItem('dark_mode_enabled', newValue.toString());
      
      Alert.alert(
        'Theme Changed',
        'The theme will be applied when you restart the app.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error toggling dark mode:', error);
    }
  };

  const handleDeleteAllData = async () => {
    try {
      // Get all keys
      const keys = await AsyncStorage.getAllKeys();
      
      // Remove all data
      await AsyncStorage.multiRemove(keys);
      
      // Cancel all notifications
      await cancelNotifications();
      
      Alert.alert(
        'Data Deleted',
        'All data has been permanently deleted. The app will now restart.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset navigation stack to onboarding
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' as never }],
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting data:', error);
      Alert.alert('Error', 'Failed to delete data. Please try again.');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleExitApp = () => {
    BackHandler.exitApp();
  };

  const confirmKillAndDelete = () => {
    Alert.alert(
      'Kill App & Delete Data',
      'This will permanently delete all your data and exit the app. This action cannot be undone.\n\nAre you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete & Exit',
          style: 'destructive',
          onPress: async () => {
            await handleDeleteAllData();
            setTimeout(() => {
              handleExitApp();
            }, 1000);
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const profile = await AsyncStorage.getItem('user_profile');
      const settings = await AsyncStorage.getItem('update_reminders_enabled');
      
      const exportData = {
        profile: profile ? JSON.parse(profile) : null,
        settings: {
          updateReminders: settings === 'true',
          darkMode,
        },
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
      };

      // In a real app, you would implement file sharing/export here
      Alert.alert(
        'Export Data',
        `Data exported successfully!\n\nSize: ${JSON.stringify(exportData).length} characters\n\nIn a real implementation, this would save to a file or share via email.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const handleClearCache = async () => {
    try {
      // Clear any cached predictions or temporary data
      await AsyncStorage.removeItem('cached_predictions');
      await AsyncStorage.removeItem('temp_data');
      
      Alert.alert('Success', 'Cache cleared successfully!');
      await calculateStorageSize();
    } catch (error) {
      console.error('Error clearing cache:', error);
      Alert.alert('Error', 'Failed to clear cache. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Profile Settings</Title>
            
            <List.Item
              title="Update Profile Data"
              description="Modify your interests and preferences"
              left={(props) => <List.Icon {...props} icon="account-edit" color={theme.colors.primary} />}
              onPress={() => navigation.navigate('DataInput' as never)}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
            />

            <List.Item
              title="Profile Status"
              description={profileExists ? 'Profile configured' : 'No profile found'}
              left={(props) => <List.Icon {...props} icon="account-check" color={profileExists ? theme.colors.success : theme.colors.error} />}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
            />
          </Card.Content>
        </Card>

        {/* Notification Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Notifications</Title>
            
            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>Profile Update Reminders</Text>
                <Text style={styles.switchDescription}>
                  Get monthly reminders to refresh your profile data
                </Text>
              </View>
              <Switch
                value={updateReminders}
                onValueChange={toggleUpdateReminders}
                color={theme.colors.primary}
              />
            </View>
          </Card.Content>
        </Card>

        {/* App Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>App Settings</Title>
            
            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>Dark Mode</Text>
                <Text style={styles.switchDescription}>
                  Use dark theme for better viewing in low light
                </Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={toggleDarkMode}
                color={theme.colors.primary}
              />
            </View>

            <Divider style={styles.divider} />

            <List.Item
              title="Clear Cache"
              description="Remove temporary files and cached data"
              left={(props) => <List.Icon {...props} icon="delete-sweep" color={theme.colors.warning} />}
              onPress={handleClearCache}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
            />
          </Card.Content>
        </Card>

        {/* Data Management */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Data Management</Title>
            
            <List.Item
              title="Export Data"
              description="Save your profile data as a backup"
              left={(props) => <List.Icon {...props} icon="export" color={theme.colors.info} />}
              onPress={handleExportData}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
            />

            <List.Item
              title="Data Storage"
              description={`Currently using ${storageSize} of local storage`}
              left={(props) => <List.Icon {...props} icon="database" color={theme.colors.primary} />}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
            />
          </Card.Content>
        </Card>

        {/* Privacy & Security */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Privacy & Security</Title>
            
            <List.Item
              title="Privacy Policy"
              description="Your data never leaves this device"
              left={(props) => <List.Icon {...props} icon="shield-check" color={theme.colors.success} />}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
            />

            <List.Item
              title="Data Processing"
              description="100% offline • No network connections"
              left={(props) => <List.Icon {...props} icon="wifi-off" color={theme.colors.success} />}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
            />
          </Card.Content>
        </Card>

        {/* About */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>About AdSight</Title>
            
            <List.Item
              title="Version"
              description="1.0.0"
              left={(props) => <List.Icon {...props} icon="information" color={theme.colors.primary} />}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
            />

            <List.Item
              title="License"
              description="MIT License • Open Source"
              left={(props) => <List.Icon {...props} icon="license" color={theme.colors.primary} />}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
            />

            <List.Item
              title="Author"
              description="Amal Reji Nair"
              left={(props) => <List.Icon {...props} icon="account-circle" color={theme.colors.primary} />}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
            />
          </Card.Content>
        </Card>

        {/* Danger Zone */}
        <Card style={[styles.card, styles.dangerCard]}>
          <Card.Content>
            <Title style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Title>
            
            <Button
              mode="outlined"
              onPress={() => setShowDeleteDialog(true)}
              style={styles.dangerButton}
              labelStyle={styles.dangerButtonLabel}
              icon="delete-forever"
            >
              Delete All Data
            </Button>

            <Button
              mode="contained"
              onPress={confirmKillAndDelete}
              style={styles.killButton}
              labelStyle={styles.killButtonLabel}
              icon="power"
            >
              Kill App & Delete Data
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title style={styles.dialogTitle}>Delete All Data</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={styles.dialogText}>
              This will permanently delete all your profile data, preferences, and settings. 
              This action cannot be undone.
            </Paragraph>
            <Paragraph style={[styles.dialogText, styles.warningText]}>
              Are you sure you want to continue?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button
              onPress={handleDeleteAllData}
              textColor={theme.colors.error}
              style={styles.deleteConfirmButton}
            >
              Delete All
            </Button>
          </Dialog.Actions>
        </Dialog>
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
  card: {
    backgroundColor: theme.colors.cardBackground,
    elevation: 4,
    marginBottom: 15,
  },
  dangerCard: {
    borderColor: theme.colors.error,
    borderWidth: 1,
  },
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: 10,
  },
  dangerTitle: {
    color: theme.colors.error,
  },
  listItem: {
    paddingVertical: 8,
  },
  listTitle: {
    color: theme.colors.text,
    fontSize: 16,
  },
  listDescription: {
    color: theme.colors.text,
    opacity: 0.7,
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  switchTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  switchDescription: {
    color: theme.colors.text,
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
  },
  divider: {
    backgroundColor: theme.colors.borderColor,
    marginVertical: 10,
  },
  dangerButton: {
    borderColor: theme.colors.error,
    marginBottom: 10,
  },
  dangerButtonLabel: {
    color: theme.colors.error,
  },
  killButton: {
    backgroundColor: theme.colors.error,
  },
  killButtonLabel: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dialogTitle: {
    color: theme.colors.text,
  },
  dialogText: {
    color: theme.colors.text,
    lineHeight: 22,
  },
  warningText: {
    color: theme.colors.error,
    fontWeight: 'bold',
    marginTop: 10,
  },
  deleteConfirmButton: {
    backgroundColor: theme.colors.error,
  },
  bottomSpacing: {
    height: 30,
  },
});