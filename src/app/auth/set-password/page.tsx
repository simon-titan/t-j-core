'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

type Status = 'loading' | 'ready' | 'saving' | 'done' | 'error';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function SetPasswordPage() {
  const router = useRouter();
  const [status,   setStatus]   = useState<Status>('loading');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const pwTooShort = password.length > 0 && password.length < 8;
  const pwMismatch = confirm.length > 0 && password !== confirm;
  const canSave    = password.length >= 8 && password === confirm && status === 'ready';

  useEffect(() => {
    const supabase = createClient();
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const accessToken  = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      setStatus('error');
      return;
    }

    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ data: { session }, error }) => {
        if (error || !session) {
          setStatus('error');
          return;
        }
        // Remove tokens from URL bar
        window.history.replaceState(null, '', window.location.pathname);
        setStatus('ready');
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setStatus('saving');
    setErrorMsg('');
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrorMsg(error.message ?? 'Passwort konnte nicht gesetzt werden.');
      setStatus('ready');
      return;
    }
    setStatus('done');
    setTimeout(() => router.replace('/app'), 1500);
  }

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-7)',
      overflow: 'hidden',
    }}>
      {/* Background */}
      <Image
        src="/bg/forest.jpg"
        alt=""
        fill
        priority
        quality={85}
        style={{ objectFit: 'cover', objectPosition: 'center', zIndex: 0 }}
      />
      {/* Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(14,14,12,0.55) 0%, rgba(18,38,32,0.60) 50%, rgba(14,14,12,0.50) 100%)',
        zIndex: 1,
      }} />

      {/* Card */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="auth-glass-card">

          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-7)' }}>
            <Image
              src="/logo/logo-dark.jpg"
              alt="T&J Consulting"
              width={72}
              height={72}
              priority
              style={{ borderRadius: '14px', objectFit: 'cover', boxShadow: '0 4px 16px rgba(18,38,32,0.25)' }}
            />
          </div>

          <span className="label-kicker" style={{ marginBottom: 'var(--space-4)', display: 'block' }}>
            T&J CRM
          </span>

          {/* ── Loading ── */}
          {status === 'loading' && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--mute)', textAlign: 'center', padding: 'var(--space-5) 0' }}>
              Einladung wird überprüft…
            </p>
          )}

          {/* ── Invalid / expired ── */}
          {status === 'error' && (
            <>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontStyle: 'italic', letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 'var(--space-4)' }}>
                Link ungültig.
              </h1>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--mute)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
                Dieser Einladungslink ist abgelaufen oder wurde bereits verwendet. Bitte fordere eine neue Einladung an.
              </p>
              <button onClick={() => router.replace('/login')} style={btnStyle(true)}>
                Zur Anmeldung →
              </button>
            </>
          )}

          {/* ── Password form ── */}
          {(status === 'ready' || status === 'saving') && (
            <>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,4vw,36px)', fontStyle: 'italic', letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--ink)', marginBottom: 'var(--space-4)' }}>
                Passwort festlegen.
              </h1>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--mute)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
                Willkommen bei T&J CRM. Lege jetzt dein persönliches Passwort fest.
              </p>

              <div className="auth-chase-trail" style={{ height: '1px', marginBottom: 'var(--space-7)', position: 'relative', overflow: 'hidden' }} />

              <form onSubmit={handleSubmit} noValidate>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

                  <div>
                    <label style={labelStyle}>Neues Passwort</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Mindestens 8 Zeichen"
                        autoFocus
                        style={inputStyle(pwTooShort)}
                      />
                      <button type="button" onClick={() => setShowPw(v => !v)} style={eyeBtnStyle}>
                        <EyeIcon open={showPw} />
                      </button>
                    </div>
                    {pwTooShort && <p style={hintStyle}>Mindestens 8 Zeichen erforderlich.</p>}
                  </div>

                  <div>
                    <label style={labelStyle}>Passwort bestätigen</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConf ? 'text' : 'password'}
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        placeholder="Passwort wiederholen"
                        style={inputStyle(pwMismatch)}
                      />
                      <button type="button" onClick={() => setShowConf(v => !v)} style={eyeBtnStyle}>
                        <EyeIcon open={showConf} />
                      </button>
                    </div>
                    {pwMismatch && <p style={hintStyle}>Passwörter stimmen nicht überein.</p>}
                  </div>

                  {errorMsg && (
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#991B1B', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 'var(--radius-2)', padding: '10px 14px', margin: 0 }}>
                      {errorMsg}
                    </p>
                  )}

                  <button type="submit" disabled={!canSave} style={btnStyle(canSave)}>
                    {status === 'saving' ? 'Wird gespeichert…' : 'Passwort speichern →'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── Done ── */}
          {status === 'done' && (
            <>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontStyle: 'italic', letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 'var(--space-4)' }}>
                Passwort gesetzt. ✓
              </h1>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--mute)', lineHeight: 1.6 }}>
                Du wirst gleich weitergeleitet…
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-sans)',
  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--mute)',
  marginBottom: '6px',
  letterSpacing: '-0.01em',
};

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: '100%',
    height: '44px',
    padding: '0 40px 0 14px',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    color: 'var(--ink)',
    background: 'var(--paper)',
    border: `1px solid ${hasError ? 'rgba(239,68,68,0.50)' : 'var(--mist)'}`,
    borderRadius: 'var(--radius-2)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 150ms ease',
  };
}

const eyeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--mute)',
  display: 'flex',
  alignItems: 'center',
  padding: 0,
};

const hintStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '12px',
  color: '#DC2626',
  marginTop: '5px',
};

function btnStyle(active: boolean): React.CSSProperties {
  return {
    width: '100%',
    height: '44px',
    marginTop: '8px',
    background: active ? '#4A7C5C' : '#C8D5CB',
    color: 'var(--paper)',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    fontSize: '15px',
    letterSpacing: '-0.01em',
    borderRadius: 'var(--radius-2)',
    border: 'none',
    cursor: active ? 'pointer' : 'not-allowed',
    transition: 'background 150ms ease',
  };
}
