/**
 * Curated reference list of well-known horse breeds — not literally "every breed in
 * the world" (there are 300+ recognized breeds; an exhaustive list would need
 * ongoing curation beyond this pass), but a solid, accurate starting set spanning
 * hot-bloods, warmbloods, cold-bloods/draft breeds, ponies, and — since this
 * platform is for Iranian riders — the Iranian breeds specifically.
 *
 * Photos are NOT hardcoded here: `wikipediaTitle` is looked up live against
 * Wikipedia's public REST summary API (see apps/backend/src/wiki/wiki.controller.ts)
 * to fetch a real, current thumbnail rather than guessing a Wikimedia file URL.
 */
export interface HorseBreedInfo {
  id: string;
  nameFa: string;
  nameEn: string;
  origin: string;
  wikipediaTitle: string;
  descriptionFa: string;
}

export const HORSE_BREEDS: HorseBreedInfo[] = [
  { id: 'arabian', nameFa: 'عرب', nameEn: 'Arabian', origin: 'شبه‌جزیره عربستان', wikipediaTitle: 'Arabian horse', descriptionFa: 'یکی از قدیمی‌ترین نژادهای شناخته‌شده؛ استقامت بالا، سر ظریف با پیشانی محدب، دم بلندشده هنگام حرکت — پایه ژنتیکی بسیاری از نژادهای امروزی.' },
  { id: 'thoroughbred', nameFa: 'تروبرد', nameEn: 'Thoroughbred', origin: 'انگلستان', wikipediaTitle: 'Thoroughbred', descriptionFa: 'نژاد اصلی کورس‌های اسب‌دوانی مسطح؛ سرعت بسیار بالا و بدن آیرودینامیک، نتیجه پرورش گزینشی از سه اسب بنیان‌گذار عربی/بربری.' },
  { id: 'akhal-teke', nameFa: 'آخال‌تکه', nameEn: 'Akhal-Teke', origin: 'ترکمنستان', wikipediaTitle: 'Akhal-Teke', descriptionFa: 'معروف به موی درخشان فلزی‌رنگش؛ نژادی باستانی از آسیای مرکزی با استقامت فوق‌العاده در شرایط سخت صحرایی.' },
  { id: 'turkoman', nameFa: 'ترکمن', nameEn: 'Turkoman horse', origin: 'ایران / ترکمن‌صحرا', wikipediaTitle: 'Turkoman horse', descriptionFa: 'نژاد تاریخی منطقه ترکمن‌صحرای ایران، از اجداد احتمالی آخال‌تکه و تروبرد؛ بدنی کشیده و استقامت بالا در مسافت‌های طولانی.' },
  { id: 'caspian', nameFa: 'کاسپین', nameEn: 'Caspian horse', origin: 'شمال ایران', wikipediaTitle: 'Caspian horse', descriptionFa: 'نژاد بسیار کوچک و باستانی ایرانی که تصور می‌شد منقرض شده تا اینکه در دهه ۱۹۶۵ در سواحل دریای خزر بازکشف شد؛ نازک‌اندام و سریع با ظرافتی شبیه اسب‌های اصیل.' },
  { id: 'darashouri', nameFa: 'دره‌شوری', nameEn: 'Darashouri', origin: 'فارس، ایران', wikipediaTitle: 'Darashouri', descriptionFa: 'نژاد ایلی جنوب ایران (فارس)، شناخته‌شده برای استقامت در کوهستان و مناسب کار عشایری و سوارکاری سنتی.' },
  { id: 'kurdish', nameFa: 'کرد', nameEn: 'Kurdish horse', origin: 'غرب ایران', wikipediaTitle: 'Kurdish horse', descriptionFa: 'نژاد بومی مناطق کردنشین غرب ایران؛ بدنی قوی و پا محکم، مناسب زمین‌های کوهستانی.' },
  { id: 'andalusian', nameFa: 'آندلسی', nameEn: 'Andalusian horse', origin: 'اسپانیا', wikipediaTitle: 'Andalusian horse', descriptionFa: 'نژاد کلاسیک اسپانیایی (PRE)، معروف در دراساژ کلاسیک و نمایش‌های سوارکاری با یال و دم پرپشت.' },
  { id: 'friesian', nameFa: 'فریزین', nameEn: 'Friesian horse', origin: 'هلند', wikipediaTitle: 'Friesian horse', descriptionFa: 'نژاد سیاه‌رنگ هلندی با یال بلند موج‌دار؛ حرکات برجسته در گام‌های بلند، محبوب در نمایش و رانندگی درشکه.' },
  { id: 'quarter-horse', nameFa: 'کوارتر هورس', nameEn: 'American Quarter Horse', origin: 'آمریکا', wikipediaTitle: 'American Quarter Horse', descriptionFa: 'پرجمعیت‌ترین نژاد ثبت‌شده جهان؛ شتاب فوق‌العاده در مسافت کوتاه (یک‌چهارم مایل) و پایه سوارکاری وسترن.' },
  { id: 'appaloosa', nameFa: 'آپالوسا', nameEn: 'Appaloosa', origin: 'آمریکا', wikipediaTitle: 'Appaloosa', descriptionFa: 'شناخته‌شده برای الگوی خالدار پوست؛ پرورش‌یافته توسط سرخ‌پوستان نی‌پرسه، مناسب کار و نمایش وسترن.' },
  { id: 'clydesdale', nameFa: 'کلایدزدیل', nameEn: 'Clydesdale horse', origin: 'اسکاتلند', wikipediaTitle: 'Clydesdale horse', descriptionFa: 'نژاد باری اسکاتلندی با یال پا (feathering) مشخص؛ قدرت کششی بالا، امروزه بیشتر در نمایش و رانندگی درشکه.' },
  { id: 'shire', nameFa: 'شایر', nameEn: 'Shire horse', origin: 'انگلستان', wikipediaTitle: 'Shire horse', descriptionFa: 'یکی از بلندترین و سنگین‌ترین نژادهای اسب جهان؛ تاریخاً برای کارهای کشاورزی و باربری سنگین.' },
  { id: 'percheron', nameFa: 'پرشرون', nameEn: 'Percheron', origin: 'فرانسه', wikipediaTitle: 'Percheron', descriptionFa: 'نژاد باری فرانسوی معمولاً خاکستری یا سیاه، ترکیبی از قدرت و ظرافت نسبی نسبت به سایر نژادهای باری.' },
  { id: 'lipizzan', nameFa: 'لیپیزان', nameEn: 'Lipizzan', origin: 'اتریش/اسلوونی', wikipediaTitle: 'Lipizzan', descriptionFa: 'نژاد کلاسیک مدرسه اسپانیایی سوارکاری وین؛ تخصص در حرکات پیشرفته دراساژ کلاسیک مثل کاپریول.' },
  { id: 'hanoverian', nameFa: 'هانوفرین', nameEn: 'Hanoverian horse', origin: 'آلمان', wikipediaTitle: 'Hanoverian horse', descriptionFa: 'یکی از موفق‌ترین نژادهای warmblood در پرش و دراساژ المپیک؛ پرورش گزینشی دقیق در آلمان.' },
  { id: 'trakehner', nameFa: 'تراکنر', nameEn: 'Trakehner', origin: 'پروس شرقی', wikipediaTitle: 'Trakehner', descriptionFa: 'سبک‌ترین نژاد warmblood با رگه بالای خون عربی/تروبرد؛ قابلیت بالا در دراساژ و ایونتینگ.' },
  { id: 'mustang', nameFa: 'موستانگ', nameEn: 'Mustang horse', origin: 'آمریکای شمالی', wikipediaTitle: 'Mustang horse', descriptionFa: 'اسب وحشی آزاد آمریکای شمالی، نسل بازمانده از اسب‌های اسپانیایی دوران استعمار؛ نمادی از سرسختی.' },
  { id: 'icelandic', nameFa: 'ایسلندی', nameEn: 'Icelandic horse', origin: 'ایسلند', wikipediaTitle: 'Icelandic horse', descriptionFa: 'نژاد کوچک اما قدرتمند با دو گام اضافی منحصربه‌فرد (tölt و pace)؛ هزار سال جدا از سایر نژادها پرورش یافته.' },
  { id: 'welsh-pony', nameFa: 'پونی ولزی', nameEn: 'Welsh pony', origin: 'ولز', wikipediaTitle: 'Welsh pony', descriptionFa: 'پونی محبوب برای آموزش کودکان و نوجوانان؛ چند بخش (section A تا D) با اندازه‌های متفاوت.' },
  { id: 'shetland-pony', nameFa: 'پونی شتلند', nameEn: 'Shetland pony', origin: 'جزایر شتلند، اسکاتلند', wikipediaTitle: 'Shetland pony', descriptionFa: 'کوچک‌ترین نژادهای پونی رایج؛ بسیار قوی نسبت به اندازه بدن، محبوب برای کودکان.' },
  { id: 'haflinger', nameFa: 'هافلینگر', nameEn: 'Haflinger', origin: 'اتریش/ایتالیا', wikipediaTitle: 'Haflinger', descriptionFa: 'نژاد کوهستانی طلایی‌رنگ با یال کرم؛ چندمنظوره، مناسب سوارکاری تفریحی و درشکه.' },
  { id: 'standardbred', nameFa: 'استاندارد برد', nameEn: 'Standardbred', origin: 'آمریکا', wikipediaTitle: 'Standardbred', descriptionFa: 'نژاد تخصصی کورس یورتمه‌سواری (harness racing) با گام trot یا pace استاندارد.' },
  { id: 'marwari', nameFa: 'مارواری', nameEn: 'Marwari horse', origin: 'راجستان، هند', wikipediaTitle: 'Marwari horse', descriptionFa: 'مشخصه بارز: گوش‌های خمیده به داخل که نوک‌شان به هم می‌رسد؛ نژاد رزمی تاریخی هند.' },
  { id: 'fjord', nameFa: 'فیورد نروژی', nameEn: 'Fjord horse', origin: 'نروژ', wikipediaTitle: 'Fjord horse', descriptionFa: 'نژاد باستانی نروژی با یال دورنگ مشخص (خاکستری با نوار سیاه وسط)؛ بسیار مقاوم و چندمنظوره.' },
];
