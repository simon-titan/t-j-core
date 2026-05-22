import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-7)',
        overflow: 'hidden',
      }}
    >
      {/* Background photo */}
      <Image
        src="/bg/forest.jpg"
        alt=""
        fill
        priority
        quality={85}
        style={{ objectFit: 'cover', objectPosition: 'center', zIndex: 0 }}
      />

      {/* Cinematic overlay — darkens + tints toward forest */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(14,14,12,0.55) 0%, rgba(18,38,32,0.60) 50%, rgba(14,14,12,0.50) 100%)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}
