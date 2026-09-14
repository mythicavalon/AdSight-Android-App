import { getDatabase } from './Database';

export class SettingsRepository {
  async getBoolean(key: string, fallback = false): Promise<boolean> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_settings WHERE key = ?',
      key,
    );
    if (!row) return fallback;
    return row.value === 'true';
  }

  async setBoolean(key: string, value: boolean): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
      key,
      value ? 'true' : 'false',
    );
  }

  async delete(key: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM app_settings WHERE key = ?', key);
  }
}

export const settingsRepository = new SettingsRepository();
