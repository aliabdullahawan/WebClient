'use client'
import { useEffect, useRef, useState } from 'react'

const features = [
  { icon: '🧶', title: 'Handcrafted Quality', desc: 'Every piece is made by hand with premium yarn and meticulous attention to detail.' },
  { icon: '✨', title: 'Custom Orders', desc: 'Request a unique piece made just for you — your vision, our craft.' },
  { icon: '💝', title: 'Made with Love', desc: 'Each creation carries genuine care and passion from start to finish.' },
  { icon: '📦', title: 'Fast Delivery', desc: 'We ensure your handcrafted items reach you safely and on time.' },
  { icon: '💬', title: 'WhatsApp Support', desc: 'Direct communication for orders, updates, and custom consultations.' },
  { icon: '⭐', title: 'Happy Customers', desc: 'Hundreds of satisfied customers who keep coming back for more.' },
]

export function WhyChooseUs() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-14 sm:py-20 px-4 sm:px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fdf2f8 100%)' }}>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-rose-400 to-pink-500" />
            <span className="text-xs font-bold text-rose-400 tracking-widest uppercase">Why Us</span>
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#3d1520] mb-3">
            Crafted for You 🌸
          </h2>
          <p className="text-rose-400 text-sm sm:text-base max-w-md mx-auto">
            Here&apos;s why our customers love Crochet Masterpiece
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`card p-5 sm:p-6 transition-all duration-500 ${
                visible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #fff1f2, #fce7f3)' }}>
                {f.icon}
              </div>
              <h3 className="font-bold text-[#3d1520] text-base mb-2">{f.title}</h3>
              <p className="text-rose-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
