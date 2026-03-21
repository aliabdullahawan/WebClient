'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, MessageSquare, ChevronDown, X } from 'lucide-react'
import { BubbleButton } from '@/components/ui/BubbleButton'

const statusConfig: Record<string, { label: string; color: string; next?: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', next: 'confirmed' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', next: 'shipped' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700', next: 'delivered' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
}

function OrdersContent() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [updating, setUpdating] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: page.toString(), limit: '20' })
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/admin/orders?${params}`)
    const d = await res.json()
    setOrders(d.orders || [])
    setTotal(d.total || 0)
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [page, statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectOrder = async (id: string) => {
    const res = await fetch(`/api/admin/orders/${id}`)
    const d = await res.json()
    setSelected(d.order)
  }

  const updateStatus = async (status: string) => {
    if (!selected) return
    setUpdating(true)
    await fetch(`/api/admin/orders/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    setSelected((s: any) => ({ ...s, status }))
    setOrders(prev => prev.map(o => o.id === selected.id ? { ...o, status } : o))
    setUpdating(false)
  }

  const sendMessage = async () => {
    if (!message.trim() || !selected) return
    setSending(true)
    await fetch(`/api/admin/orders/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: message.trim() }) })
    setMessage('')
    setSending(false)
  }

  const filteredOrders = orders.filter(o =>
    !search || o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.order_number?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-black text-[#3d1520]">Orders </h1>
        <p className="text-rose-400 text-sm">{total} orders total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`text-xs px-4 py-2 rounded-full font-semibold transition-all border ${statusFilter === s ? 'bg-rose-500 border-rose-500 text-white' : 'border-rose-200 text-rose-500 hover:bg-rose-50'}`}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className={`flex gap-4 ${selected ? 'flex-col lg:flex-row' : ''}`}>
        {/* Orders list */}
        <div className={`${selected ? 'lg:w-1/2' : 'w-full'} space-y-2`}>
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..."
              className="w-full pl-9 pr-4 py-2.5 bg-white rounded-2xl border border-rose-200 text-sm text-[#3d1520] outline-none focus:border-rose-400 placeholder-rose-300" />
          </div>

          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-rose-300"><div className="text-4xl mb-2"></div><p>No orders found</p></div>
          ) : filteredOrders.map(o => (
            <div key={o.id} onClick={() => selectOrder(o.id)}
              className={`bg-white rounded-2xl p-4 border cursor-pointer hover:border-rose-300 hover:shadow-sm transition-all ${selected?.id === o.id ? 'border-rose-400 shadow-md' : 'border-rose-100'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs font-bold text-rose-500">{o.order_number}</p>
                  <p className="font-semibold text-[#3d1520] text-sm mt-0.5">{o.customer_name || 'Guest'}</p>
                  <p className="text-rose-300 text-xs">{o.customer_email}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusConfig[o.status]?.color || 'bg-rose-50 text-rose-600'}`}>
                    {statusConfig[o.status]?.label || o.status}
                  </span>
                  <p className="text-rose-500 font-bold text-sm mt-1">₨{Number(o.total_amount).toLocaleString()}</p>
                </div>
              </div>
              <p className="text-rose-300 text-xs mt-2">{new Date(o.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          ))}

          {total > 20 && (
            <div className="flex justify-center gap-2 pt-2">
              <BubbleButton variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</BubbleButton>
              <span className="flex items-center px-3 text-xs text-rose-400">Page {page}</span>
              <BubbleButton variant="secondary" size="sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Next →</BubbleButton>
            </div>
          )}
        </div>

        {/* Order detail panel */}
        {selected && (
          <div className="lg:w-1/2 bg-white rounded-2xl border border-rose-200 shadow-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
              <div>
                <p className="font-mono text-sm font-bold text-rose-500">{selected.order_number}</p>
                <p className="text-xs text-rose-400">{statusConfig[selected.status]?.label}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-rose-100 rounded-full text-rose-400"><X size={16} /></button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Customer info */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-rose-400 uppercase tracking-wide">Customer</p>
                <p className="font-semibold text-[#3d1520] text-sm">{selected.users?.full_name || selected.guest_name || 'Guest'}</p>
                <p className="text-rose-400 text-xs">{selected.users?.email || selected.guest_email}</p>
                <p className="text-rose-400 text-xs">{selected.users?.phone || selected.guest_phone}</p>
                {(selected.shipping_address || selected.users?.address) && (
                  <p className="text-rose-300 text-xs">{selected.shipping_address || selected.users?.address}</p>
                )}
              </div>

              {/* Order items */}
              {selected.order_items?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-rose-400 uppercase tracking-wide mb-2">Items</p>
                  <div className="space-y-2">
                    {selected.order_items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between bg-rose-50 rounded-xl px-3 py-2">
                        <div>
                          <p className="text-[#3d1520] text-xs font-semibold">{item.product_name}</p>
                          <p className="text-rose-300 text-[11px]">× {item.quantity}</p>
                        </div>
                        <p className="text-rose-500 font-bold text-xs">₨{(item.price_at_order * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-rose-100">
                    <span className="text-sm font-bold text-[#3d1520]">Total</span>
                    <span className="text-sm font-black text-rose-500">₨{Number(selected.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Status change */}
              <div>
                <p className="text-xs font-bold text-rose-400 uppercase tracking-wide mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusConfig).map(([s, cfg]) => (
                    <button key={s} onClick={() => updateStatus(s)} disabled={updating || selected.status === s}
                      className={`text-xs px-3 py-1.5 rounded-full font-bold border transition-all disabled:opacity-40 ${selected.status === s ? cfg.color + ' border-current' : 'border-rose-200 text-rose-400 hover:bg-rose-50'}`}>
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Send message */}
              <div>
                <p className="text-xs font-bold text-rose-400 uppercase tracking-wide mb-2">Message to Customer</p>
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." rows={3}
                  className="w-full px-4 py-3 bg-rose-50 rounded-2xl border border-rose-200 text-sm text-[#3d1520] outline-none focus:border-rose-400 resize-none placeholder-rose-300 transition-all" />
                <BubbleButton variant="primary" size="sm" className="mt-2" loading={sending} onClick={sendMessage} disabled={!message.trim()}>
                  <MessageSquare size={14} /> Send Notification
                </BubbleButton>
              </div>

              {selected.admin_notes && (
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <p className="text-xs font-bold text-amber-600 mb-1">Admin Notes</p>
                  <p className="text-amber-700 text-xs">{selected.admin_notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminOrdersPage() {
  return <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-4xl animate-bounce"></div></div>}><OrdersContent /></Suspense>
}
