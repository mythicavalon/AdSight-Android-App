import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications should be handled when the app is running
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Request notification permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Schedule monthly profile update reminders
   */
  async scheduleProfileUpdateReminder(): Promise<void> {
    try {
      // Cancel any existing reminders first
      await this.cancelProfileUpdateReminders();

      // Check if reminders are enabled
      const remindersEnabled = await AsyncStorage.getItem('update_reminders_enabled');
      if (remindersEnabled !== 'true') {
        return;
      }

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Notification permissions not granted');
        return;
      }

      // Schedule monthly reminder
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 AdSight Profile Update',
          body: 'Time to refresh your profile for more accurate ad predictions!',
          sound: true,
          data: {
            type: 'profile_update_reminder',
            timestamp: new Date().toISOString(),
          },
        },
        trigger: {
          seconds: 60 * 60 * 24 * 30, // 30 days
          repeats: true,
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        },
      });

      console.log('Profile update reminder scheduled');
    } catch (error) {
      console.error('Error scheduling profile update reminder:', error);
    }
  }

  /**
   * Cancel all profile update reminders
   */
  async cancelProfileUpdateReminders(): Promise<void> {
    try {
      // Get all scheduled notifications
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      // Find and cancel profile update reminders
      const reminderNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.type === 'profile_update_reminder'
      );

      for (const notification of reminderNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }

      console.log(`Cancelled ${reminderNotifications.length} profile update reminders`);
    } catch (error) {
      console.error('Error cancelling profile update reminders:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  /**
   * Show immediate notification for testing
   */
  async showTestNotification(): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Notification permissions not granted');
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 AdSight Test',
          body: 'This is a test notification from AdSight!',
          sound: true,
          data: {
            type: 'test_notification',
            timestamp: new Date().toISOString(),
          },
        },
        trigger: {
          seconds: 1,
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        },
      });

      console.log('Test notification scheduled');
    } catch (error) {
      console.error('Error showing test notification:', error);
      throw error;
    }
  }

  /**
   * Get notification settings status
   */
  async getNotificationStatus(): Promise<{
    permissionGranted: boolean;
    remindersEnabled: boolean;
    scheduledCount: number;
  }> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      const remindersEnabled = await AsyncStorage.getItem('update_reminders_enabled');
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      return {
        permissionGranted: status === 'granted',
        remindersEnabled: remindersEnabled === 'true',
        scheduledCount: scheduledNotifications.length,
      };
    } catch (error) {
      console.error('Error getting notification status:', error);
      return {
        permissionGranted: false,
        remindersEnabled: false,
        scheduledCount: 0,
      };
    }
  }

  /**
   * Handle notification response when user taps on a notification
   */
  setupNotificationResponseHandler(): void {
    Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      switch (data?.type) {
        case 'profile_update_reminder':
          // Navigate to data input screen or show reminder modal
          console.log('Profile update reminder tapped');
          break;
        case 'test_notification':
          console.log('Test notification tapped');
          break;
        default:
          console.log('Unknown notification tapped:', data);
      }
    });
  }

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    try {
      // Set up notification response handler
      this.setupNotificationResponseHandler();
      
      // Schedule reminders if enabled
      await this.scheduleProfileUpdateReminder();
      
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  /**
   * Update notification settings
   */
  async updateSettings(remindersEnabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem('update_reminders_enabled', remindersEnabled.toString());
      
      if (remindersEnabled) {
        await this.scheduleProfileUpdateReminder();
      } else {
        await this.cancelProfileUpdateReminders();
      }
      
      console.log(`Notification settings updated: reminders ${remindersEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  }
}