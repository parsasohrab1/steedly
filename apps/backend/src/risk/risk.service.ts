import { Injectable, NotFoundException } from '@nestjs/common';
import { HorseBaseline, RiskAssessment, scoreAllDiseases, TelemetrySnapshot, highestTier } from '@asbaan/shared';

@Injectable()
export class RiskService {
  // Personal baselines would normally be a rolling 14-day computation over
  // TimescaleDB (see the risk-scoring design doc). Seeded here with a resting
  // baseline for the demo horse.
  private baselines = new Map<string, HorseBaseline>([
    ['horse-1', { horseId: 'horse-1', heartRateRestingBpm: 36, lyingBoutsPer2h: 1, dailyActivityIndex: 100 }],
  ]);

  private latestAssessments = new Map<string, RiskAssessment>();

  getBaseline(horseId: string): HorseBaseline {
    return (
      this.baselines.get(horseId) ?? {
        horseId,
        heartRateRestingBpm: 36,
        lyingBoutsPer2h: 1,
        dailyActivityIndex: 100,
      }
    );
  }

  ingest(sample: TelemetrySnapshot): RiskAssessment {
    const baseline = this.getBaseline(sample.horseId);
    const assessment = scoreAllDiseases(sample, baseline);
    this.latestAssessments.set(sample.horseId, assessment);
    return assessment;
  }

  getLatest(horseId: string): RiskAssessment {
    const assessment = this.latestAssessments.get(horseId);
    if (!assessment) throw new NotFoundException(`No telemetry received yet for horse ${horseId}`);
    return assessment;
  }

  isEmergency(assessment: RiskAssessment): boolean {
    return highestTier(assessment).tier === 'emergency';
  }
}
