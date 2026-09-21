import { Body, Controller, Post } from '@nestjs/common';
import { TelemetrySnapshot, highestTier } from '@asbaan/shared';
import { RiskService } from './risk.service';
import { BookingsService } from '../bookings/bookings.service';

@Controller('v1/telemetry')
export class TelemetryController {
  constructor(
    private readonly risk: RiskService,
    private readonly bookings: BookingsService,
  ) {}

  /**
   * Device -> phone relay (or camera WiFi) -> here. Mirrors the "Ingestion Worker"
   * step of the platform architecture doc; a real deployment would put an MQTT
   * broker in front of this and write raw samples to TimescaleDB first.
   *
   * NOVELTY CANDIDATE — see docs/PATENTABILITY_NOTES.md. The auto-dispatch call
   * below (risk assessment -> emergency booking, with no human in the loop) is the
   * piece that isn't present in the wearable-monitor prior art we found: those
   * systems (NIGHTWATCH, Trackener, US20160100802A1) stop at an alert/notification
   * and leave finding + booking a vet to the owner. Closing that loop is the
   * candidate inventive step, not the risk scoring itself.
   */
  @Post('ingest')
  ingest(@Body() sample: TelemetrySnapshot) {
    const assessment = this.risk.ingest(sample);
    const worst = highestTier(assessment);

    let dispatchedBooking = null;
    if (worst.tier === 'emergency') {
      // Mirrors the "Alert Flow" doc: Risk Score >= Emergency -> event -> auto-dispatch.
      const providerType = worst.disease === 'laminitis' ? 'vet' : 'vet';
      dispatchedBooking = this.bookings.createEmergency(sample.horseId, providerType);
    }

    return { assessment, worst, dispatchedBooking };
  }
}
