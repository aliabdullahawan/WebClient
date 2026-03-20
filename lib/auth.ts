import { createHash, randomBytes } from 'crypto'
import { createServiceClient } from './supabase/server'
import type { User, Admin } from '@/types'

// Format: SALT$SHA256(salt+password)
// SALT = 32 hex chars (16 random bytes)
// HASH = 64 hex chars (SHA-256 output)
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex') // 32 chars
  const hash = createHash('sha256').update(salt + password).digest('hex') // 64 chars
  return `${salt}$${hash}` // 97 chars total
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    if (!stored || typeof stored !== 'string') return false

    // Must contain exactly one $
    const dollarIdx = stored.indexOf('$')
    if (dollarIdx === -1) return false

    const salt = stored.substring(0, dollarIdx)
    const storedHash = stored.substring(dollarIdx + 1)

    if (!salt || !storedHash) return false

    const attempt = createHash('sha256').update(salt + password).digest('hex')
    return attempt === storedHash
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
