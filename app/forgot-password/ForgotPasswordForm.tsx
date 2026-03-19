'use client'
import { useState, useRef, KeyboardEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, ArrowLeft } from 'lucide-react'
import { AuthCard } from '@/components/auth/AuthCard'
import { FloatingInput } from '@/components/ui/FloatingInput'
import { BubbleButton } from '@/components/ui/BubbleButton'

type Step = 'email' | 'otp' | 'password' | 'done'

export default function ForgotPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAdmin = searchParams.get('admin') === '1'

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(timer); return 0 } return c - 1 })
    }, 1000)
  }

  const sendOTP = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address'); return
    }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'reset', isAdmin }),
      })
      const data = await res.json()
      if (data.success) { setStep('otp'); startCountdown() }
      else setError(data.error || 'Failed to send OTP')
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  const verifyOTP = async () => {
    const code = otp.join('')
    if (code.length !== 6) { setError('Please enter the complete 6-digit code'); return }
    setStep('password')
  }

  const resetPassword = async () => {
    if (!newPassword) { setError('Password is required'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join(''), new_password: newPassword, confirm_password: confirmPassword, isAdmin }),
      })
      const data = await res.json()
      if (data.success) setStep('done')
      else setError(data.error || 'Failed to reset password')
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]; newOtp[index] = value.slice(-1); setOtp(newOtp)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus()
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) { setOtp(pasted.split('')); otpRefs.current[5]?.focus() }
  }

  const titles: Record<Step, string> = {
    email: '🔑 Forgot Password?',
    otp: '📱 Check Your Email',
    password: '🔒 Set New Password',
    done: '✅ Password Reset!',
  }
  const subtitles: Record<Step, string> = {
    email: "No worries! Enter your email and we'll send you a reset code",
    otp: `We sent a 6-digit code to ${email}`,
    password: 'Choose a strong new password',
    done: 'Your password has been reset successfully',
  }

  return (
    <AuthCard title={titles[step]} subtitle={subtitles[step]}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-600 text-sm flex items-center gap-2 mb-4 animate-fade-in">
          <span>⚠️</span> {error}
        </div>
      )}

      {step === 'email' && (
        <div className="space-y-4">
          <FloatingInput label="Email address" type="email" value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            icon={<Mail size={18} />} autoComplete="email" />
          <BubbleButton variant="primary" size="lg" fullWidth loading={loading} onClick={sendOTP}>
            📨 Send Reset Code
          </BubbleButton>
          <Link href={isAdmin ? '/login?admin=1' : '/login'}
            className="flex items-center justify-center gap-2 text-sm text-rose-400 hover:text-rose-600 transition-colors mt-2">
            <ArrowLeft size={14} /> Back to login
          </Link>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-5">
          <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input key={i} ref={el => { otpRefs.current[i] = el }} type="text" inputMode="numeric"
                maxLength={1} value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-2xl border-2 outline-none transition-all duration-200 bg-rose-50
                  ${digit ? 'border-rose-400 bg-white text-rose-600 shadow-[0_0_0_3px_rgba(251,113,133,0.15)]' : 'border-rose-200 text-[#3d1520]'}
                  focus:border-rose-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(251,113,133,0.15)]`}
              />
            ))}
          </div>
          <BubbleButton variant="primary" size="lg" fullWidth loading={loading} onClick={verifyOTP}>
            ✨ Verify Code
          </BubbleButton>
          <div className="text-center text-sm text-rose-400">
            {countdown > 0 ? (
              <span>Resend in <strong className="text-rose-500">{countdown}s</strong></span>
            ) : (
              <button onClick={() => { sendOTP(); setOtp(['','','','','','']) }}
                className="text-rose-500 font-semibold hover:text-rose-700 transition-colors">
                Resend code
              </button>
            )}
          </div>
          <button onClick={() => setStep('email')}
            className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-600 transition-colors mx-auto">
            <ArrowLeft size={14} /> Change email
          </button>
        </div>
      )}

      {step === 'password' && (
        <div className="space-y-4">
          <FloatingInput label="New password" type="password" value={newPassword}
            onChange={e => { setNewPassword(e.target.value); setError('') }}
            icon={<Lock size={18} />} autoComplete="new-password" />
          <FloatingInput label="Confirm new password" type="password" value={confirmPassword}
            onChange={e => { setConfirmPassword(e.target.value); setError('') }}
            icon={<Lock size={18} />} autoComplete="new-password" />
          <div className="bg-rose-50 rounded-2xl p-3 text-xs space-y-1">
            {[
              { ok: newPassword.length >= 8, label: 'At least 8 characters' },
              { ok: /[A-Z]/.test(newPassword), label: 'One uppercase letter' },
              { ok: /[a-z]/.test(newPassword), label: 'One lowercase letter' },
              { ok: /\d/.test(newPassword), label: 'One number' },
            ].map(({ ok, label }) => (
              <div key={label} className={`flex items-center gap-2 transition-colors ${ok ? 'text-green-500' : 'text-rose-400'}`}>
                <span>{ok ? '✅' : '○'}</span> {label}
              </div>
            ))}
          </div>
          <BubbleButton variant="primary" size="lg" fullWidth loading={loading} onClick={resetPassword}>
            🔐 Reset Password
          </BubbleButton>
        </div>
      )}

      {step === 'done' && (
        <div className="text-center space-y-5 py-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto text-4xl bg-green-50 border-2 border-green-200 animate-scale-in">
            🎉
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#3d1520] mb-1">All done!</h3>
            <p className="text-rose-400 text-sm">You can now sign in with your new password</p>
          </div>
          <BubbleButton variant="primary" size="lg" fullWidth onClick={() => router.push(isAdmin ? '/login?admin=1' : '/login')}>
            🌸 Back to Login
          </BubbleButton>
        </div>
      )}
    </AuthCard>
  )
}
