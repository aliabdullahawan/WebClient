'use client'
import { useEffect, useRef, useState } from 'react'

const features = [
  { icon: '✦', title: 'Handcrafted Quality', desc: 'Every piece is made by hand with premium yarn and meticulous attention to detail.' },
  { icon: '✦', title: 'Custom Orders', desc: 'Request a unique piece made just for you — your vision, our craft and expertise.' },
  { icon: '✦', title: 'Made with Care', desc: 'Each creation carries genuine passion from start to finish — no mass production.' },
  { icon: '✦', title: 'Fast Delivery', desc: 'We ensure your handcrafted items are packaged safely and delivered on time.' },
  { icon: '✦', title: 'Direct Communication', desc: 'Reach us via WhatsApp for orders, updates, and custom consultations anytime.' },
  { icon: '✦', title: 'Satisfied Customers', desc: 'Hundreds of happy customers across Pakistan who keep coming back for more.' },
]

export function WhyChooseUs() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={ref} style={{ padding: '72px 20px', background: 'linear-gradient(180deg, white 0%, #FEFCF7 100%)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ height: 1, width: 36, background: 'linear-gradient(to right, transparent, #C8A96E)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: '#8B6914', textTransform: 'uppercase' }}>Why Choose Us</span>
            <div style={{ height: 1, width: 36, background: 'linear-gradient(to left, transparent, #C8A96E)' }} />
          </div>
          <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 900, color: '#2C1810', margin: 0 }}>
            Crafted for You
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {features.map((f, i) => (
            <div key={f.title} className="card" style={{
              padding: '22px 24px',
              opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)',
              transition: `opacity 0.5s ease ${i*80}ms, transform 0.5s ease ${i*80}ms`,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #F5E6D3, #EDD4B2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: '#8B6914', fontWeight: 700 }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 700, color: '#2C1810', fontSize: 15, margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ color: '#9E7E5A', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
