'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'

interface AuthCardProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  showLogo?: boolean
}

export function AuthCard({ children, title, subtitle, showLogo = true }: AuthCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Background bubbles
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const colors = ['rgba(251,113,133,0.15)', 'rgba(236,72,153,0.12)', 'rgba(244,63,94,0.1)', 'rgba(249,168,212,0.18)']
    const bubbles: HTMLDivElement[] = []

    for (let i = 0; i < 8; i++) {
      const bubble = document.createElement('div')
      const size = 20 + Math.random() * 50
      bubble.style.cssText = `
        position:fixed;
        width:${size}px;height:${size}px;
        left:${Math.random() * 100}%;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        border-radius:50%;
        animation:bubble-rise ${8 + Math.random() * 10}s linear infinite;
        animation-delay:${Math.random() * 8}s;
        pointer-events:none;
        z-index:0;
      `
      document.body.appendChild(bubble)
      bubbles.push(bubble)
    }
    return () => bubbles.forEach(b => b.remove())
  }, [])

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fff1f2 50%, #fce7f3 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="fixed top-0 right-0 w-72 h-72 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #fb7185, transparent)', transform: 'translate(30%,-30%)' }} />
      <div className="fixed bottom-0 left-0 w-96 h-96 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ec4899, transparent)', transform: 'translate(-30%,30%)' }} />
      <div className="fixed top-1/2 left-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #f9a8d4, transparent)', transform: 'translate(-40%,-50%)' }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        {showLogo && (
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex flex-col items-center group">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300"
                style={{ background: 'linear-gradient(135deg, #fb7185, #ec4899, #f43f5e)' }}
              >
                🧶
              </div>
              <span
                className="font-bold text-lg tracking-tight"
                style={{ background: 'linear-gradient(135deg,#f43f5e,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                Crochet Masterpiece
              </span>
            </Link>
          </div>
        )}

        <div
          className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-[0_8px_40px_rgba(244,63,94,0.15)]"
          style={{ border: '1px solid rgba(254,205,211,0.6)' }}
        >
          <h1 className="text-2xl font-bold text-[#3d1520] mb-1">{title}</h1>
          {subtitle && <p className="text-rose-400 text-sm mb-6">{subtitle}</p>}
          {!subtitle && <div className="mb-6" />}
          {children}
        </div>
      </div>
    </div>
  )
}
