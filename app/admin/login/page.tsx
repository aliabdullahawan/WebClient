import { Suspense } from 'react'
import LoginForm from '@/app/login/LoginForm'
import { LumaSpin } from '@/components/ui/LumaSpin'

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(160deg,#FEFCF7,#F9EDD8)' }}>
        <LumaSpin size={48} color="#8B6914" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
