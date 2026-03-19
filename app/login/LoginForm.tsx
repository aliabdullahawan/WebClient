'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { AuthCard } from '@/components/auth/AuthCard'
import { FloatingInput } from '@/components/ui/FloatingInput'
import { BubbleButton } from '@/components/ui/BubbleButton'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const isAdmin = searchParams.get('admin') === '1'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const e: typeof errors = {}
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email address'
    if (!password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setErrors({})

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, isAdmin }),
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push(isAdmin ? '/admin' : redirect)
          router.refresh()
        }, 800)
      } else {
        setErrors({ general: data.error || 'Login failed. Please try again.' })
      }
    } catch {
      setErrors({ general: 'Network error. Please check your connection.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title={isAdmin ? 'Admin Sign In' : 'Welcome Back'}
      subtitle={isAdmin ? 'Access your admin dashboard' : 'Sign in to your account'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {errors.general && (
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 14px' }}>
            <AlertCircle size={16} style={{ color: '#DC2626', flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 13, color: '#991B1B', lineHeight: 1.5 }}>{errors.general}</span>
          </div>
        )}
        {success && (
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '12px 14px' }}>
            <CheckCircle size={16} style={{ color: '#16A34A' }} />
            <span style={{ fontSize: 13, color: '#166534' }}>Login successful — redirecting...</span>
          </div>
        )}

        <FloatingInput label="Email address" type="email" value={email}
          onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })) }}
          error={errors.email} icon={<Mail size={16} />} autoComplete="email" />

        <FloatingInput label="Password" type="password" value={password}
          onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })) }}
          error={errors.password} icon={<Lock size={16} />} autoComplete="current-password" />

        <div style={{ textAlign: 'right', marginTop: -8 }}>
          <Link href={isAdmin ? '/forgot-password?admin=1' : '/forgot-password'}
            style={{ fontSize: 13, color: '#8B6914', fontWeight: 500, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#5C3D11'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#8B6914'}>
            Forgot password?
          </Link>
        </div>

        <BubbleButton type="submit" variant="primary" size="lg" fullWidth loading={loading} disabled={success}>
          {isAdmin ? 'Sign In to Dashboard' : 'Sign In'}
        </BubbleButton>

        {!isAdmin && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#EDD4B2' }} />
              <span style={{ fontSize: 12, color: '#B8934A', fontWeight: 500 }}>or</span>
              <div style={{ flex: 1, height: 1, background: '#EDD4B2' }} />
            </div>
            <BubbleButton type="button" variant="secondary" size="md" fullWidth onClick={() => router.push('/')}>
              Continue as Guest
            </BubbleButton>
            <p style={{ textAlign: 'center', fontSize: 13, color: '#9E7E5A', margin: 0 }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" style={{ color: '#5C3D11', fontWeight: 700, textDecoration: 'none' }}>
                Create one
              </Link>
            </p>
          </>
        )}
      </form>
    </AuthCard>
  )
}
