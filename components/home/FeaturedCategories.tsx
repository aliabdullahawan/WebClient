'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import type { Category } from '@/types'

export function FeaturedCategories() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/categories?limit=6')
      .then(r => r.json())
      .then(d => setCategories(d.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Don't render anything if no categories
  if (!loading && categories.length === 0) return null

  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #fff8fb 0%, #ffffff 100%)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-1 rounded-full bg-gradient-to-r from-rose-400 to-pink-500" />
              <span className="text-xs font-bold text-rose-400 tracking-widest uppercase">Collections</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#3d1520]">Shop by Category</h2>
          </div>
          <button
            onClick={() => router.push('/shop')}
            className="hidden sm:flex items-center gap-1 text-sm text-rose-400 hover:text-rose-600 font-medium transition-colors group"
          >
            View all <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton aspect-square rounded-2xl" />
            ))}
          </div>
        )}

        {/* Categories grid */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => router.push(`/shop?category=${cat.id}`)}
                className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-rose-100 hover:border-rose-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-gradient-to-br from-rose-50 to-pink-50"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Image */}
                {cat.image_data ? (
                  <img
                    src={`data:${cat.image_mime};base64,${cat.image_data}`}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-25">🧶</div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#3d1520]/70 via-transparent to-transparent" />

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-bold text-xs sm:text-sm leading-tight text-center drop-shadow-sm">
                    {cat.name}
                  </p>
                </div>

                {/* Hover ring */}
                <div className="absolute inset-0 rounded-2xl ring-0 ring-rose-400 group-hover:ring-2 transition-all duration-300" />
              </button>
            ))}
          </div>
        )}

        {/* Mobile view all */}
        <div className="sm:hidden mt-5 text-center">
          <button
            onClick={() => router.push('/shop')}
            className="text-sm text-rose-500 font-semibold hover:text-rose-700 transition-colors"
          >
            View all categories →
          </button>
        </div>
      </div>
    </section>
  )
}
