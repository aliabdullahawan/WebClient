'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, Grid3X3, BarChart3, ShoppingBag, Users, Tag, LogOut, Menu, X, ChevronRight, Globe } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Grid3X3 },
  { href: '/admin/discounts', label: 'Discounts', icon: Tag },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Customers', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
}

function NavContent({ pathname, onClose, onLogout }: { pathname: string; onClose: () => void; onLogout: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-rose-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm" style={{background:'linear-gradient(135deg,#fb7185,#ec4899,#f43f5e)'}}>🧶</div>
          <div>
            <p className="font-black text-[13px] leading-none" style={{background:'linear-gradient(135deg,#f43f5e,#ec4899)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Crochet</p>
            <p className="text-[10px] text-rose-300 font-bold tracking-widest leading-none mt-0.5">ADMIN PANEL</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact)
          return (
            <Link key={href} href={href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${active ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-sm' : 'text-rose-400 hover:bg-rose-50 hover:text-rose-600'}`}>
              <Icon size={17} className={active ? 'text-white' : 'text-rose-400 group-hover:text-rose-500'} />
              <span>{label}</span>
              {active && <ChevronRight size={14} className="ml-auto text-white/70" />}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-4 border-t border-rose-100 space-y-1">
        <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all">
          <Globe size={17} /> View Website
        </Link>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-50 hover:text-red-600 transition-all">
          <LogOut size={17} /> Sign Out
        </button>
      </div>
    </div>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const handleLogout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login?admin=1') }
  return (
    <>
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-rose-500 border border-rose-100"><Menu size={20} /></button>
      {open && <div className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setOpen(false)} />}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-xl border-r border-rose-100 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setOpen(false)} className="absolute top-4 right-4 p-2 text-rose-400 hover:bg-rose-50 rounded-full"><X size={18} /></button>
        <NavContent pathname={pathname} onClose={() => setOpen(false)} onLogout={handleLogout} />
      </div>
      <div className="hidden lg:flex flex-col w-56 xl:w-60 shrink-0 bg-white border-r border-rose-100 h-screen sticky top-0 shadow-sm">
        <NavContent pathname={pathname} onClose={() => {}} onLogout={handleLogout} />
      </div>
    </>
  )
}
