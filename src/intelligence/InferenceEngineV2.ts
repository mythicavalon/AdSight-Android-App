import adMappingsData from '../data/adMappings.json';
import {
  AppUsage,
  Platform,
  PurchaseHistory,
  SearchHistory,
  UserProfile,
} from '../types';
import { clamp01, normalizedStrength, recencyMultiplier } from './Recency';
import {
  EvidenceItem,
  InferenceResult,
  InferenceSignal,
  InferenceSnapshot,
} from './v2Types';

const MODEL_VERSION = 'v2.0.0-evidence';

const TYPE_WEIGHT: Record<InferenceSignal['type'], number> = {
  interest: 1.0,
  ad_preference: 2.2,
  app_usage: 0.8,
  search: 1.4,
  purchase: 2.0,
};

function stableId(prefix: string, index: number): string {
  return `${prefix}_${index}`;
}

function textMatches(text: string, keyword: string): boolean {
  const haystack = text.trim().toLowerCase();
  const needle = keyword.trim().toLowerCase();
  return needle.length > 0 && haystack.includes(needle);
}

function toSignals(profile: UserProfile): InferenceSignal[] {
  const signals: InferenceSignal[] = [];
  let index = 0;

  profile.interests.forEach((value) => {
    signals.push({
      id: stableId('interest', index++),
      type: 'interest',
      source: 'user-provided interest',
      value,
      timestamp: profile.lastUpdated,
      strength: 1,
    });
  });

  (Object.keys(profile.adPreferences) as Platform[]).forEach((platform) => {
    (profile.adPreferences[platform] || []).forEach((value) => {
      signals.push({
        id: stableId(`preference_${platform}`, index++),
        type: 'ad_preference',
        source: `${platform} preference`,
        value,
        timestamp: profile.lastUpdated,
        strength: 1,
      });
    });
  });

  profile.installedApps.forEach((app: AppUsage) => {
    signals.push({
      id: stableId('app', index++),
      type: 'app_usage',
      source: 'user-provided app usage',
      value: `${app.appName} ${app.category}`,
      timestamp: profile.lastUpdated,
      strength: clamp01(app.usageTime / 180),
    });
  });

  profile.searches.forEach((search: SearchHistory) => {
    signals.push({
      id: stableId('search', index++),
      type: 'search',
      source: `${search.platform} search`,
      value: search.query,
      timestamp: search.timestamp,
      strength: 1,
    });
  });

  profile.purchases.forEach((purchase: PurchaseHistory) => {
    signals.push({
      id: stableId('purchase', index++),
      type: 'purchase',
      source: `${purchase.platform} purchase`,
      value: `${purchase.item} ${purchase.category}`,
      timestamp: purchase.timestamp,
      strength: 1,
    });
  });

  return signals;
}

function evidenceExplanation(type: InferenceSignal['type'], contribution: number): string {
  const direction = contribution >= 0 ? 'supports' : 'does not support';
  switch (type) {
    case 'purchase':
      return `Purchase evidence ${direction} this category.`;
    case 'ad_preference':
      return `An explicitly provided preference ${direction} this category.`;
    case 'search':
      return `Search activity ${direction} this category, with recency applied.`;
    case 'app_usage':
      return `App usage context ${direction} this category.`;
    default:
      return `A stated interest ${direction} this category.`;
  }
}

export class InferenceEngineV2 {
  readonly modelVersion = MODEL_VERSION;

  generate(profile: UserProfile, platform: Platform, now: Date = new Date()): InferenceSnapshot {
    const mapping = adMappingsData.platforms[platform];
    if (!mapping) throw new Error(`Unsupported platform: ${platform}`);

    const signals = toSignals(profile);
    const results: InferenceResult[] = mapping.categories.map((category) => {
      const evidence: EvidenceItem[] = [];
      let rawScore = 0;
      const matchedSignalIds = new Set<string>();

      signals.forEach((signal) => {
        const matched = category.keywords.some((keyword) => textMatches(signal.value, keyword));
        if (!matched) return;

        const recency = recencyMultiplier(signal.timestamp, now, signal.type === 'purchase' ? 90 : 30);
        const repetitionBoost = matchedSignalIds.has(signal.id) ? 1 : 1;
        const contribution = TYPE_WEIGHT[signal.type] * normalizedStrength(signal.strength) * recency * repetitionBoost;
        rawScore += contribution;
        matchedSignalIds.add(signal.id);

        evidence.push({
          signalId: signal.id,
          signalType: signal.type,
          source: signal.source,
          value: signal.value,
          contribution,
          explanation: evidenceExplanation(signal.type, contribution),
        });
      });

      const uniqueSignalTypes = new Set(evidence.map((item) => item.signalType)).size;
      const corroboration = Math.min(0.25, Math.max(0, uniqueSignalTypes - 1) * 0.08);
      const score = clamp01(rawScore / 6 + corroboration);
      const coverage = signals.length === 0 ? 0 : clamp01(evidence.length / Math.max(3, signals.length));
      const confidence = clamp01(0.15 + coverage * 0.45 + Math.min(0.25, evidence.length * 0.04) + corroboration);

      const uncertainty: string[] = [];
      if (signals.length === 0) uncertainty.push('No user-provided signals were available.');
      if (evidence.length === 0) uncertainty.push('No matching evidence was found for this category.');
      if (evidence.length > 0 && uniqueSignalTypes === 1) uncertainty.push('Evidence comes from only one signal type.');
      if (confidence < 0.5) uncertainty.push('Limited data means this inference should be treated cautiously.');

      evidence.sort((a, b) => b.contribution - a.contribution);

      return {
        platform,
        categoryId: category.id,
        categoryName: category.name,
        score,
        confidence,
        dataQuality: coverage,
        modelVersion: MODEL_VERSION,
        evidence: evidence.slice(0, 8),
        uncertainty,
      };
    });

    results.sort((a, b) => b.score - a.score);

    return {
      platform,
      modelVersion: MODEL_VERSION,
      generatedAt: now,
      results,
    };
  }

  generateAll(profile: UserProfile, now: Date = new Date()): Record<Platform, InferenceSnapshot> {
    const platforms: Platform[] = ['facebook', 'instagram', 'google', 'youtube', 'tiktok', 'linkedin', 'amazon'];
    return platforms.reduce((all, platform) => {
      all[platform] = this.generate(profile, platform, now);
      return all;
    }, {} as Record<Platform, InferenceSnapshot>);
  }
}
