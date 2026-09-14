import { UserProfile } from '../types';
import { settingsRepository } from './SettingsRepository';

const PROFILE_KEY = 'user_profile';

export class ProfileRepository {
  async get(): Promise<UserProfile | null> {
    const raw = await settingsRepository.getString(PROFILE_KEY);
    if (!raw) return null;

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

  async save(profile: UserProfile): Promise<void> {
    await settingsRepository.setString(PROFILE_KEY, JSON.stringify(profile));
  }

  async delete(): Promise<void> {
    await settingsRepository.delete(PROFILE_KEY);
  }
}

export const profileRepository = new ProfileRepository();
