import Link from 'next/link'
import { Instagram, Facebook } from 'lucide-react'

const TikTokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.04a8.16 8.16 0 004.77 1.52V7.12a4.85 4.85 0 01-1-.43z"/>
  </svg>
)
const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export function Footer() {
  return (
    <footer className="relative border-t border-rose-100 bg-gradient-to-br from-white to-rose-50/50 pt-10 pb-6 px-4 sm:px-6 overflow-hidden">
      {/* Subtle bg */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(ellipse at bottom center, rgba(251,113,133,0.08), transparent 70%)' }} />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm"
                style={{ background: 'linear-gradient(135deg,#fb7185,#ec4899,#f43f5e)' }}>🧶</div>
              <div>
                <div className="font-black text-base" style={{ background: 'linear-gradient(135deg,#f43f5e,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Crochet Masterpiece
                </div>
                <div className="text-[10px] text-rose-300 tracking-widest uppercase">Handcrafted with love</div>
              </div>
            </div>
            <p className="text-rose-400 text-sm leading-relaxed">
              Every piece is made with love and care. Custom orders are our specialty. 💕
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-[#3d1520] text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/', label: 'Home' },
                { href: '/shop', label: 'Shop' },
                { href: '/custom', label: 'Custom Order' },
                { href: '/contact', label: 'Contact Us' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-rose-400 text-sm hover:text-rose-600 transition-colors flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-rose-300 group-hover:bg-rose-500 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-bold text-[#3d1520] text-sm mb-4">Account</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/login', label: 'Sign In' },
                { href: '/signup', label: 'Create Account' },
                { href: '/orders', label: 'My Orders' },
                { href: '/profile', label: 'My Profile' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-rose-400 text-sm hover:text-rose-600 transition-colors flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-rose-300 group-hover:bg-rose-500 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold text-[#3d1520] text-sm mb-4">Follow Us</h3>
            <div className="flex flex-wrap gap-2.5">
              {[
                { href: 'https://www.instagram.com/croch_etmasterpiece', icon: <Instagram size={16} />, label: 'Instagram', cls: 'social-instagram' },
                { href: 'https://www.facebook.com/profile.php?id=61579353555271', icon: <Facebook size={16} />, label: 'Facebook', cls: 'social-facebook' },
                { href: 'https://www.tiktok.com/@croch_et.masterpiece', icon: <TikTokIcon />, label: 'TikTok', cls: 'social-tiktok' },
                { href: 'https://whatsapp.com/channel/0029VbBXbGv9WtC90s3UER04', icon: <WhatsAppIcon />, label: 'WhatsApp', cls: 'social-whatsapp' },
              ].map(({ href, icon, label, cls }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className={`w-9 h-9 rounded-xl ${cls} flex items-center justify-center text-white hover:scale-110 hover:-translate-y-0.5 transition-all duration-200 shadow-sm`}
                  title={label}>
                  {icon}
                </a>
              ))}
            </div>
            <p className="text-rose-300 text-xs mt-3">📱 Primary ordering via WhatsApp</p>
          </div>
        </div>

        <div className="border-t border-rose-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-rose-300 text-xs text-center sm:text-left">
            © 2025 Crochet Masterpiece. Made with 💕 in Pakistan.
          </p>
          <p className="text-rose-300 text-xs">
            All handcrafted products are unique 🌸
          </p>
        </div>
      </div>
    </footer>
  )
}
