import bcrypt from 'bcryptjs'
import { createServiceClient } from './supabase/server'
import type { User, Admin } from '@/types'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function getOTPExpiry(): Date {
  return new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()
  if (error || !data) return null
  return data as User
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()
  if (error || !data) return null
  return data as Admin
}

export async function validateUserLogin(email: string, password: string) {
  const supabase = createServiceClient()
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()

  if (!user) return { success: false, error: 'Invalid email or password' }
  if (user.is_blocked) return { success: false, error: 'Your account has been blocked. Contact support.' }
  if (!user.password_hash) return { success: false, error: 'Please login with Google' }

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) return { success: false, error: 'Invalid email or password' }

  return { success: true, user }
}

export async function validateAdminLogin(email: string, password: string) {
  const supabase = createServiceClient()
  const { data: admin } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()

  if (!admin) return { success: false, error: 'Invalid email or password' }

  // Use raw SQL to verify bcrypt password stored via pgcrypto
  const { data: result } = await supabase
    .rpc('verify_admin_password', { p_email: email, p_password: password })
    .single()

  // Fallback: compare with bcryptjs if rpc not available
  const valid = result ?? (await verifyPassword(password, admin.password_hash))
  if (!valid) return { success: false, error: 'Invalid email or password' }

  return { success: true, admin }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' }
  if (!/(?=.*[a-z])/.test(password)) return { valid: false, message: 'Password must contain a lowercase letter' }
  if (!/(?=.*[A-Z])/.test(password)) return { valid: false, message: 'Password must contain an uppercase letter' }
  if (!/(?=.*\d)/.test(password)) return { valid: false, message: 'Password must contain a number' }
  return { valid: true }
}
