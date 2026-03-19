'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Sparkles } from 'lucide-react'
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
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Password too short'
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
        body: JSON.stringify({ email, password, isAdmin }),
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push(isAdmin ? '/admin' : redirect)
          router.refresh()
        }, 800)
      } else {
        setErrors({ general: data.error })
      }
    } catch {
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title={isAdmin ? '👑 Admin Login' : '🌸 Welcome Back!'}
      subtitle={isAdmin ? 'Sign in to your admin dashboard' : 'Sign in to your account to continue'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-600 text-sm flex items-center gap-2 animate-fade-in">
            <span>⚠️</span> {errors.general}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-green-600 text-sm flex items-center gap-2 animate-fade-in">
            <span>✅</span> Login successful! Redirecting...
          </div>
        )}

        <FloatingInput label="Email address" type="email" value={email}
          onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })) }}
          error={errors.email} icon={<Mail size={18} />} autoComplete="email" />

        <FloatingInput label="Password" type="password" value={password}
          onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })) }}
          error={errors.password} icon={<Lock size={18} />} autoComplete="current-password" />

        <div className="text-right">
          <Link href={isAdmin ? '/forgot-password?admin=1' : '/forgot-password'}
            className="text-sm text-rose-400 hover:text-rose-600 transition-colors font-medium">
            Forgot password?
          </Link>
        </div>

        <BubbleButton type="submit" variant="primary" size="lg" fullWidth loading={loading} disabled={success}>
          <Sparkles size={18} />
          {isAdmin ? 'Sign In to Dashboard' : 'Sign In'}
        </BubbleButton>

        {!isAdmin && (
          <>
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-rose-100" />
              <span className="text-rose-300 text-xs font-medium">or continue as</span>
              <div className="flex-1 h-px bg-rose-100" />
            </div>
            <BubbleButton type="button" variant="secondary" size="md" fullWidth onClick={() => router.push('/')}>
              👀 Browse as Guest
            </BubbleButton>
            <p className="text-center text-sm text-rose-400 mt-2">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-rose-500 font-semibold hover:text-rose-700 transition-colors underline underline-offset-2">
                Sign up for free
              </Link>
            </p>
          </>
        )}
      </form>
    </AuthCard>
  )
}
