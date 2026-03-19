'use client'
import Link from 'next/link'

function CrochetLogoMark() {
  return (
    <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#C8A96E,#5C3D11)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(92,61,17,0.28)' }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
        <line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/>
        <line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/>
      </svg>
    </div>
  )
}

export function AuthCard({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string; showLogo?: boolean }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'linear-gradient(160deg, #FEFCF7 0%, #F9EDD8 50%, #F5E6D3 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: 0, right: 0, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,169,110,0.15), transparent)', transform: 'translate(25%,-25%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(92,61,17,0.1), transparent)', transform: 'translate(-25%,25%)', pointerEvents: 'none' }} />

      <div className="animate-fade-in-up relative z-10" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <CrochetLogoMark />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: '#8B6914', textTransform: 'uppercase' }}>
              Crochet Masterpiece
            </span>
          </Link>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)', borderRadius: 24, padding: '32px 28px', boxShadow: '0 8px 40px rgba(92,61,17,0.12)', border: '1px solid rgba(226,192,144,0.5)' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#2C1810', margin: '0 0 4px' }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 13, color: '#9E7E5A', margin: '0 0 24px' }}>{subtitle}</p>}
          {!subtitle && <div style={{ height: 20 }} />}
          {children}
        </div>
      </div>
    </div>
  )
}
