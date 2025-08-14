import React from 'react';
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
  Paragraph,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { theme } from '../theme/theme';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate('Consent');
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Title style={styles.title}>Welcome to</Title>
          <Text style={styles.appName}>AdSight</Text>
          <Paragraph style={styles.subtitle}>
            Privacy-First Ad Prediction Tool
          </Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>What is AdSight?</Title>
            <Paragraph style={styles.description}>
              AdSight is a completely offline, zero-cost tool that predicts likely advertisements 
              you might see on various platforms including:
            </Paragraph>
            
            <View style={styles.platformList}>
              <Text style={styles.platformItem}>• YouTube & Google</Text>
              <Text style={styles.platformItem}>• Facebook & Instagram</Text>
              <Text style={styles.platformItem}>• TikTok & LinkedIn</Text>
              <Text style={styles.platformItem}>• Amazon</Text>
            </View>

            <Paragraph style={styles.description}>
              Using your provided data, AdSight creates predictions about advertising content 
              you might encounter, helping you understand how your digital footprint influences 
              the ads you see.
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Key Features</Title>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>🔒 Completely Offline & Private</Text>
              <Text style={styles.featureItem}>💰 Zero Cost, Forever</Text>
              <Text style={styles.featureItem}>🧠 AI-Powered Predictions</Text>
              <Text style={styles.featureItem}>📊 Detailed Analytics</Text>
              <Text style={styles.featureItem}>🎯 Platform-Specific Insights</Text>
              <Text style={styles.featureItem}>🔄 Regular Updates Available</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Privacy Commitment</Title>
            <Paragraph style={styles.description}>
              Your data never leaves your device. All processing happens locally on your phone, 
              ensuring complete privacy and control over your information.
            </Paragraph>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleGetStarted}
          style={styles.getStartedButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Get Started
        </Button>

        <Text style={styles.footer}>
          Open Source • MIT Licensed • Privacy First
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    minHeight: height,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    color: theme.colors.text,
    textAlign: 'center',
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    opacity: 0.8,
  },
  card: {
    marginBottom: 20,
    backgroundColor: theme.colors.cardBackground,
    elevation: 4,
  },
  cardTitle: {
    color: theme.colors.text,
    marginBottom: 10,
  },
  description: {
    color: theme.colors.text,
    lineHeight: 24,
    opacity: 0.9,
  },
  platformList: {
    marginVertical: 15,
  },
  platformItem: {
    color: theme.colors.text,
    fontSize: 16,
    marginBottom: 5,
    opacity: 0.9,
  },
  featureList: {
    marginTop: 10,
  },
  featureItem: {
    color: theme.colors.text,
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.9,
  },
  getStartedButton: {
    marginTop: 30,
    marginBottom: 20,
    backgroundColor: theme.colors.success,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    textAlign: 'center',
    color: theme.colors.text,
    opacity: 0.7,
    fontSize: 12,
    marginBottom: 20,
  },
});