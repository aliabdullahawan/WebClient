'use client'
import { useEffect, useState } from 'react'
import { X, Bell, Package, Tag, MessageSquare, Star, Info, CheckCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface Notification {
  id: string; type: string; title: string; message: string;
  is_read: boolean; created_at: string; related_order_id?: string; related_product_id?: string
}

const typeIcon: Record<string, React.ReactNode> = {
  order_update:   <Package size={14} />,
  discount:       <Tag size={14} />,
  admin_message:  <MessageSquare size={14} />,
  review_reply:   <Star size={14} />,
  system:         <Info size={14} />,
}
const typeColor: Record<string, string> = {
  order_update: '#3B82F6', discount: '#8B6914', admin_message: '#7C3AED', review_reply: '#D97706', system: '#6B7280',
}

export function NotificationPanel({ open, onClose, onCountChange }: { open: boolean; onClose: () => void; onCountChange?: (n: number) => void }) {
  const { user } = useAuth()
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const fetchNotifs = async () => {
    if (!user || user.role !== 'user') return
    setLoading(true)
    const res = await fetch('/api/notifications')
    const data = await res.json()
    const all = data.notifications || []
    setItems(all)
    onCountChange?.(all.filter((n: Notification) => !n.is_read).length)
    setLoading(false)
  }

  useEffect(() => { if (open) fetchNotifs() }, [open, user]) // eslint-disable-line react-hooks/exhaustive-deps

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    setItems(p => p.map(n => n.id === id ? { ...n, is_read: true } : n))
    onCountChange?.(items.filter(n => !n.is_read && n.id !== id).length)
  }

  const markAll = async () => {
    await fetch('/api/notifications/mark-read', { method: 'PATCH' })
    setItems(p => p.map(n => ({ ...n, is_read: true })))
    onCountChange?.(0)
  }

  const displayed = filter === 'unread' ? items.filter(n => !n.is_read) : items
  const unreadCount = items.filter(n => !n.is_read).length

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'Just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  if (!open) return null

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.3)' }} onClick={onClose} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 380, zIndex: 91,
        background: 'white', boxShadow: '-4px 0 30px rgba(92,61,17,0.15)',
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #EDD4B2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FDF8EE' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={18} style={{ color: '#8B6914' }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: '#2C1810' }}>Notifications</span>
            {unreadCount > 0 && (
              <span style={{ background: 'linear-gradient(135deg,#C8A96E,#8B6914)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{unreadCount}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {unreadCount > 0 && (
              <button onClick={markAll} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#8B6914', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
            <button onClick={onClose} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#9E7E5A' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', padding: '8px 16px', gap: 6, borderBottom: '1px solid #EDD4B2' }}>
          {(['all', 'unread'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
                background: filter === f ? '#F5E6D3' : 'transparent',
                color: filter === f ? '#5C3D11' : '#9E7E5A',
              }}>
              {f === 'all' ? `All (${items.length})` : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #EDD4B2', borderTopColor: '#C8A96E', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : !user ? (
            <div style={{ textAlign: 'center', padding: '40px 24px', color: '#B8934A', fontSize: 13 }}>
              <Bell size={28} style={{ color: '#E2C090', marginBottom: 10 }} />
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Sign in to see notifications</p>
            </div>
          ) : displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 24px', color: '#B8934A', fontSize: 13 }}>
              <Bell size={28} style={{ color: '#E2C090', marginBottom: 10 }} />
              <p style={{ fontWeight: 600 }}>{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
            </div>
          ) : (
            displayed.map(n => (
              <div key={n.id} onClick={() => !n.is_read && markRead(n.id)}
                style={{
                  padding: '14px 20px', borderBottom: '1px solid #F9EDD8', cursor: n.is_read ? 'default' : 'pointer',
                  background: n.is_read ? 'white' : '#FEFCF7',
                  transition: 'background 0.15s',
                }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FDF8EE', border: `1.5px solid #EDD4B2`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: typeColor[n.type] || '#8B6914' }}>
                    {typeIcon[n.type] || <Bell size={13} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ fontWeight: n.is_read ? 500 : 700, fontSize: 13, color: '#2C1810', lineHeight: 1.3 }}>{n.title}</span>
                      {!n.is_read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#C8A96E', flexShrink: 0, marginTop: 4 }} />}
                    </div>
                    <p style={{ fontSize: 12, color: '#9E7E5A', margin: '4px 0 0', lineHeight: 1.5 }}>{n.message}</p>
                    <p style={{ fontSize: 11, color: '#B8934A', marginTop: 6 }}>{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
