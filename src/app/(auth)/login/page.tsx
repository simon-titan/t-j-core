import Image from 'next/image';
import { LoginForm } from '@/components/auth/LoginForm';
import { FunnyCard } from '@/components/ui/FunnyCard';

export const metadata = { title: 'Anmelden — T&J CRM' };

export default function LoginPage() {
  return (
    <>
      {/* FunnyCard — client-only, randomised position each load */}
      <FunnyCard />

      <div className="auth-glass-card">
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-7)' }}>
          <Image
            src="/logo/logo-dark.jpg"
            alt="T&J Consulting"
            width={72}
            height={72}
            priority
            style={{
              borderRadius: '14px',
              objectFit: 'cover',
              boxShadow: '0 4px 16px rgba(18,38,32,0.25)',
            }}
          />
        </div>

        {/* Kicker */}
        <span
          className="label-kicker"
          style={{ marginBottom: 'var(--space-4)', display: 'block' }}
        >
          T&J CRM
        </span>

        {/* Headline */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 40px)',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            fontWeight: 400,
            fontStyle: 'italic',
            color: 'var(--ink)',
            marginBottom: 'var(--space-6)',
          }}
        >
          Willkommen zurück.
        </h1>

        {/* Chase Trail */}
        <div
          className="auth-chase-trail"
          style={{
            height: '1px',
            marginBottom: 'var(--space-7)',
            position: 'relative',
            overflow: 'hidden',
          }}
        />

        <LoginForm />
      </div>
    </>
  );
}
