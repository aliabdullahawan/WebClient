'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingCart, Star, Minus, Plus, ChevronLeft, ChevronRight, MessageCircle, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/hooks/useAuth'

interface Product {
  id: string; name: string; description: string; price: number
  category_name?: string; tags?: string[]; average_rating: number; review_count: number
  images: { id: string; is_primary: boolean; order_index: number }[]
  discount?: { discount_percentage: number; discounted_price: number }
}
interface Review {
  id: string; rating: number; comment?: string; admin_reply?: string
  admin_replied_at?: string; created_at: string; users?: { full_name: string }
}

function Stars({ value, onChange, size = 18 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hov, setHov] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button"
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHov(i)}
          onMouseLeave={() => onChange && setHov(0)}
          style={{ background: 'none', border: 'none', cursor: onChange ? 'pointer' : 'default', padding: 1 }}>
          <Star size={size} fill={i <= (hov || value) ? '#C8A96E' : 'none'} stroke={i <= (hov || value) ? '#C8A96E' : '#D1B87A'} />
        </button>
      ))}
    </div>
  )
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const [cartMsg, setCartMsg] = useState('')
  const [showOrder, setShowOrder] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewMsg, setReviewMsg] = useState<{ type: 'success'|'error'; text: string }|null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { router.push('/shop'); return }
        setProduct(d.product)
        setReviews(d.reviews || [])
      })
      .catch(() => router.push('/shop'))
      .finally(() => setLoading(false))

    if (user) {
      fetch('/api/wishlist').then(r => r.json()).then(d => {
        setWishlisted((d.items || []).some((i: any) => i.product_id === id))
      }).catch(() => {})
    }
  }, [id, user, router])

  const addToCart = async () => {
    if (!user) { router.push('/login?redirect=/shop/' + id); return }
    const res = await fetch('/api/cart', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: id, quantity: qty })
    })
    const d = await res.json()
    if (d.success) { setCartMsg('Added to cart!'); setTimeout(() => setCartMsg(''), 2500) }
    else setCartMsg(d.error || 'Failed')
  }

  const toggleWishlist = async () => {
    if (!user) { router.push('/login?redirect=/shop/' + id); return }
    await fetch('/api/wishlist', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: id })
    })
    setWishlisted(!wishlisted)
  }

  const orderViaWhatsApp = () => {
    if (!product) return
    const price = product.discount?.discounted_price || product.price
    const msg = `Hello! I want to order:\n\n*${product.name}*\nQuantity: ${qty}\nPrice: ₨${(price * qty).toLocaleString()}\n\nPlease confirm availability.`
    window.open(`https://wa.me/923159202186?text=${encodeURIComponent(msg)}`, '_blank')
    setShowOrder(false)
  }

  const placeOrder = async () => {
    if (!user) { router.push('/login?redirect=/shop/' + id); return }
    const res = await fetch('/api/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ product_id: id, quantity: qty }] })
    })
    const d = await res.json()
    if (d.success) { setShowOrder(false); alert(`Order placed! Order #${d.order_number}`) }
    else alert(d.error || 'Failed to place order')
  }

  const submitReview = async () => {
    if (!user) { setReviewMsg({ type: 'error', text: 'Please sign in to leave a review' }); return }
    if (!rating) { setReviewMsg({ type: 'error', text: 'Please select a rating' }); return }
    setReviewLoading(true); setReviewMsg(null)
    const res = await fetch('/api/reviews', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: id, rating, comment })
    })
    const d = await res.json()
    if (d.success) {
      setReviewMsg({ type: 'success', text: 'Review submitted! Thank you.' })
      setRating(0); setComment('')
      // Refresh reviews
      fetch(`/api/reviews?product_id=${id}`).then(r => r.json()).then(d => setReviews(d.reviews || []))
    } else {
      setReviewMsg({ type: 'error', text: d.error || 'Failed to submit' })
    }
    setReviewLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FEFCF7' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #EDD4B2', borderTopColor: '#C8A96E', animation: 'spin 0.8s linear infinite' }} />
      </div>
    </div>
  )

  if (!product) return null

  const displayPrice = product.discount?.discounted_price || product.price
  const images = product.images || []

  return (
    <div style={{ minHeight: '100vh', background: '#FEFCF7' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '90px 20px 60px' }}>

        {/* Back */}
        <button onClick={() => router.push('/shop')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#8B6914', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, fontWeight: 600 }}>
          <ArrowLeft size={15} /> Back to Shop
        </button>

        {/* Product grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }} className="product-detail-grid">

          {/* Images */}
          <div>
            {/* Main image */}
            <div style={{ aspectRatio: '1', borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(135deg, #F5E6D3, #EDD4B2)', position: 'relative', marginBottom: 12 }}>
              {images.length > 0 && images[imgIdx] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/products/image/${images[imgIdx].id}`}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C8A96E' }}>
                  <ShoppingCart size={48} />
                </div>
              )}
              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                    <ChevronLeft size={18} style={{ color: '#5C3D11' }} />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                    <ChevronRight size={18} style={{ color: '#5C3D11' }} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setImgIdx(i)}
                    style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', border: `2px solid ${i === imgIdx ? '#C8A96E' : '#EDD4B2'}`, cursor: 'pointer', padding: 0, background: '#F5E6D3', flexShrink: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/api/products/image/${img.id}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {product.category_name && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#8B6914', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{product.category_name}</span>
            )}
            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, color: '#2C1810', margin: 0, lineHeight: 1.2 }}>{product.name}</h1>

            {/* Rating */}
            {product.average_rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Stars value={Math.round(product.average_rating)} size={16} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#8B6914' }}>{Number(product.average_rating).toFixed(1)}</span>
                <span style={{ fontSize: 12, color: '#B8934A' }}>({product.review_count} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#2C1810' }}>₨{displayPrice.toLocaleString()}</span>
              {product.discount && (
                <>
                  <span style={{ fontSize: 16, color: '#B8934A', textDecoration: 'line-through' }}>₨{product.price.toLocaleString()}</span>
                  <span style={{ background: 'linear-gradient(135deg,#5C3D11,#8B6914)', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                    -{product.discount.discount_percentage}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p style={{ fontSize: 14, color: '#7A5C10', lineHeight: 1.75, margin: 0, padding: '14px 16px', background: '#FDF8EE', borderRadius: 12, border: '1px solid #EDD4B2' }}>
                {product.description}
              </p>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {product.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#F5E6D3', color: '#7A5C10', fontWeight: 600, border: '1px solid #EDD4B2' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Qty + Buttons */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#8B6914', marginBottom: 8, display: 'block' }}>Quantity</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #E2C090', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C3D11' }}>
                  <Minus size={14} />
                </button>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#2C1810', minWidth: 28, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #E2C090', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C3D11' }}>
                  <Plus size={14} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => setShowOrder(true)} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, minWidth: 140, padding: '13px' }}>
                  <ShoppingCart size={16} /> Buy Now
                </button>
                <button onClick={addToCart}
                  style={{ padding: '13px 18px', borderRadius: 999, border: '1.5px solid #E2C090', background: 'white', color: '#5C3D11', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}>
                  <ShoppingCart size={15} /> Add to Cart
                </button>
                <button onClick={toggleWishlist}
                  style={{ width: 46, height: 46, borderRadius: '50%', border: '1.5px solid #E2C090', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}>
                  <Heart size={18} fill={wishlisted ? '#C8A96E' : 'none'} stroke={wishlisted ? '#C8A96E' : '#9E7E5A'} />
                </button>
              </div>

              {cartMsg && (
                <div style={{ marginTop: 10, padding: '8px 14px', borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: 12, color: '#166534', fontWeight: 600 }}>
                  {cartMsg}
                </div>
              )}
            </div>

            {/* WhatsApp */}
            <a href={`https://wa.me/923159202186?text=${encodeURIComponent(`Hi! I'm interested in: ${product.name}`)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#16a34a', fontWeight: 600, textDecoration: 'none', padding: '10px 16px', borderRadius: 12, background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <MessageCircle size={15} /> Ask about this item on WhatsApp
            </a>
          </div>
        </div>

        {/* Reviews section */}
        <div style={{ marginTop: 60 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#2C1810', marginBottom: 24 }}>
            Customer Reviews {reviews.length > 0 && <span style={{ fontSize: 14, color: '#9E7E5A', fontWeight: 400 }}>({reviews.length})</span>}
          </h2>

          {/* Write review */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EDD4B2', padding: '24px', marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#2C1810', margin: '0 0 14px' }}>Write a Review</h3>
            {!user && (
              <p style={{ fontSize: 13, color: '#9E7E5A', margin: '0 0 12px' }}>
                <button onClick={() => router.push('/login?redirect=/shop/' + id)}
                  style={{ color: '#8B6914', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Sign in
                </button>{' '}to leave a review
              </p>
            )}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#8B6914', display: 'block', marginBottom: 6 }}>Your Rating</label>
              <Stars value={rating} onChange={setRating} size={24} />
            </div>
            <textarea
              value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              className="input-field" rows={3}
              style={{ resize: 'vertical', marginBottom: 12 }}
            />
            {reviewMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, marginBottom: 12, background: reviewMsg.type === 'success' ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${reviewMsg.type === 'success' ? '#BBF7D0' : '#FECACA'}`, color: reviewMsg.type === 'success' ? '#166534' : '#991B1B', fontSize: 12 }}>
                {reviewMsg.type === 'success' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                {reviewMsg.text}
              </div>
            )}
            <button onClick={submitReview} disabled={reviewLoading || !rating} className="btn-primary" style={{ padding: '10px 24px', fontSize: 13 }}>
              {reviewLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>

          {/* Review list */}
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', background: 'white', borderRadius: 16, border: '1px solid #EDD4B2' }}>
              <Star size={28} style={{ color: '#E2C090', marginBottom: 10 }} />
              <p style={{ color: '#9E7E5A', fontSize: 14, fontWeight: 600 }}>No reviews yet — be the first!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {reviews.map(r => (
                <div key={r.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #EDD4B2', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#C8A96E,#8B6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                        {(r.users?.full_name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#2C1810' }}>{r.users?.full_name || 'Anonymous'}</div>
                        <div style={{ fontSize: 11, color: '#B8934A', marginTop: 2 }}>
                          {new Date(r.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <Stars value={r.rating} size={14} />
                  </div>
                  {r.comment && <p style={{ fontSize: 13, color: '#5C3D11', lineHeight: 1.6, margin: 0 }}>{r.comment}</p>}
                  {r.admin_reply && (
                    <div style={{ marginTop: 12, padding: '10px 14px', background: '#FDF8EE', borderRadius: 10, borderLeft: '3px solid #C8A96E' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#8B6914', margin: '0 0 4px' }}>Response from Crochet Masterpiece</p>
                      <p style={{ fontSize: 12, color: '#7A5C10', margin: 0, lineHeight: 1.55 }}>{r.admin_reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order modal */}
      {showOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 28, maxWidth: 380, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: '#2C1810', margin: '0 0 8px' }}>How would you like to order?</h3>
            <p style={{ fontSize: 13, color: '#9E7E5A', margin: '0 0 20px' }}>
              {product.name} × {qty} — ₨{((product.discount?.discounted_price || product.price) * qty).toLocaleString()}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={orderViaWhatsApp} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderRadius: 12, border: '1.5px solid #BBF7D0', background: '#F0FDF4', color: '#166534', fontWeight: 700, fontSize: 14, cursor: 'pointer', textAlign: 'left' }}>
                <MessageCircle size={20} style={{ color: '#25d366' }} />
                <div>
                  <div>Order via WhatsApp</div>
                  <div style={{ fontSize: 11, fontWeight: 400, color: '#6B7280' }}>Chat directly — fastest response</div>
                </div>
              </button>
              {user && (
                <button onClick={placeOrder} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderRadius: 12, border: '1.5px solid #E2C090', background: '#FDF8EE', color: '#5C3D11', fontWeight: 700, fontSize: 14, cursor: 'pointer', textAlign: 'left' }}>
                  <ShoppingCart size={20} style={{ color: '#8B6914' }} />
                  <div>
                    <div>Place Website Order</div>
                    <div style={{ fontSize: 11, fontWeight: 400, color: '#6B7280' }}>Track your order in your profile</div>
                  </div>
                </button>
              )}
              <button onClick={() => setShowOrder(false)} style={{ padding: '10px', borderRadius: 12, border: '1px solid #EDD4B2', background: 'white', color: '#9E7E5A', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .product-detail-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
