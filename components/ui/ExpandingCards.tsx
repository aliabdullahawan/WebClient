'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

export interface HeroCardItem {
  id: string; title: string; description: string; price: number
  imageSrc: string; category?: string; badge?: string
}

export function ExpandingCards({ items, defaultActiveIndex = 0 }: { items: HeroCardItem[]; defaultActiveIndex?: number }) {
  const router = useRouter()
  const [active, setActive] = useState(defaultActiveIndex)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const gridStyle = useMemo(() => {
    if (isDesktop) return { gridTemplateColumns: items.map((_, i) => i === active ? '5fr' : '1fr').join(' ') }
    return { gridTemplateRows: items.map((_, i) => i === active ? '4fr' : '1fr').join(' ') }
  }, [active, items.length, isDesktop])

  if (!items.length) return null

  return (
    <ul className="w-full grid gap-2 expanding-cards"
      style={{ ...gridStyle, height: isDesktop ? '480px' : '540px', ...(isDesktop ? { gridTemplateRows:'1fr' } : { gridTemplateColumns:'1fr' }) }}>
      {items.map((item, i) => {
        const on = i === active
        return (
          <li key={item.id} onClick={() => on ? router.push(`/shop/${item.id}`) : setActive(i)}
            onMouseEnter={() => setActive(i)}
            style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', cursor: 'pointer',
              minWidth: isDesktop ? 56 : 0, minHeight: isDesktop ? 0 : 44 }}>

            {/* Image */}
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#F5E6D3,#E2C090)' }}>
              {item.imageSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageSrc} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover',
                  transform: on ? 'scale(1.04)' : 'scale(1.12)',
                  filter: on ? 'none' : 'grayscale(25%) brightness(0.85)',
                  transition: 'transform 700ms ease, filter 500ms ease' }} />
              )}
            </div>

            {/* Overlay */}
            <div style={{ position:'absolute', inset:0, transition:'background 500ms ease',
              background: on
                ? 'linear-gradient(to top, rgba(44,24,16,0.88) 0%, rgba(44,24,16,0.25) 55%, transparent 100%)'
                : 'linear-gradient(to top, rgba(44,24,16,0.65) 0%, rgba(44,24,16,0.45) 100%)' }} />

            {/* Collapsed label */}
            {isDesktop && !on && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'flex-end', justifyContent:'center', paddingBottom:16 }}>
                <span style={{ writingMode:'vertical-rl', transform:'rotate(180deg)', color:'rgba(254,252,247,0.75)',
                  fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase' }}>
                  {item.title}
                </span>
              </div>
            )}

            {/* Content */}
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'20px 22px' }}>
              {item.category && (
                <p style={{ opacity: on ? 0.7 : 0, transition:'opacity 300ms 80ms ease', fontSize:10,
                  color:'#F2DDB8', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:3, fontWeight:600 }}>
                  {item.category}
                </p>
              )}
              <h3 style={{ opacity: on ? 1 : 0, transition:'opacity 300ms 140ms ease', fontSize:20, fontWeight:800,
                color:'#FEFCF7', lineHeight:1.2, marginBottom:6 }}>
                {item.title}
              </h3>
              <p style={{ opacity: on ? 0.75 : 0, transition:'opacity 300ms 200ms ease', fontSize:12,
                color:'#F2DDB8', lineHeight:1.55, maxWidth:280, marginBottom:14 }}>
                {item.description}
              </p>
              <div style={{ opacity: on ? 1 : 0, transition:'opacity 300ms 250ms ease', display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:18, fontWeight:900, color:'#C8A96E' }}>₨{item.price.toLocaleString()}</span>
                <button onClick={e => { e.stopPropagation(); router.push(`/shop/${item.id}`) }}
                  style={{ background:'linear-gradient(135deg,#C8A96E,#8B6914)', color:'#FEFCF7', border:'none',
                    borderRadius:20, padding:'7px 18px', fontSize:11, fontWeight:700, cursor:'pointer',
                    letterSpacing:'0.06em', textTransform:'uppercase' }}>
                  Shop Now
                </button>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
