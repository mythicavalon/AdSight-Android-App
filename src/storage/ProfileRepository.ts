import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';
import { settingsRepository } from './SettingsRepository';

const PROFILE_KEY = 'user_profile';

function reviveProfile(raw: string): UserProfile | null {
  try {
    const parsed = JSON.parse(raw) as UserProfile;
    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      lastUpdated: new Date(parsed.lastUpdated),
      searches: parsed.searches.map((item) => ({ ...item, timestamp: new Date(item.timestamp) })),
      purchases: parsed.purchases.map((item) => ({ ...item, timestamp: new Date(item.timestamp) })),
    };
  } catch (error) {
    console.error('Stored profile could not be parsed:', error);
    return null;
  }
}

export class ProfileRepository {
  async get(): Promise<UserProfile | null> {
    const encryptedRaw = await settingsRepository.getString(PROFILE_KEY);
    if (encryptedRaw) return reviveProfile(encryptedRaw);

    // One-time bridge for profiles created by the V1 screen. A successful read
    // immediately moves the profile into encrypted SQLite and removes the legacy copy.
    const legacyRaw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!legacyRaw) return null;

    const profile = reviveProfile(legacyRaw);
    if (!profile) return null;

    await this.save(profile);
    await AsyncStorage.removeItem(PROFILE_KEY);
    return profile;
  }

  async save(profile: UserProfile): Promise<void> {
    await settingsRepository.setString(PROFILE_KEY, JSON.stringify(profile));
  }

  async delete(): Promise<void> {
    await settingsRepository.delete(PROFILE_KEY);
    await AsyncStorage.removeItem(PROFILE_KEY);
  }
}

export const profileRepository = new ProfileRepository();
