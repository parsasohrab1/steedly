/**
 * Reference library of real, publicly available instructional videos showing correct
 * technique per gait and per discipline. Curated from search results (titles/URLs
 * verified to be real YouTube videos or federation-hosted pages, not invented) — this
 * is a starting set, not exhaustive, and should grow as more vetted sources are added.
 * Thumbnails use YouTube's own public thumbnail CDN (img.youtube.com), which is
 * designed for exactly this kind of embedding.
 */

export type ReferenceCategory =
  | 'walk'
  | 'trot'
  | 'canter'
  | 'jumping'
  | 'dressage'
  | 'eventing'
  | 'racing'
  | 'archery';

export const REFERENCE_CATEGORY_LABELS: Record<ReferenceCategory, string> = {
  walk: 'قدم',
  trot: 'یورتمه',
  canter: 'چهارنعل',
  jumping: 'پرش',
  dressage: 'دراساژ',
  eventing: 'ایونتینگ',
  racing: 'کورس (اسب‌دوانی)',
  archery: 'کمان‌سواری',
};

export interface TechniqueReferenceVideo {
  id: string;
  category: ReferenceCategory;
  title: string;
  url: string;
  thumbnailUrl?: string;
  sourceLabel: string;
  descriptionFa: string;
}

function youtubeThumb(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export const TECHNIQUE_REFERENCE_LIBRARY: TechniqueReferenceVideo[] = [
  // --- قدم (walk) ---
  {
    id: 'ref-walk-1',
    category: 'walk',
    title: 'How to Free Walk — Dressage with Rachael Clarke',
    url: 'https://www.youtube.com/watch?v=ki-MY3V__3A',
    thumbnailUrl: youtubeThumb('ki-MY3V__3A'),
    sourceLabel: 'YouTube',
    descriptionFa: 'راهنمای گام‌به‌گام قدم آزاد صحیح — ریتم چهارضربی، دراز کردن گردن روی دهنه بلند، و اورترک درست.',
  },
  {
    id: 'ref-walk-2',
    category: 'walk',
    title: 'Dressage: How to ride free walk',
    url: 'https://www.youtube.com/watch?v=rafIzOdaKR0',
    thumbnailUrl: youtubeThumb('rafIzOdaKR0'),
    sourceLabel: 'YouTube',
    descriptionFa: 'تمرین عملی سوار شدن قدم آزاد در دراساژ با تأکید بر ریتم منظم و آرامش اسب.',
  },

  // --- یورتمه (trot / diagonal) ---
  {
    id: 'ref-trot-1',
    category: 'trot',
    title: 'Rising Trot / Posting Trot — How To Find Your Diagonals',
    url: 'https://www.youtube.com/watch?v=PtBC9QagjNE',
    thumbnailUrl: youtubeThumb('PtBC9QagjNE'),
    sourceLabel: 'YouTube',
    descriptionFa: 'نحوه تشخیص و اصلاح اریب (دیاگونال) صحیح در یورتمه سبک — همان معیاری که در بازخورد تکنیک استفاده می‌کنیم.',
  },
  {
    id: 'ref-trot-2',
    category: 'trot',
    title: 'How To Trot On The Correct Diagonal',
    url: 'https://www.youtube.com/watch?v=IGASjZWBBEg',
    thumbnailUrl: youtubeThumb('IGASjZWBBEg'),
    sourceLabel: 'YouTube',
    descriptionFa: 'قاعده «بلند شو-بشین با شانه بیرونی» برای پیدا کردن اریب درست بدون نگاه‌کردن به پای اسب.',
  },

  // --- چهارنعل (canter / light seat) ---
  {
    id: 'ref-canter-1',
    category: 'canter',
    title: 'Canter Seat: How to Sit the Canter',
    url: 'https://www.youtube.com/watch?v=E0R5KBrmbeQ',
    thumbnailUrl: youtubeThumb('E0R5KBrmbeQ'),
    sourceLabel: 'YouTube',
    descriptionFa: 'نشست صحیح در چهارنعل — هماهنگی لگن با حرکت پشت اسب، پایه همان معیار «سبکی نشست» در بازخورد تکنیک.',
  },
  {
    id: 'ref-canter-2',
    category: 'canter',
    title: '#5: Light Seat — 40 Fundamentals of English Riding',
    url: 'https://www.youtube.com/watch?v=HrzXRVUVHWE',
    thumbnailUrl: youtubeThumb('HrzXRVUVHWE'),
    sourceLabel: 'YouTube',
    descriptionFa: 'نشست سبک (light seat / two-point) و کاربردش در چهارنعل و نزدیک شدن به مانع.',
  },

  // --- پرش (jumping) ---
  {
    id: 'ref-jump-1',
    category: 'jumping',
    title: 'Two-Point Position',
    url: 'https://www.youtube.com/watch?v=Hw3PE_8XdNg',
    thumbnailUrl: youtubeThumb('Hw3PE_8XdNg'),
    sourceLabel: 'YouTube',
    descriptionFa: 'اصول نشست دو-نقطه‌ای برای پرش: پاشنه پایین، تعادل جلو، دست‌های آماده release.',
  },
  {
    id: 'ref-jump-2',
    category: 'jumping',
    title: 'Horse Riding Position — Use A Two Point Seat To Help',
    url: 'https://www.youtube.com/watch?v=2R_N4lfmvQo',
    thumbnailUrl: youtubeThumb('2R_N4lfmvQo'),
    sourceLabel: 'YouTube',
    descriptionFa: 'تمرین عملی نشست دو-نقطه‌ای پیش از رفتن سراغ پرش واقعی موانع.',
  },

  // --- دراساژ (dressage overall position) ---
  {
    id: 'ref-dressage-1',
    category: 'dressage',
    title: 'Dressage Rider Position: Master These 3 Things',
    url: 'https://www.youtube.com/watch?v=Jk2CSuX1Fms',
    thumbnailUrl: youtubeThumb('Jk2CSuX1Fms'),
    sourceLabel: 'YouTube',
    descriptionFa: 'سه اصل کلیدی جایگاه سوارکار در دراساژ: تراز عمودی، ثبات دست، و استقلال پا.',
  },
  {
    id: 'ref-dressage-2',
    category: 'dressage',
    title: 'How To Get The Correct Dressage Position',
    url: 'https://www.youtube.com/watch?v=CSHLqw52OD8',
    thumbnailUrl: youtubeThumb('CSHLqw52OD8'),
    sourceLabel: 'YouTube',
    descriptionFa: 'تنظیم جایگاه صحیح نشستن در دراساژ، هم‌راستا با معیار ثبات دست‌ها و جایگاه پا در رکاب.',
  },

  // --- ایونتینگ (eventing cross-country) ---
  {
    id: 'ref-eventing-1',
    category: 'eventing',
    title: 'Eventing: Intro to Cross-Country Riding',
    url: 'https://www.usef.org/learning-center/videos/eventing-intro-to-cross-country-riding',
    sourceLabel: 'US Equestrian',
    descriptionFa: 'آموزش David O\'Connor و Lauren Kieffer درباره جایگاه بدن، نگه‌داشتن خط مسیر و سرعت در کراس‌کانتری.',
  },
  {
    id: 'ref-eventing-2',
    category: 'eventing',
    title: 'RE-LIVE — CCIO4* Cross Country (FEI Eventing)',
    url: 'https://www.youtube.com/watch?v=tIcPfcKKeAs',
    thumbnailUrl: youtubeThumb('tIcPfcKKeAs'),
    sourceLabel: 'YouTube (FEI)',
    descriptionFa: 'بازپخش واقعی مسابقه کراس‌کانتری سطح ۴ ستاره — مشاهده تکنیک سوارکاران حرفه‌ای در شرایط واقعی مسابقه.',
  },

  // --- کورس / اسب‌دوانی (racing) ---
  {
    id: 'ref-racing-1',
    category: 'racing',
    title: 'Jockey Lesson with Frankie Lovato — "Balance & Position"',
    url: 'https://www.youtube.com/watch?v=h6vqQ_LNmBM',
    thumbnailUrl: youtubeThumb('h6vqQ_LNmBM'),
    sourceLabel: 'YouTube',
    descriptionFa: 'آموزش وضعیت «مارتینی گلس» ژوکی: زانو بالای نقطه تعادل پا، کمر صاف، دست‌ها پایین روی جدوگاه.',
  },

  // --- کمان‌سواری (mounted archery) ---
  {
    id: 'ref-archery-1',
    category: 'archery',
    title: 'How to learn Horseback Archery? — Part 1: Correct Equipment',
    url: 'https://www.youtube.com/watch?v=FbvzCqbq-C4',
    thumbnailUrl: youtubeThumb('FbvzCqbq-C4'),
    sourceLabel: 'YouTube',
    descriptionFa: 'تجهیزات صحیح برای شروع کمان‌سواری — پیش‌نیاز تکنیک صحیح تیراندازی سواره.',
  },
  {
    id: 'ref-archery-2',
    category: 'archery',
    title: 'How to learn Horseback Archery? — Part 2: Archery Basics',
    url: 'https://www.youtube.com/watch?v=JkwGKl9Gogk',
    thumbnailUrl: youtubeThumb('JkwGKl9Gogk'),
    sourceLabel: 'YouTube',
    descriptionFa: 'هماهنگی حرکت بالاتنه با ریتم گام اسب و حفظ ثبات در نشست نیمه‌ایستاده هنگام تیراندازی.',
  },
];

export function getReferencesByCategory(category: ReferenceCategory): TechniqueReferenceVideo[] {
  return TECHNIQUE_REFERENCE_LIBRARY.filter((v) => v.category === category);
}
