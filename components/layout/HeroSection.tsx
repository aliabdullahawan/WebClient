'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Instagram, Facebook, ArrowRight, ChevronRight } from 'lucide-react'
import { CountUp } from '@/components/ui/CountUp'
import { ExpandingCards } from '@/components/ui/ExpandingCards'
import type { Discount } from '@/types'

const TikTokIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.04a8.16 8.16 0 004.77 1.52V7.12a4.85 4.85 0 01-1-.43z"/>
  </svg>
)
const WhatsAppIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const platformIcons: Record<string, { icon: React.ReactNode; cls: string }> = {
  instagram: { icon: <Instagram size={13} />, cls: 'social-instagram' },
  facebook:  { icon: <Facebook size={13} />,  cls: 'social-facebook' },
  tiktok:    { icon: <TikTokIcon />,          cls: 'social-tiktok' },
  whatsapp:  { icon: <WhatsAppIcon />,         cls: 'social-whatsapp' },
}

interface SocialLink { id: string; platform: string; url: string; follower_count: number }

export function HeroSection() {
  const router = useRouter()
  const [heroData, setHeroData] = useState<{ links: SocialLink[]; userCount: number; settings: Record<string,string> } | null>(null)
  const [heroProducts, setHeroProducts] = useState<any[]>([])
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [discountIdx, setDiscountIdx] = useState(0)

  useEffect(() => {
    Promise.all([
      fetch('/api/social').then(r => r.json()),
      fetch('/api/products?hero=1&limit=5').then(r => r.json()),
      fetch('/api/discounts/active').then(r => r.json()).catch(() => ({ discounts: [] })),
    ]).then(([social, prods, disc]) => {
      setHeroData(social)
      setHeroProducts(prods.products || [])
      setDiscounts(disc.discounts || [])
    })
  }, [])

  useEffect(() => {
    if (discounts.length <= 1) return
    const t = setInterval(() => setDiscountIdx(i => (i + 1) % discounts.length), 4000)
    return () => clearInterval(t)
  }, [discounts.length])

  const cardItems = heroProducts.map((p: any) => ({
    id: p.id,
    title: p.name,
    description: p.description || 'Handcrafted with care and premium materials.',
    price: p.price,
    imageSrc: p.primary_image_id ? `/api/products/image/${p.primary_image_id}` : '',
    category: p.category_name,
    badge: p.is_featured ? 'Featured' : undefined,
  }))

  return (
    <section style={{ background: 'linear-gradient(160deg, #FEFCF7 0%, #F9EDD8 40%, #F5E6D3 100%)', minHeight: '100vh' }}>

      {/* Discount banner */}
      {discounts.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #5C3D11, #8B6914)', padding: '10px 16px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <p style={{ color: '#FEFCF7', fontSize: 13, fontWeight: 600, margin: 0, letterSpacing: '0.02em' }}>
            Limited Offer —{' '}
            <span style={{ color: '#F2DDB8' }}>
              {discounts[discountIdx]?.description || `${discounts[discountIdx]?.percentage}% off selected items`}
            </span>
            {discounts[discountIdx]?.code && (
              <span style={{ marginLeft: 8, background: 'rgba(254,252,247,0.2)', padding: '2px 10px', borderRadius: 12, fontFamily: 'monospace', letterSpacing: '0.12em' }}>
                {discounts[discountIdx].code}
              </span>
            )}
          </p>
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>

        {/* Main hero grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 40, paddingTop: 100, paddingBottom: 48 }}
          className="lg:grid-cols-[1fr_1.4fr] xl:grid-cols-[1fr_1.5fr]">

          {/* Left: Copy */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24 }}>
            <div className="animate-fade-in-down" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ height: 1, width: 40, background: 'linear-gradient(to right, #C8A96E, transparent)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: '#8B6914', textTransform: 'uppercase' }}>
                Handcrafted in Pakistan
              </span>
            </div>

            <div className="animate-fade-in-up delay-100">
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.05, color: '#2C1810', margin: 0, letterSpacing: '-1px' }}>
                {heroData?.settings?.hero_tagline || 'Crochet'}<br />
                <span style={{ background: 'linear-gradient(135deg, #C8A96E, #8B6914)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Masterpiece
                </span>
              </h1>
            </div>

            <p className="animate-fade-in-up delay-200" style={{ fontSize: 16, color: '#9E7E5A', lineHeight: 1.7, maxWidth: 420, margin: 0 }}>
              {heroData?.settings?.hero_subtitle || 'Every piece is woven with love, precision, and premium yarn. Discover our growing collection of handcrafted creations — or commission something uniquely yours.'}
            </p>

            {/* CTA buttons */}
            <div className="animate-fade-in-up delay-300" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button className="btn-primary" onClick={() => router.push('/shop')}>
                Browse Collection <ArrowRight size={16} />
              </button>
              <button className="btn-secondary" onClick={() => router.push('/custom')}>
                Request Custom Order
              </button>
            </div>

            {/* Social stats */}
            {heroData && (
              <div className="animate-fade-in-up delay-400" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                {/* Users */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', border: '1px solid #E2C090', borderRadius: 14, padding: '8px 14px' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#C8A96E,#8B6914)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#2C1810', lineHeight: 1 }}>
                      <CountUp end={heroData.userCount} />
                    </div>
                    <div style={{ fontSize: 10, color: '#9E7E5A', lineHeight: 1, marginTop: 2 }}>Customers</div>
                  </div>
                </div>

                {/* Social platforms */}
                {heroData.links.map((link: SocialLink) => {
                  const cfg = platformIcons[link.platform]
                  if (!cfg) return null
                  return (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', border: '1px solid #E2C090', borderRadius: 14, padding: '8px 14px', textDecoration: 'none', transition: 'all 0.2s ease' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(92,61,17,0.14)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}>
                      <div className={cfg.cls} style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                        {cfg.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: '#2C1810', lineHeight: 1 }}>
                          <CountUp end={link.follower_count || 0} />
                        </div>
                        <div style={{ fontSize: 10, color: '#9E7E5A', lineHeight: 1, marginTop: 2, textTransform: 'capitalize' }}>
                          {link.platform}
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right: Expanding cards or placeholder */}
          <div className="animate-slide-right delay-200">
            {cardItems.length > 0 ? (
              <ExpandingCards items={cardItems} defaultActiveIndex={0} />
            ) : (
              <div style={{ height: 480, borderRadius: 16, background: 'linear-gradient(135deg, #F5E6D3, #E2C090)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#9E7E5A', fontSize: 14 }}>Add products and mark them &quot;Show on Hero&quot; in the admin panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom nav hint */}
        <div style={{ textAlign: 'center', paddingBottom: 32 }}>
          <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#8B6914', textDecoration: 'none', letterSpacing: '0.05em', transition: 'opacity 0.2s' }}>
            View All Products <ChevronRight size={15} />
          </Link>
        </div>
      </div>

      {/* WhatsApp floating btn */}
      <a href={`https://wa.me/${heroData?.settings?.whatsapp_number || '923159202186'}`}
        target="_blank" rel="noopener noreferrer"
        title="Chat on WhatsApp"
        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50, width: 52, height: 52, borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,211,102,0.35)', transition: 'transform 0.2s ease' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = '' }}>
        <WhatsAppIcon />
      </a>
    </section>
  )
}
