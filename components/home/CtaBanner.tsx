'use client'
import { useRouter } from 'next/navigation'

export function CtaBanner() {
  const router = useRouter()
  return (
    <section style={{ padding: '72px 20px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #FEFCF7, #F9EDD8)' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,169,110,0.12), transparent)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(92,61,17,0.08), transparent)' }} />
      </div>
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', border: '1px solid #E2C090', borderRadius: 20, padding: '5px 16px', marginBottom: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8A96E' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#8B6914', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Custom Orders Open</span>
        </div>
        <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, color: '#2C1810', lineHeight: 1.1, margin: '0 0 16px' }}>
          Want something made<br />
          <span style={{ background: 'linear-gradient(135deg, #C8A96E, #8B6914)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            just for you?
          </span>
        </h2>
        <p style={{ color: '#9E7E5A', fontSize: 15, lineHeight: 1.7, margin: '0 0 28px', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
          Share your dream design and we will bring it to life with expert crochet craftsmanship.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => router.push('/custom')}>
            Start Custom Order
          </button>
          <button className="btn-secondary" onClick={() => window.open('https://wa.me/923159202186', '_blank')}>
            Chat on WhatsApp
          </button>
        </div>
      </div>
    </section>
  )
}
