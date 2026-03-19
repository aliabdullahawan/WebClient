'use client'
import { useState, useEffect } from 'react'
import { X, ShoppingCart, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { BubbleButton } from '@/components/ui/BubbleButton'
import type { CartItem } from '@/types'

interface CartPanelProps {
  open: boolean
  onClose: () => void
  onCountChange?: (count: number) => void
}

export function CartPanel({ open, onClose, onCountChange }: CartPanelProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const loadCart = async () => {
      setLoading(true)
      try {
        const r = await fetch('/api/cart')
        const d = await r.json()
        setItems(d.items || [])
        onCountChange?.(d.items?.length || 0)
      } catch {}
      finally { setLoading(false) }
    }
    loadCart()
  }, [open])

  const updateQty = async (id: string, qty: number) => {
    if (qty < 1) return removeItem(id)
    setUpdating(id)
    await fetch(`/api/cart/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: qty }),
    })
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
    setUpdating(null)
  }

  const removeItem = async (id: string) => {
    setUpdating(id)
    await fetch(`/api/cart/${id}`, { method: 'DELETE' })
    setItems(prev => {
      const newItems = prev.filter(i => i.id !== id)
      onCountChange?.(newItems.length)
      return newItems
    })
    setUpdating(null)
  }

  const total = items.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0)

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-[-8px_0_40px_rgba(244,63,94,0.15)] flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white">
              <ShoppingCart size={18} />
            </div>
            <div>
              <h2 className="font-bold text-[#3d1520] text-base">My Cart</h2>
              <p className="text-xs text-rose-400">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-100 rounded-full transition-colors text-rose-400">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {!user ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <div className="text-5xl">🛒</div>
              <p className="text-rose-400 text-sm">Sign in to view your cart</p>
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
              <div className="text-5xl animate-float">🛍️</div>
              <h3 className="font-semibold text-[#3d1520]">Your cart is empty</h3>
              <p className="text-rose-400 text-sm">Discover our beautiful crochet collection</p>
              <BubbleButton variant="primary" size="sm" onClick={() => { onClose(); router.push('/shop') }}>
                Browse Shop
              </BubbleButton>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 bg-rose-50/50 rounded-2xl p-3 border border-rose-100">
                  <div className="w-16 h-16 rounded-xl bg-rose-100 flex items-center justify-center text-2xl shrink-0">
                    🧶
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#3d1520] text-sm line-clamp-1">{item.product?.name || 'Product'}</p>
                    <p className="text-rose-500 font-bold text-sm">₨{((item.product?.price || 0) * item.quantity).toLocaleString()}</p>
                    <p className="text-rose-300 text-xs">₨{item.product?.price?.toLocaleString()} each</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)}
                        disabled={updating === item.id}
                        className="w-6 h-6 rounded-full bg-rose-200 hover:bg-rose-300 flex items-center justify-center text-rose-600 transition-colors disabled:opacity-50">
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-semibold text-[#3d1520] w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)}
                        disabled={updating === item.id}
                        className="w-6 h-6 rounded-full bg-rose-200 hover:bg-rose-300 flex items-center justify-center text-rose-600 transition-colors disabled:opacity-50">
                        <Plus size={12} />
                      </button>
                      <button onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                        className="ml-auto text-red-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-rose-100 p-5 bg-gradient-to-r from-rose-50/50 to-pink-50/50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-rose-400 font-medium">Total</span>
              <span className="text-xl font-bold text-[#3d1520]">₨{total.toLocaleString()}</span>
            </div>
            <BubbleButton variant="primary" size="lg" fullWidth
              onClick={() => { onClose(); router.push('/checkout') }}>
              <ShoppingBag size={18} /> Checkout
            </BubbleButton>
            <BubbleButton variant="secondary" size="md" fullWidth
              onClick={() => { onClose(); router.push('/shop') }}>
              Continue Shopping
            </BubbleButton>
          </div>
        )}
      </div>
    </>
  )
}
