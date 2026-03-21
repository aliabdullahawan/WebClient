'use client'
import { useEffect, useState } from 'react'
import { X, Heart, ShoppingCart } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface WishlistItem { id: string; product_id: string; products: { id: string; name: string; price: number; product_images: { id: string }[] } }

export function WishlistPanel({ open, onClose, onCountChange }: { open: boolean; onClose: () => void; onCountChange?: (n: number) => void }) {
  const { user } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchWishlist = async () => {
    if (!user) return
    setLoading(true)
    const res = await fetch('/api/wishlist')
    const data = await res.json()
    const all = data.items || []
    setItems(all)
    onCountChange?.(all.length)
    setLoading(false)
  }

  useEffect(() => { if (open) fetchWishlist() }, [open, user]) // eslint-disable-line react-hooks/exhaustive-deps

  const removeItem = async (id: string) => {
    await fetch(`/api/wishlist/${id}`, { method: 'DELETE' })
    const updated = items.filter(i => i.id !== id)
    setItems(updated)
    onCountChange?.(updated.length)
  }

  const addToCart = async (item: WishlistItem) => {
    await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: item.product_id, quantity: 1 }) })
    await removeItem(item.id)
  }

  if (!open) return null
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.3)' }} onClick={onClose} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 380, zIndex: 91, background: 'white', boxShadow: '-4px 0 30px rgba(92,61,17,0.15)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #EDD4B2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FDF8EE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Heart size={18} style={{ color: '#8B6914' }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: '#2C1810' }}>Wishlist</span>
            <span style={{ background: 'linear-gradient(135deg,#C8A96E,#8B6914)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{items.length}</span>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#9E7E5A' }}><X size={18} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {!user ? (
            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
              <Heart size={28} style={{ color: '#E2C090', marginBottom: 10 }} />
              <p style={{ fontSize: 13, color: '#9E7E5A', fontWeight: 600 }}>Sign in to view your wishlist</p>
              <button onClick={() => { onClose(); router.push('/login') }} className="btn-primary" style={{ marginTop: 14, padding: '10px 24px', fontSize: 13 }}>Sign In</button>
            </div>
          ) : loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #EDD4B2', borderTopColor: '#C8A96E', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
              <Heart size={28} style={{ color: '#E2C090', marginBottom: 10 }} />
              <p style={{ fontSize: 13, color: '#9E7E5A', fontWeight: 600 }}>Your wishlist is empty</p>
              <button onClick={() => { onClose(); router.push('/shop') }} className="btn-primary" style={{ marginTop: 14, padding: '10px 24px', fontSize: 13 }}>Browse Products</button>
            </div>
          ) : items.map(item => (
            <div key={item.id} style={{ padding: '14px 20px', borderBottom: '1px solid #F9EDD8', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 10, background: '#F5E6D3', flexShrink: 0, overflow: 'hidden' }}>
                {item.products?.product_images?.[0]?.id && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/products/image/${item.products.product_images[0].id}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: '#2C1810', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.products?.name}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#8B6914', margin: '3px 0 8px' }}>₨{item.products?.price?.toLocaleString()}</p>
                <button onClick={() => addToCart(item)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, border: '1.5px solid #E2C090', background: 'white', color: '#5C3D11', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  <ShoppingCart size={11} /> Add to Cart
                </button>
              </div>
              <button onClick={() => removeItem(item.id)} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#B8934A' }}>
                <Heart size={15} fill="#C8A96E" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
