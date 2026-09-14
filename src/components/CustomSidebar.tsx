import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Title, Divider, Avatar } from 'react-native-paper';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { Platform } from '../types';

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

export default function CustomSidebar({ navigation }: DrawerContentComponentProps) {
  const navigateToPlatform = (platform: Platform) => {
    navigation.navigate('Dashboard', { platform });
  };

  const navigateToScreen = (screenName: string) => {
    navigation.navigate(screenName as never);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.header}>
        <View style={styles.headerContent}>
          <Avatar.Text size={60} label="AS" style={styles.avatar} labelStyle={styles.avatarLabel} />
          <Title style={styles.appTitle}>AdSight</Title>
          <Text style={styles.appSubtitle}>Private · Local · Explainable</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateToScreen('Dashboard')}>
            <Text style={styles.menuIcon}>🏠</Text>
            <Text style={styles.menuText}>Overview</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateToScreen('Evidence')}>
            <Text style={styles.menuIcon}>🔎</Text>
            <Text style={styles.menuText}>Evidence Explorer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateToScreen('DataInput')}>
            <Text style={styles.menuIcon}>📝</Text>
            <Text style={styles.menuText}>My Data</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateToScreen('Import')}>
            <Text style={styles.menuIcon}>📥</Text>
            <Text style={styles.menuText}>Import Data</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateToScreen('Analytics')}>
            <Text style={styles.menuIcon}>📈</Text>
            <Text style={styles.menuText}>History & Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateToScreen('Settings')}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuText}>Privacy & Settings</Text>
          </TouchableOpacity>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platforms</Text>
          {(Object.keys(platformIcons) as Platform[]).map((platform) => (
            <TouchableOpacity key={platform} style={styles.platformItem} onPress={() => navigateToPlatform(platform)}>
              <Text style={styles.platformIcon}>{platformIcons[platform]}</Text>
              <Text style={styles.platformText}>{platformNames[platform]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>2.0.0</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Processing</Text>
            <Text style={styles.infoValue}>Local-first</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Your data. Your evidence. Your decision.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: { alignItems: 'center' },
  avatar: { backgroundColor: theme.colors.accent, marginBottom: 10 },
  avatarLabel: { color: theme.colors.text, fontWeight: 'bold' },
  appTitle: { color: theme.colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  appSubtitle: { color: theme.colors.text, fontSize: 12, opacity: 0.8, textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 15 },
  section: { marginVertical: 10 },
  sectionTitle: { color: theme.colors.text, fontSize: 14, fontWeight: 'bold', marginBottom: 10, opacity: 0.7, textTransform: 'uppercase' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8, marginBottom: 2 },
  menuIcon: { fontSize: 20, marginRight: 15, width: 25 },
  menuText: { color: theme.colors.text, fontSize: 16, flex: 1 },
  platformItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 8, marginBottom: 2, backgroundColor: theme.colors.accent },
  platformIcon: { fontSize: 18, marginRight: 15, width: 25 },
  platformText: { color: theme.colors.text, fontSize: 15, flex: 1 },
  divider: { backgroundColor: theme.colors.borderColor, marginVertical: 10 },
  infoItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 10 },
  infoLabel: { color: theme.colors.text, fontSize: 14, opacity: 0.7 },
  infoValue: { color: theme.colors.text, fontSize: 14, fontWeight: '500' },
  footer: { padding: 20, alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.colors.borderColor },
  footerText: { color: theme.colors.text, fontSize: 12, opacity: 0.6, textAlign: 'center' },
});
