export type HorseOrigin = 'imported' | 'domestic_bred';

export interface OwnershipRecord {
  id: string;
  ownerName: string;
  ownerUserId?: string;
  fromDateIso: string;
  toDateIso?: string; // absent = current owner
  priceRial?: number;
  note?: string;
}

export interface ImportedPedigree {
  origin: 'imported';
  importedBy: string;
  importDateIso: string;
  originCountry?: string;
}

export interface DomesticPedigree {
  origin: 'domestic_bred';
  sireName: string;
  damName: string;
  breeder?: string;
}

export type HorsePedigree = ImportedPedigree | DomesticPedigree;

/** Editable-field keys a community contribution can target on a horse's history —
 * used as `field` on a Contribution (see contributions.ts) whose entityType is 'horse'. */
export type HorseHistoryField =
  | 'pedigree'
  | 'ownershipRecord' // adds one new ownership record (never edits past ones directly)
  | 'currentOwner';
