import type { Booking, Horse, RiskAssessment } from '@asbaan/shared';

// Android emulator reaches the host machine's localhost via 10.0.2.2; iOS
// simulator can use localhost directly. Override with EXPO_PUBLIC_API_URL for
// a physical device on the same network as the backend.
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000';

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export function fetchHorses(): Promise<Horse[]> {
  return fetch(`${API_BASE}/v1/horses`).then((r) => json(r));
}

export function fetchRiskStatus(horseId: string): Promise<RiskAssessment> {
  return fetch(`${API_BASE}/v1/horses/${horseId}/risk-status`).then((r) => json(r));
}

export function createEmergencyBooking(horseId: string): Promise<Booking> {
  return fetch(`${API_BASE}/v1/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      horseId,
      providerType: 'vet',
      providerName: 'نزدیک‌ترین دامپزشک در دسترس (SOS دستی)',
      scheduledAtIso: new Date().toISOString(),
      isEmergency: true,
    }),
  }).then((r) => json(r));
}
