'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ShoppingCart, Heart, Bell, User, Menu, X, LogOut, Settings, Package, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { BubbleButton } from '@/components/ui/BubbleButton'
import { NotificationPanel } from '@/components/layout/NotificationPanel'
import { CartPanel } from '@/components/layout/CartPanel'
import { WishlistPanel } from '@/components/layout/WishlistPanel'

const navLinks = [
  { href: '/', label: 'HOME' },
  { href: '/shop', label: 'SHOP' },
  { href: '/custom', label: 'CUSTOM' },
  { href: '/contact', label: 'CONTACT US' },
]

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
    if (!user || user.role !== 'user') return
    const fetchCounts = async () => {
      try {
        const [cartRes, wishRes, notifRes] = await Promise.all([
          fetch('/api/cart/count'),
          fetch('/api/wishlist/count'),
          fetch('/api/notifications/count'),
        ])
        const [cart, wish, notif] = await Promise.all([cartRes.json(), wishRes.json(), notifRes.json()])
        setCartCount(cart.count || 0)
        setWishlistCount(wish.count || 0)
        setUnreadCount(notif.count || 0)
      } catch {}
    }
    fetchCounts()
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [user])

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUser(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)

  const handleLogout = async () => {
    setShowUser(false)
    await logout()
  }

  return (
    <>
      <nav
        className={`navbar z-50 transition-all duration-300 ${
          scrolled ? 'shadow-[0_2px_20px_rgba(244,63,94,0.1)] bg-white/95' : 'bg-white/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-18">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
                style={{ background: 'linear-gradient(135deg,#fb7185,#ec4899,#f43f5e)' }}
              >
                🧶
              </div>
              <div className="hidden sm:block">
                <span
                  className="font-bold text-base tracking-tight leading-none"
                  style={{ background: 'linear-gradient(135deg,#f43f5e,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  Crochet
                </span>
                <br />
                <span className="text-[10px] text-rose-300 tracking-widest font-medium uppercase leading-none">
                  Masterpiece
                </span>
              </div>
              <span
                className="sm:hidden font-bold text-base tracking-tight"
                style={{ background: 'linear-gradient(135deg,#f43f5e,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                CM
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-2 text-[13px] font-semibold tracking-wider transition-all duration-200 rounded-full group ${
                    isActive(href)
                      ? 'text-rose-500 bg-rose-50'
                      : 'text-rose-400 hover:text-rose-500 hover:bg-rose-50'
                  }`}
                >
                  {label}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 transition-all duration-300 ${
                    isActive(href) ? 'w-6' : 'w-0 group-hover:w-6'
                  }`} />
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">

              {/* Wishlist */}
              <button
                onClick={() => { setShowWishlist(true); setShowCart(false); setShowNotif(false) }}
                className="relative p-2.5 text-rose-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all duration-200 group"
                title="Wishlist"
              >
                <Heart size={20} className="group-hover:scale-110 group-hover:fill-rose-300 transition-all duration-200" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-rose-400 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => { setShowCart(true); setShowWishlist(false); setShowNotif(false) }}
                className="relative p-2.5 text-rose-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all duration-200 group"
                title="Cart"
              >
                <ShoppingCart size={20} className="group-hover:scale-110 transition-all duration-200" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-rose-400 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {/* Notifications */}
              {user && user.role === 'user' && (
                <button
                  onClick={() => { setShowNotif(true); setShowCart(false); setShowWishlist(false) }}
                  className="relative p-2.5 text-rose-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all duration-200 group"
                  title="Notifications"
                >
                  <Bell size={20} className="group-hover:scale-110 transition-all duration-200" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-rose-400 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-glow">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* User Menu */}
              {user ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setShowUser(!showUser)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-rose-50 transition-all duration-200 group"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block text-[13px] font-medium text-rose-500 max-w-[80px] truncate">
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className={`text-rose-400 transition-transform duration-200 ${showUser ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {showUser && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-[0_8px_40px_rgba(244,63,94,0.18)] border border-rose-100 overflow-hidden animate-fade-in-down z-50">
                      <div className="px-4 py-3 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
                        <p className="font-semibold text-[#3d1520] text-sm">{user.name}</p>
                        <p className="text-rose-400 text-xs truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        {user.role === 'user' && (
                          <>
                            <Link href="/profile" onClick={() => setShowUser(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors">
                              <User size={15} /> My Profile
                            </Link>
                            <Link href="/orders" onClick={() => setShowUser(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors">
                              <Package size={15} /> My Orders
                            </Link>
                          </>
                        )}
                        {user.role === 'admin' && (
                          <Link href="/admin" onClick={() => setShowUser(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors">
                            <Settings size={15} /> Admin Panel
                          </Link>
                        )}
                        <hr className="my-1 border-rose-100" />
                        <button onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-50 transition-colors w-full">
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <BubbleButton
                  variant="primary" size="sm"
                  onClick={() => router.push('/login')}
                  className="!text-xs !px-4 !py-2"
                >
                  Get Started
                </BubbleButton>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2.5 text-rose-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all duration-200 ml-1"
              >
                <div className={`transition-all duration-300 ${mobileOpen ? 'rotate-90 scale-110' : ''}`}>
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-80' : 'max-h-0'}`}>
          <div className="border-t border-rose-100 px-4 py-4 space-y-1 bg-white/95 backdrop-blur-sm">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center px-4 py-3 rounded-2xl text-sm font-semibold tracking-wider transition-all duration-200 ${
                  isActive(href)
                    ? 'bg-rose-50 text-rose-500'
                    : 'text-rose-400 hover:bg-rose-50 hover:text-rose-500'
                }`}
              >
                {isActive(href) && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-3" />}
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Slide-in Panels */}
      <NotificationPanel open={showNotif} onClose={() => setShowNotif(false)} onCountChange={setUnreadCount} />
      <CartPanel open={showCart} onClose={() => setShowCart(false)} onCountChange={setCartCount} />
      <WishlistPanel open={showWishlist} onClose={() => setShowWishlist(false)} onCountChange={setWishlistCount} />
    </>
  )
}
