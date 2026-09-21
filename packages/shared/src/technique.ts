/**
 * Riding-technique feedback module: lets a rider upload a video of a jumping round
 * (or flatwork) and get a per-criterion checklist against real coaching standards.
 *
 * IMPORTANT — current state: `simulateAnalysis()` below is a deterministic stub.
 * Actually detecting these criteria from video requires a pose-estimation pipeline
 * (rider + horse keypoints per frame, e.g. MediaPipe/OpenPose plus a jumping-specific
 * model for takeoff point and bascule) — real computer-vision engineering that is not
 * implemented in this repo yet. The stub exists so the API contract, UI, and coaching
 * copy can be built and reviewed now; swap the stub body for real inference later
 * without changing callers. Products already validating this category: Equus AI,
 * Ridesum (AI Seat Analytics), Rider Analysis, Equestrian AiK.
 */

export type TechniqueDiscipline = 'jumping' | 'dressage' | 'eventing';

export type CriterionKey =
  | 'diagonal' // correct trot diagonal (rising with the outside foreleg)
  | 'whip_hold' // whip grip and carriage
  | 'rein_length' // hands too short / too long, quality of contact
  | 'hand_steadiness' // quiet hands, straight elbow-to-bit line, no bouncing or "opening"
  | 'foot_position' // heel down, toe up, leg on the girth line
  | 'takeoff_point' // distance to the fence at takeoff
  | 'approach_rhythm' // rushing vs. a balanced, rhythmic approach
  | 'seat_timing' // light seat at canter, sitting down only in the final strides before the fence
  | 'bascule' // horse's bascule (rounding of back/neck) over the fence
  | 'release_timing'; // rider's hand/rein release following the horse's head — "late reaction"

export type CriterionVerdict = 'correct' | 'needs_improvement' | 'incorrect';

export interface CriterionDefinition {
  key: CriterionKey;
  label: string;
  standard: string; // what the correct technique looks like
  commonFault: string; // the fault this criterion is meant to catch
}

export const TECHNIQUE_CRITERIA: CriterionDefinition[] = [
  {
    key: 'diagonal',
    label: 'اریب (دیاگونال) ترک',
    standard: 'سوارکار هم‌زمان با عقب رفتن دست جلوی بیرونی اسب باید در زین بنشیند و با جلو آمدنش بلند شود.',
    commonFault: 'دیاگونال اشتباه — نشستن و بلند شدن هم‌زمان با دست داخلی به‌جای دست بیرونی.',
  },
  {
    key: 'whip_hold',
    label: 'نحوه گرفتن شلاق',
    standard: 'شلاق در یک دست، رو به پایین و در امتداد ران/کپل اسب نگه داشته شود؛ استفاده کوتاه و هدفمند.',
    commonFault: 'شلاق رو به بالا یا جلو گرفته شده، یا استفاده مکرر و بی‌مورد از آن.',
  },
  {
    key: 'rein_length',
    label: 'طول دست (لجام) — کوتاه یا بلند',
    standard: 'تماس ثابت و نرم با دهان اسب؛ نه آنقدر کوتاه که فشار دائم ایجاد کند، نه آنقدر بلند که کنترل از دست برود.',
    commonFault: 'دست خیلی کوتاه (فشار مداوم روی دهان) یا خیلی بلند (از دست رفتن تماس و کنترل).',
  },
  {
    key: 'hand_steadiness',
    label: 'ثبات دست‌ها (خط راست آرنج تا دهانه)',
    standard:
      'دست‌ها ثابت و نرم، در امتداد یک خط راست از آرنج تا دهانه اسب نگه داشته می‌شوند و فقط هم‌زمان با حرکت سر و گردن اسب هماهنگ می‌شوند — نه مستقل از آن.',
    commonFault:
      'باز نگه‌داشتن دست‌ها یا حرکت مستقل بالا و پایین آن‌ها، که تماس با دهان اسب را ناپایدار و غیرارگونومیک می‌کند.',
  },
  {
    key: 'foot_position',
    label: 'جایگاه پا در رکاب',
    standard: 'پاشنه پایین، پنجه پا کمی بالا، و ساق پا در راستای خط پشت تنگ — نه جلوتر و نه عقب‌تر از آن.',
    commonFault: 'پاشنه بالا، پنجه رو به پایین، یا جابه‌جایی پا از خط پشت تنگ که ثبات پا و تعادل پایین‌تنه را از بین می‌برد.',
  },
  {
    key: 'takeoff_point',
    label: 'نقطه جهش',
    standard: 'جهش از فاصله متناسب با ارتفاع مانع؛ نه خیلی دور (long) و نه خیلی نزدیک (deep/chip).',
    commonFault: 'جهش از فاصله نامناسب که منجر به برخورد با مانع یا فرود ناگهانی می‌شود.',
  },
  {
    key: 'approach_rhythm',
    label: 'عجله در نزدیک شدن به مانع',
    standard: 'نزدیک شدن با ریتم و تعادل ثابت در یک کورس متعادل، بدون تغییر ناگهانی سرعت.',
    commonFault: 'عجله کردن و از دست دادن ریتم درست قبل از مانع.',
  },
  {
    key: 'seat_timing',
    label: 'سبکی نشست در چهارنعل و زمان نشستن روی زین',
    standard:
      'سوارکار در چهارنعل نشست را سبک (half-seat/light-seat) نگه می‌دارد و تنها در چند گام پایانی نزدیک مانع (معمولاً ۲ تا ۴ گام) وزن را روی زین می‌نشاند تا ایمپالس و کنترل لازم برای نقطه جهش را فراهم کند.',
    commonFault:
      'نشستن زودهنگام و کامل روی زین در کل مسیر که پشت اسب را سفت و ایمپالس را کم می‌کند، یا برعکس، ننشستن حتی در گام‌های پایانی که کنترل نقطه جهش را از بین می‌برد.',
  },
  {
    key: 'bascule',
    label: 'باسکول (قوس کمر و گردن روی مانع)',
    standard: 'اسب کمر و گردن خود را روی مانع قوس می‌دهد و سر را پایین/جلو می‌برد — نشانه پرش مکانیکی صحیح.',
    commonFault: 'پرش صاف و بدون قوس، معمولاً به‌دلیل release نامناسب سوارکار.',
  },
  {
    key: 'release_timing',
    label: 'عکس‌العمل (release) دست روی مانع',
    standard: 'دست‌ها باید هم‌زمان با حرکت سر و گردن اسب روی مانع رها/همراهی شوند، نه دیر و نه با کشش.',
    commonFault: 'واکنش دیرهنگام یا نگه‌داشتن سفت دهنه، که باسکول را از بین می‌برد و می‌تواند به رفتارهای اجتنابی منجر شود.',
  },
];

export interface CriterionFeedback {
  key: CriterionKey;
  verdict: CriterionVerdict;
  note: string;
}

export interface VideoSubmission {
  id: string;
  riderId: string;
  horseId?: string;
  discipline: TechniqueDiscipline;
  videoUrl: string;
  submittedAtIso: string;
  status: 'queued' | 'analyzed';
}

export interface VideoAnalysisResult {
  submissionId: string;
  analyzedAtIso: string;
  feedback: CriterionFeedback[];
  /** true while this result comes from simulateAnalysis() rather than a real CV model */
  simulated: boolean;
}

/**
 * Deterministic placeholder scorer — NOT real video analysis. Hashes the video URL
 * to produce a stable, repeatable verdict per criterion so the UI/API can be built
 * and demoed end-to-end. Replace with a real pose-estimation pipeline before
 * showing results to actual riders.
 */
export function simulateAnalysis(submission: VideoSubmission): VideoAnalysisResult {
  let seed = 0;
  for (const ch of submission.videoUrl) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;

  const feedback: CriterionFeedback[] = TECHNIQUE_CRITERIA.map((c, i) => {
    const roll = (seed >> (i * 3)) % 3;
    const verdict: CriterionVerdict = roll === 0 ? 'correct' : roll === 1 ? 'needs_improvement' : 'incorrect';
    const note =
      verdict === 'correct'
        ? `${c.label}: مطابق استاندارد اجرا شده است.`
        : `${c.label}: ${c.commonFault}`;
    return { key: c.key, verdict, note };
  });

  return {
    submissionId: submission.id,
    analyzedAtIso: new Date().toISOString(),
    feedback,
    simulated: true,
  };
}
