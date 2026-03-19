'use client'
import { useState, useEffect } from 'react'
import { X, Bell, Package, MessageCircle, Tag, CheckCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { Notification } from '@/types'

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
  onCountChange?: (count: number) => void
}

const typeIcons: Record<string, React.ReactNode> = {
  order_update: <Package size={16} />,
  admin_message: <MessageCircle size={16} />,
  review_reply: <MessageCircle size={16} />,
  discount: <Tag size={16} />,
  system: <Bell size={16} />,
}

const typeColors: Record<string, string> = {
  order_update: 'bg-blue-100 text-blue-500',
  admin_message: 'bg-rose-100 text-rose-500',
  review_reply: 'bg-pink-100 text-pink-500',
  discount: 'bg-amber-100 text-amber-500',
  system: 'bg-purple-100 text-purple-500',
}

export function NotificationPanel({ open, onClose, onCountChange }: NotificationPanelProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !user || user.role !== 'user') return
    setLoading(true)
    fetch('/api/notifications')
      .then(r => r.json())
      .then(d => {
        setNotifications(d.notifications || [])
        onCountChange?.(d.unread || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, user])

  const markAllRead = async () => {
    await fetch('/api/notifications/mark-read', { method: 'POST' })
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    onCountChange?.(0)
  }

  const markOne = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    const unread = notifications.filter(n => !n.is_read && n.id !== id).length
    onCountChange?.(unread)
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-[−8px_0_40px_rgba(244,63,94,0.15)] flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white">
              <Bell size={18} />
            </div>
            <div>
              <h2 className="font-bold text-[#3d1520] text-base">Notifications</h2>
              <p className="text-xs text-rose-400">{notifications.filter(n => !n.is_read).length} unread</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.is_read) && (
              <button onClick={markAllRead} className="text-xs text-rose-400 hover:text-rose-600 flex items-center gap-1 transition-colors">
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-rose-100 rounded-full transition-colors text-rose-400">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!user ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <div className="text-5xl">🔔</div>
              <p className="text-rose-400 text-sm">Sign in to see your notifications</p>
            </div>
          ) : loading ? (
            <div className="space-y-3 p-4">
              {[1,2,3].map(i => (
                <div key={i} className="skeleton h-20 rounded-2xl" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <div className="text-5xl animate-float">🌸</div>
              <h3 className="font-semibold text-[#3d1520]">All caught up!</h3>
              <p className="text-rose-400 text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-rose-50">
              {notifications.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => markOne(notif.id)}
                  className={`w-full text-left px-5 py-4 hover:bg-rose-50/50 transition-colors duration-200 flex gap-3 ${!notif.is_read ? 'bg-rose-50/30' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${typeColors[notif.type] || typeColors.system}`}>
                    {typeIcons[notif.type] || typeIcons.system}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium text-[#3d1520] leading-snug ${!notif.is_read ? 'font-semibold' : ''}`}>
                        {notif.title}
                      </p>
                      {!notif.is_read && <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-rose-400 mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[11px] text-rose-300 mt-1">{timeAgo(notif.created_at)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
