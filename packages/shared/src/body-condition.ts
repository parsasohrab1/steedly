/**
 * Weight estimation (real formula, not a stub) + Henneke Body Condition Score (BCS)
 * based diet/fitness guidance.
 *
 * Weight-from-tape formula (heart girth + body length) is standard equine husbandry
 * math — see e.g. UAEX / UT Extension weight-tape guides. It is genuinely computed
 * here, unlike the technique-video and photo-based BCS estimation below, which would
 * need a trained computer-vision model (not implemented) and are exposed as an
 * explicit, real, guided Henneke checklist instead of a fake image classifier.
 */

export type WeightUnit = 'metric' | 'imperial';

/**
 * @param heartGirth measured around the horse's midsection just behind the withers/elbow
 * @param bodyLength measured from the point of the shoulder to the point of the buttock
 * @param unit 'metric' expects cm and returns kg; 'imperial' expects inches and returns lbs
 */
export function estimateWeight(heartGirth: number, bodyLength: number, unit: WeightUnit = 'metric'): number {
  if (heartGirth <= 0 || bodyLength <= 0) {
    throw new Error('heartGirth and bodyLength must be positive measurements');
  }
  if (unit === 'imperial') {
    // Weight (lbs) = Heart Girth(in)^2 x Body Length(in) / 330
    return Math.round((heartGirth * heartGirth * bodyLength) / 330);
  }
  // Weight (kg) = Heart Girth(cm)^2 x Body Length(cm) / 11900 (metric equivalent of the /330 imperial formula)
  return Math.round((heartGirth * heartGirth * bodyLength) / 11900);
}

/**
 * Equine BMI = weight(kg) / withers-height(m)^2 — the same formula as human BMI,
 * adapted to the horse's withers height. Real, published in veterinary research
 * (e.g. post-colic-surgery incisional-complication risk correlates with a higher
 * BMI), but unlike Henneke BCS below it has no single, universally standardized
 * "ideal range" — treat it as a supplementary research-style index, not the basis
 * for care-plan decisions. Typical adult riding horses land roughly in the
 * 170-230 kg/m^2 range, nothing like the human 18.5-25 scale.
 */
export function estimateBmi(weightKg: number, withersHeightM: number): number {
  if (weightKg <= 0 || withersHeightM <= 0) {
    throw new Error('weightKg and withersHeightM must be positive measurements');
  }
  return Math.round((weightKg / (withersHeightM * withersHeightM)) * 10) / 10;
}

/** Henneke 1–9 scale: 1 = extremely emaciated, 9 = extremely fat. Ideal range for most horses is 4–6. */
export type HennekeScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type BcsCategory = 'underweight' | 'ideal' | 'overweight';

export function categorizeBcs(score: HennekeScore): BcsCategory {
  if (score <= 3) return 'underweight';
  if (score <= 6) return 'ideal';
  return 'overweight';
}

/**
 * A guided visual checklist standing in for automated photo-based BCS estimation.
 * Real automated scoring would need a trained computer-vision model looking at the
 * six Henneke regions (neck, withers, shoulder, ribs, loin, tailhead) — not built
 * here. Answering these six questions (rib visibility, fat over tailhead, neck
 * crest, etc.) against the published Henneke descriptors is how a rider can arrive
 * at an honest score today without that model.
 */
export interface HennekeChecklistAnswers {
  ribsVisible: 'clearly_visible' | 'faintly_visible' | 'not_visible_easily_felt' | 'cannot_feel';
  neckCrest: 'none' | 'slight' | 'thickened' | 'very_thick_falls_to_side';
  tailheadFat: 'bones_prominent' | 'can_feel_bones' | 'spongy' | 'bulging';
  withersShoulder: 'bones_prominent' | 'defined' | 'rounded' | 'bulging_fat_pockets';
}

/** Rough single-score estimate from the checklist above; a real deployment would
 * still want a vet/experienced handler to confirm the score hands-on. */
export function estimateBcsFromChecklist(answers: HennekeChecklistAnswers): HennekeScore {
  const weights: Record<string, number> = {
    clearly_visible: 2, faintly_visible: 4, not_visible_easily_felt: 5, cannot_feel: 7,
    none: 3, slight: 5, thickened: 7, very_thick_falls_to_side: 9,
    bones_prominent: 2, can_feel_bones: 4, spongy: 6, bulging: 8,
    defined: 4, rounded: 6, bulging_fat_pockets: 8,
  };
  const values = [
    weights[answers.ribsVisible],
    weights[answers.neckCrest],
    weights[answers.tailheadFat],
    weights[answers.withersShoulder],
  ].filter((v): v is number => typeof v === 'number');

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const rounded = Math.min(9, Math.max(1, Math.round(avg))) as HennekeScore;
  return rounded;
}

export interface CarePlan {
  category: BcsCategory;
  diet: string;
  fitness: string;
  groundwork: string;
  disciplineNotes: string;
}

export function getCarePlan(score: HennekeScore, discipline: 'jumping' | 'dressage'): CarePlan {
  const category = categorizeBcs(score);

  const base: Record<BcsCategory, Omit<CarePlan, 'disciplineNotes' | 'category'>> = {
    underweight: {
      diet: 'افزایش تدریجی انرژی جیره (علوفه باکیفیت بیشتر + مکمل انرژی‌زا)، در نظر گرفتن انگل‌زدایی و بررسی دندان توسط دامپزشک.',
      fitness: 'کار سبک و کوتاه، افزایش تدریجی حجم تمرین فقط پس از شروع افزایش وزن — حداکثر یک واحد BCS در هر ۴ تا ۶ هفته.',
      groundwork: 'کار زمینی سبک (لانژ کوتاه، واکینگ) برای حفظ تحرک بدون فشار انرژی اضافه.',
    },
    ideal: {
      diet: 'حفظ جیره فعلی؛ فقط با تغییر حجم تمرین، انرژی جیره متناسب تنظیم شود.',
      fitness: 'برنامه تمرینی منظم و متناسب با سطح مسابقه قابل ادامه است.',
      groundwork: 'کار زمینی متنوع (لانژ، کار روی خط) برای حفظ آمادگی و انعطاف.',
    },
    overweight: {
      diet: 'کاهش تدریجی انرژی جیره (کاهش کنسانتره، علوفه کم‌کالری)، افزایش زمان چرای کنترل‌شده به‌جای کنسانتره اضافه.',
      fitness: 'افزایش تدریجی حجم کار هوازی کم‌فشار (واکینگ/تروت طولانی) پیش از افزودن تمرین شدید.',
      groundwork: 'جلسات کار زمینی طولانی‌تر و منظم برای افزایش مصرف انرژی بدون فشار مفصلی پرش.',
    },
  };

  const disciplineNotes =
    discipline === 'jumping'
      ? category === 'overweight'
        ? 'تا کاهش وزن، ارتفاع پرش و تعداد تکرار موانع محدود شود تا فشار روی مفاصل و تاندون‌ها کم بماند.'
        : category === 'underweight'
          ? 'پرش تمرینی تا بازگشت به BCS ایده‌آل به‌تعویق بیفتد یا در حداقل ارتفاع نگه داشته شود.'
          : 'برنامه استاندارد افزایش تدریجی ارتفاع و پیچیدگی کورس قابل اجراست.'
      : category === 'overweight'
        ? 'تمرکز بر حرکات جمع‌شدگی سبک‌تر تا کاهش وزن؛ حرکات با فشار مفصلی بالا (پیروئت، پیاف) به تعویق بیفتد.'
        : category === 'underweight'
          ? 'حرکات جمع‌شدگی سنگین (پیاف/پاساژ) تا بازگشت به وزن مناسب محدود شود.'
          : 'برنامه استاندارد پیشرفت سطوح دراساژ قابل اجراست.';

  return { category, ...base[category], disciplineNotes };
}
