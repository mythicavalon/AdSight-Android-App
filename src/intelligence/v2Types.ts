import { Platform } from '../types';

export type SignalType = 'interest' | 'ad_preference' | 'app_usage' | 'search' | 'purchase';

export interface InferenceSignal {
  id: string;
  type: SignalType;
  source: string;
  value: string;
  timestamp: Date;
  strength: number;
}

export interface EvidenceItem {
  signalId: string;
  signalType: SignalType;
  source: string;
  value: string;
  contribution: number;
  explanation: string;
}

export interface InferenceResult {
  platform: Platform;
  categoryId: string;
  categoryName: string;
  score: number;
  confidence: number;
  dataQuality: number;
  modelVersion: string;
  evidence: EvidenceItem[];
  uncertainty: string[];
}

export interface InferenceSnapshot {
  platform: Platform;
  modelVersion: string;
  generatedAt: Date;
  results: InferenceResult[];
}
