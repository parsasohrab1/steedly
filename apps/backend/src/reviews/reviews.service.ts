import { Injectable } from '@nestjs/common';
import { Review, ReviewCategory } from '@asbaan/shared';
import { randomUUID } from 'crypto';

@Injectable()
export class ReviewsService {
  // Seeded with the same sample entries shown on the marketing site, clearly
  // marked as samples — no real business names until providers are onboarded.
  private reviews: Review[] = [
    { id: randomUUID(), category: 'vet', providerName: 'دامپزشک نمونه ۱', rating: 5, comment: 'برخورد سریع در اورژانس.', createdAtIso: new Date().toISOString() },
    { id: randomUUID(), category: 'farrier', providerName: 'نعلبند نمونه ۱', rating: 5, comment: 'کار تمیز، قیمت منصفانه.', createdAtIso: new Date().toISOString() },
    { id: randomUUID(), category: 'equipment_shop', providerName: 'فروشگاه تجهیزات نمونه', rating: 4, comment: 'تنوع خوب زین و لجام.', createdAtIso: new Date().toISOString() },
    { id: randomUUID(), category: 'feed_supplier', providerName: 'فروشنده کنسانتره نمونه', rating: 5, comment: 'کیفیت ثابت، تحویل به‌موقع.', createdAtIso: new Date().toISOString() },
    { id: randomUUID(), category: 'coach', providerName: 'مربی نمونه', rating: 5, comment: 'صبور با سوارکاران مبتدی.', createdAtIso: new Date().toISOString() },
    { id: randomUUID(), category: 'club_service', providerName: 'خدمات رفاهی باشگاه نمونه', rating: 4, comment: 'محوطه تمیز، اسطبل استاندارد.', createdAtIso: new Date().toISOString() },
  ];

  findAll(category?: ReviewCategory): Review[] {
    return category ? this.reviews.filter((r) => r.category === category) : this.reviews;
  }

  create(input: Omit<Review, 'id' | 'createdAtIso'>): Review {
    const review: Review = { id: randomUUID(), createdAtIso: new Date().toISOString(), ...input };
    this.reviews.unshift(review);
    return review;
  }
}
