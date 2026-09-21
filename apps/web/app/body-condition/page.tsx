'use client';

import { useState } from 'react';
import type { CarePlan, HennekeChecklistAnswers } from '@asbaan/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function BodyConditionPage() {
  const [heartGirth, setHeartGirth] = useState(180);
  const [bodyLength, setBodyLength] = useState(185);
  const [withersHeight, setWithersHeight] = useState(160);
  const [discipline, setDiscipline] = useState<'jumping' | 'dressage'>('jumping');
  const [checklist, setChecklist] = useState<HennekeChecklistAnswers>({
    ribsVisible: 'not_visible_easily_felt',
    neckCrest: 'slight',
    tailheadFat: 'can_feel_bones',
    withersShoulder: 'defined',
  });
  const [result, setResult] = useState<{ weight: number; bcs: number; bmi?: number; carePlan: CarePlan } | null>(null);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/v1/body-condition/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heartGirth, bodyLength, withersHeight, unit: 'metric', checklist, discipline }),
      });
      if (!res.ok) throw new Error();
      setResult(await res.json());
    } catch {
      setError('اتصال به سرور برقرار نشد — بک‌اند اسبان را روی http://localhost:3000 اجرا کنید.');
    }
  }

  return (
    <main className="container">
      <h2 className="section-title">
        تخمین وزن و رژیم متناسب <span className="tag">WEIGHT + BCS</span>
      </h2>
      <p className="lede">
        وزن از فرمول استاندارد دور سینه × دور سینه × طول بدن ÷ ۱۱۹۰۰ (متریک) محاسبه می‌شود؛ امتیاز وضعیت بدنی (BCS) از
        یک چک‌لیست هدایت‌شده بر پایه مقیاس Henneke ۱ تا ۹ تخمین زده می‌شود.
      </p>
      <div className="note">
        تشخیص خودکار BCS از روی عکس نیازمند مدل بینایی کامپیوتر آموزش‌دیده روی تصاویر اسب است که هنوز ساخته نشده؛
        چک‌لیست زیر جایگزین صادقانه آن تا رسیدن به آن مرحله است.
      </div>

      <form className="card" style={{ maxWidth: 560 }} onSubmit={handleSubmit}>
        <div className="field">
          <label>دور سینه (Heart Girth) — سانتی‌متر</label>
          <input type="number" value={heartGirth} onChange={(e) => setHeartGirth(Number(e.target.value))} />
        </div>
        <div className="field">
          <label>طول بدن (نوک شانه تا نوک نشیمنگاه) — سانتی‌متر</label>
          <input type="number" value={bodyLength} onChange={(e) => setBodyLength(Number(e.target.value))} />
        </div>
        <div className="field">
          <label>ارتفاع جدوگاه (Withers Height) — سانتی‌متر</label>
          <input type="number" value={withersHeight} onChange={(e) => setWithersHeight(Number(e.target.value))} />
        </div>
        <div className="field">
          <label>رشته</label>
          <select value={discipline} onChange={(e) => setDiscipline(e.target.value as 'jumping' | 'dressage')}>
            <option value="jumping">پرش</option>
            <option value="dressage">دراساژ</option>
          </select>
        </div>

        <div className="field">
          <label>وضوح دنده‌ها</label>
          <select
            value={checklist.ribsVisible}
            onChange={(e) => setChecklist({ ...checklist, ribsVisible: e.target.value as any })}
          >
            <option value="clearly_visible">کاملاً نمایان</option>
            <option value="faintly_visible">کمی نمایان</option>
            <option value="not_visible_easily_felt">نمایان نیست ولی راحت لمس می‌شود</option>
            <option value="cannot_feel">حتی با لمس هم مشخص نیست</option>
          </select>
        </div>
        <div className="field">
          <label>برجستگی چربی روی گردن (crest)</label>
          <select
            value={checklist.neckCrest}
            onChange={(e) => setChecklist({ ...checklist, neckCrest: e.target.value as any })}
          >
            <option value="none">وجود ندارد</option>
            <option value="slight">کمی</option>
            <option value="thickened">ضخیم</option>
            <option value="very_thick_falls_to_side">بسیار ضخیم و افتاده به یک‌طرف</option>
          </select>
        </div>
        <div className="field">
          <label>چربی اطراف دم (tailhead)</label>
          <select
            value={checklist.tailheadFat}
            onChange={(e) => setChecklist({ ...checklist, tailheadFat: e.target.value as any })}
          >
            <option value="bones_prominent">استخوان‌ها کاملاً برجسته</option>
            <option value="can_feel_bones">استخوان‌ها با لمس مشخص است</option>
            <option value="spongy">اسفنجی</option>
            <option value="bulging">برجسته و پر</option>
          </select>
        </div>
        <div className="field">
          <label>شانه و جدوگاه (withers/shoulder)</label>
          <select
            value={checklist.withersShoulder}
            onChange={(e) => setChecklist({ ...checklist, withersShoulder: e.target.value as any })}
          >
            <option value="bones_prominent">استخوان‌ها برجسته</option>
            <option value="defined">مشخص و متناسب</option>
            <option value="rounded">گرد شده</option>
            <option value="bulging_fat_pockets">جیب‌های چربی برجسته</option>
          </select>
        </div>

        <button type="submit" className="btn-primary">محاسبه</button>
        {error && <p className="form-note">{error}</p>}
      </form>

      {result && (
        <div className="card-grid" style={{ marginBlockStart: 20 }}>
          <div className="card">
            <h4>وزن تخمینی</h4>
            <p className="num" style={{ fontSize: 22, fontWeight: 700 }}>
              {result.weight} kg
            </p>
          </div>
          <div className="card">
            <h4>امتیاز BCS (Henneke)</h4>
            <p className="num" style={{ fontSize: 22, fontWeight: 700 }}>
              {result.bcs} / 9
            </p>
            <p>{result.carePlan.category === 'ideal' ? 'وضعیت ایده‌آل' : result.carePlan.category === 'underweight' ? 'کمبود وزن' : 'اضافه وزن'}</p>
          </div>
          {result.bmi !== undefined && (
            <div className="card">
              <h4>BMI (وزن ÷ ارتفاع جدوگاه²)</h4>
              <p className="num" style={{ fontSize: 22, fontWeight: 700 }}>
                {result.bmi} kg/m²
              </p>
              <p>مقیاس اسبی است، قابل‌مقایسه با BMI انسانی (۱۸.۵–۲۵) نیست؛ فقط یک شاخص تحقیقاتی مکمل BCS است، نه معیار اصلی تصمیم‌گیری تغذیه.</p>
            </div>
          )}
          <div className="card">
            <h4>تغذیه</h4>
            <p>{result.carePlan.diet}</p>
          </div>
          <div className="card">
            <h4>آمادگی جسمانی</h4>
            <p>{result.carePlan.fitness}</p>
          </div>
          <div className="card">
            <h4>کار زمینی</h4>
            <p>{result.carePlan.groundwork}</p>
          </div>
          <div className="card">
            <h4>نکته اختصاصی رشته</h4>
            <p>{result.carePlan.disciplineNotes}</p>
          </div>
        </div>
      )}
    </main>
  );
}
