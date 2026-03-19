'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Instagram, Facebook, MessageCircle, ChevronRight, Sparkles, ArrowRight } from 'lucide-react'
import { BubbleButton } from '@/components/ui/BubbleButton'
import { CountUp } from '@/components/ui/CountUp'
import { ProductCard } from '@/components/shop/ProductCard'
import type { Product, SocialLink, Discount } from '@/types'

interface HeroData {
  links: SocialLink[]
  userCount: number
  settings: Record<string, string>
}

const TikTokIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.04a8.16 8.16 0 004.77 1.52V7.12a4.85 4.85 0 01-1-.43z"/>
  </svg>
)

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const platformConfig = {
  instagram: { icon: <Instagram size={16} />, color: 'social-instagram', label: 'Instagram' },
  facebook: { icon: <Facebook size={16} />, color: 'social-facebook', label: 'Facebook' },
  tiktok: { icon: <TikTokIcon />, color: 'social-tiktok', label: 'TikTok' },
  whatsapp: { icon: <WhatsAppIcon />, color: 'social-whatsapp', label: 'WhatsApp' },
}

export function HeroSection() {
  const router = useRouter()
  const carouselRef = useRef<HTMLDivElement>(null)
  const [heroData, setHeroData] = useState<HeroData | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [discountIdx, setDiscountIdx] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const bubblesRef = useRef<HTMLDivElement>(null)

  // Fetch data
  useEffect(() => {
    Promise.all([
      fetch('/api/social').then(r => r.json()),
      fetch('/api/products?hero=1&limit=12').then(r => r.json()),
      fetch('/api/discounts/active').then(r => r.json()).catch(() => ({ discounts: [] })),
    ]).then(([social, prods, disc]) => {
      setHeroData(social)
      setProducts(prods.products || [])
      setDiscounts(disc.discounts || [])
    })
  }, [])

  // Discount banner rotation
  useEffect(() => {
    if (discounts.length <= 1) return
    const t = setInterval(() => setDiscountIdx(i => (i + 1) % discounts.length), 4000)
    return () => clearInterval(t)
  }, [discounts.length])

  // Animated background bubbles
  useEffect(() => {
    const container = bubblesRef.current
    if (!container) return
    const colors = [
      'rgba(251,113,133,0.12)', 'rgba(236,72,153,0.08)',
      'rgba(244,63,94,0.1)', 'rgba(249,168,212,0.15)',
      'rgba(253,164,175,0.1)', 'rgba(252,231,243,0.2)',
    ]
    const bubbles: HTMLDivElement[] = []
    for (let i = 0; i < 14; i++) {
      const b = document.createElement('div')
      const size = 30 + Math.random() * 80
      b.style.cssText = `
        position:absolute;width:${size}px;height:${size}px;
        left:${Math.random() * 100}%;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        border-radius:50%;pointer-events:none;
        animation:bubble-rise ${10 + Math.random() * 15}s linear infinite;
        animation-delay:${Math.random() * 12}s;
      `
      container.appendChild(b)
      bubbles.push(b)
    }
    return () => bubbles.forEach(b => b.remove())
  }, [])

  // Infinite carousel auto-scroll
  useEffect(() => {
    if (products.length === 0) return
    const el = carouselRef.current
    if (!el) return
    let animId: number
    let paused = false
    const scroll = () => {
      if (!paused && !isDragging) {
        el.scrollLeft += 0.5
        if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0
      }
      animId = requestAnimationFrame(scroll)
    }
    animId = requestAnimationFrame(scroll)
    el.addEventListener('mouseenter', () => { paused = true })
    el.addEventListener('mouseleave', () => { paused = false })
    return () => cancelAnimationFrame(animId)
  }, [products.length, isDragging])

  // Carousel drag
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0))
    setScrollLeft(carouselRef.current?.scrollLeft || 0)
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - (carouselRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 1.5
    if (carouselRef.current) carouselRef.current.scrollLeft = scrollLeft - walk
  }

  // Doubled products for infinite loop effect
  const displayProducts = [...products, ...products]

  const totalFollowers = (heroData?.links || []).reduce((sum, l) => sum + (l.follower_count || 0), 0)

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: 'linear-gradient(160deg, #fff8fb 0%, #fdf2f8 40%, #fff1f2 70%, #fce7f3 100%)' }}>

      {/* Animated bubbles bg */}
      <div ref={bubblesRef} className="absolute inset-0 pointer-events-none overflow-hidden z-0" />

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at top right, rgba(251,113,133,0.18) 0%, transparent 70%)', transform: 'translate(15%,-15%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at bottom left, rgba(236,72,153,0.14) 0%, transparent 70%)', transform: 'translate(-15%,15%)' }} />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[300px] pointer-events-none z-0 -translate-x-1/2 -translate-y-1/2"
        style={{ background: 'radial-gradient(ellipse, rgba(249,168,212,0.08) 0%, transparent 70%)' }} />

      {/* Discount Banner */}
      {discounts.length > 0 && (
        <div className="relative z-10 w-full bg-gradient-to-r from-rose-400 via-pink-500 to-rose-500 py-2 px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="absolute text-white text-xs font-bold animate-float" style={{ left: `${i * 18}%`, top: '50%', transform: 'translateY(-50%)', animationDelay: `${i * 0.3}s` }}>✨</span>
            ))}
          </div>
          <div className="relative flex items-center justify-center gap-3 text-white text-sm font-semibold text-center">
            <span className="text-base">🎀</span>
            <span className="animate-fade-in">
              {discounts[discountIdx]?.description || `${discounts[discountIdx]?.percentage}% OFF — Use code: `}
              {discounts[discountIdx]?.code && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold tracking-wider ml-1">
                  {discounts[discountIdx].code}
                </span>
              )}
            </span>
            <span className="text-base">🎀</span>
          </div>
        </div>
      )}

      {/* Main hero content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-24 sm:pt-28 pb-8">

        {/* Badge */}
        <div className="animate-fade-in-down flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-rose-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
          <Sparkles size={14} className="text-rose-400" />
          <span className="text-xs font-semibold text-rose-500 tracking-wide">HANDCRAFTED WITH LOVE</span>
        </div>

        {/* Main headline */}
        <h1 className="animate-fade-in-up delay-100 text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-5 max-w-3xl">
          <span style={{ background: 'linear-gradient(135deg,#3d1520 0%,#9d174d 50%,#f43f5e 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Crochet
          </span>
          <br />
          <span style={{ background: 'linear-gradient(135deg,#ec4899 0%,#f43f5e 50%,#fb7185 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Masterpiece
          </span>
          <span className="inline-block ml-3 animate-float">🧶</span>
        </h1>

        <p className="animate-fade-in-up delay-200 text-center text-rose-400 text-base sm:text-lg md:text-xl max-w-xl mx-auto mb-8 leading-relaxed">
          {heroData?.settings?.hero_subtitle || 'Explore our beautiful collection of handmade crochet creations'}
        </p>

        {/* CTA buttons */}
        <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-3 mb-12">
          <BubbleButton variant="primary" size="lg" onClick={() => router.push('/shop')}>
            <Sparkles size={18} /> Shop Collection
          </BubbleButton>
          <BubbleButton variant="secondary" size="lg" onClick={() => router.push('/custom')}>
            Custom Order <ArrowRight size={16} />
          </BubbleButton>
        </div>

        {/* Social stats */}
        {heroData && (
          <div className="animate-fade-in-up delay-400 flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
            {/* Site users */}
            <div className="flex items-center gap-2.5 bg-white/70 backdrop-blur-sm border border-rose-100 rounded-2xl px-4 py-2.5 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-sm">
                👥
              </div>
              <div>
                <div className="font-bold text-[#3d1520] text-sm leading-none">
                  <CountUp end={heroData.userCount} />
                </div>
                <div className="text-rose-300 text-[10px] leading-none mt-0.5">Happy Customers</div>
              </div>
            </div>

            {/* Social platforms */}
            {(heroData.links || []).map(link => {
              const config = platformConfig[link.platform as keyof typeof platformConfig]
              if (!config) return null
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 bg-white/70 backdrop-blur-sm border border-rose-100 rounded-2xl px-4 py-2.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                    {config.icon}
                  </div>
                  <div>
                    <div className="font-bold text-[#3d1520] text-sm leading-none">
                      <CountUp end={link.follower_count || 0} />
                    </div>
                    <div className="text-rose-300 text-[10px] leading-none mt-0.5">{config.label}</div>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>

      {/* Product Carousel */}
      {products.length > 0 && (
        <div className="relative z-10 w-full pb-12">
          <div className="flex items-center justify-between px-4 sm:px-6 mb-5">
            <h2 className="font-bold text-[#3d1520] text-lg sm:text-xl">
              ✨ Featured Creations
            </h2>
            <Link href="/shop" className="flex items-center gap-1 text-sm text-rose-400 hover:text-rose-600 font-medium transition-colors">
              View all <ChevronRight size={16} />
            </Link>
          </div>

          {/* Carousel */}
          <div
            ref={carouselRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            className="flex gap-4 overflow-x-auto scroll-smooth px-4 sm:px-6 pb-4 cursor-grab active:cursor-grabbing select-none"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <style>{`.hero-carousel::-webkit-scrollbar{display:none}`}</style>
            {displayProducts.map((p, i) => (
              <ProductCard key={`${p.id}-${i}`} product={p} size="md" />
            ))}
          </div>

          {/* Fade edges */}
          <div className="absolute left-0 top-12 bottom-4 w-12 sm:w-16 pointer-events-none z-10"
            style={{ background: 'linear-gradient(to right, rgba(253,242,248,0.95), transparent)' }} />
          <div className="absolute right-0 top-12 bottom-4 w-12 sm:w-16 pointer-events-none z-10"
            style={{ background: 'linear-gradient(to left, rgba(252,231,243,0.95), transparent)' }} />
        </div>
      )}

      {/* WhatsApp floating button */}
      <a
        href={`https://wa.me/${heroData?.settings?.whatsapp_number || '923159202186'}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-transform duration-200 animate-pulse-glow"
        style={{ background: '#25d366' }}
        title="Chat on WhatsApp"
      >
        <WhatsAppIcon />
        <span className="sr-only">Chat on WhatsApp</span>
      </a>
    </section>
  )
}
