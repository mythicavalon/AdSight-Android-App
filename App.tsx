import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { ActivityIndicator, Text, View } from 'react-native';

import { NotificationService } from './src/services/NotificationService';
import { getDatabase } from './src/storage/Database';
import { settingsRepository } from './src/storage/SettingsRepository';

import WelcomeScreen from './src/screens/WelcomeScreen';
import ConsentScreen from './src/screens/ConsentScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import V2DataInputScreen from './src/screens/V2DataInputScreen';
import V2SettingsScreen from './src/screens/V2SettingsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import CustomSidebar from './src/components/CustomSidebar';
import ImportDataScreen from './src/screens/ImportDataScreen';
import EvidenceExplorerScreen from './src/screens/EvidenceExplorerScreen';

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
      <Drawer.Screen name="Evidence" component={EvidenceExplorerScreen} options={{ title: 'Evidence Explorer' }} />
      <Drawer.Screen name="DataInput" component={V2DataInputScreen} options={{ title: 'Data Input' }} />
      <Drawer.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
      <Drawer.Screen name="Settings" component={V2SettingsScreen} options={{ title: 'Privacy Center' }} />
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
        await getDatabase();
        const onboardingComplete = await settingsRepository.getBoolean('onboarding_complete');
        if (!mounted) return;
        setHasCompletedOnboarding(onboardingComplete);
        void NotificationService.getInstance().initialize();
      } catch (error) {
        console.error('Error initializing AdSight:', error);
        if (mounted) setStartupError('AdSight could not initialize its private local database.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void initializeApp();
    return () => { mounted = false; };
  }, []);

  if (isLoading) {
    return (
      <PaperProvider theme={theme}>
        <View style={styles.startupState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.startupText}>Preparing your private workspace…</Text>
        </View>
      </PaperProvider>
    );
  }

  if (startupError) {
    return (
      <PaperProvider theme={theme}>
        <View style={styles.startupState}>
          <Text style={styles.startupTitle}>AdSight could not start</Text>
          <Text style={styles.startupText}>{startupError}</Text>
        </View>
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

const styles = {
  startupState: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  startupTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  startupText: {
    color: theme.colors.text,
    opacity: 0.72,
    textAlign: 'center' as const,
    marginTop: 12,
  },
};
