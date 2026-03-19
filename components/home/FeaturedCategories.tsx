'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface CatItem { id: string; name: string; description?: string; is_active: boolean }

export function FeaturedCategories() {
  const [cats, setCats] = useState<CatItem[]>([])
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    fetch('/api/categories?limit=6').then(r => r.json()).then(d => setCats(d.categories || []))
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  if (!cats.length) return null

  const palettes = [
    ['#F5E6D3','#C8A96E'], ['#EDD4B2','#B8934A'], ['#F9EDD8','#9E7E5A'],
    ['#F2DDB8','#8B6914'], ['#E2C090','#7A5C10'], ['#C8A96E','#5C3D11'],
  ]

  return (
    <section ref={ref} style={{ padding: '64px 20px', background: 'white' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 36 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ height: 1, width: 32, background: 'linear-gradient(to right, #C8A96E, transparent)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: '#8B6914', textTransform: 'uppercase' }}>Our Collections</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, color: '#2C1810', margin: 0 }}>Browse Categories</h2>
          </div>
          <Link href="/shop" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#8B6914', textDecoration: 'none' }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
          {cats.map((cat, i) => {
            const [bg, accent] = palettes[i % palettes.length]
            return (
              <Link key={cat.id} href={`/shop?category=${cat.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  borderRadius: 16, overflow: 'hidden', aspectRatio: '1', position: 'relative', cursor: 'pointer',
                  opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.92)',
                  transition: `opacity 0.5s ease ${i*60}ms, transform 0.5s ease ${i*60}ms`,
                  background: `linear-gradient(135deg, ${bg}, ${accent})`,
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'scale(1.04)'; el.style.boxShadow = '0 8px 30px rgba(92,61,17,0.2)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = '' }}>
                  {/* Category image if available */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/api/categories/image/${cat.id}`} alt={cat.name}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />

                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(44,24,16,0.75) 0%, rgba(44,24,16,0.1) 60%, transparent 100%)' }} />
                  {/* Decorative pattern */}
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.06 }}>
                    <svg width="100%" height="100%" viewBox="0 0 60 60"><circle cx="15" cy="15" r="8" fill="white" opacity="0.5"/><circle cx="45" cy="45" r="8" fill="white" opacity="0.5"/><circle cx="45" cy="15" r="5" fill="white" opacity="0.3"/><circle cx="15" cy="45" r="5" fill="white" opacity="0.3"/></svg>
                  </div>
                  <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', padding: '0 8px' }}>
                    <span style={{ color: '#FEFCF7', fontWeight: 700, fontSize: 13, letterSpacing: '0.03em', textShadow: '0 1px 4px rgba(0,0,0,0.4)', display: 'block' }}>{cat.name}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
