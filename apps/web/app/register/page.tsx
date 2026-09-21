'use client';

import { useState } from 'react';
import { USER_ROLE_LABELS, type UserRole } from '@asbaan/shared';
import { login, register } from '../../lib/auth';

const ROLE_OPTIONS = Object.entries(USER_ROLE_LABELS) as [UserRole, string][];

export default function RegisterPage() {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState<UserRole[]>(['rider']);
  const [message, setMessage] = useState('');

  function toggleRole(role: UserRole) {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    try {
      await register({ name, email, password, roles });
      await login(email, password);
      setMessage('ثبت‌نام و ورود با موفقیت انجام شد.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'خطای نامشخص');
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    try {
      await login(email, password);
      setMessage('ورود موفق بود.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'خطای نامشخص');
    }
  }

  return (
    <main className="container">
      <h2 className="section-title">
        {mode === 'register' ? 'ثبت‌نام' : 'ورود'} <span className="tag">ACCOUNT</span>
      </h2>
      <p className="lede">
        هر کاربر می‌تواند یک یا چند نقش داشته باشد: سوارکار، رایدر، مربی، دامپزشک، نعلبند، اسب‌کش، یا مدیر باشگاه.
      </p>

      <div className="subtabs">
        <a className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')} style={{ cursor: 'pointer' }}>
          ثبت‌نام
        </a>
        <a className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} style={{ cursor: 'pointer' }}>
          ورود
        </a>
      </div>

      <form className="card" style={{ maxWidth: 520 }} onSubmit={mode === 'register' ? handleRegister : handleLogin}>
        {mode === 'register' && (
          <div className="field">
            <label>نام و نام‌خانوادگی</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        )}
        <div className="field">
          <label>ایمیل</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>رمز عبور</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>

        {mode === 'register' && (
          <div className="field">
            <label>نقش‌ها (چندانتخابی)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ROLE_OPTIONS.map(([role, label]) => (
                <label
                  key={role}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5,
                    background: roles.includes(role) ? 'var(--green)' : 'var(--surface-2)',
                    color: roles.includes(role) ? '#f4f1e6' : 'var(--text)',
                    borderRadius: 20, padding: '6px 12px', cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={roles.includes(role)}
                    onChange={() => toggleRole(role)}
                    style={{ display: 'none' }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="btn-primary">{mode === 'register' ? 'ایجاد حساب' : 'ورود'}</button>
        {message && <p className="form-note">{message}</p>}
      </form>
    </main>
  );
}
