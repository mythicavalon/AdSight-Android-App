import * as Notifications from 'expo-notifications';
import { settingsRepository } from '../storage/SettingsRepository';

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
  private responseSubscription: Notifications.EventSubscription | null = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async scheduleProfileUpdateReminder(): Promise<void> {
    try {
      await this.cancelProfileUpdateReminders();

      const remindersEnabled = await settingsRepository.getBoolean('update_reminders_enabled');
      if (!remindersEnabled) return;

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'AdSight profile check-in',
          body: 'Review your advertising profile and refresh your data if you want to.',
          sound: true,
          data: { type: 'profile_update_reminder' },
        },
        trigger: {
          seconds: 60 * 60 * 24 * 30,
          repeats: true,
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        },
      });
    } catch (error) {
      console.error('Error scheduling profile update reminder:', error);
    }
  }

  async cancelProfileUpdateReminders(): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const reminders = scheduledNotifications.filter(
        (notification) => notification.content.data?.type === 'profile_update_reminder',
      );

      await Promise.all(
        reminders.map((notification) =>
          Notifications.cancelScheduledNotificationAsync(notification.identifier),
        ),
      );
    } catch (error) {
      console.error('Error cancelling profile update reminders:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  async showTestNotification(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) throw new Error('Notification permissions not granted');

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'AdSight test notification',
        body: 'Notifications are working on this device.',
        data: { type: 'test_notification' },
      },
      trigger: {
        seconds: 1,
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      },
    });
  }

  async getNotificationStatus(): Promise<{
    permissionGranted: boolean;
    remindersEnabled: boolean;
    scheduledCount: number;
  }> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      const remindersEnabled = await settingsRepository.getBoolean('update_reminders_enabled');
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

      return {
        permissionGranted: status === 'granted',
        remindersEnabled,
        scheduledCount: scheduledNotifications.length,
      };
    } catch (error) {
      return { permissionGranted: false, remindersEnabled: false, scheduledCount: 0 };
    }
  }

  setupNotificationResponseHandler(): void {
    this.responseSubscription?.remove();
    this.responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const type = response.notification.request.content.data?.type;
      if (type === 'profile_update_reminder') {
        console.log('Profile update reminder opened');
      }
    });
  }

  async initialize(): Promise<void> {
    try {
      this.setupNotificationResponseHandler();
      await this.scheduleProfileUpdateReminder();
    } catch (error) {
      // Notifications are optional. Never prevent the core app from starting.
      console.error('Notification initialization failed:', error);
    }
  }

  async updateSettings(remindersEnabled: boolean): Promise<void> {
    await settingsRepository.setBoolean('update_reminders_enabled', remindersEnabled);
    if (remindersEnabled) {
      await this.scheduleProfileUpdateReminder();
    } else {
      await this.cancelProfileUpdateReminders();
    }
  }
}
