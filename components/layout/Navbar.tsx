'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ShoppingCart, Heart, Bell, User, Menu, X, LogOut, Settings, Package, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { NotificationPanel } from '@/components/layout/NotificationPanel'
import { CartPanel } from '@/components/layout/CartPanel'
import { WishlistPanel } from '@/components/layout/WishlistPanel'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/custom', label: 'Custom Order' },
  { href: '/contact', label: 'Contact' },
]

function CrochetLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #C8A96E, #5C3D11)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(92,61,17,0.25)', flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
          <line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/>
        </svg>
      </div>
      <div className="hidden sm:block">
        <div style={{ fontSize: 13, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.3px', background: 'linear-gradient(135deg, #5C3D11, #8B6914)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Crochet
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: '#9E7E5A', textTransform: 'uppercase', lineHeight: 1, marginTop: 1 }}>
          Masterpiece
        </div>
      </div>
    </div>
  )
}

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showUser, setShowUser] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [showWishlist, setShowWishlist] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    let ignore = false
    if (!ignore) setMobileOpen(false)
    return () => { ignore = true }
  }, [pathname])

  useEffect(() => {
    if (!user || user.role !== 'user') return
    const fetch_ = async () => {
      try {
        const [c, w, n] = await Promise.all([
          fetch('/api/cart/count').then(r => r.json()),
          fetch('/api/wishlist/count').then(r => r.json()),
          fetch('/api/notifications/count').then(r => r.json()),
        ])
        setCartCount(c.count || 0)
        setWishlistCount(w.count || 0)
        setUnreadCount(n.count || 0)
      } catch {}
    }
    fetch_()
    const iv = setInterval(fetch_, 30000)
    return () => clearInterval(iv)
  }, [user])

  useEffect(() => {
    const h = (e: MouseEvent) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUser(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)

  const iconBtn = (label: string, count: number, onClick: () => void, Icon: React.ElementType) => (
    <button onClick={onClick} title={label} style={{
      position: 'relative', padding: '8px', borderRadius: 10, border: 'none', background: 'transparent',
      cursor: 'pointer', color: '#8B6914', transition: 'all 0.2s ease'
    }}
    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F5E6D3'}
    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
      <Icon size={20} />
      {count > 0 && (
        <span style={{
          position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: '50%',
          background: 'linear-gradient(135deg,#C8A96E,#8B6914)', color: '#FEFCF7',
          fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>{count > 9 ? '9+' : count}</span>
      )}
    </button>
  )

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none' }}><CrochetLogo /></Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex" style={{ gap: 4 }}>
              {navLinks.map(({ href, label }) => (
                <Link key={href} href={href} style={{
                  position: 'relative', padding: '6px 14px', borderRadius: 8,
                  fontSize: 13, fontWeight: 600, letterSpacing: '0.02em', textDecoration: 'none',
                  color: isActive(href) ? '#5C3D11' : '#9E7E5A',
                  background: isActive(href) ? '#F5E6D3' : 'transparent',
                  transition: 'all 0.2s ease',
                }}>
                  {label}
                  {isActive(href) && <span style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2, borderRadius: 1, background: 'linear-gradient(to right,#C8A96E,#8B6914)' }} />}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {iconBtn('Wishlist', wishlistCount, () => { setShowWishlist(true); setShowCart(false); setShowNotif(false) }, Heart)}
              {iconBtn('Cart', cartCount, () => { setShowCart(true); setShowWishlist(false); setShowNotif(false) }, ShoppingCart)}
              {user?.role === 'user' && iconBtn('Notifications', unreadCount, () => { setShowNotif(true); setShowCart(false); setShowWishlist(false) }, Bell)}

              {/* User menu */}
              {user ? (
                <div ref={userMenuRef} style={{ position: 'relative' }}>
                  <button onClick={() => setShowUser(!showUser)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
                    borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F5E6D3'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#C8A96E,#8B6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700 }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block" style={{ fontSize: 13, fontWeight: 600, color: '#5C3D11', maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={13} style={{ color: '#9E7E5A', transform: showUser ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
                  </button>
                  {showUser && (
                    <div className="animate-fade-in-down" style={{
                      position: 'absolute', right: 0, top: '100%', marginTop: 6, width: 200,
                      background: 'white', borderRadius: 14, boxShadow: '0 8px 40px rgba(92,61,17,0.16)',
                      border: '1px solid #E8D5B7', overflow: 'hidden', zIndex: 50,
                    }}>
                      <div style={{ padding: '12px 16px', background: '#FDF8EE', borderBottom: '1px solid #EDD4B2' }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#2C1810' }}>{user.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#9E7E5A', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                      </div>
                      {user.role === 'user' && (
                        <>
                          <Link href="/profile" onClick={() => setShowUser(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, color: '#5C3D11', textDecoration: 'none', transition: 'background 0.15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FDF8EE'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                            <User size={14} /> My Profile
                          </Link>
                          <Link href="/orders" onClick={() => setShowUser(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, color: '#5C3D11', textDecoration: 'none', transition: 'background 0.15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FDF8EE'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                            <Package size={14} /> My Orders
                          </Link>
                        </>
                      )}
                      {user.role === 'admin' && (
                        <Link href="/admin" onClick={() => setShowUser(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, color: '#5C3D11', textDecoration: 'none' }}>
                          <Settings size={14} /> Admin Panel
                        </Link>
                      )}
                      <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #EDD4B2' }} />
                      <button onClick={() => { setShowUser(false); logout() }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, color: '#7A5C10', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FDF8EE'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button className="btn-primary" onClick={() => router.push('/login')}
                  style={{ padding: '8px 18px', fontSize: 13 }}>
                  Sign In
                </button>
              )}

              {/* Mobile toggle */}
              <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} style={{
                padding: 8, borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', color: '#8B6914',
                marginLeft: 4,
              }}>
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden" style={{
          maxHeight: mobileOpen ? 280 : 0, overflow: 'hidden',
          transition: 'max-height 0.3s ease', borderTop: mobileOpen ? '1px solid #EDD4B2' : 'none',
          background: 'rgba(254,252,247,0.98)',
        }}>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} style={{
                padding: '10px 14px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none',
                color: isActive(href) ? '#5C3D11' : '#8B6914',
                background: isActive(href) ? '#F5E6D3' : 'transparent',
              }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <NotificationPanel open={showNotif} onClose={() => setShowNotif(false)} onCountChange={setUnreadCount} />
      <CartPanel open={showCart} onClose={() => setShowCart(false)} onCountChange={setCartCount} />
      <WishlistPanel open={showWishlist} onClose={() => setShowWishlist(false)} onCountChange={setWishlistCount} />
    </>
  )
}
