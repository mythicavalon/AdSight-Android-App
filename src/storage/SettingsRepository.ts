import { getDatabase } from './Database';

export class SettingsRepository {
  async getString(key: string): Promise<string | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_settings WHERE key = ?',
      key,
    );
    return row?.value ?? null;
  }

  async setString(key: string, value: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
      key,
      value,
    );
  }

  async getBoolean(key: string, fallback = false): Promise<boolean> {
    const value = await this.getString(key);
    return value === null ? fallback : value === 'true';
  }

  async setBoolean(key: string, value: boolean): Promise<void> {
    await this.setString(key, value ? 'true' : 'false');
  }

  async delete(key: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM app_settings WHERE key = ?', key);
  }

  async clearAll(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM app_settings');
  }
}

export const settingsRepository = new SettingsRepository();
