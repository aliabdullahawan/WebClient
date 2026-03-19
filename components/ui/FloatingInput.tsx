'use client'
import { useState, InputHTMLAttributes, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: React.ReactNode
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, icon, type, ...props }, ref) => {
    const [showPw, setShowPw] = useState(false)
    const [focused, setFocused] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPw ? 'text' : 'password') : type

    return (
      <div className="relative group">
        {focused && (
          <div style={{ position: 'absolute', inset: -2, borderRadius: 18, background: 'linear-gradient(135deg,#C8A96E,#8B6914)', opacity: 0.2, zIndex: -1, filter: 'blur(6px)' }} />
        )}
        <div style={{
          display: 'flex', alignItems: 'center', background: focused ? 'white' : '#F9EDD8',
          borderRadius: 16, border: `1.5px solid ${error ? '#c0392b' : focused ? '#C8A96E' : '#EDD4B2'}`,
          boxShadow: focused ? '0 0 0 3px rgba(200,169,110,0.18)' : 'none',
          transition: 'all 0.2s ease', overflow: 'hidden',
        }}>
          {icon && <span style={{ paddingLeft: 14, color: focused ? '#8B6914' : '#B8934A', flexShrink: 0 }}>{icon}</span>}
          <div style={{ position: 'relative', flex: 1 }}>
            <input ref={ref} type={inputType}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              placeholder=" "
              style={{ width: '100%', padding: icon ? '22px 14px 6px 10px' : '22px 14px 6px 14px', background: 'transparent', color: '#2C1810', fontSize: 15, outline: 'none', border: 'none' }}
              {...props} />
            <label style={{
              position: 'absolute', left: icon ? 10 : 14, top: '50%', transform: 'translateY(-50%)',
              color: '#B8934A', fontSize: 15, pointerEvents: 'none', transition: 'all 0.18s ease',
              ...(focused || (props.value && String(props.value).length > 0) ? { top: '30%', fontSize: 11, color: '#9E7E5A', fontWeight: 600, letterSpacing: '0.03em' } : {}),
            }}>
              {label}
            </label>
          </div>
          {isPassword && (
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ paddingRight: 14, color: '#B8934A', background: 'none', border: 'none', cursor: 'pointer' }}>
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          )}
        </div>
        {error && <p style={{ marginTop: 5, fontSize: 12, color: '#922b21', paddingLeft: 4 }}>⚠ {error}</p>}
      </div>
    )
  }
)
FloatingInput.displayName = 'FloatingInput'
