'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Lock, Eye, EyeOff, Save, LogOut, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function AdminProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', current_password: '', new_password: '', confirm_password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!user) { router.push('/login?admin=1'); return }
    if (user.role !== 'admin') { router.push('/'); return }
    setForm(f => ({ ...f, full_name: user.name || '' }))
  }, [user, router])

  const handleSave = async () => {
    if (form.new_password && form.new_password !== form.confirm_password) {
      setMsg({ type: 'error', text: 'New passwords do not match' }); return
    }
    setLoading(true); setMsg(null)
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          current_password: form.current_password || undefined,
          new_password: form.new_password || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMsg({ type: 'success', text: 'Profile updated!' })
        setForm(f => ({ ...f, current_password: '', new_password: '', confirm_password: '' }))
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to update' })
      }
    } catch { setMsg({ type: 'error', text: 'Network error' }) }
    setLoading(false)
  }

  if (!user) return null
  return (
    <div style={{ padding: '32px 24px', maxWidth: 580, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: '#2C1810', marginBottom: 24 }}>Admin Profile</h1>

      {/* Avatar card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', background: 'white', borderRadius: 16, border: '1px solid #E2C090', marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#C8A96E,#5C3D11)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 22, fontWeight: 800 }}>
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#2C1810' }}>{user.name}</div>
          <div style={{ fontSize: 12, color: '#9E7E5A', marginTop: 2 }}>{user.email}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FDF8EE', border: '1px solid #E2C090', borderRadius: 20, padding: '2px 10px', marginTop: 6 }}>
            <Shield size={10} style={{ color: '#8B6914' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#8B6914', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Administrator</span>
          </div>
        </div>
      </div>

      {msg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, marginBottom: 16, background: msg.type === 'success' ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${msg.type === 'success' ? '#BBF7D0' : '#FECACA'}`, color: msg.type === 'success' ? '#166534' : '#991B1B', fontSize: 13 }}>
          {msg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {msg.text}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2C090', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ paddingBottom: 16, borderBottom: '1px solid #F5E6D3' }}>
          <h3 style={{ fontWeight: 700, fontSize: 13, color: '#5C3D11', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={14} /> Personal Information
          </h3>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8B6914', marginBottom: 6 }}>Full Name</label>
          <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="input-field" placeholder="Your name" />
        </div>

        <div>
          <h3 style={{ fontWeight: 700, fontSize: 13, color: '#5C3D11', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lock size={14} /> Change Password <span style={{ fontSize: 11, fontWeight: 400, color: '#B8934A' }}>(optional)</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            {[
              { key: 'current_password', label: 'Current Password' },
              { key: 'new_password', label: 'New Password' },
              { key: 'confirm_password', label: 'Confirm New Password' },
            ].map(({ key, label }) => (
              <div key={key} style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8B6914', marginBottom: 5 }}>{label}</label>
                <input type={showPw ? 'text' : 'password'} value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="input-field" placeholder={label} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, bottom: 13, background: 'none', border: 'none', cursor: 'pointer', color: '#B8934A' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid #F5E6D3' }}>
          <button onClick={handleSave} disabled={loading}
            className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0' }}>
            <Save size={14} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={() => logout()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 999, border: '1.5px solid #E2C090', background: 'white', color: '#7A5C10', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
