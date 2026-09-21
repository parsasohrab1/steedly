import {
  Disease,
  DiseaseScoreResult,
  HorseBaseline,
  RiskTier,
  ScoreBreakdownItem,
  TelemetrySnapshot,
} from './types';

/**
 * Phase-1 rule-based multi-disease risk scoring engine.
 *
 * These are expert-weighted starting points (see the "موتور ریسک اسب" design doc),
 * NOT clinically validated thresholds. They must be reviewed and calibrated by a
 * veterinarian before any real deployment, and are meant to be replaced by a
 * learned model (logistic regression / GBM) once labelled field outcomes exist —
 * see scoreAllDiseases() below for where that swap would happen.
 */

const TIER_THRESHOLDS: Record<Disease, { watch: number; alert: number; emergency: number }> = {
  colic: { watch: 30, alert: 60, emergency: 90 },
  laminitis: { watch: 25, alert: 50, emergency: 75 },
  azoturia: { watch: 25, alert: 50, emergency: 80 },
};

function classifyTier(disease: Disease, score: number): RiskTier {
  const t = TIER_THRESHOLDS[disease];
  if (score >= t.emergency) return 'emergency';
  if (score >= t.alert) return 'alert';
  if (score >= t.watch) return 'watch';
  return 'normal';
}

function heartRateDeviationPct(sample: TelemetrySnapshot, baseline: HorseBaseline): number {
  if (baseline.heartRateRestingBpm <= 0) return 0;
  return ((sample.heartRateBpm - baseline.heartRateRestingBpm) / baseline.heartRateRestingBpm) * 100;
}

export function scoreColic(sample: TelemetrySnapshot, baseline: HorseBaseline): DiseaseScoreResult {
  const breakdown: ScoreBreakdownItem[] = [];
  const hrDevPct = heartRateDeviationPct(sample, baseline);

  if (hrDevPct > 25) {
    breakdown.push({ label: `ضربان قلب +${hrDevPct.toFixed(0)}٪ نسبت به baseline`, points: 25 });
  } else if (hrDevPct >= 10) {
    breakdown.push({ label: `ضربان قلب +${hrDevPct.toFixed(0)}٪ نسبت به baseline`, points: 10 });
  }

  if (sample.sweatIncreased) {
    breakdown.push({ label: 'افزایش محسوس عرق (GSR)', points: 20 });
  }

  const lyingRatio = baseline.lyingBoutsPer2h > 0 ? sample.lyingBoutsLast2h / baseline.lyingBoutsPer2h : 0;
  if (lyingRatio >= 4) {
    breakdown.push({ label: `دراز کشیدن/بلندشدن ${lyingRatio.toFixed(1)}× baseline`, points: 30 });
  }

  if (sample.rollingDetected) {
    breakdown.push({ label: 'غلتیدن مکرر (تشخیص بصری)', points: 35 });
  }

  if (sample.missedFeedingCount >= 2) {
    breakdown.push({ label: `${sample.missedFeedingCount} نوبت تغذیه نادیده گرفته شده`, points: 20 });
  }

  const rawScore = breakdown.reduce((sum, b) => sum + b.points, 0);
  const score = Math.min(rawScore, 100);

  return { disease: 'colic', score, tier: classifyTier('colic', score), breakdown };
}

export function scoreLaminitis(sample: TelemetrySnapshot): DiseaseScoreResult {
  const breakdown: ScoreBreakdownItem[] = [];

  if (sample.hoofTempAsymmetryC > 2) {
    breakdown.push({ label: `عدم‌تقارن حرارتی سم +${sample.hoofTempAsymmetryC.toFixed(1)}°C`, points: 30 });
  } else if (sample.hoofTempAsymmetryC >= 1) {
    breakdown.push({ label: `عدم‌تقارن حرارتی سم +${sample.hoofTempAsymmetryC.toFixed(1)}°C`, points: 15 });
  }

  if (sample.weightShiftFrequent) {
    breakdown.push({ label: 'تغییر مکرر وضعیت ایستادن (rocked-back stance)', points: 15 });
  }

  if (sample.activityDropPct > 50) {
    breakdown.push({ label: `افت فعالیت روزانه ${sample.activityDropPct.toFixed(0)}٪`, points: 20 });
  } else if (sample.activityDropPct >= 25) {
    breakdown.push({ label: `افت فعالیت روزانه ${sample.activityDropPct.toFixed(0)}٪`, points: 10 });
  }

  const score = Math.min(breakdown.reduce((sum, b) => sum + b.points, 0), 100);
  return { disease: 'laminitis', score, tier: classifyTier('laminitis', score), breakdown };
}

export function scoreAzoturia(sample: TelemetrySnapshot): DiseaseScoreResult {
  const breakdown: ScoreBreakdownItem[] = [];
  const gateActive = sample.hoursSinceExercise < 2;

  if (gateActive) {
    if (sample.postExerciseStiffness === 'severe') {
      breakdown.push({ label: 'سفتی/امتناع شدید از حرکت پس از تمرین', points: 40 });
    } else if (sample.postExerciseStiffness === 'mild') {
      breakdown.push({ label: 'سفتی خفیف پس از تمرین', points: 20 });
    }

    if (sample.vitalsSurgeSeverity === 'severe') {
      breakdown.push({ label: 'جهش شدید HR/دما/عرق نامتناسب با شدت تمرین', points: 30 });
    } else if (sample.vitalsSurgeSeverity === 'moderate') {
      breakdown.push({ label: 'جهش متوسط HR/دما/عرق نامتناسب با شدت تمرین', points: 15 });
    }
  }

  const score = Math.min(breakdown.reduce((sum, b) => sum + b.points, 0), 100);
  const result: DiseaseScoreResult = {
    disease: 'azoturia',
    score: gateActive ? score : 0,
    tier: classifyTier('azoturia', gateActive ? score : 0),
    breakdown: gateActive ? breakdown : [],
  };
  if (!gateActive) result.suppressed = true; // gate inactive: azoturia is not evaluated
  return result;
}

/**
 * NOVELTY CANDIDATE — see docs/PATENTABILITY_NOTES.md before reusing or publishing
 * this function's design elsewhere. Unlike the sensor-set-selection approach to
 * differential diagnosis described in prior art (e.g. US11181519), this disambiguation
 * uses a single discrete contextual gate ("hours since exercise < 2h") to reinterpret
 * an already-computed disease score, rather than choosing which sensors to trust.
 * Colic-specific signals (rolling, missed feeding) always count on their own
 * regardless of the gate. Treat this function's exact logic as sensitive pending
 * legal review (patent vs. trade-secret decision) — don't casually copy it elsewhere.
 */
function disambiguateColic(
  colic: DiseaseScoreResult,
  azoturia: DiseaseScoreResult,
  sample: TelemetrySnapshot,
): DiseaseScoreResult {
  const azoturiaGateActive = sample.hoursSinceExercise < 2;
  const azoturiaIsAlertOrAbove = azoturia.tier === 'alert' || azoturia.tier === 'emergency';
  const colicSpecificSignalPresent = sample.rollingDetected || sample.missedFeedingCount >= 2;

  if (azoturiaGateActive && azoturiaIsAlertOrAbove && !colicSpecificSignalPresent) {
    return {
      ...colic,
      tier: colic.tier === 'emergency' || colic.tier === 'alert' ? 'watch' : colic.tier,
      suppressed: true,
    };
  }
  return colic;
}

export interface RiskAssessment {
  horseId: string;
  timestampIso: string;
  colic: DiseaseScoreResult;
  laminitis: DiseaseScoreResult;
  azoturia: DiseaseScoreResult;
}

/**
 * Runs all three disease heads and applies the disambiguation gate.
 * This is the Phase-1 engine described in the risk-scoring architecture doc;
 * a Phase-3 learned model would swap the body of scoreColic/scoreLaminitis/
 * scoreAzoturia for calibrated coefficients while keeping this same interface.
 */
export function scoreAllDiseases(sample: TelemetrySnapshot, baseline: HorseBaseline): RiskAssessment {
  const colicRaw = scoreColic(sample, baseline);
  const laminitis = scoreLaminitis(sample);
  const azoturia = scoreAzoturia(sample);
  const colic = disambiguateColic(colicRaw, azoturia, sample);

  return {
    horseId: sample.horseId,
    timestampIso: sample.timestampIso,
    colic,
    laminitis,
    azoturia,
  };
}

export function highestTier(assessment: RiskAssessment): { disease: Disease; tier: RiskTier; score: number } {
  const candidates = [assessment.colic, assessment.laminitis, assessment.azoturia];
  const order: RiskTier[] = ['normal', 'watch', 'alert', 'emergency'];
  return candidates.reduce((worst, cur) => (order.indexOf(cur.tier) > order.indexOf(worst.tier) ? cur : worst));
}
