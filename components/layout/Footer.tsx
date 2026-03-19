'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Instagram, Facebook, MessageCircle } from 'lucide-react'

const TikTokIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.04a8.16 8.16 0 004.77 1.52V7.12a4.85 4.85 0 01-1-.43z"/>
  </svg>
)

const platformIcon: Record<string, React.ReactNode> = {
  instagram: <Instagram size={16} />,
  facebook: <Facebook size={16} />,
  tiktok: <TikTokIcon />,
  whatsapp: <MessageCircle size={16} />,
}

export function Footer() {
  const [links, setLinks] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/social').then(r => r.json()).then(d => setLinks(d.links || []))
  }, [])

  return (
    <footer style={{ background: 'linear-gradient(180deg, #2C1810, #1A0D06)', color: '#F2DDB8', padding: '48px 20px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 36, paddingBottom: 36, borderBottom: '1px solid rgba(226,192,144,0.2)' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#C8A96E,#5C3D11)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#F2DDB8', letterSpacing: '-0.3px' }}>Crochet Masterpiece</div>
                <div style={{ fontSize: 10, color: '#B8934A', letterSpacing: '0.1em' }}>Handcrafted in Pakistan</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#9E7E5A', lineHeight: 1.7, maxWidth: 240 }}>
              Premium handmade crochet creations, crafted with love and care in Pakistan.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              {links.map(l => (
                <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" title={l.platform}
                  style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(226,192,144,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C8A96E', textDecoration: 'none', border: '1px solid rgba(226,192,144,0.2)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,169,110,0.2)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(226,192,144,0.1)'; (e.currentTarget as HTMLElement).style.transform = '' }}>
                  {platformIcon[l.platform] || <span style={{ fontSize: 12 }}>{l.platform[0].toUpperCase()}</span>}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C8A96E', margin: '0 0 14px' }}>Shop</h4>
            {[['All Products', '/shop'], ['Custom Orders', '/custom'], ['New Arrivals', '/shop?sort=created_at']].map(([l, h]) => (
              <Link key={h} href={h} style={{ display: 'block', fontSize: 13, color: '#9E7E5A', textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#F2DDB8'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#9E7E5A'}>
                {l}
              </Link>
            ))}
          </div>

          {/* Support */}
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C8A96E', margin: '0 0 14px' }}>Support</h4>
            {[['Contact Us', '/contact'], ['My Orders', '/orders'], ['My Profile', '/profile']].map(([l, h]) => (
              <Link key={h} href={h} style={{ display: 'block', fontSize: 13, color: '#9E7E5A', textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#F2DDB8'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#9E7E5A'}>
                {l}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <p style={{ fontSize: 12, color: '#5C3D11', margin: 0 }}>
            &copy; {new Date().getFullYear()} Crochet Masterpiece. All rights reserved.
          </p>
          <p style={{ fontSize: 12, color: '#5C3D11', margin: 0 }}>
            Made with care in Pakistan
          </p>
        </div>
      </div>
    </footer>
  )
}
