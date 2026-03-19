import { createHash, randomBytes, timingSafeEqual } from 'crypto'
import { createServiceClient } from './supabase/server'
import type { User, Admin } from '@/types'

// Use Node.js built-in crypto — no external dependencies, works everywhere
// SHA-256 with salt: "SALT$hash"
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = createHash('sha256').update(salt + password).digest('hex')
  return `${salt}$${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    // Handle both our format (salt$hash) and legacy bcrypt hashes ($2b$...)
    if (stored.startsWith('$2b$') || stored.startsWith('$2a$')) {
      // Legacy bcrypt — can't verify without bcryptjs, return false to force re-setup
      console.warn('Legacy bcrypt hash detected — please run setup endpoint')
      return false
    }
    const [salt, hash] = stored.split('$')
    if (!salt || !hash) return false
    const attempt = createHash('sha256').update(salt + password).digest('hex')
    // Constant-time comparison
    const a = Buffer.from(attempt, 'hex')
    const b = Buffer.from(hash, 'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function getOTPExpiry(): Date {
  return new Date(Date.now() + 10 * 60 * 1000)
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' }
  if (!/(?=.*[a-z])/.test(password)) return { valid: false, message: 'Password must include a lowercase letter' }
  if (!/(?=.*[A-Z])/.test(password)) return { valid: false, message: 'Password must include an uppercase letter' }
  if (!/(?=.*\d)/.test(password)) return { valid: false, message: 'Password must include a number' }
  return { valid: true }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).single()
  if (error || !data) return null
  return data as User
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('admins').select('*').eq('email', email.toLowerCase()).single()
  if (error || !data) return null
  return data as Admin
}
