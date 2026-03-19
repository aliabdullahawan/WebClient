'use client'

interface LumaSpinProps {
  size?: number
  color?: string
}

export function LumaSpin({ size = 52, color = '#5C3D11' }: LumaSpinProps) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <span style={{
        position: 'absolute', borderRadius: 50, inset: 0,
        boxShadow: `inset 0 0 0 3px ${color}`,
        animation: 'loaderAnim 2.5s infinite',
      }} />
      <span style={{
        position: 'absolute', borderRadius: 50, inset: 0,
        boxShadow: `inset 0 0 0 3px ${color}`,
        animation: 'loaderAnim 2.5s infinite',
        animationDelay: '-1.25s',
      }} />
    </div>
  )
}

export function PageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(160deg, #FEFCF7 0%, #F9EDD8 50%, #F5E6D3 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 24,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'linear-gradient(135deg, #C8A96E, #8B6914)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(92,61,17,0.2)',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z"/>
            <path d="M12 8v1M12 15v1M8 12H7M17 12h-1"/>
          </svg>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: '#8B6914', textTransform: 'uppercase' }}>
          Crochet Masterpiece
        </span>
      </div>

      <LumaSpin size={48} color="#8B6914" />

      <span style={{ fontSize: 13, color: '#9E7E5A', letterSpacing: '0.05em' }}>{label}</span>
    </div>
  )
}
