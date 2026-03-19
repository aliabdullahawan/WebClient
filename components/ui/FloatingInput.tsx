'use client'
import { useState, InputHTMLAttributes, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: React.ReactNode
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, icon, type, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [focused, setFocused] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className="relative group">
        {/* Glow background */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-400 blur-sm transition-opacity duration-300 -z-10 ${
            focused ? 'opacity-25' : 'opacity-0'
          }`}
        />

        {/* Input wrapper */}
        <div
          className={`relative flex items-center bg-rose-50 rounded-2xl border-[1.5px] transition-all duration-200 overflow-hidden ${
            focused
              ? 'border-rose-400 bg-white shadow-[0_0_0_3px_rgba(251,113,133,0.12)]'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-rose-200 hover:border-rose-300'
          }`}
        >
          {icon && (
            <span className={`pl-4 text-rose-400 transition-colors duration-200 ${focused ? 'text-rose-500' : ''}`}>
              {icon}
            </span>
          )}
          <div className="relative flex-1">
            <input
              ref={ref}
              type={inputType}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder=" "
              className={`
                peer w-full px-4 pt-6 pb-2 bg-transparent text-[#3d1520] text-[15px]
                outline-none placeholder-transparent
                disabled:opacity-60 disabled:cursor-not-allowed
                ${!icon ? '' : '!pl-2'}
              `}
              {...props}
            />
            {/* Floating label */}
            <label
              className={`
                absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 text-[15px]
                transition-all duration-200 pointer-events-none origin-left
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-rose-300
                peer-focus:top-3 peer-focus:text-xs peer-focus:text-rose-500
                peer-[&:not(:placeholder-shown)]:top-3 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-rose-400
                ${!icon ? '' : '!left-2'}
              `}
            >
              {label}
            </label>
          </div>

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="pr-4 text-rose-300 hover:text-rose-500 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 pl-1">
            <span>⚠️</span> {error}
          </p>
        )}
      </div>
    )
  }
)

FloatingInput.displayName = 'FloatingInput'
