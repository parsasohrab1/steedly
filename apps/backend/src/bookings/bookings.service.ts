import { Injectable, NotFoundException } from '@nestjs/common';
import { Booking } from '@asbaan/shared';
import { randomUUID } from 'crypto';

@Injectable()
export class BookingsService {
  private bookings: Booking[] = [];

  findAll(horseId?: string): Booking[] {
    return horseId ? this.bookings.filter((b) => b.horseId === horseId) : this.bookings;
  }

  create(input: Omit<Booking, 'id' | 'status'>): Booking {
    const booking: Booking = { id: randomUUID(), status: 'requested', ...input };
    this.bookings.push(booking);
    return booking;
  }

  updateStatus(id: string, status: Booking['status']): Booking {
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    booking.status = status;
    return booking;
  }

  /** Dispatch service stub: in production this geo-matches the nearest available
   * provider (see "Dispatch Service" in the platform architecture doc). Here it
   * just creates an emergency booking immediately. */
  createEmergency(horseId: string, providerType: Booking['providerType']): Booking {
    return this.create({
      horseId,
      providerType,
      providerName: 'نزدیک‌ترین ارائه‌دهنده در دسترس (auto-dispatch)',
      scheduledAtIso: new Date().toISOString(),
      isEmergency: true,
    });
  }
}
