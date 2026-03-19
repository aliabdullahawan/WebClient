'use client'
import { useState, useEffect } from 'react'
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { BubbleButton } from '@/components/ui/BubbleButton'
import type { WishlistItem } from '@/types'

interface WishlistPanelProps {
  open: boolean
  onClose: () => void
  onCountChange?: (count: number) => void
}

export function WishlistPanel({ open, onClose, onCountChange }: WishlistPanelProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !user) return
    const loadWishlist = async () => {
      setLoading(true)
      try {
        const r = await fetch('/api/wishlist')
        const d = await r.json()
        setItems(d.items || [])
        onCountChange?.(d.items?.length || 0)
      } catch {}
      finally { setLoading(false) }
    }
    loadWishlist()
  }, [open, user])

  const removeItem = async (id: string) => {
    await fetch(`/api/wishlist/${id}`, { method: 'DELETE' })
    setItems(prev => {
      const next = prev.filter(i => i.id !== id)
      onCountChange?.(next.length)
      return next
    })
  }

  const moveToCart = async (item: WishlistItem) => {
    await fetch('/api/cart', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: item.product_id }),
    })
    await removeItem(item.id)
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-[-8px_0_40px_rgba(244,63,94,0.15)] flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white">
              <Heart size={18} fill="white" />
            </div>
            <div>
              <h2 className="font-bold text-[#3d1520] text-base">Wishlist</h2>
              <p className="text-xs text-rose-400">{items.length} saved {items.length === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-100 rounded-full transition-colors text-rose-400">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!user ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <div className="text-5xl">💝</div>
              <p className="text-rose-400 text-sm">Sign in to save your wishlist</p>
              <BubbleButton variant="primary" size="sm" onClick={() => { onClose(); router.push('/login') }}>
                Sign In
              </BubbleButton>
            </div>
          ) : loading ? (
            <div className="space-y-3 p-4">
              {[1,2].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <div className="text-5xl animate-float">💕</div>
              <h3 className="font-semibold text-[#3d1520]">Your wishlist is empty</h3>
              <p className="text-rose-400 text-sm">Save items you love to your wishlist</p>
              <BubbleButton variant="primary" size="sm" onClick={() => { onClose(); router.push('/shop') }}>
                Explore Shop
              </BubbleButton>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 bg-rose-50/50 rounded-2xl p-3 border border-rose-100">
                  <button
                    className="w-16 h-16 rounded-xl bg-rose-100 flex items-center justify-center text-2xl shrink-0 hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => { onClose(); router.push(`/shop/${item.product_id}`) }}
                  >
                    🧶
                  </button>
                  <div className="flex-1 min-w-0">
                    <button onClick={() => { onClose(); router.push(`/shop/${item.product_id}`) }}
                      className="font-medium text-[#3d1520] text-sm line-clamp-2 text-left hover:text-rose-500 transition-colors">
                      {item.product?.name || 'Product'}
                    </button>
                    <p className="text-rose-500 font-bold text-sm mt-0.5">₨{item.product?.price?.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => moveToCart(item)}
                        className="flex items-center gap-1 text-xs text-rose-500 bg-rose-100 hover:bg-rose-200 px-2.5 py-1 rounded-full transition-colors font-medium">
                        <ShoppingCart size={12} /> Add to Cart
                      </button>
                      <button onClick={() => removeItem(item.id)}
                        className="text-red-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
