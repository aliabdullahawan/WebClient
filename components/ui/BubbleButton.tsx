'use client'
import { useRef, ButtonHTMLAttributes } from 'react'

interface BubbleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export function BubbleButton({ children, variant = 'primary', size = 'md', loading = false, fullWidth = false, className = '', onClick, disabled, style, ...props }: BubbleButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return
    const btn = btnRef.current
    if (btn) {
      const rect = btn.getBoundingClientRect()
      const ripple = document.createElement('span')
      ripple.style.cssText = `position:absolute;left:${e.clientX - rect.left}px;top:${e.clientY - rect.top}px;width:0;height:0;border-radius:50%;background:rgba(255,255,255,0.35);transform:translate(-50%,-50%) scale(0);animation:ripple-btn 0.6s linear forwards;pointer-events:none;`
      btn.appendChild(ripple)
      setTimeout(() => ripple.remove(), 600)
    }
    onClick?.(e)
  }

  const base = `relative inline-flex items-center justify-center overflow-hidden select-none transition-all font-semibold rounded-full border-none cursor-pointer`
  const sz = { sm: 'px-5 py-2.5 text-sm gap-1.5', md: 'px-7 py-3 text-[14px] gap-2', lg: 'px-8 py-3.5 text-[15px] gap-2' }[size]
  const mob = size === 'md' ? 'min-h-[50px] sm:min-h-0' : ''
  const vars = {
    primary: 'text-[#FEFCF7] disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-white border-[1.5px] border-[#E2C090] text-[#5C3D11] hover:bg-[#F9EDD8] hover:border-[#C8A96E] hover:-translate-y-0.5 hover:shadow-md',
    ghost: 'bg-transparent text-[#8B6914] hover:bg-[#F5E6D3] hover:text-[#5C3D11]',
    danger: 'text-white',
  }[variant]

  const inlineStyle: React.CSSProperties = variant === 'primary'
    ? { background: 'linear-gradient(135deg,#C8A96E,#B8934A,#8B6914)', boxShadow: '0 4px 20px rgba(92,61,17,0.28)', ...style }
    : variant === 'danger'
    ? { background: 'linear-gradient(135deg,#c0392b,#922b21)', ...style }
    : { ...style }

  return (
    <button ref={btnRef} onClick={handleClick} disabled={disabled || loading}
      className={`${base} ${sz} ${mob} ${vars} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={inlineStyle} {...props}>
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Please wait...
        </span>
      ) : children}
    </button>
  )
}
