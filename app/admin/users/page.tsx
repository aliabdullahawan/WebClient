'use client'
import { useState, useEffect } from 'react'
import { Search, User, Package, MessageSquare, Shield, X, ChevronRight } from 'lucide-react'
import { BubbleButton } from '@/components/ui/BubbleButton'

interface UserStat { id: string; full_name: string; email: string; phone?: string; is_blocked: boolean; created_at: string; total_orders: number; delivered_orders: number; cancelled_orders: number; total_spent: number }

const statusColors: Record<string, string> = { pending: 'text-amber-600 bg-amber-50', confirmed: 'text-blue-600 bg-blue-50', shipped: 'text-purple-600 bg-purple-50', delivered: 'text-green-600 bg-green-50', cancelled: 'text-red-600 bg-red-50' }

export default function AdminUsers() {
  const [users, setUsers] = useState<UserStat[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<any>(null)
  const [selectedOrders, setSelectedOrders] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [blocking, setBlocking] = useState(false)

  const fetch_ = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: page.toString(), limit: '20' })
    if (search) params.set('q', search)
    const res = await fetch(`/api/admin/users?${params}`)
    const d = await res.json()
    setUsers(d.users || [])
    setTotal(d.total || 0)
    setLoading(false)
  }

  useEffect(() => { fetch_() }, [page, search])

  const selectUser = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}`)
    const d = await res.json()
    setSelected(d.user)
    setSelectedOrders(d.orders || [])
    setMessage('')
  }

  const toggleBlock = async () => {
    if (!selected) return
    setBlocking(true)
    await fetch(`/api/admin/users/${selected.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_blocked: !selected.is_blocked }),
    })
    setSelected((u: any) => ({ ...u, is_blocked: !u.is_blocked }))
    setUsers(prev => prev.map(u => u.id === selected.id ? { ...u, is_blocked: !u.is_blocked } : u))
    setBlocking(false)
  }

  const sendMsg = async () => {
    if (!message.trim() || !selected) return
    setSending(true)
    await fetch(`/api/admin/users/${selected.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message.trim() }),
    })
    setMessage('')
    setSending(false)
  }

  const filteredUsers = users.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-black text-[#3d1520]">Customers 👥</h1>
        <p className="text-rose-400 text-sm">{total} registered users</p>
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Users list */}
        <div className={`${selected ? 'lg:w-1/2' : 'w-full'} space-y-3`}>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-3 bg-white rounded-2xl border border-rose-200 text-sm outline-none focus:border-rose-400 placeholder-rose-300 transition-all" />
          </div>

          {loading ? (
            <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-rose-300"><div className="text-4xl mb-2">👥</div><p>No users found</p></div>
          ) : filteredUsers.map(u => (
            <div key={u.id} onClick={() => selectUser(u.id)}
              className={`bg-white rounded-2xl border cursor-pointer hover:border-rose-300 hover:shadow-sm transition-all p-4 ${selected?.id === u.id ? 'border-rose-400 shadow-md' : 'border-rose-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${u.is_blocked ? 'bg-red-400' : 'bg-gradient-to-br from-rose-400 to-pink-500'}`}>
                  {u.is_blocked ? '🚫' : u.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#3d1520] text-sm truncate">{u.full_name}</p>
                    {u.is_blocked && <span className="text-[10px] bg-red-100 text-red-500 font-bold px-2 py-0.5 rounded-full">Blocked</span>}
                  </div>
                  <p className="text-rose-400 text-xs truncate">{u.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-[#3d1520]">{u.total_orders} orders</p>
                  <p className="text-rose-400 text-xs">₨{Number(u.total_spent || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}

          {total > 20 && (
            <div className="flex justify-center gap-2 pt-2">
              <BubbleButton variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</BubbleButton>
              <span className="flex items-center px-3 text-xs text-rose-400">{page} / {Math.ceil(total / 20)}</span>
              <BubbleButton variant="secondary" size="sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Next →</BubbleButton>
            </div>
          )}
        </div>

        {/* User detail */}
        {selected && (
          <div className="lg:w-1/2 bg-white rounded-2xl border border-rose-200 shadow-md overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold ${selected.is_blocked ? 'bg-red-400' : 'bg-gradient-to-br from-rose-400 to-pink-500'}`}>
                  {selected.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-[#3d1520] text-sm">{selected.full_name}</p>
                  <p className="text-rose-400 text-xs">{selected.email}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-rose-100 rounded-full text-rose-400"><X size={16} /></button>
            </div>

            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Orders', value: selected.total_orders, icon: '📦' },
                  { label: 'Delivered', value: selected.delivered_orders, icon: '✅' },
                  { label: 'Cancelled', value: selected.cancelled_orders, icon: '❌' },
                ].map(s => (
                  <div key={s.label} className="bg-rose-50 rounded-2xl p-3 text-center">
                    <div className="text-xl mb-1">{s.icon}</div>
                    <p className="font-black text-[#3d1520] text-lg">{s.value || 0}</p>
                    <p className="text-rose-300 text-[11px]">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between bg-rose-50 rounded-2xl p-3">
                <span className="text-rose-400 text-sm font-medium">Total Spent</span>
                <span className="font-black text-rose-500 text-lg">₨{Number(selected.total_spent || 0).toLocaleString()}</span>
              </div>

              {/* Contact */}
              {selected.phone && (
                <div className="bg-rose-50/50 rounded-2xl p-3">
                  <p className="text-xs font-bold text-rose-400 mb-1">📞 Phone</p>
                  <p className="text-[#3d1520] text-sm font-medium">{selected.phone}</p>
                </div>
              )}

              {/* Block/Unblock */}
              <BubbleButton variant={selected.is_blocked ? 'secondary' : 'danger'} size="sm" fullWidth
                loading={blocking} onClick={toggleBlock}>
                {selected.is_blocked ? <><Shield size={14} /> Unblock User</> : <>🚫 Block User</>}
              </BubbleButton>

              {/* Send message */}
              <div>
                <p className="text-xs font-bold text-rose-400 uppercase tracking-wide mb-2">Send Notification</p>
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message to this customer..."
                  rows={3} className="w-full px-4 py-3 bg-rose-50 rounded-2xl border border-rose-200 text-sm text-[#3d1520] outline-none focus:border-rose-400 resize-none placeholder-rose-300 transition-all" />
                <BubbleButton variant="primary" size="sm" className="mt-2" loading={sending}
                  disabled={!message.trim()} onClick={sendMsg}>
                  <MessageSquare size={14} /> Send
                </BubbleButton>
              </div>

              {/* Order history */}
              {selectedOrders.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-rose-400 uppercase tracking-wide mb-3">Order History</p>
                  <div className="space-y-2">
                    {selectedOrders.slice(0, 8).map((o: any) => (
                      <div key={o.id} className="flex items-center justify-between bg-rose-50/50 rounded-xl px-3 py-2.5">
                        <div>
                          <p className="font-mono text-xs font-bold text-rose-500">{o.order_number}</p>
                          <p className="text-rose-300 text-[11px]">{new Date(o.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-rose-500 font-bold text-xs">₨{Number(o.total_amount).toLocaleString()}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[o.status] || 'bg-rose-50 text-rose-400'}`}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
