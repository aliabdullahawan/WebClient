'use client'
import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Tag, FileText, DollarSign, Clock, ChevronDown } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { FloatingInput } from '@/components/ui/FloatingInput'
import { BubbleButton } from '@/components/ui/BubbleButton'

interface Category { id: string; name: string }

const deliveryOptions = ['1-2 weeks', '2-3 weeks', '3-4 weeks', '4-6 weeks', '6+ weeks', 'Flexible']

export default function CustomOrderPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    category: '', customCategory: '', description: '',
    minPrice: '', maxPrice: '', delivery: '',
  })
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []))
  }, [])

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setErrors(p => { const n = { ...p }; delete n[k]; return n })
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    if (!form.description.trim()) e.description = 'Please describe what you want'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const sendViaWhatsApp = () => {
    if (!validate()) return
    const category = showCustomCategory ? form.customCategory : form.category
    const priceRange = form.minPrice && form.maxPrice ? `₨${form.minPrice} - ₨${form.maxPrice}` : form.minPrice ? `From ₨${form.minPrice}` : form.maxPrice ? `Up to ₨${form.maxPrice}` : 'Not specified'
    const msg = ` *Custom Order Request*\n\n*Name:* ${form.name}\n*Email:* ${form.email || 'Not provided'}\n*Phone:* ${form.phone}\n*Address:* ${form.address || 'Not provided'}\n\n*Category:* ${category || 'Not specified'}\n*Description:* ${form.description}\n*Budget:* ${priceRange}\n*Delivery:* ${form.delivery || 'Not specified'}\n\n_Sent via Crochet Masterpiece website_ `
    window.open(`https://wa.me/923159202186?text=${encodeURIComponent(msg)}`, '_blank')
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'linear-gradient(160deg,#fdf2f8,#fff8fb)' }}>
      <Navbar />
      <main className="flex-1 pt-20 pb-12 px-4 sm:px-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-400 via-pink-500 to-rose-500 py-10 sm:py-14 text-center relative overflow-hidden -mx-4 sm:-mx-6 mb-8">
          {['', '', '', '', ''].map((e, i) => (
            <span key={i} className="absolute text-2xl opacity-20 animate-float select-none" style={{ left: `${5 + i * 22}%`, top: '50%', transform: 'translateY(-50%)', animationDelay: `${i * 0.4}s` }}>{e}</span>
          ))}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-3">
              <span className="text-white text-xs font-bold tracking-wide">CUSTOM ORDERS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Your Dream Piece </h1>
            <p className="text-rose-100 text-sm sm:text-base max-w-md mx-auto">Tell us what you want and we&apos;ll bring it to life with our expert crochet craft</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-rose-100 text-center">
              <div className="text-6xl mb-4 animate-bounce"></div>
              <h2 className="text-2xl font-black text-[#3d1520] mb-2">Request Sent!</h2>
              <p className="text-rose-400 mb-5">Your custom order request has been sent to WhatsApp. We&apos;ll get back to you soon! </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <BubbleButton variant="primary" size="md" onClick={() => setSubmitted(false)}>Place Another Order</BubbleButton>
                <BubbleButton variant="secondary" size="md" onClick={() => window.location.href = '/'}>Back to Home</BubbleButton>
              </div>
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-lg border border-rose-100">
              <h2 className="font-bold text-[#3d1520] text-lg mb-6">Tell us about your order </h2>

              <div className="space-y-4">
                {/* Contact info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FloatingInput label="Your name *" type="text" value={form.name} onChange={update('name')} error={errors.name} icon={<User size={16} />} />
                  <FloatingInput label="Email (optional)" type="email" value={form.email} onChange={update('email')} icon={<Mail size={16} />} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FloatingInput label="WhatsApp / Phone *" type="tel" value={form.phone} onChange={update('phone')} error={errors.phone} icon={<Phone size={16} />} />
                  <FloatingInput label="Address (optional)" type="text" value={form.address} onChange={update('address')} icon={<MapPin size={16} />} />
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-rose-400 uppercase tracking-wide mb-2 block">Category</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {categories.map(c => (
                      <button key={c.id} type="button"
                        onClick={() => { setForm(f => ({ ...f, category: c.name })); setShowCustomCategory(false) }}
                        className={`text-sm px-4 py-2 rounded-full font-medium transition-all border ${form.category === c.name && !showCustomCategory ? 'bg-rose-500 border-rose-500 text-white' : 'border-rose-200 text-rose-500 hover:bg-rose-50'}`}>
                        {c.name}
                      </button>
                    ))}
                    <button type="button"
                      onClick={() => { setShowCustomCategory(true); setForm(f => ({ ...f, category: '' })) }}
                      className={`text-sm px-4 py-2 rounded-full font-medium transition-all border ${showCustomCategory ? 'bg-rose-500 border-rose-500 text-white' : 'border-rose-200 text-rose-500 hover:bg-rose-50'}`}>
                      + Custom
                    </button>
                  </div>
                  {showCustomCategory && (
                    <FloatingInput label="Custom category" type="text" value={form.customCategory} onChange={update('customCategory')} icon={<Tag size={16} />} />
                  )}
                </div>

                {/* Description */}
                <div>
                  <div className="relative bg-rose-50 rounded-2xl border-[1.5px] border-rose-200 focus-within:border-rose-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(251,113,133,0.12)] transition-all">
                    <FileText size={16} className="absolute left-4 top-4 text-rose-400" />
                    <div className="pl-11">
                      <textarea value={form.description} onChange={update('description')} rows={4} placeholder=" "
                        className="peer w-full px-3 pt-6 pb-3 bg-transparent text-[#3d1520] text-[15px] outline-none resize-none placeholder-transparent" />
                      <label className="absolute left-11 top-4 text-rose-300 text-[15px] pointer-events-none transition-all peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-rose-500 peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-rose-400">
                        Describe what you want in detail *
                      </label>
                    </div>
                  </div>
                  {errors.description && <p className="mt-1 text-xs text-red-500 pl-1"> {errors.description}</p>}
                </div>

                {/* Price range */}
                <div>
                  <label className="text-xs font-bold text-rose-400 uppercase tracking-wide mb-2 block">Budget Range (₨)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <FloatingInput label="Min price" type="number" value={form.minPrice} onChange={update('minPrice')} icon={<DollarSign size={16} />} />
                    <FloatingInput label="Max price" type="number" value={form.maxPrice} onChange={update('maxPrice')} icon={<DollarSign size={16} />} />
                  </div>
                </div>

                {/* Delivery */}
                <div>
                  <label className="text-xs font-bold text-rose-400 uppercase tracking-wide mb-2 block">Delivery Timeframe</label>
                  <div className="flex flex-wrap gap-2">
                    {deliveryOptions.map(d => (
                      <button key={d} type="button" onClick={() => setForm(f => ({ ...f, delivery: d }))}
                        className={`text-sm px-4 py-2 rounded-full font-medium transition-all border ${form.delivery === d ? 'bg-rose-500 border-rose-500 text-white' : 'border-rose-200 text-rose-500 hover:bg-rose-50'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <BubbleButton variant="primary" size="lg" fullWidth onClick={sendViaWhatsApp}>
                    <span className="text-lg"></span> Send via WhatsApp
                  </BubbleButton>
                  <p className="text-center text-xs text-rose-300 mt-2">This will open WhatsApp with your order details pre-filled</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
