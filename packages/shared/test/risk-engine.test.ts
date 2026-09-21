import { describe, expect, it } from 'vitest';
import { scoreAllDiseases, scoreAzoturia, scoreColic, scoreLaminitis } from '../src/risk-engine';
import { HorseBaseline, TelemetrySnapshot } from '../src/types';

function baseSample(overrides: Partial<TelemetrySnapshot> = {}): TelemetrySnapshot {
  return {
    horseId: 'horse-1',
    timestampIso: '2026-09-16T14:00:00.000Z',
    heartRateBpm: 36,
    skinTempC: 37.8,
    sweatIncreased: false,
    lyingBoutsLast2h: 1,
    activityDropPct: 0,
    rollingDetected: false,
    missedFeedingCount: 0,
    hoofTempAsymmetryC: 0,
    weightShiftFrequent: false,
    hoursSinceExercise: 8,
    postExerciseStiffness: 'none',
    vitalsSurgeSeverity: 'none',
    ...overrides,
  };
}

const baseline: HorseBaseline = {
  horseId: 'horse-1',
  heartRateRestingBpm: 36,
  lyingBoutsPer2h: 1,
  dailyActivityIndex: 100,
};

describe('scoreColic — worked example from the risk-scoring design doc (اسب «شبدیز»)', () => {
  it('reaches the Emergency tier when all colic signals fire together', () => {
    const sample = baseSample({
      heartRateBpm: 46, // +27.8% vs baseline 36 -> +25
      sweatIncreased: true, // +20
      lyingBoutsLast2h: 5, // 5x baseline of 1 -> +30
      rollingDetected: true, // +35
      missedFeedingCount: 2, // +20
    });

    const result = scoreColic(sample, baseline);

    expect(result.score).toBe(100); // raw 130 capped at 100
    expect(result.tier).toBe('emergency');
    expect(result.breakdown).toHaveLength(5);
  });

  it('stays normal when signals are all within baseline', () => {
    const result = scoreColic(baseSample(), baseline);
    expect(result.score).toBe(0);
    expect(result.tier).toBe('normal');
  });
});

describe('scoreLaminitis', () => {
  it('flags a large hoof thermal asymmetry as alert-tier', () => {
    const result = scoreLaminitis(baseSample({ hoofTempAsymmetryC: 2.5, weightShiftFrequent: true }));
    expect(result.score).toBe(45); // 30 + 15
    expect(result.tier).toBe('watch');
  });

  it('reaches emergency with asymmetry + stance change + severe activity drop', () => {
    const result = scoreLaminitis(
      baseSample({ hoofTempAsymmetryC: 2.5, weightShiftFrequent: true, activityDropPct: 60 }),
    );
    expect(result.score).toBe(65);
    expect(result.tier).toBe('alert');
  });
});

describe('scoreAzoturia — exercise gate', () => {
  it('is suppressed (score 0) when more than 2 hours have passed since exercise', () => {
    const result = scoreAzoturia(baseSample({ hoursSinceExercise: 8, postExerciseStiffness: 'severe' }));
    expect(result.score).toBe(0);
    expect(result.suppressed).toBe(true);
  });

  it('scores stiffness + vitals surge when within the 2h post-exercise window', () => {
    const result = scoreAzoturia(
      baseSample({ hoursSinceExercise: 0.5, postExerciseStiffness: 'severe', vitalsSurgeSeverity: 'severe' }),
    );
    expect(result.score).toBe(70);
    expect(result.tier).toBe('alert');
  });
});

describe('scoreAllDiseases — disambiguation gate', () => {
  it('suppresses a colic alert built only from overlapping signals right after hard exercise', () => {
    const sample = baseSample({
      heartRateBpm: 50, // +39% -> colic +25
      sweatIncreased: true, // colic +20
      hoursSinceExercise: 0.5,
      postExerciseStiffness: 'severe', // azoturia +40
      vitalsSurgeSeverity: 'severe', // azoturia +30 -> azoturia score 70 (alert)
    });

    const assessment = scoreAllDiseases(sample, baseline);

    expect(assessment.azoturia.tier).toBe('alert');
    expect(assessment.colic.suppressed).toBe(true);
    expect(assessment.colic.tier).not.toBe('emergency');
  });

  it('does NOT suppress colic when colic-specific signals (rolling) are present independently', () => {
    const sample = baseSample({
      heartRateBpm: 50,
      sweatIncreased: true,
      rollingDetected: true, // colic-specific signal -> disambiguation must not suppress
      hoursSinceExercise: 0.5,
      postExerciseStiffness: 'severe',
      vitalsSurgeSeverity: 'severe',
    });

    const assessment = scoreAllDiseases(sample, baseline);

    expect(assessment.colic.suppressed).toBeUndefined();
    expect(assessment.colic.score).toBe(80); // 25 + 20 + 35
  });
});
