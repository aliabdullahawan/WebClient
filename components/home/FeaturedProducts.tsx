'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Star, ShoppingCart, Heart, ArrowRight } from 'lucide-react'
import type { Product } from '@/types'

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    fetch('/api/products?featured=1&limit=8').then(r => r.json()).then(d => setProducts(d.products || []))
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  if (!products.length) return null

  return (
    <section ref={ref} style={{ padding: '64px 20px', background: '#FEFCF7' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 36 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ height: 1, width: 32, background: 'linear-gradient(to right, #C8A96E, transparent)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: '#8B6914', textTransform: 'uppercase' }}>Handpicked for You</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, color: '#2C1810', margin: 0 }}>Featured Creations</h2>
          </div>
          <Link href="/shop?featured=1" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#8B6914', textDecoration: 'none' }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {products.map((p: any, i) => (
            <ProductCard key={p.id} product={p} index={i} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductCard({ product, index, visible }: { product: any; index: number; visible: boolean }) {
  const [wishlisted, setWishlisted] = useState(false)
  const [hovered, setHovered] = useState(false)

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: product.id, quantity: 1 }) })
  }

  return (
    <Link href={`/shop/${product.id}`} style={{ textDecoration: 'none' }}>
      <div className="card-product" style={{
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.5s ease ${index*60}ms, transform 0.5s ease ${index*60}ms`,
      }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: 'linear-gradient(135deg, #F9EDD8, #EDD4B2)' }}>
          {product.primary_image_id ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/api/products/image/${product.primary_image_id}`} alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 500ms ease', transform: hovered ? 'scale(1.08)' : 'scale(1)' }} />
          ) : (
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#C8A96E' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
          )}
          <button onClick={e => { e.preventDefault(); setWishlisted(!wishlisted) }} style={{
            position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s ease',
          }}>
            <Heart size={15} fill={wishlisted ? '#8B6914' : 'none'} stroke={wishlisted ? '#8B6914' : '#9E7E5A'} />
          </button>
          {product.discount_percentage > 0 && (
            <span style={{ position: 'absolute', top: 10, left: 10, background: 'linear-gradient(135deg, #5C3D11, #8B6914)', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 10 }}>
              -{product.discount_percentage}%
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '14px 14px 12px' }}>
          {product.category_name && (
            <p style={{ fontSize: 10, fontWeight: 600, color: '#B8934A', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>{product.category_name}</p>
          )}
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#2C1810', margin: '0 0 8px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </h3>

          {product.average_rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
              <Star size={11} fill="#C8A96E" stroke="none" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#8B6914' }}>{Number(product.average_rating).toFixed(1)}</span>
              <span style={{ fontSize: 11, color: '#B8934A' }}>({product.review_count})</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <span style={{ fontSize: 16, fontWeight: 900, color: '#2C1810' }}>
                ₨{(product.discounted_price || product.price)?.toLocaleString()}
              </span>
              {product.discount_percentage > 0 && (
                <span style={{ fontSize: 11, color: '#B8934A', textDecoration: 'line-through', marginLeft: 6 }}>₨{product.price?.toLocaleString()}</span>
              )}
            </div>
            <button onClick={addToCart} style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #C8A96E, #8B6914)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, transition: 'transform 0.2s ease' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ''}>
              <ShoppingCart size={14} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
