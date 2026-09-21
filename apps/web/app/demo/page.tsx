'use client';

import { useEffect, useState } from 'react';
import { scoreAllDiseases, type HorseBaseline, type RiskAssessment, type TelemetrySnapshot } from '@asbaan/shared';

const BASELINE: HorseBaseline = {
  horseId: 'horse-1',
  heartRateRestingBpm: 36,
  lyingBoutsPer2h: 1,
  dailyActivityIndex: 100,
};

function randomSample(): TelemetrySnapshot {
  const hr = 36 + Math.round(Math.random() * 6); // mostly-normal demo range
  return {
    horseId: 'horse-1',
    timestampIso: new Date().toISOString(),
    heartRateBpm: hr,
    skinTempC: 37.8 + (Math.random() * 0.4 - 0.2),
    sweatIncreased: false,
    lyingBoutsLast2h: 1,
    activityDropPct: 0,
    rollingDetected: false,
    missedFeedingCount: 0,
    hoofTempAsymmetryC: 0,
    weightShiftFrequent: false,
    hoursSinceExercise: 8,
    postExerciseStiffness: 'none',
    vitalsSurgeSeverity: 'none',
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function tierClass(tier: string) {
  if (tier === 'emergency' || tier === 'alert') return 'alert';
  if (tier === 'watch') return 'watch';
  return 'ok';
}

export default function DemoPage() {
  const [sample, setSample] = useState<TelemetrySnapshot>(randomSample());
  const [assessment, setAssessment] = useState<RiskAssessment>(() => scoreAllDiseases(randomSample(), BASELINE));
  const [source, setSource] = useState<'live' | 'local-engine'>('local-engine');

  useEffect(() => {
    const tick = async () => {
      try {
        const res = await fetch(`${API_BASE}/v1/horses/horse-1/risk-status`, { cache: 'no-store' });
        if (res.ok) {
          setAssessment(await res.json());
          setSource('live');
          return;
        }
        throw new Error('no live data yet');
      } catch {
        const next = randomSample();
        setSample(next);
        setAssessment(scoreAllDiseases(next, BASELINE));
        setSource('local-engine');
      }
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => clearInterval(id);
  }, []);

  const worst = [assessment.colic, assessment.laminitis, assessment.azoturia].reduce((a, b) =>
    a.score >= b.score ? a : b,
  );

  return (
    <main className="container">
      <h2 className="section-title">
        دموی اسبان‌پالس <span className="tag">LIVE DEMO</span>
      </h2>
      <p className="lede">
        {source === 'live'
          ? 'در حال نمایش داده واقعی دریافت‌شده از بک‌اند اسبان (http://localhost:3000).'
          : 'بک‌اند در دسترس نیست — این نمونه‌سازی مستقیماً موتور ریسک‌اسکورینگ واقعی (@asbaan/shared) را در مرورگر اجرا می‌کند.'}
      </p>
      <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div className="phone">
          <div className="phone-head">
            <b>اسبان‌پالس</b>
            <span className="horse-chip">🐴 شبدیز</span>
          </div>
          <div className={`tier-badge ${tierClass(worst.tier)}`}>
            <span className="dot" />
            <span>
              {worst.tier === 'normal' && 'وضعیت عادی'}
              {worst.tier === 'watch' && 'تحت نظر'}
              {worst.tier === 'alert' && 'هشدار'}
              {worst.tier === 'emergency' && 'اورژانس — دیسپچ خودکار'}
            </span>
          </div>
          <div className="vital-row">
            <span className="v-label">ضربان قلب</span>
            <span className="v-value num">{sample.heartRateBpm} bpm</span>
          </div>
          <div className="vital-row">
            <span className="v-label">دمای پوستی</span>
            <span className="v-value num">{sample.skinTempC.toFixed(1)}°C</span>
          </div>
          <div className="vital-row">
            <span className="v-label">امتیاز ریسک کولیک</span>
            <span className="v-value num">{assessment.colic.score} / 100</span>
          </div>
          <div className="vital-row">
            <span className="v-label">امتیاز ریسک لمینایتیس</span>
            <span className="v-value num">{assessment.laminitis.score} / 100</span>
          </div>
          <div className="vital-row">
            <span className="v-label">امتیاز ریسک آزوتوریا</span>
            <span className="v-value num">{assessment.azoturia.score} / 100</span>
          </div>
        </div>
        <div style={{ flex: '1 1 260px' }}>
          <h3 style={{ fontSize: 14.5, margin: '0 0 10px' }}>این دمو چه چیزی را نشان می‌دهد</h3>
          <ul style={{ fontSize: 13, color: 'var(--text-muted)', paddingInlineStart: 20, paddingInlineEnd: 0 }}>
            <li>امتیازها از همان تابع <code>scoreAllDiseases()</code> پکیج <code>@asbaan/shared</code> محاسبه می‌شوند — نه اعداد ساختگی.</li>
            <li>اگر بک‌اند اسبان روی <span className="num">localhost:3000</span> اجرا باشد، دمو خودکار به داده زنده سوییچ می‌کند.</li>
            <li>در نسخه واقعی، این داده مستقیماً از بند بیومتریک روی تسمه شکم اسب دریافت می‌شود.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
