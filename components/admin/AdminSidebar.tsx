'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, Tag, Percent, ShoppingBag, Users, BarChart2, Menu, X, LogOut, User, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/discounts', label: 'Discounts', icon: Percent },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
]

const NavContent = ({ onLinkClick, user, logout }: { onLinkClick?: () => void; user: any; logout: () => void }) => {
  const pathname = usePathname()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(226,192,144,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#C8A96E,#5C3D11)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#2C1810', lineHeight: 1 }}>Crochet Masterpiece</div>
            <div style={{ fontSize: 10, color: '#9E7E5A', marginTop: 2 }}>Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href} onClick={onLinkClick}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, marginBottom: 2, textDecoration: 'none', transition: 'all 0.15s',
                background: active ? '#F5E6D3' : 'transparent',
                color: active ? '#5C3D11' : '#9E7E5A', fontWeight: active ? 700 : 500, fontSize: 13,
              }}>
              <Icon size={16} />
              {label}
              {active && <ChevronRight size={12} style={{ marginLeft: 'auto' }} />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: Profile + Logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(226,192,144,0.3)' }}>
        <Link href="/admin/profile" onClick={onLinkClick}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, textDecoration: 'none', marginBottom: 4, transition: 'all 0.15s', color: '#8B6914' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#C8A96E,#5C3D11)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2C1810', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Admin'}</div>
            <div style={{ fontSize: 10, color: '#9E7E5A' }}>View Profile</div>
          </div>
          <User size={13} />
        </Link>
        <button onClick={logout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: 'none', background: 'transparent', color: '#9E7E5A', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.color = '#991B1B' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9E7E5A' }}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  )
}

export function AdminSidebar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (user && user.role !== 'admin') router.push('/')
  }, [user, router])

  const handleLogout = async () => { await logout(); router.push('/login?admin=1') }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex" style={{ width: 220, flexShrink: 0, background: 'white', borderRight: '1px solid #EDD4B2', minHeight: '100vh', position: 'sticky', top: 0, height: '100vh', flexDirection: 'column' }}>
        <NavContent user={user} logout={handleLogout} />
      </aside>

      {/* Mobile topbar */}
      <div className="lg:hidden" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 56, background: 'white', borderBottom: '1px solid #EDD4B2', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12 }}>
        <button onClick={() => setOpen(true)} style={{ padding: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#5C3D11' }}>
          <Menu size={20} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#2C1810' }}>Crochet Masterpiece — Admin</span>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 240, background: 'white', boxShadow: '4px 0 20px rgba(0,0,0,0.15)' }}>
            <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: 12, right: 12, padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#9E7E5A' }}>
              <X size={18} />
            </button>
            <NavContent onLinkClick={() => setOpen(false)} user={user} logout={handleLogout} />
          </div>
        </div>
      )}
    </>
  )
}
