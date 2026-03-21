'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Phone, MapPin, Sparkles } from 'lucide-react'
import { AuthCard } from '@/components/auth/AuthCard'
import { FloatingInput } from '@/components/ui/FloatingInput'
import { BubbleButton } from '@/components/ui/BubbleButton'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirm_password: '', phone: '', address: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    setErrors(p => { const n = { ...p }; delete n[field]; delete n.general; return n })
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    else {
      if (form.password.length < 8) e.password = 'At least 8 characters'
      else if (!/[A-Z]/.test(form.password)) e.password = 'Needs an uppercase letter'
      else if (!/[a-z]/.test(form.password)) e.password = 'Needs a lowercase letter'
      else if (!/\d/.test(form.password)) e.password = 'Needs a number'
    }
    if (!form.confirm_password) e.confirm_password = 'Please confirm your password'
    else if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setTimeout(() => { router.push('/'); router.refresh() }, 1000)
      } else {
        setErrors({ general: data.error })
      }
    } catch {
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const pwStrength = (() => {
    let s = 0
    if (form.password.length >= 8) s++
    if (/[A-Z]/.test(form.password)) s++
    if (/[a-z]/.test(form.password)) s++
    if (/\d/.test(form.password)) s++
    if (/[^A-Za-z0-9]/.test(form.password)) s++
    return s
  })()

  return (
    <AuthCard
      title=" Create Account"
      subtitle="Join Crochet Masterpiece today!"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-600 text-sm flex items-center gap-2 animate-fade-in">
            <span></span> {errors.general}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-green-600 text-sm flex items-center gap-2 animate-fade-in">
            <span></span> Account created! Redirecting...
          </div>
        )}

        <FloatingInput label="Full name" type="text" value={form.full_name}
          onChange={update('full_name')} error={errors.full_name} icon={<User size={18} />} autoComplete="name" />

        <FloatingInput label="Email address" type="email" value={form.email}
          onChange={update('email')} error={errors.email} icon={<Mail size={18} />} autoComplete="email" />

        <div className="space-y-1">
          <FloatingInput label="Password" type="password" value={form.password}
            onChange={update('password')} error={errors.password} icon={<Lock size={18} />} autoComplete="new-password" />
          {/* Strength bar */}
          {form.password && (
            <div className="flex gap-1 px-1 pt-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i <= pwStrength
                    ? pwStrength <= 2 ? 'bg-red-400'
                    : pwStrength <= 3 ? 'bg-yellow-400'
                    : 'bg-green-400'
                    : 'bg-rose-100'
                }`} />
              ))}
              <span className={`text-xs ml-1 ${pwStrength <= 2 ? 'text-red-400' : pwStrength <= 3 ? 'text-yellow-500' : 'text-green-500'}`}>
                {pwStrength <= 2 ? 'Weak' : pwStrength <= 3 ? 'Fair' : pwStrength === 4 ? 'Good' : 'Strong'}
              </span>
            </div>
          )}
        </div>

        <FloatingInput label="Confirm password" type="password" value={form.confirm_password}
          onChange={update('confirm_password')} error={errors.confirm_password} icon={<Lock size={18} />} autoComplete="new-password" />

        <FloatingInput label="Phone number (optional)" type="tel" value={form.phone}
          onChange={update('phone')} icon={<Phone size={18} />} autoComplete="tel" />

        {/* Address textarea styled to match */}
        <div className="relative group">
          <div className={`relative bg-rose-50 rounded-2xl border-[1.5px] border-rose-200 hover:border-rose-300 transition-all duration-200 focus-within:border-rose-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(251,113,133,0.12)] overflow-hidden`}>
            <div className="pl-4 pt-4 flex">
              <MapPin size={18} className="text-rose-400 mt-1 shrink-0" />
            </div>
            <div className="relative -mt-6 pl-8">
              <textarea
                value={form.address}
                onChange={update('address')}
                placeholder=" "
                rows={2}
                className="peer w-full px-3 pt-6 pb-2 bg-transparent text-[#3d1520] text-[15px] outline-none resize-none placeholder-transparent"
              />
              <label className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-300 text-[15px] transition-all duration-200 pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-[15px] peer-focus:top-3 peer-focus:text-xs peer-focus:text-rose-500 peer-[&:not(:placeholder-shown)]:top-3 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-rose-400">
                Delivery address (optional)
              </label>
            </div>
          </div>
        </div>

        <BubbleButton type="submit" variant="primary" size="lg" fullWidth loading={loading} disabled={success}>
          <Sparkles size={18} />
          Create My Account
        </BubbleButton>

        <p className="text-center text-sm text-rose-400">
          Already have an account?{''}
          <Link href="/login" className="text-rose-500 font-semibold hover:text-rose-700 transition-colors underline underline-offset-2">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-rose-300 mt-1">
          By signing up, you agree to our{''}
          <span className="text-rose-400 cursor-pointer hover:text-rose-600">Terms</span> &amp;{''}
          <span className="text-rose-400 cursor-pointer hover:text-rose-600">Privacy Policy</span>
        </p>
      </form>
    </AuthCard>
  )
}
