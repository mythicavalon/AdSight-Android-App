import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';

import { NotificationService } from './src/services/NotificationService';
import { getDatabase } from './src/storage/Database';
import { settingsRepository } from './src/storage/SettingsRepository';

import WelcomeScreen from './src/screens/WelcomeScreen';
import ConsentScreen from './src/screens/ConsentScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import DataInputScreen from './src/screens/DataInputScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import CustomSidebar from './src/components/CustomSidebar';
import ImportDataScreen from './src/screens/ImportDataScreen';

import { theme } from './src/theme/theme';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function MainAppNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomSidebar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        drawerStyle: { backgroundColor: theme.colors.surface, width: 280 },
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'AdSight Dashboard' }} />
      <Drawer.Screen name="DataInput" component={DataInputScreen} options={{ title: 'Data Input' }} />
      <Drawer.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Drawer.Screen name="Import" component={ImportDataScreen} options={{ title: 'Import Data' }} />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        // Opening the database also runs all pending migrations before the UI is shown.
        await getDatabase();
        const onboardingComplete = await settingsRepository.getBoolean('onboarding_complete');

        if (!mounted) return;
        setHasCompletedOnboarding(onboardingComplete);

        // Notifications are optional and must never block the core app.
        void NotificationService.getInstance().initialize();
      } catch (error) {
        console.error('Error initializing AdSight:', error);
        if (mounted) setStartupError('AdSight could not initialize its private local database.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void initializeApp();
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return null;
  }

  if (startupError) {
    return (
      <PaperProvider theme={theme}>
        <StatusBar style="light" backgroundColor={theme.colors.primary} />
        <WelcomeScreen />
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!hasCompletedOnboarding ? (
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Consent" component={ConsentScreen} />
            </>
          ) : (
            <Stack.Screen name="Main" component={MainAppNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
