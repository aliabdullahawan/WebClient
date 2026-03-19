'use client'
import React from 'react'

interface LumaSpinnerProps { size?: number; color?: string; className?: string }

export function LumaSpinner({ size = 52, color = '#A07850', className = '' }: LumaSpinnerProps) {
  const s: React.CSSProperties = { position:'relative', width:size, height:size, flexShrink:0 }
  const b: React.CSSProperties = { position:'absolute', inset:0, borderRadius:12, boxShadow:`inset 0 0 0 3px ${color}` }
  return (
    <div style={s} className={className}>
      <span style={b} className="animate-loader" />
      <span style={b} className="animate-loader-delay" />
    </div>
  )
}

export function CrochetLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M30 8C20 8 12 16 12 26C12 33 16 39 22 42L22 50C22 52.2 23.8 54 26 54L34 54C36.2 54 38 52.2 38 50L38 42C44 39 48 33 48 26C48 16 40 8 30 8Z" fill="url(#lg1)" opacity="0.15"/>
      <path d="M30 14C23 14 17 20 17 27C17 31.5 19.5 35.5 23.5 37.5" stroke="url(#lg1)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M30 14C37 14 43 20 43 27C43 31.5 40.5 35.5 36.5 37.5" stroke="url(#lg1)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <circle cx="30" cy="28" r="5" fill="url(#lg1)"/>
      <path d="M30 33L30 50M26 47C26 47 28 51 30 50C32 49 34 47 34 47" stroke="#8B6040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 18C24 18 27 14 30 14C33 14 36 18 36 18" stroke="url(#lg1)" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <defs>
        <linearGradient id="lg1" x1="12" y1="8" x2="48" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C4956A"/>
          <stop offset="50%" stopColor="#A07850"/>
          <stop offset="100%" stopColor="#6B4A30"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5" style={{background:'linear-gradient(160deg,#FAF7F2 0%,#F5EFE6 50%,#EDE0CE 100%)'}}>
      <CrochetLogo size={52} />
      <LumaSpinner size={48} color="#A07850" />
      <div className="text-center space-y-1">
        <p className="font-bold text-[#2C1810] text-base tracking-wide">Crochet Masterpiece</p>
        <p className="text-[#A07850] text-sm">{message}</p>
      </div>
      <div className="flex gap-1.5">
        {[0,1,2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#C4956A] animate-float" style={{animationDelay:`${i*0.2}s`,animationDuration:'1.2s'}} />
        ))}
      </div>
    </div>
  )
}

export function AdminLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
      <LumaSpinner size={48} color="#A07850" />
      <p className="text-[#8B6040] text-sm font-medium">{message}</p>
    </div>
  )
}

export function InlineSpinner({ size = 18, color = '#A07850' }: { size?: number; color?: string }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke={color} strokeWidth="4"/>
      <path className="opacity-75" fill={color} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  )
}
