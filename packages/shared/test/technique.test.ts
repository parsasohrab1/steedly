import { describe, expect, it } from 'vitest';
import { simulateAnalysis, TECHNIQUE_CRITERIA, VideoSubmission } from '../src/technique';

function submission(overrides: Partial<VideoSubmission> = {}): VideoSubmission {
  return {
    id: 'sub-1',
    riderId: 'rider-1',
    discipline: 'jumping',
    videoUrl: 'https://example.com/videos/round-1.mp4',
    submittedAtIso: new Date().toISOString(),
    status: 'queued',
    ...overrides,
  };
}

describe('simulateAnalysis', () => {
  it('returns one feedback item per defined criterion', () => {
    const result = simulateAnalysis(submission());
    expect(result.feedback).toHaveLength(TECHNIQUE_CRITERIA.length);
    expect(result.simulated).toBe(true);
  });

  it('is deterministic for the same video URL', () => {
    const a = simulateAnalysis(submission({ videoUrl: 'https://example.com/a.mp4' }));
    const b = simulateAnalysis(submission({ videoUrl: 'https://example.com/a.mp4' }));
    expect(a.feedback).toEqual(b.feedback);
  });

  it('differs across different video URLs (not a constant stub)', () => {
    const a = simulateAnalysis(submission({ videoUrl: 'https://example.com/a.mp4' }));
    const b = simulateAnalysis(submission({ videoUrl: 'https://example.com/b.mp4' }));
    expect(a.feedback).not.toEqual(b.feedback);
  });
});
