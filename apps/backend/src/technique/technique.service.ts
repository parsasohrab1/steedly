import { Injectable, NotFoundException } from '@nestjs/common';
import { simulateAnalysis, VideoAnalysisResult, VideoSubmission } from '@asbaan/shared';
import { randomUUID } from 'crypto';

@Injectable()
export class TechniqueService {
  private submissions = new Map<string, VideoSubmission>();
  private results = new Map<string, VideoAnalysisResult>();

  submit(input: Pick<VideoSubmission, 'riderId' | 'horseId' | 'discipline' | 'videoUrl'>): VideoSubmission {
    const submission: VideoSubmission = {
      id: randomUUID(),
      submittedAtIso: new Date().toISOString(),
      status: 'queued',
      ...input,
    };
    this.submissions.set(submission.id, submission);
    return submission;
  }

  /**
   * Runs the Phase-1 stub scorer (see @asbaan/shared technique.ts). Swap this method's
   * body for a real pose-estimation pipeline call when that's built — callers don't change.
   */
  analyze(id: string): VideoAnalysisResult {
    const submission = this.submissions.get(id);
    if (!submission) throw new NotFoundException(`Video submission ${id} not found`);
    const result = simulateAnalysis(submission);
    submission.status = 'analyzed';
    this.results.set(id, result);
    return result;
  }

  getResult(id: string): VideoAnalysisResult {
    const result = this.results.get(id);
    if (!result) throw new NotFoundException(`No analysis yet for submission ${id}`);
    return result;
  }
}
