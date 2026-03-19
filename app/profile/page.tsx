'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, MapPin, Lock, Shield, Package, LogOut, ChevronRight, Star } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { FloatingInput } from '@/components/ui/FloatingInput'
import { BubbleButton } from '@/components/ui/BubbleButton'
import { useAuth } from '@/hooks/useAuth'

interface UserProfile { id: string; full_name: string; email: string; phone?: string; address?: string; avatar_id?: string; created_at: string }
interface Order { id: string; order_number: string; status: string; order_type: string; total_amount: number; created_at: string; order_items: any[] }
interface Avatar { id: string; name: string }

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-600',
  confirmed: 'bg-blue-100 text-blue-600',
  shipped: 'bg-purple-100 text-purple-600',
  delivered: 'bg-green-100 text-green-600',
  cancelled: 'bg-red-100 text-red-600',
}
const statusEmoji: Record<string, string> = { pending: '⏳', confirmed: '✅', shipped: '📦', delivered: '🎉', cancelled: '❌' }

export default function ProfilePage() {
  const { user, logout, refresh } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'security'>('profile')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', address: '', avatar_id: '' })
  const [pwForm, setPwForm] = useState({ new_password: '', confirm_password: '' })
  const [otpStep, setOtpStep] = useState<'idle' | 'sending' | 'verifying'>('idle')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!user) { router.push('/login?redirect=/profile'); return }
    Promise.all([
      fetch('/api/user/profile').then(r => r.json()),
      fetch('/api/user/orders').then(r => r.json()),
      fetch('/api/avatars').then(r => r.json()),
    ]).then(([p, o, a]) => {
      setProfile(p.user)
      setOrders(o.orders || [])
      setAvatars(a.avatars || [])
      setForm({ full_name: p.user?.full_name || '', phone: p.user?.phone || '', address: p.user?.address || '', avatar_id: p.user?.avatar_id || '' })
    })
  }, [user])

  const sendOTP = async (forPassword = false) => {
    setOtpStep('sending'); setError('')
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: profile?.email, purpose: forPassword ? 'reset' : 'profile_update' }),
    })
    const d = await res.json()
    if (d.success) { setOtpSent(true); setOtpStep('verifying') }
    else { setError(d.error || 'Failed to send code'); setOtpStep('idle') }
  }

  const handleOtpChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return
    const n = [...otp]; n[i] = v.slice(-1); setOtp(n)
    if (v && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const saveProfile = async () => {
    setLoading(true); setError(''); setSuccess('')
    const res = await fetch('/api/user/profile', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, otp: otp.join('') }),
    })
    const d = await res.json()
    if (d.success) {
      setSuccess('Profile updated successfully! 🌸'); setEditing(false); setOtpSent(false); setOtp(['','','','','','']); setOtpStep('idle')
      await refresh()
      const p = await fetch('/api/user/profile').then(r => r.json())
      setProfile(p.user)
    } else { setError(d.error) }
    setLoading(false)
  }

  const savePassword = async () => {
    if (pwForm.new_password !== pwForm.confirm_password) { setError('Passwords do not match'); return }
    setLoading(true); setError(''); setSuccess('')
    const res = await fetch('/api/user/profile', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_password: pwForm.new_password, otp: otp.join('') }),
    })
    const d = await res.json()
    if (d.success) { setSuccess('Password changed! 🔒'); setPwForm({ new_password: '', confirm_password: '' }); setOtpSent(false); setOtp(['','','','','','']); setOtpStep('idle') }
    else setError(d.error)
    setLoading(false)
  }

  const stats = {
    total: orders.length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    pending: orders.filter(o => o.status === 'pending').length,
    spent: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total_amount, 0),
  }

  if (!user) return null

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'linear-gradient(160deg,#fdf2f8,#fff8fb)' }}>
      <Navbar />
      <main className="flex-1 pt-20 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">

          {/* Profile header card */}
          <div className="rounded-3xl overflow-hidden shadow-lg mb-6" style={{ border: '1px solid rgba(254,205,211,0.5)' }}>
            <div className="h-24 sm:h-32 bg-gradient-to-br from-rose-400 via-pink-500 to-rose-500 relative">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="absolute text-white text-xl opacity-20 animate-float select-none"
                  style={{ left: `${10 + i * 22}%`, top: '50%', transform: 'translateY(-50%)', animationDelay: `${i * 0.4}s` }}>🌸</span>
              ))}
            </div>
            <div className="bg-white px-5 sm:px-8 pb-5 sm:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10 sm:-mt-12">
                <div className="flex items-end gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center text-white text-3xl font-bold">
                      {profile?.avatar_id
                        ? <img src={`/api/avatars/${profile.avatar_id}`} alt="avatar" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        : <span>{profile?.full_name?.charAt(0).toUpperCase() || '✨'}</span>
                      }
                    </div>
                  </div>
                  <div className="pb-1">
                    <h1 className="text-xl sm:text-2xl font-black text-[#3d1520]">{profile?.full_name}</h1>
                    <p className="text-rose-400 text-sm">{profile?.email}</p>
                    <p className="text-rose-300 text-xs mt-0.5">Member since {new Date(profile?.created_at || '').toLocaleDateString('en', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <BubbleButton variant="danger" size="sm" onClick={logout} className="self-start sm:self-auto">
                  <LogOut size={14} /> Sign Out
                </BubbleButton>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-rose-50">
                {[
                  { label: 'Orders', value: stats.total, icon: '📦' },
                  { label: 'Delivered', value: stats.delivered, icon: '🎉' },
                  { label: 'Pending', value: stats.pending, icon: '⏳' },
                  { label: 'Spent', value: `₨${stats.spent >= 1000 ? (stats.spent / 1000).toFixed(1) + 'K' : stats.spent}`, icon: '💳' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="text-lg sm:text-2xl font-black text-[#3d1520]">{s.value}</div>
                    <div className="text-rose-300 text-[10px] sm:text-xs">{s.icon} {s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-rose-100 mb-6">
            {([['profile', User, 'My Profile'], ['orders', Package, 'Orders'], ['security', Shield, 'Security']] as const).map(([tab, Icon, label]) => (
              <button key={tab} onClick={() => { setActiveTab(tab); setError(''); setSuccess('') }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-sm' : 'text-rose-400 hover:bg-rose-50'}`}>
                <Icon size={15} /> <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Messages */}
          {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-600 text-sm flex items-center gap-2 animate-fade-in"><span>⚠️</span>{error}</div>}
          {success && <div className="mb-4 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-green-600 text-sm flex items-center gap-2 animate-fade-in"><span>✅</span>{success}</div>}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-rose-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-[#3d1520] text-lg">Personal Information</h2>
                {!editing && <BubbleButton variant="secondary" size="sm" onClick={() => setEditing(true)}>✏️ Edit</BubbleButton>}
              </div>

              {!editing ? (
                <div className="space-y-4">
                  {[
                    { icon: <User size={16} />, label: 'Full Name', value: profile?.full_name },
                    { icon: <Mail size={16} />, label: 'Email', value: profile?.email },
                    { icon: <Phone size={16} />, label: 'Phone', value: profile?.phone || 'Not set' },
                    { icon: <MapPin size={16} />, label: 'Address', value: profile?.address || 'Not set' },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 p-4 bg-rose-50/50 rounded-2xl">
                      <span className="text-rose-400 mt-0.5">{icon}</span>
                      <div>
                        <p className="text-rose-300 text-xs font-medium">{label}</p>
                        <p className="text-[#3d1520] font-medium text-sm mt-0.5">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Avatar selector */}
                  {avatars.length > 0 && (
                    <div>
                      <p className="text-rose-400 text-xs font-semibold mb-2 uppercase tracking-wide">Choose Avatar</p>
                      <div className="flex flex-wrap gap-2">
                        {avatars.map(a => (
                          <button key={a.id} onClick={() => setForm(f => ({ ...f, avatar_id: a.id }))}
                            className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-200 ${form.avatar_id === a.id ? 'border-rose-400 scale-110 shadow-lg' : 'border-rose-100 hover:border-rose-300'}`}>
                            <img src={`/api/avatars/${a.id}`} alt={a.name} className="w-full h-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).parentElement!.innerHTML = '😊' }} />
                          </button>
                        ))}
                        <button onClick={() => setForm(f => ({ ...f, avatar_id: '' }))}
                          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg transition-all ${!form.avatar_id ? 'border-rose-400 bg-rose-50' : 'border-rose-100 hover:border-rose-200'}`}>
                          ✨
                        </button>
                      </div>
                    </div>
                  )}
                  <FloatingInput label="Full name" type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} icon={<User size={16} />} />
                  <FloatingInput label="Phone number" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} icon={<Phone size={16} />} />
                  <div className="relative bg-rose-50 rounded-2xl border-[1.5px] border-rose-200 focus-within:border-rose-400 focus-within:bg-white transition-all">
                    <MapPin size={16} className="absolute left-4 top-4 text-rose-400" />
                    <textarea rows={3} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Delivery address"
                      className="w-full pl-11 pr-4 pt-3 pb-3 bg-transparent text-[#3d1520] text-[15px] outline-none resize-none placeholder-rose-300" />
                  </div>

                  {/* OTP step */}
                  {!otpSent ? (
                    <div className="flex gap-3 pt-2">
                      <BubbleButton variant="primary" size="md" fullWidth loading={otpStep === 'sending'} onClick={() => sendOTP()}>
                        🔑 Request Verification Code
                      </BubbleButton>
                      <BubbleButton variant="ghost" size="md" onClick={() => { setEditing(false); setOtp(['','','','','','']) }}>
                        Cancel
                      </BubbleButton>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <p className="text-sm text-rose-400 text-center">Enter the 6-digit code sent to <strong>{profile?.email}</strong></p>
                      <div className="flex gap-2 justify-center">
                        {otp.map((d, i) => (
                          <input key={i} ref={el => { otpRefs.current[i] = el }} type="text" inputMode="numeric" maxLength={1} value={d}
                            onChange={e => handleOtpChange(i, e.target.value)}
                            onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) otpRefs.current[i - 1]?.focus() }}
                            className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold rounded-2xl border-2 outline-none transition-all bg-rose-50 ${d ? 'border-rose-400 bg-white text-rose-600' : 'border-rose-200'} focus:border-rose-400 focus:bg-white`} />
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <BubbleButton variant="primary" size="md" fullWidth loading={loading} onClick={saveProfile}>
                          ✅ Confirm & Save
                        </BubbleButton>
                        <BubbleButton variant="ghost" size="md" onClick={() => { setOtpSent(false); setOtp(['','','','','','']) }}>
                          Back
                        </BubbleButton>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 shadow-sm border border-rose-100 text-center">
                  <div className="text-5xl mb-4 animate-float">📦</div>
                  <h3 className="font-bold text-[#3d1520] mb-2">No orders yet</h3>
                  <p className="text-rose-400 text-sm mb-5">Start shopping and your orders will appear here</p>
                  <BubbleButton variant="primary" size="md" onClick={() => router.push('/shop')}>Browse Shop 🌸</BubbleButton>
                </div>
              ) : orders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-rose-100 hover:border-rose-200 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-[#3d1520] text-sm">{order.order_number}</p>
                      <p className="text-rose-300 text-xs mt-0.5">{new Date(order.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[order.status] || 'bg-rose-100 text-rose-600'}`}>
                      {statusEmoji[order.status]} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  {order.order_items?.length > 0 && (
                    <div className="space-y-1 mb-3">
                      {order.order_items.slice(0, 2).map((item: any) => (
                        <p key={item.id} className="text-rose-400 text-xs">• {item.product_name} × {item.quantity}</p>
                      ))}
                      {order.order_items.length > 2 && <p className="text-rose-300 text-xs">+{order.order_items.length - 2} more items</p>}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-rose-50">
                    <span className="font-bold text-rose-500">₨{order.total_amount.toLocaleString()}</span>
                    <span className="text-xs text-rose-300 capitalize">{order.order_type} order</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-rose-100">
              <h2 className="font-bold text-[#3d1520] text-lg mb-6 flex items-center gap-2"><Shield size={18} className="text-rose-400" /> Change Password</h2>
              <div className="space-y-4 max-w-md">
                <FloatingInput label="New password" type="password" value={pwForm.new_password} onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} icon={<Lock size={16} />} />
                <FloatingInput label="Confirm new password" type="password" value={pwForm.confirm_password} onChange={e => setPwForm(f => ({ ...f, confirm_password: e.target.value }))} icon={<Lock size={16} />} />
                {!otpSent ? (
                  <BubbleButton variant="primary" size="md" fullWidth loading={otpStep === 'sending'}
                    disabled={!pwForm.new_password || pwForm.new_password !== pwForm.confirm_password}
                    onClick={() => sendOTP(true)}>
                    🔑 Request Verification Code
                  </BubbleButton>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-rose-400 text-center">Enter the 6-digit code sent to your email</p>
                    <div className="flex gap-2 justify-center">
                      {otp.map((d, i) => (
                        <input key={i} ref={el => { otpRefs.current[i] = el }} type="text" inputMode="numeric" maxLength={1} value={d}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) otpRefs.current[i - 1]?.focus() }}
                          className={`w-10 h-12 text-center text-lg font-bold rounded-2xl border-2 outline-none transition-all bg-rose-50 ${d ? 'border-rose-400 bg-white text-rose-600' : 'border-rose-200'} focus:border-rose-400`} />
                      ))}
                    </div>
                    <BubbleButton variant="primary" size="md" fullWidth loading={loading} onClick={savePassword}>🔐 Change Password</BubbleButton>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
