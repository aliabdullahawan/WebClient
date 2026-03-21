'use client'
import { useState } from 'react'
import { Instagram, Facebook, Mail, Phone, MapPin, MessageCircle } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { FloatingInput } from '@/components/ui/FloatingInput'
import { BubbleButton } from '@/components/ui/BubbleButton'

const TikTokIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.04a8.16 8.16 0 004.77 1.52V7.12a4.85 4.85 0 01-1-.43z"/></svg>
const WhatsAppIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>

const socials = [
  { platform: 'Instagram', icon: <Instagram size={22} />, color: 'social-instagram', url: 'https://www.instagram.com/croch_etmasterpiece', handle: '@croch_etmasterpiece', action: 'Follow on Instagram' },
  { platform: 'Facebook', icon: <Facebook size={22} />, color: 'social-facebook', url: 'https://www.facebook.com/profile.php?id=61579353555271', handle: 'Crochet Masterpiece', action: 'Like on Facebook' },
  { platform: 'TikTok', icon: <TikTokIcon />, color: 'social-tiktok', url: 'https://www.tiktok.com/@croch_et.masterpiece', handle: '@croch_et.masterpiece', action: 'Follow on TikTok' },
  { platform: 'WhatsApp', icon: <WhatsAppIcon />, color: 'social-whatsapp', url: 'https://whatsapp.com/channel/0029VbBXbGv9WtC90s3UER04', handle: 'Join Channel', action: 'Join WhatsApp Channel' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setErrors(p => { const n = { ...p }; delete n[k]; return n })
  }

  const sendViaWhatsApp = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.message.trim()) e.message = 'Message is required'
    setErrors(e)
    if (Object.keys(e).length > 0) return
    const msg = ` *Message from Website*\n\n*Name:* ${form.name}\n*Email:* ${form.email || 'Not provided'}\n*Message:* ${form.message}\n\n_Sent via Crochet Masterpiece website_ `
    window.open(`https://wa.me/923159202186?text=${encodeURIComponent(msg)}`, '_blank')
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'linear-gradient(160deg,#fdf2f8,#fff8fb)' }}>
      <Navbar />
      <main className="flex-1 pt-20 pb-12 px-4 sm:px-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-400 via-pink-500 to-rose-500 py-10 sm:py-14 text-center relative overflow-hidden -mx-4 sm:-mx-6 mb-10">
          {['', '', '', '', ''].map((e, i) => (
            <span key={i} className="absolute text-2xl opacity-20 animate-float select-none" style={{ left: `${5 + i * 22}%`, top: '50%', transform: 'translateY(-50%)', animationDelay: `${i * 0.4}s` }}>{e}</span>
          ))}
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Get in Touch </h1>
            <p className="text-rose-100 text-sm sm:text-base">We&apos;d love to hear from you!</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Social links grid */}
          <div>
            <h2 className="font-bold text-[#3d1520] text-lg mb-4 flex items-center gap-2">
              <div className="w-6 h-1 rounded-full bg-gradient-to-r from-rose-400 to-pink-500" /> Follow Us
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {socials.map(s => (
                <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-rose-100 hover:border-rose-300 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group">
                  <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
                    {s.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#3d1520] text-sm">{s.platform}</p>
                    <p className="text-rose-400 text-xs">{s.handle}</p>
                  </div>
                  <span className="text-xs font-semibold text-rose-400 bg-rose-50 px-3 py-1 rounded-full group-hover:bg-rose-100 transition-colors">
                    {s.action}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact info */}
            <div className="space-y-4">
              <h2 className="font-bold text-[#3d1520] text-lg mb-4 flex items-center gap-2">
                <div className="w-6 h-1 rounded-full bg-gradient-to-r from-rose-400 to-pink-500" /> Contact Info
              </h2>
              {[
                { icon: <Phone size={18} />, label: 'Phone / WhatsApp', value: '03159202186', href: 'tel:+923159202186' },
                { icon: <Mail size={18} />, label: 'Email', value: 'amnamubeen516@gmail.com', href: 'mailto:amnamubeen516@gmail.com' },
                { icon: <MapPin size={18} />, label: 'Location', value: 'Pakistan 🇵🇰', href: null },
              ].map(({ icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-rose-100">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-rose-500">{icon}</div>
                  <div>
                    <p className="text-rose-300 text-xs font-medium">{label}</p>
                    {href
                      ? <a href={href} className="text-[#3d1520] font-semibold text-sm hover:text-rose-500 transition-colors">{value}</a>
                      : <p className="text-[#3d1520] font-semibold text-sm">{value}</p>
                    }
                  </div>
                </div>
              ))}

              <div className="p-4 bg-white rounded-2xl border border-rose-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600"><WhatsAppIcon /></div>
                  <div>
                    <p className="text-rose-300 text-xs font-medium">Fastest Response</p>
                    <p className="text-[#3d1520] font-semibold text-sm">WhatsApp</p>
                  </div>
                </div>
                <BubbleButton variant="primary" size="sm" fullWidth onClick={() => window.open('https://wa.me/923159202186', '_blank')}>
                  <MessageCircle size={16} /> Start Chat
                </BubbleButton>
              </div>
            </div>

            {/* Chat form */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-rose-100">
              <h2 className="font-bold text-[#3d1520] text-lg mb-5 flex items-center gap-2">
                <div className="w-6 h-1 rounded-full bg-gradient-to-r from-rose-400 to-pink-500" /> Send a Message
              </h2>
              <div className="space-y-4">
                <FloatingInput label="Your name *" type="text" value={form.name} onChange={update('name')} error={errors.name} icon={<Phone size={16} />} />
                <FloatingInput label="Email (optional)" type="email" value={form.email} onChange={update('email')} icon={<Mail size={16} />} />
                <div className="relative bg-rose-50 rounded-2xl border-[1.5px] border-rose-200 focus-within:border-rose-400 focus-within:bg-white transition-all">
                  <MessageCircle size={16} className="absolute left-4 top-4 text-rose-400" />
                  <div className="pl-11">
                    <textarea value={form.message} onChange={update('message')} rows={4} placeholder=" "
                      className="peer w-full px-3 pt-6 pb-3 bg-transparent text-[#3d1520] text-[15px] outline-none resize-none placeholder-transparent" />
                    <label className="absolute left-11 top-4 text-rose-300 text-[15px] pointer-events-none transition-all peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-rose-500 peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs">
                      Your message *
                    </label>
                  </div>
                  {errors.message && <p className="px-4 pb-2 text-xs text-red-500"> {errors.message}</p>}
                </div>
                <BubbleButton variant="primary" size="lg" fullWidth onClick={sendViaWhatsApp}>
                  <span className="text-lg"></span> Send via WhatsApp
                </BubbleButton>
                <p className="text-center text-xs text-rose-300">This opens WhatsApp with your message pre-filled</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
