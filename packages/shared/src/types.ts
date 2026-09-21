export type Disease = 'colic' | 'laminitis' | 'azoturia';

export type RiskTier = 'normal' | 'watch' | 'alert' | 'emergency';

export interface ScoreBreakdownItem {
  label: string;
  points: number;
}

export interface DiseaseScoreResult {
  disease: Disease;
  score: number;
  tier: RiskTier;
  breakdown: ScoreBreakdownItem[];
  /** true when this score was suppressed by the disambiguation gate (e.g. colic suppressed in favour of azoturia) */
  suppressed?: boolean;
}

/** Rolling personal-baseline stats for one horse, computed over the trailing window (e.g. 14 days). */
export interface HorseBaseline {
  horseId: string;
  heartRateRestingBpm: number;
  lyingBoutsPer2h: number;
  dailyActivityIndex: number;
}

export interface TelemetrySnapshot {
  horseId: string;
  timestampIso: string;

  // Unit-A (wearable band)
  heartRateBpm: number;
  skinTempC: number;
  sweatIncreased: boolean;
  lyingBoutsLast2h: number;
  activityDropPct: number; // 0-100, drop vs personal baseline over trailing 24h

  // Unit-B (stall thermal + vision camera) — NOVELTY CANDIDATE, see
  // docs/PATENTABILITY_NOTES.md: one fixed unit fusing hoof thermography
  // (laminitis) with behavioral vision (colic) on shared edge compute, rather
  // than the single-purpose handheld thermal cameras or single-purpose
  // behavioral wearables sold separately today.
  rollingDetected: boolean;
  missedFeedingCount: number; // consecutive missed feeding/watering windows
  hoofTempAsymmetryC: number;
  weightShiftFrequent: boolean;

  // post-exercise context (azoturia gate)
  hoursSinceExercise: number;
  postExerciseStiffness: 'none' | 'mild' | 'severe';
  vitalsSurgeSeverity: 'none' | 'moderate' | 'severe';
}

export interface Horse {
  id: string;
  ownerId: string;
  name: string;
  breed?: string;
  ageYears?: number;
  discipline?: 'jumping' | 'dressage' | 'eventing' | 'racing' | 'archery' | 'general';
  /** Pedigree/import facts and the full chain of ownership — see horse-history.ts.
   * Populated over time through community HorseContribution submissions. */
  pedigree?: import('./horse-history').HorsePedigree;
  ownershipHistory?: import('./horse-history').OwnershipRecord[];
}

export interface Booking {
  id: string;
  horseId: string;
  providerType: 'vet' | 'farrier' | 'transport';
  providerName: string;
  scheduledAtIso: string;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled';
  isEmergency: boolean;
}

export type ReviewCategory =
  | 'vet'
  | 'farrier'
  | 'equipment_shop'
  | 'feed_supplier'
  | 'coach'
  | 'club_service';

export interface Review {
  id: string;
  category: ReviewCategory;
  providerName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAtIso: string;
}

export interface FeedbackMessage {
  id: string;
  type: 'suggestion' | 'complaint' | 'bug' | 'other';
  name?: string;
  email?: string;
  message: string;
  createdAtIso: string;
}
