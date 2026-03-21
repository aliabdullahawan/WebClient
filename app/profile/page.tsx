'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Phone, MapPin, Lock, Package, LogOut, Eye, EyeOff, CheckCircle, AlertCircle, Star, Calendar } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/hooks/useAuth'

interface Order { id: string; order_number: string; status: string; total_amount: number; created_at: string; order_items: any[] }

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: '#92400E', bg: '#FEF3C7' },
  confirmed: { label: 'Confirmed', color: '#1E40AF', bg: '#DBEAFE' },
  shipped:   { label: 'Shipped',   color: '#5B21B6', bg: '#EDE9FE' },
  delivered: { label: 'Delivered', color: '#065F46', bg: '#D1FAE5' },
  cancelled: { label: 'Cancelled', color: '#991B1B', bg: '#FEE2E2' },
}

export default function ProfilePage() {
  const { user, logout, refresh } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [tab, setTab] = useState<'profile' | 'orders' | 'security'>('profile')
  const [form, setForm] = useState({ full_name: '', phone: '', address: '' })
  const [pwForm, setPwForm] = useState({ new_password: '', confirm_password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login?redirect=/profile'); return }
    if (user.role !== 'user') { router.push('/admin'); return }
    setDataLoading(true)
    Promise.all([
      fetch('/api/user/profile').then(r => r.json()),
      fetch('/api/user/orders').then(r => r.json()),
    ]).then(([p, o]) => {
      setProfile(p.user)
      setOrders(o.orders || [])
      setForm({ full_name: p.user?.full_name || '', phone: p.user?.phone || '', address: p.user?.address || '' })
      setDataLoading(false)
    }).catch(() => setDataLoading(false))
  }, [user, router])

  const saveProfile = async () => {
    setLoading(true); setMsg(null)
    const res = await fetch('/api/user/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    if (data.success) { setMsg({ type: 'success', text: 'Profile saved!' }); await refresh() }
    else setMsg({ type: 'error', text: data.error || 'Failed to save' })
    setLoading(false)
  }

  const changePassword = async () => {
    if (pwForm.new_password !== pwForm.confirm_password) { setMsg({ type: 'error', text: 'Passwords do not match' }); return }
    if (pwForm.new_password.length < 8) { setMsg({ type: 'error', text: 'Password must be at least 8 characters' }); return }
    setLoading(true); setMsg(null)
    const res = await fetch('/api/user/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ new_password: pwForm.new_password }) })
    const data = await res.json()
    if (data.success) { setMsg({ type: 'success', text: 'Password updated!' }); setPwForm({ new_password: '', confirm_password: '' }) }
    else setMsg({ type: 'error', text: data.error || 'Failed to update password' })
    setLoading(false)
  }

  if (!user || dataLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FEFCF7' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #EDD4B2', borderTopColor: '#C8A96E', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
    { id: 'security', label: 'Security', icon: Lock },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#FEFCF7' }}>
      <Navbar />
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '100px 20px 60px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#C8A96E,#5C3D11)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 800 }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#2C1810', margin: 0 }}>{user.name}</h1>
              <p style={{ fontSize: 12, color: '#9E7E5A', margin: '2px 0 0' }}>
                Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
              </p>
            </div>
          </div>
          <button onClick={() => logout()} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 999, border: '1.5px solid #E2C090', background: 'white', color: '#8B6914', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 14, padding: 4, border: '1px solid #EDD4B2', marginBottom: 20 }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setTab(id as any); setMsg(null) }}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 8px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                background: tab === id ? '#F5E6D3' : 'transparent',
                color: tab === id ? '#5C3D11' : '#9E7E5A',
              }}>
              <Icon size={14} /> <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {msg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, marginBottom: 16, background: msg.type === 'success' ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${msg.type === 'success' ? '#BBF7D0' : '#FECACA'}`, color: msg.type === 'success' ? '#166534' : '#991B1B', fontSize: 13 }}>
            {msg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {msg.text}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EDD4B2', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#8B6914', marginBottom: 6 }}><User size={12} /> Full Name</label>
              <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="input-field" placeholder="Your full name" />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#8B6914', marginBottom: 6 }}><Mail size={12} /> Email</label>
              <input value={profile?.email || ''} disabled className="input-field" style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              <p style={{ fontSize: 11, color: '#B8934A', marginTop: 4 }}>Email cannot be changed</p>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#8B6914', marginBottom: 6 }}><Phone size={12} /> Phone Number</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="+92 3XX XXXXXXX" />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#8B6914', marginBottom: 6 }}><MapPin size={12} /> Delivery Address</label>
              <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="input-field" rows={3} placeholder="Your full delivery address" style={{ resize: 'vertical' }} />
            </div>
            <button onClick={saveProfile} disabled={loading} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: 16, border: '1px solid #EDD4B2' }}>
                <Package size={32} style={{ color: '#E2C090', marginBottom: 12 }} />
                <p style={{ fontWeight: 700, color: '#5C3D11', fontSize: 15 }}>No orders yet</p>
                <p style={{ fontSize: 13, color: '#9E7E5A', marginTop: 4 }}>Your orders will appear here</p>
                <Link href="/shop" className="btn-primary" style={{ display: 'inline-flex', marginTop: 16, padding: '10px 28px', fontSize: 13, textDecoration: 'none' }}>Start Shopping</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {orders.map(order => {
                  const cfg = statusConfig[order.status] || statusConfig.pending
                  return (
                    <div key={order.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #EDD4B2', padding: '18px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 13, color: '#2C1810' }}>{order.order_number}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                            <Calendar size={11} style={{ color: '#B8934A' }} />
                            <span style={{ fontSize: 11, color: '#9E7E5A' }}>{new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 16, fontWeight: 900, color: '#2C1810' }}>₨{Number(order.total_amount).toLocaleString()}</span>
                          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                        </div>
                      </div>
                      {order.order_items?.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {order.order_items.slice(0, 3).map((item: any, i: number) => (
                            <span key={i} style={{ fontSize: 11, color: '#8B6914', background: '#FDF8EE', border: '1px solid #EDD4B2', padding: '2px 8px', borderRadius: 8 }}>
                              {item.product_name} x{item.quantity}
                            </span>
                          ))}
                          {order.order_items.length > 3 && <span style={{ fontSize: 11, color: '#B8934A' }}>+{order.order_items.length - 3} more</span>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Security Tab */}
        {tab === 'security' && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EDD4B2', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 13, color: '#9E7E5A', margin: 0 }}>Change your account password below.</p>
            {(['new_password', 'confirm_password'] as const).map((key) => (
              <div key={key} style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8B6914', marginBottom: 6 }}>
                  {key === 'new_password' ? 'New Password' : 'Confirm New Password'}
                </label>
                <input type={showPw ? 'text' : 'password'} value={pwForm[key]}
                  onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                  className="input-field" placeholder={key === 'new_password' ? 'Enter new password' : 'Confirm password'}
                  style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, bottom: 13, background: 'none', border: 'none', cursor: 'pointer', color: '#B8934A' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            ))}
            <button onClick={changePassword} disabled={loading} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 32px' }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}
