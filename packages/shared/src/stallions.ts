/**
 * "سیلمی جهت کشش" — a stallion-for-breeding directory. Real stallion/owner data
 * for Iran was NOT scraped or compiled here: publishing named private individuals'
 * identities alongside their pricing without their consent isn't something this
 * repo does. Instead this is the real, working directory FEATURE — owners register
 * (see users.ts UserRole) and self-list their own stallion, opt-in, the same way
 * ReviewsService's providers are real once onboarded. Seed data below is clearly
 * marked `sample: true` and uses placeholder names, exactly like ReviewsService's
 * seed reviews.
 */
export interface StallionListing {
  id: string;
  horseName: string;
  breed: string;
  ageYears?: number;
  ownerUserId: string;
  ownerDisplayName: string;
  location: string;
  studFeeRial: number;
  description: string;
  contactPhone?: string;
  sample?: boolean;
  createdAtIso: string;
}

export interface CreateStallionListingInput {
  horseName: string;
  breed: string;
  ageYears?: number;
  ownerUserId: string;
  ownerDisplayName: string;
  location: string;
  studFeeRial: number;
  description: string;
  contactPhone?: string;
}
