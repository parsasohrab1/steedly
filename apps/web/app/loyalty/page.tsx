'use client';

import { useEffect, useState } from 'react';
import type { LoyaltyAccount, LoyaltyReward, RewardRedemption } from '@asbaan/shared';
import { authHeaders } from '../../lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function LoyaltyPage() {
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [note, setNote] = useState('');

  function refresh() {
    fetch(`${API_BASE}/v1/loyalty/rewards`).then((r) => r.json()).then(setRewards);
    fetch(`${API_BASE}/v1/loyalty/me`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setAccount(d.account);
        setRedemptions(d.redemptions);
      })
      .catch(() => setNote('برای مشاهده امتیاز خود، ابتدا از صفحه «ثبت‌نام» وارد شوید.'));
  }

  useEffect(refresh, []);

  async function handleRedeem(rewardId: string) {
    try {
      const res = await fetch(`${API_BASE}/v1/loyalty/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ rewardId }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setNote('جایزه شما ثبت شد و برای ارسال آماده می‌شود.');
      refresh();
    } catch (err) {
      setNote(err instanceof Error ? err.message : 'خطا در ثبت درخواست');
    }
  }

  return (
    <main className="container">
      <h2 className="section-title">
        باشگاه مشتریان <span className="tag">LOYALTY</span>
      </h2>
      <p className="lede">
        به ازای هر مشارکت تأییدشده در تکمیل اطلاعات سایت (تاریخچه/پدیگری اسب، تکمیل پروفایل اعضا)،{' '}
        <b>۱۰ امتیاز</b> دریافت می‌کنید. امتیازها را می‌توانید با جوایز زیر تعویض کنید.
      </p>

      {account && (
        <div className="card" style={{ maxWidth: 320, marginBlockEnd: 20 }}>
          <h4>امتیاز شما</h4>
          <p className="num" style={{ fontSize: 26, fontWeight: 700 }}>{account.points}</p>
        </div>
      )}
      {note && <div className="note">{note}</div>}

      <div className="card-grid">
        {rewards.map((r) => (
          <div className="card" key={r.id}>
            <h4>{r.title}</h4>
            <p>{r.description}</p>
            <p className="num" style={{ margin: '8px 0' }}>{r.pointsCost} امتیاز</p>
            <button className="btn-primary" onClick={() => handleRedeem(r.id)}>دریافت جایزه</button>
          </div>
        ))}
      </div>

      {redemptions.length > 0 && (
        <>
          <h3 style={{ fontSize: 14.5, margin: '24px 0 10px' }}>درخواست‌های قبلی</h3>
          <div className="card-grid">
            {redemptions.map((r) => (
              <div className="card" key={r.id}>
                <p><b>وضعیت:</b> {r.status}</p>
                <p><b>امتیاز مصرف‌شده:</b> <span className="num">{r.pointsSpent}</span></p>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
