import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateStallionListingInput, StallionListing } from '@asbaan/shared';

@Injectable()
export class StallionsService {
  // Sample/placeholder listings only — see stallions.ts for why real owner data
  // isn't scraped/compiled here. Real listings come from owners registering and
  // submitting their own stallion via POST, the same self-serve pattern as reviews.
  private listings: StallionListing[] = [
    {
      id: 'sample-stallion-1',
      horseName: 'رعد',
      breed: 'عرب',
      ageYears: 8,
      ownerUserId: 'sample-owner-1',
      ownerDisplayName: 'مالک نمونه ۱',
      location: 'کرج',
      studFeeRial: 80_000_000,
      description: 'سیلمی نمونه با رکورد مسابقه‌ای در پرش سطح ۱ متر.',
      sample: true,
      createdAtIso: new Date().toISOString(),
    },
    {
      id: 'sample-stallion-2',
      horseName: 'دلاور',
      breed: 'ترکمن',
      ageYears: 10,
      ownerUserId: 'sample-owner-2',
      ownerDisplayName: 'مالک نمونه ۲',
      location: 'گنبدکاووس',
      studFeeRial: 45_000_000,
      description: 'سیلمی نمونه با استقامت بالا، مناسب کورس استقامت.',
      sample: true,
      createdAtIso: new Date().toISOString(),
    },
  ];

  findAll(): StallionListing[] {
    return this.listings;
  }

  create(input: CreateStallionListingInput): StallionListing {
    const listing: StallionListing = { id: randomUUID(), createdAtIso: new Date().toISOString(), ...input };
    this.listings.push(listing);
    return listing;
  }
}
