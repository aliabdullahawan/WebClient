'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingCart, Star, Minus, Plus, MessageCircle, Share2, ChevronLeft, ChevronRight, Sparkles, Tag } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { BubbleButton } from '@/components/ui/BubbleButton'
import { useAuth } from '@/hooks/useAuth'

interface Product {
  id: string; name: string; description: string; price: number; category_name?: string
  tags?: string[]; average_rating: number; review_count: number; images: any[]
  discount?: { discount_percentage: number; discounted_price: number; discount_end_date?: string }
}
interface Review { id: string; rating: number; comment?: string; admin_reply?: string; created_at: string; users?: { full_name: string } }

function StarRating({ value, onChange, size = 20 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button" onClick={() => onChange?.(i)} onMouseEnter={() => onChange && setHover(i)} onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}>
          <Star size={size} fill={i <= (hover || value) ? '#fb7185' : 'none'} stroke={i <= (hover || value) ? '#fb7185' : '#fda4af'} />
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
  const [addedToCart, setAddedToCart] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [orderVia, setOrderVia] = useState<'site' | 'whatsapp' | null>(null)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(d => { setProduct(d.product); setReviews(d.reviews || []) })
      .catch(() => router.push('/shop'))
      .finally(() => setLoading(false))

    fetch('/api/wishlist').then(r => r.json()).then(d => {
      setWishlisted((d.items || []).some((i: any) => i.product_id === id))
    }).catch(() => {})
  }, [id])

  const toggleWishlist = async () => {
    const res = await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: id }) })
    const d = await res.json()
    if (d.success) setWishlisted(d.action === 'added')
  }

  const addToCart = async () => {
    if (!user) { router.push('/login?redirect=/shop/' + id); return }
    for (let i = 0; i < qty; i++) await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: id }) })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const sendViaWhatsApp = () => {
    if (!product) return
    const discountedPrice = product.discount?.discounted_price || product.price
    const totalPrice = discountedPrice * qty
    const couponLine = couponCode ? `\n*Coupon Code:* ${couponCode}` : ''
    const msg = ` *New Order*\n\n*Product:* ${product.name}\n*Quantity:* ${qty}\n*Price:* ₨${totalPrice.toLocaleString()}${product.discount ? ` (${product.discount.discount_percentage}% off)` : ''}${couponLine}\n\n_Ordered via Crochet Masterpiece website_ `
    window.open(`https://wa.me/923159202186?text=${encodeURIComponent(msg)}`, '_blank')
    setShowOrderModal(false)
  }

  const sendSiteOrder = async () => {
    if (!user) { router.push('/login?redirect=/shop/' + id); return }
    const res = await fetch('/api/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ product_id: id, quantity: qty }], discount_code: couponCode }),
    })
    const d = await res.json()
    if (d.success) { setShowOrderModal(false); router.push(`/orders/${d.order_number}`) }
  }

  const submitReview = async () => {
    if (!user) { setReviewError('Please sign in to leave a review'); return }
    if (!newRating) { setReviewError('Please select a rating'); return }
    setReviewLoading(true); setReviewError('')
    const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: id, rating: newRating, comment: newComment }) })
    const d = await res.json()
    if (d.success) {
      setReviewSuccess('Review submitted! ')
      const p = await fetch(`/api/products/${id}`).then(r => r.json())
      setReviews(p.reviews || [])
      setNewRating(0); setNewComment('')
    } else setReviewError(d.error)
    setReviewLoading(false)
  }

  if (loading) return (
    <div className="flex flex-col min-h-screen" style={{ background: 'linear-gradient(160deg,#fdf2f8,#fff8fb)' }}>
      <Navbar /><div className="flex-1 flex items-center justify-center pt-20"><div className="text-5xl animate-bounce"></div></div><Footer />
    </div>
  )
  if (!product) return null

  const price = product.discount?.discounted_price || product.price
  const images = product.images || []

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'linear-gradient(160deg,#fdf2f8,#fff8fb)' }}>
      <Navbar />
      <main className="flex-1 pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-rose-300 mb-6 pt-2">
            <button onClick={() => router.push('/')} className="hover:text-rose-500 transition-colors">Home</button>
            <span>/</span>
            <button onClick={() => router.push('/shop')} className="hover:text-rose-500 transition-colors">Shop</button>
            <span>/</span>
            <span className="text-rose-400 truncate max-w-[160px]">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image gallery */}
            <div className="space-y-3">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 shadow-md group">
                {images.length > 0 ? (
                  <img src={`/api/products/image/${images[imgIdx]?.id}`} alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl opacity-20"></div>
                )}
                {product.discount && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                    <Tag size={11} /> {product.discount.discount_percentage}% OFF
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                      <ChevronLeft size={18} className="text-rose-500" />
                    </button>
                    <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                      <ChevronRight size={18} className="text-rose-500" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_: any, i: number) => (
                        <button key={i} onClick={() => setImgIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-rose-400 w-3' : 'bg-white/60'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img: any, i: number) => (
                    <button key={img.id} onClick={() => setImgIdx(i)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${i === imgIdx ? 'border-rose-400 shadow-md scale-105' : 'border-rose-100 hover:border-rose-300'}`}>
                      <img src={`/api/products/image/${img.id}`} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="space-y-5">
              {product.category_name && (
                <span className="text-xs font-bold text-rose-400 bg-rose-50 px-3 py-1 rounded-full">{product.category_name}</span>
              )}
              <h1 className="text-2xl sm:text-3xl font-black text-[#3d1520] leading-tight">{product.name}</h1>

              {/* Rating */}
              {product.review_count > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating value={Math.round(product.average_rating)} />
                  <span className="text-sm font-semibold text-rose-500">{product.average_rating.toFixed(1)}</span>
                  <span className="text-rose-300 text-sm">({product.review_count} reviews)</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-end gap-3">
                <span className="text-3xl font-black text-rose-500">₨{price.toLocaleString()}</span>
                {product.discount && (
                  <span className="text-lg text-rose-300 line-through">₨{product.price.toLocaleString()}</span>
                )}
              </div>

              {product.description && (
                <p className="text-rose-400 text-sm leading-relaxed">{product.description}</p>
              )}

              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag: string) => (
                    <span key={tag} className="text-xs px-3 py-1 bg-rose-50 text-rose-400 rounded-full border border-rose-100">{tag}</span>
                  ))}
                </div>
              )}

              {/* Qty + actions */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-rose-50 rounded-full px-3 py-2 border border-rose-200">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-7 h-7 rounded-full bg-rose-200 hover:bg-rose-300 flex items-center justify-center text-rose-600 transition-colors"><Minus size={14} /></button>
                  <span className="w-8 text-center font-bold text-[#3d1520] text-sm">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="w-7 h-7 rounded-full bg-rose-200 hover:bg-rose-300 flex items-center justify-center text-rose-600 transition-colors"><Plus size={14} /></button>
                </div>
                <button onClick={toggleWishlist}
                  className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${wishlisted ? 'border-rose-400 bg-rose-500 text-white' : 'border-rose-200 text-rose-400 hover:border-rose-400 hover:bg-rose-50'}`}>
                  <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <BubbleButton variant="primary" size="lg" className="flex-1" onClick={() => setShowOrderModal(true)}>
                  <Sparkles size={16} /> Buy Now
                </BubbleButton>
                <BubbleButton variant="secondary" size="lg" className="flex-1" onClick={addToCart}>
                  {addedToCart ? ' Added!' : <><ShoppingCart size={16} /> Add to Cart</>}
                </BubbleButton>
              </div>

              <button onClick={() => window.open(`https://wa.me/923159202186?text=${encodeURIComponent(`Hi! I'm interested in: ${product.name}`)}`, '_blank')}
                className="flex items-center gap-2 text-sm text-green-500 hover:text-green-700 transition-colors font-medium">
                <MessageCircle size={16} /> Chat on WhatsApp
              </button>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-12">
            <h2 className="text-xl font-black text-[#3d1520] mb-6 flex items-center gap-2">
              <div className="w-6 h-1 rounded-full bg-gradient-to-r from-rose-400 to-pink-500" /> Customer Reviews
              {reviews.length > 0 && <span className="text-base text-rose-400 font-normal">({reviews.length})</span>}
            </h2>

            {/* Write review */}
            <div className="bg-white rounded-2xl p-5 border border-rose-100 mb-6">
              <h3 className="font-bold text-[#3d1520] text-sm mb-3">Write a Review</h3>
              {reviewSuccess ? (
                <p className="text-green-500 text-sm">{reviewSuccess}</p>
              ) : (
                <div className="space-y-3">
                  {reviewError && <p className="text-red-500 text-sm"> {reviewError}</p>}
                  <StarRating value={newRating} onChange={setNewRating} size={24} />
                  <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Share your experience..."
                    rows={3} className="w-full px-4 py-3 bg-rose-50 rounded-2xl border border-rose-200 text-[#3d1520] text-sm outline-none focus:border-rose-400 resize-none placeholder-rose-300 transition-all" />
                  <BubbleButton variant="primary" size="sm" loading={reviewLoading} onClick={submitReview}>Submit Review</BubbleButton>
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-10 text-rose-300">
                <div className="text-4xl mb-2">⭐</div>
                <p className="text-sm">No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                          {r.users?.full_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#3d1520] text-sm">{r.users?.full_name || 'Customer'}</p>
                          <p className="text-rose-300 text-xs">{new Date(r.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <StarRating value={r.rating} size={14} />
                    </div>
                    {r.comment && <p className="text-rose-400 text-sm mt-2 leading-relaxed">{r.comment}</p>}
                    {r.admin_reply && (
                      <div className="mt-3 pl-3 border-l-2 border-rose-200 bg-rose-50/50 rounded-r-xl p-3">
                        <p className="text-xs font-bold text-rose-400 mb-1"> Crochet Masterpiece replied:</p>
                        <p className="text-rose-500 text-sm">{r.admin_reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border border-rose-100 animate-scale-in">
            <h3 className="font-bold text-[#3d1520] text-lg mb-1">Complete Your Order </h3>
            <p className="text-rose-400 text-sm mb-5">{product.name} × {qty} = <strong className="text-rose-500">₨{(price * qty).toLocaleString()}</strong></p>
            <div className="mb-5">
              <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code (optional)"
                className="w-full px-4 py-3 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-[#3d1520] outline-none focus:border-rose-400 transition-all placeholder-rose-300 tracking-widest font-mono" />
            </div>
            <div className="space-y-3">
              <BubbleButton variant="primary" size="lg" fullWidth onClick={sendViaWhatsApp}>
                <span className="text-lg"></span> Order via WhatsApp
              </BubbleButton>
              {user && (
                <BubbleButton variant="secondary" size="md" fullWidth onClick={sendSiteOrder}>
                   Send Order Query via Site
                </BubbleButton>
              )}
              <button onClick={() => setShowOrderModal(false)} className="w-full text-sm text-rose-400 hover:text-rose-600 transition-colors py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
