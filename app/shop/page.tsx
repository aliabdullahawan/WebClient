'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X, ChevronDown, Star } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/components/shop/ProductCard'
import { BubbleButton } from '@/components/ui/BubbleButton'
import type { Product } from '@/types'

interface Category { id: string; name: string }

function ShopContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'created_at',
    order: searchParams.get('order') || 'desc',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    featured: searchParams.get('featured') === '1',
    page: 1,
  })

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.q) params.set('q', filters.q)
      if (filters.category) params.set('category', filters.category)
      params.set('sort', filters.sort)
      params.set('order', filters.order)
      if (filters.minPrice) params.set('minPrice', filters.minPrice)
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
      if (filters.featured) params.set('featured', '1')
      params.set('page', filters.page.toString())
      params.set('limit', '12')

      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products || [])
      setTotal(data.total || 0)
    } catch {} finally { setLoading(false) }
  }, [filters])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []))
    fetch('/api/wishlist').then(r => r.json()).then(d => {
      setWishlistIds(new Set((d.items || []).map((i: any) => i.product_id)))
    }).catch(() => {})
  }, [])

  const toggleWishlist = async (productId: string) => {
    const res = await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: productId }) })
    const d = await res.json()
    if (d.success) {
      setWishlistIds(prev => { const n = new Set(prev); d.action === 'added' ? n.add(productId) : n.delete(productId); return n })
    }
  }

  const updateFilter = (key: string, value: unknown) => setFilters(f => ({ ...f, [key]: value, page: 1 }))

  const sortOptions = [
    { value: 'created_at|desc', label: ' Newest First' },
    { value: 'created_at|asc', label: ' Oldest First' },
    { value: 'price|asc', label: ' Price: Low to High' },
    { value: 'price|desc', label: ' Price: High to Low' },
    { value: 'average_rating|desc', label: '⭐ Top Rated' },
    { value: 'name|asc', label: ' A to Z' },
    { value: 'name|desc', label: ' Z to A' },
  ]

  const activeFilterCount = [filters.category, filters.minPrice, filters.maxPrice, filters.featured].filter(Boolean).length

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'linear-gradient(160deg,#fdf2f8,#fff8fb)' }}>
      <Navbar />
      <main className="flex-1 pt-20">

        {/* Hero strip */}
        <div className="bg-gradient-to-r from-rose-400 via-pink-500 to-rose-500 py-8 sm:py-10 px-4 sm:px-6 text-center relative overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="absolute text-white text-2xl opacity-20 animate-float select-none"
              style={{ left: `${5 + i * 30}%`, top: '50%', transform: 'translateY(-50%)', animationDelay: `${i * 0.5}s` }}></span>
          ))}
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-1 relative z-10">Our Collection </h1>
          <p className="text-rose-100 text-sm relative z-10">{total > 0 ? `${total} beautiful handcrafted pieces` : 'Explore our handcrafted pieces'}</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Search + filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400" />
              <input
                type="text" value={filters.q} placeholder="Search products..."
                onChange={e => updateFilter('q', e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border-[1.5px] border-rose-200 text-[#3d1520] text-sm outline-none focus:border-rose-400 focus:shadow-[0_0_0_3px_rgba(251,113,133,0.12)] transition-all placeholder-rose-300"
              />
              {filters.q && <button onClick={() => updateFilter('q', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-300 hover:text-rose-500"><X size={16} /></button>}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={`${filters.sort}|${filters.order}`}
                onChange={e => { const [sort, order] = e.target.value.split('|'); updateFilter('sort', sort); setFilters(f => ({ ...f, order, page: 1 })) }}
                className="appearance-none bg-white border-[1.5px] border-rose-200 rounded-2xl pl-4 pr-10 py-3 text-sm text-rose-500 font-medium outline-none focus:border-rose-400 cursor-pointer"
              >
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none" />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-[1.5px] text-sm font-semibold transition-all ${showFilters || activeFilterCount > 0 ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-rose-200 text-rose-500 hover:border-rose-400'}`}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && <span className="bg-white text-rose-500 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center">{activeFilterCount}</span>}
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-white rounded-2xl border border-rose-100 p-5 mb-6 shadow-sm animate-fade-in-down">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-rose-400 uppercase tracking-wide mb-2 block">Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => updateFilter('category', '')}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${!filters.category ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-500 hover:bg-rose-100'}`}>
                      All
                    </button>
                    {categories.map(c => (
                      <button key={c.id} onClick={() => updateFilter('category', c.id)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${filters.category === c.id ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-500 hover:bg-rose-100'}`}>
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <label className="text-xs font-bold text-rose-400 uppercase tracking-wide mb-2 block">Min Price (₨)</label>
                  <input type="number" placeholder="0" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)}
                    className="w-full px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-sm text-[#3d1520] outline-none focus:border-rose-400" />
                </div>
                <div>
                  <label className="text-xs font-bold text-rose-400 uppercase tracking-wide mb-2 block">Max Price (₨)</label>
                  <input type="number" placeholder="999999" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-sm text-[#3d1520] outline-none focus:border-rose-400" />
                </div>

                {/* Featured */}
                <div className="flex flex-col justify-end">
                  <button onClick={() => updateFilter('featured', !filters.featured)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-[1.5px] text-sm font-semibold transition-all ${filters.featured ? 'bg-rose-500 border-rose-500 text-white' : 'border-rose-200 text-rose-500 hover:bg-rose-50'}`}>
                    <Star size={14} fill={filters.featured ? 'white' : 'none'} /> Featured Only
                  </button>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button onClick={() => setFilters(f => ({ ...f, category: '', minPrice: '', maxPrice: '', featured: false, page: 1 }))}
                  className="mt-3 text-xs text-rose-400 hover:text-rose-600 flex items-center gap-1">
                  <X size={12} /> Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="skeleton h-52 sm:h-60 w-full" />
                  <div className="p-3 space-y-2"><div className="skeleton h-4 w-3/4 rounded" /><div className="skeleton h-4 w-1/2 rounded" /></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4 animate-float"></div>
              <h3 className="font-bold text-[#3d1520] text-xl mb-2">No products found</h3>
              <p className="text-rose-400 text-sm mb-5">Try adjusting your search or filters</p>
              <BubbleButton variant="secondary" size="md" onClick={() => setFilters(f => ({ ...f, q: '', category: '', minPrice: '', maxPrice: '', featured: false, page: 1 }))}>
                Clear Filters
              </BubbleButton>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} isWishlisted={wishlistIds.has(p.id)} onWishlist={() => toggleWishlist(p.id)} />
                ))}
              </div>

              {/* Pagination */}
              {total > 12 && (
                <div className="flex justify-center gap-2 mt-8">
                  <BubbleButton variant="secondary" size="sm" disabled={filters.page === 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>
                    ← Prev
                  </BubbleButton>
                  <span className="flex items-center px-4 text-sm text-rose-500 font-medium">
                    Page {filters.page} of {Math.ceil(total / 12)}
                  </span>
                  <BubbleButton variant="secondary" size="sm" disabled={filters.page >= Math.ceil(total / 12)} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>
                    Next →
                  </BubbleButton>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function ShopPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{background:'linear-gradient(135deg,#fdf2f8,#fff1f2)'}}><div className="text-5xl animate-bounce"></div></div>}><ShopContent /></Suspense>
}
