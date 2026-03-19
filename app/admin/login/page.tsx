import { Suspense } from 'react'
import LoginForm from '@/app/login/LoginForm'

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{background:'linear-gradient(135deg,#fdf2f8,#fff1f2)'}}><div className="text-5xl animate-bounce">🧶</div></div>}>
      <LoginForm />
    </Suspense>
  )
}
