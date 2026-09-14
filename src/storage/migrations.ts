import type { SQLiteDatabase } from 'expo-sqlite';

const CURRENT_SCHEMA_VERSION = 1;

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS imports (
        id TEXT PRIMARY KEY NOT NULL,
        source TEXT NOT NULL,
        format TEXT NOT NULL,
        imported_at INTEGER NOT NULL,
        row_count INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS signals (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL,
        source TEXT NOT NULL,
        value TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        strength REAL NOT NULL,
        import_id TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (import_id) REFERENCES imports(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_signals_type_timestamp
        ON signals(type, timestamp DESC);

      CREATE INDEX IF NOT EXISTS idx_signals_import
        ON signals(import_id);

      CREATE TABLE IF NOT EXISTS inference_snapshots (
        id TEXT PRIMARY KEY NOT NULL,
        platform TEXT NOT NULL,
        model_version TEXT NOT NULL,
        generated_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_snapshots_platform_generated
        ON inference_snapshots(platform, generated_at DESC);

      CREATE TABLE IF NOT EXISTS inference_results (
        id TEXT PRIMARY KEY NOT NULL,
        snapshot_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        category_name TEXT NOT NULL,
        score REAL NOT NULL,
        confidence REAL NOT NULL,
        data_quality REAL NOT NULL,
        FOREIGN KEY (snapshot_id) REFERENCES inference_snapshots(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS evidence (
        id TEXT PRIMARY KEY NOT NULL,
        result_id TEXT NOT NULL,
        signal_id TEXT NOT NULL,
        signal_type TEXT NOT NULL,
        source TEXT NOT NULL,
        value TEXT NOT NULL,
        contribution REAL NOT NULL,
        explanation TEXT NOT NULL,
        FOREIGN KEY (result_id) REFERENCES inference_results(id) ON DELETE CASCADE,
        FOREIGN KEY (signal_id) REFERENCES signals(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_evidence_result
        ON evidence(result_id, contribution DESC);

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );

      PRAGMA user_version = 1;
    `);
  }

  if (currentVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `Database schema ${currentVersion} is newer than this app supports (${CURRENT_SCHEMA_VERSION}).`,
    );
  }
}

export { CURRENT_SCHEMA_VERSION };
