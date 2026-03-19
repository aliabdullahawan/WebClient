'use client'
import { useRouter } from 'next/navigation'
import { BubbleButton } from '@/components/ui/BubbleButton'
import { Sparkles, MessageCircle } from 'lucide-react'

export function CtaBanner() {
  const router = useRouter()

  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fff1f2 50%, #fce7f3 100%)' }} />

      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #fb7185, transparent)' }} />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }} />

      {/* Floating emojis */}
      {['🌸', '🧶', '💕', '✨', '🎀'].map((e, i) => (
        <span key={i} className="absolute text-2xl sm:text-3xl opacity-20 pointer-events-none animate-float select-none"
          style={{
            left: `${8 + i * 22}%`,
            top: `${20 + (i % 2) * 40}%`,
            animationDelay: `${i * 0.5}s`,
          }}>
          {e}
        </span>
      ))}

      <div className="relative max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-rose-200 rounded-full px-4 py-1.5 mb-5 shadow-sm">
          <Sparkles size={14} className="text-rose-400" />
          <span className="text-xs font-bold text-rose-500 tracking-wide">CUSTOM ORDERS OPEN</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-[#3d1520] mb-4 leading-tight">
          Want something
          <br />
          <span style={{ background: 'linear-gradient(135deg,#f43f5e,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            made just for you?
          </span>
          <span className="inline-block ml-2">🎀</span>
        </h2>

        <p className="text-rose-400 text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed">
          Share your dream design and we&apos;ll bring it to life with our expert crochet craftsmanship.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <BubbleButton variant="primary" size="lg" onClick={() => router.push('/custom')}>
            <Sparkles size={18} /> Start Custom Order
          </BubbleButton>
          <BubbleButton
            variant="secondary" size="lg"
            onClick={() => window.open('https://wa.me/923159202186', '_blank')}
          >
            <MessageCircle size={18} /> Chat on WhatsApp
          </BubbleButton>
        </div>
      </div>
    </section>
  )
}
