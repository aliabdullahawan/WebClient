'use client'
import { useRef, ButtonHTMLAttributes } from 'react'

interface BubbleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export function BubbleButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  onClick,
  disabled,
  ...props
}: BubbleButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return
    // Ripple effect
    const btn = btnRef.current
    if (btn) {
      const rect = btn.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const ripple = document.createElement('span')
      ripple.style.cssText = `
        position:absolute;
        left:${x}px;top:${y}px;
        width:0;height:0;
        border-radius:50%;
        background:rgba(255,255,255,0.4);
        transform:translate(-50%,-50%) scale(0);
        animation:ripple-btn 0.6s linear forwards;
        pointer-events:none;
      `
      btn.appendChild(ripple)
      setTimeout(() => ripple.remove(), 600)
    }
    onClick?.(e)
  }

  const baseClasses = 'relative inline-flex items-center justify-center font-semibold rounded-full border-none cursor-pointer overflow-hidden select-none transition-all'

  const sizeClasses = {
    sm: 'px-5 py-2.5 text-sm gap-1.5',
    md: 'px-7 py-3 text-[15px] gap-2',
    lg: 'px-8 py-4 text-base gap-2',
  }[size]

  const mobileSize = size === 'md' ? 'min-h-[52px] sm:min-h-0' : ''

  const variantClasses = {
    primary: `
      bg-gradient-to-br from-[#fb7185] via-[#ec4899] to-[#f43f5e] text-white
      shadow-[0_4px_20px_rgba(244,63,94,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]
      hover:shadow-[0_8px_40px_rgba(236,72,153,0.45),0_0_30px_rgba(251,113,133,0.3)]
      hover:-translate-y-0.5 hover:scale-[1.03]
      active:translate-y-0 active:scale-[0.97] active:shadow-sm
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
    `,
    secondary: `
      bg-white text-rose-500 border-2 border-rose-300
      hover:bg-rose-50 hover:border-rose-400 hover:text-rose-600
      hover:-translate-y-0.5 hover:scale-[1.02]
      hover:shadow-[0_4px_20px_rgba(244,63,94,0.18)]
      active:translate-y-0 active:scale-[0.97]
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    ghost: `
      bg-transparent text-rose-500
      hover:bg-rose-100 hover:text-rose-600
      active:bg-rose-200
    `,
    danger: `
      bg-gradient-to-br from-red-400 to-rose-600 text-white
      shadow-[0_4px_20px_rgba(239,68,68,0.3)]
      hover:shadow-[0_8px_30px_rgba(239,68,68,0.4)]
      hover:-translate-y-0.5 hover:scale-[1.02]
      active:scale-[0.97]
    `,
  }[variant]

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses} ${mobileSize} ${variantClasses} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span>Please wait...</span>
        </span>
      ) : children}
      <style>{`
        @keyframes ripple-btn {
          to { width: 400px; height: 400px; opacity: 0; }
        }
      `}</style>
    </button>
  )
}
