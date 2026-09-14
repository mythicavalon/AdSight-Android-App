// Platform types for ad predictions
export type Platform = 'facebook' | 'instagram' | 'google' | 'youtube' | 'tiktok' | 'linkedin' | 'amazon';

// User data types
export interface UserProfile {
  id: string;
  name: string;
  interests: string[];
  demographics: {
    age?: number;
    gender?: string;
    location?: string;
  };
  adPreferences: {
    [platform in Platform]?: string[];
  };
  installedApps: AppUsage[];
  searches: SearchHistory[];
  purchases: PurchaseHistory[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface AppUsage {
  packageName: string;
  appName: string;
  usageTime: number;
  category: string;
}

export interface SearchHistory {
  query: string;
  platform: Platform;
  timestamp: Date;
}

export interface PurchaseHistory {
  item: string;
  category: string;
  platform: Platform;
  timestamp: Date;
}

export interface AdPrediction {
  platform: Platform;
  categories: AdCategory[];
  confidence: number;
  reasoning: string[];
}

export interface AdCategory {
  name: string;
  probability: number;
  examples: string[];
}

export interface AdMapping {
  platforms: {
    [platform in Platform]: PlatformMapping;
  };
}

export interface PlatformMapping {
  name: string;
  categories: CategoryMapping[];
  rules: PredictionRule[];
}

export interface CategoryMapping {
  id: string;
  name: string;
  keywords: string[];
  examples: string[];
  weight: number;
}

export interface PredictionRule {
  trigger: {
    type: 'interest' | 'search' | 'purchase' | 'app';
    keywords: string[];
  };
  result: {
    categories: string[];
    confidence: number;
  };
}

export interface AppSettings {
  profileUpdateReminder: boolean;
  reminderFrequency: 'weekly' | 'monthly' | 'quarterly';
  enableNotifications: boolean;
  darkMode: boolean;
  enableAnalytics: boolean;
  multipleProfiles: boolean;
}

export type RootStackParamList = {
  Welcome: undefined;
  Consent: undefined;
  Main: undefined;
};

export type MainDrawerParamList = {
  Dashboard: { platform?: Platform };
  DataInput: undefined;
  Analytics: undefined;
  Settings: undefined;
  Import: undefined;
  Evidence: { platform?: Platform };
};