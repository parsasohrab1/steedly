import type { FeedbackMessage, Review, ReviewCategory } from '@asbaan/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function fetchReviews(category?: ReviewCategory): Promise<Review[]> {
  const url = new URL('/v1/reviews', API_BASE);
  if (category) url.searchParams.set('category', category);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function submitReview(input: Omit<Review, 'id' | 'createdAtIso'>): Promise<Review> {
  const res = await fetch(new URL('/v1/reviews', API_BASE), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to submit review');
  return res.json();
}

export async function submitFeedback(input: Omit<FeedbackMessage, 'id' | 'createdAtIso'>): Promise<FeedbackMessage> {
  const res = await fetch(new URL('/v1/feedback', API_BASE), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to submit feedback');
  return res.json();
}
