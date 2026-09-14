import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';

import { migrateDatabase } from './migrations';

const DATABASE_NAME = 'adsight.db';
const DATABASE_KEY_NAME = 'adsight.sqlite.key.v1';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function getOrCreateDatabaseKey(): Promise<string> {
  const existingKey = await SecureStore.getItemAsync(DATABASE_KEY_NAME, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });

  if (existingKey) return existingKey;

  const key = bytesToHex(await Crypto.getRandomBytesAsync(32));
  await SecureStore.setItemAsync(DATABASE_KEY_NAME, key, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return key;
}

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  const key = await getOrCreateDatabaseKey();

  // SQLCipher is enabled by app.json. The key must be set before querying the database.
  await db.execAsync(`PRAGMA key = '${key}'`);
  await db.execAsync('PRAGMA foreign_keys = ON');
  await db.execAsync('PRAGMA journal_mode = WAL');
  await migrateDatabase(db);

  return db;
}

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openDatabase().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}

export async function closeDatabase(): Promise<void> {
  if (!databasePromise) return;
  const db = await databasePromise;
  await db.closeAsync();
  databasePromise = null;
}

export async function deleteDatabase(): Promise<void> {
  await closeDatabase();
  await SQLite.deleteDatabaseAsync(DATABASE_NAME);
  await SecureStore.deleteItemAsync(DATABASE_KEY_NAME);
}
