import { getDatabase } from './Database';
import { EvidenceItem, InferenceResult, InferenceSignal, InferenceSnapshot } from '../intelligence/v2Types';

export interface ImportRecord {
  id: string;
  source: string;
  format: string;
  importedAt: Date;
  rowCount: number;
  status: 'completed' | 'failed' | 'partial';
}

function toSignalRow(signal: InferenceSignal, importId?: string) {
  return {
    id: signal.id,
    type: signal.type,
    source: signal.source,
    value: signal.value,
    timestamp: signal.timestamp.getTime(),
    strength: signal.strength,
    importId: importId ?? null,
    createdAt: Date.now(),
  };
}

export class SignalRepository {
  async saveImport(record: ImportRecord): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO imports (id, source, format, imported_at, row_count, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      record.id,
      record.source,
      record.format,
      record.importedAt.getTime(),
      record.rowCount,
      record.status,
    );
  }

  async saveSignals(signals: InferenceSignal[], importId?: string): Promise<void> {
    if (signals.length === 0) return;
    const db = await getDatabase();

    await db.withTransactionAsync(async () => {
      for (const signal of signals) {
        const row = toSignalRow(signal, importId);
        await db.runAsync(
          `INSERT OR REPLACE INTO signals
             (id, type, source, value, timestamp, strength, import_id, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          row.id,
          row.type,
          row.source,
          row.value,
          row.timestamp,
          row.strength,
          row.importId,
          row.createdAt,
        );
      }
    });
  }

  async deleteImport(importId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM imports WHERE id = ?', importId);
  }

  async listSignals(limit = 500): Promise<InferenceSignal[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      id: string;
      type: InferenceSignal['type'];
      source: string;
      value: string;
      timestamp: number;
      strength: number;
    }>(
      `SELECT id, type, source, value, timestamp, strength
       FROM signals
       ORDER BY timestamp DESC
       LIMIT ?`,
      limit,
    );

    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      source: row.source,
      value: row.value,
      timestamp: new Date(row.timestamp),
      strength: row.strength,
    }));
  }

  async saveSnapshot(snapshot: InferenceSnapshot): Promise<void> {
    const db = await getDatabase();
    const snapshotId = `${snapshot.platform}:${snapshot.generatedAt.getTime()}:${snapshot.modelVersion}`;

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT OR REPLACE INTO inference_snapshots
           (id, platform, model_version, generated_at)
         VALUES (?, ?, ?, ?)`,
        snapshotId,
        snapshot.platform,
        snapshot.modelVersion,
        snapshot.generatedAt.getTime(),
      );

      for (const result of snapshot.results) {
        const resultId = `${snapshotId}:${result.categoryId}`;
        await db.runAsync(
          `INSERT OR REPLACE INTO inference_results
             (id, snapshot_id, category_id, category_name, score, confidence, data_quality)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          resultId,
          snapshotId,
          result.categoryId,
          result.categoryName,
          result.score,
          result.confidence,
          result.dataQuality,
        );

        for (const item of result.evidence) {
          await saveEvidence(db, resultId, item);
        }
      }
    });
  }
}

async function saveEvidence(db: Awaited<ReturnType<typeof getDatabase>>, resultId: string, item: EvidenceItem) {
  const evidenceId = `${resultId}:${item.signalId}`;
  await db.runAsync(
    `INSERT OR REPLACE INTO evidence
       (id, result_id, signal_id, signal_type, source, value, contribution, explanation)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    evidenceId,
    resultId,
    item.signalId,
    item.signalType,
    item.source,
    item.value,
    item.contribution,
    item.explanation,
  );
}
