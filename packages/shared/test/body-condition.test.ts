import { describe, expect, it } from 'vitest';
import { categorizeBcs, estimateBcsFromChecklist, estimateBmi, estimateWeight, getCarePlan } from '../src/body-condition';

describe('estimateWeight', () => {
  it('matches the standard imperial weight-tape formula (girth^2 x length / 330)', () => {
    // 72in girth, 74in length -> (72*72*74)/330 = 1162.47... -> rounds to 1162
    expect(estimateWeight(72, 74, 'imperial')).toBe(1162);
  });

  it('gives a plausible metric estimate for an average riding horse', () => {
    // ~183cm girth, ~188cm length is a typical mid-size riding horse
    const kg = estimateWeight(183, 188, 'metric');
    expect(kg).toBeGreaterThan(400);
    expect(kg).toBeLessThan(650);
  });

  it('rejects non-positive measurements', () => {
    expect(() => estimateWeight(0, 100)).toThrow();
    expect(() => estimateWeight(100, -5)).toThrow();
  });
});

describe('estimateBmi', () => {
  it('matches weight / withersHeight^2, in the plausible equine range (not the human 18.5-25 scale)', () => {
    // 480kg horse, 1.6m withers height -> 480 / 2.56 = 187.5
    expect(estimateBmi(480, 1.6)).toBe(187.5);
  });

  it('rejects non-positive measurements', () => {
    expect(() => estimateBmi(0, 1.6)).toThrow();
    expect(() => estimateBmi(480, 0)).toThrow();
  });
});

describe('categorizeBcs', () => {
  it('classifies the Henneke scale into underweight / ideal / overweight', () => {
    expect(categorizeBcs(2)).toBe('underweight');
    expect(categorizeBcs(5)).toBe('ideal');
    expect(categorizeBcs(8)).toBe('overweight');
  });
});

describe('estimateBcsFromChecklist', () => {
  it('scores a visibly underweight horse low', () => {
    const score = estimateBcsFromChecklist({
      ribsVisible: 'clearly_visible',
      neckCrest: 'none',
      tailheadFat: 'bones_prominent',
      withersShoulder: 'bones_prominent',
    });
    expect(score).toBeLessThanOrEqual(3);
  });

  it('scores a visibly overweight horse high', () => {
    const score = estimateBcsFromChecklist({
      ribsVisible: 'cannot_feel',
      neckCrest: 'very_thick_falls_to_side',
      tailheadFat: 'bulging',
      withersShoulder: 'bulging_fat_pockets',
    });
    expect(score).toBeGreaterThanOrEqual(7);
  });
});

describe('getCarePlan', () => {
  it('recommends reduced jump height for an overweight jumping horse', () => {
    const plan = getCarePlan(8, 'jumping');
    expect(plan.category).toBe('overweight');
    expect(plan.disciplineNotes).toContain('ارتفاع پرش');
  });

  it('recommends delaying collected dressage work for an underweight horse', () => {
    const plan = getCarePlan(2, 'dressage');
    expect(plan.category).toBe('underweight');
    expect(plan.disciplineNotes).toContain('پیاف');
  });
});
