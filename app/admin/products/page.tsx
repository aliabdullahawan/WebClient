'use client'
import { useState, useEffect, useRef } from 'react'
import { Plus, Search, Edit, Trash2, Star, X, Upload, Tag, ToggleLeft, ToggleRight, ChevronDown } from 'lucide-react'
import { BubbleButton } from '@/components/ui/BubbleButton'
import { FloatingInput } from '@/components/ui/FloatingInput'

interface Product { id: string; name: string; price: number; category_name?: string; is_featured: boolean; show_on_hero: boolean; is_active: boolean; average_rating: number; review_count: number; primary_image_id?: string }
interface Category { id: string; name: string }

function ImageUploadBox({ onImages }: { onImages: (imgs: { data: string; mime: string }[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<string[]>([])
  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const imgs: { data: string; mime: string }[] = []
    const prevs: string[] = []
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        const result = e.target?.result as string
        const base64 = result.split(',')[1]
        imgs.push({ data: base64, mime: file.type })
        prevs.push(result)
        if (imgs.length === files.length) { onImages(imgs); setPreviews(p => [...p, ...prevs]) }
      }
      reader.readAsDataURL(file)
    })
  }
  return (
    <div>
      <div onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-rose-200 rounded-2xl p-6 text-center cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-all">
        <Upload size={24} className="text-rose-300 mx-auto mb-2" />
        <p className="text-rose-400 text-sm font-medium">Click to upload images</p>
        <p className="text-rose-300 text-xs mt-1">PNG, JPG up to 10MB each</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
      {previews.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {previews.map((p, i) => (
            <div key={i} className="relative">
              <img src={p} alt="" className="w-16 h-16 rounded-xl object-cover border-2 border-rose-200" />
              <button onClick={() => setPreviews(prev => prev.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-400 text-white rounded-full flex items-center justify-center text-xs">×</button>
              {i === 0 && <div className="absolute bottom-0 left-0 right-0 bg-rose-400 text-white text-[9px] text-center rounded-b-xl">Primary</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', category_id: '', tags: '', is_featured: false, show_on_hero: false })
  const [newImages, setNewImages] = useState<{ data: string; mime: string }[]>([])

  const fetchProducts = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: page.toString(), limit: '15' })
    if (search) params.set('q', search)
    const res = await fetch(`/api/admin/products?${params}`)
    const d = await res.json()
    setProducts(d.products || [])
    setTotal(d.total || 0)
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [page, search]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || [])) }, [])

  const openNew = () => { setEditingId(null); setForm({ name: '', description: '', price: '', category_id: '', tags: '', is_featured: false, show_on_hero: false }); setNewImages([]); setShowForm(true) }

  const openEdit = async (id: string) => {
    const res = await fetch(`/api/admin/products/${id}`)
    const d = await res.json()
    const p = d.product
    setForm({ name: p.name, description: p.description || '', price: p.price.toString(), category_id: p.category_id || '', tags: (p.tags || []).join(', '), is_featured: p.is_featured, show_on_hero: p.show_on_hero })
    setNewImages([]); setEditingId(id); setShowForm(true)
  }

  const save = async () => {
    if (!form.name.trim() || !form.price) return
    setSaving(true)
    const body = { ...form, price: parseFloat(form.price), tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), images: editingId ? undefined : newImages, newImages: editingId ? newImages : undefined }
    const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products'
    const method = editingId ? 'PATCH' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSaving(false); setShowForm(false); fetchProducts()
  }

  const del = async (id: string) => {
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    setDeleteId(null); fetchProducts()
  }

  const toggleField = async (id: string, field: string, val: boolean) => {
    await fetch(`/api/admin/products/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [field]: val }) })
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p))
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#3d1520]">Products 🧶</h1>
          <p className="text-rose-400 text-sm">{total} products total</p>
        </div>
        <BubbleButton variant="primary" size="sm" onClick={openNew}><Plus size={16} /> Add Product</BubbleButton>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search products..."
          className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-rose-200 text-sm text-[#3d1520] outline-none focus:border-rose-400 placeholder-rose-300 transition-all" />
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-rose-300"><div className="text-5xl mb-3">🧶</div><p>No products yet</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <div className="w-14 h-14 rounded-xl bg-rose-50 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                  {p.primary_image_id
                    ? <img src={`/api/products/image/${p.primary_image_id}`} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    : '🧶'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#3d1520] text-sm line-clamp-1">{p.name}</p>
                  <p className="text-rose-400 text-xs">{p.category_name || '—'}</p>
                  <p className="text-rose-500 font-bold text-sm">₨{p.price.toLocaleString()}</p>
                </div>
              </div>
              <div className="px-4 pb-3 flex items-center justify-between border-t border-rose-50 pt-3">
                <div className="flex gap-2">
                  <button title="Featured" onClick={() => toggleField(p.id, 'is_featured', !p.is_featured)}
                    className={`text-[11px] px-2 py-1 rounded-full font-bold transition-all ${p.is_featured ? 'bg-amber-100 text-amber-600' : 'bg-rose-50 text-rose-300'}`}>
                    ✨ {p.is_featured ? 'Featured' : 'Feature'}
                  </button>
                  <button title="Hero" onClick={() => toggleField(p.id, 'show_on_hero', !p.show_on_hero)}
                    className={`text-[11px] px-2 py-1 rounded-full font-bold transition-all ${p.show_on_hero ? 'bg-purple-100 text-purple-600' : 'bg-rose-50 text-rose-300'}`}>
                    🎬 {p.show_on_hero ? 'Hero' : 'Add Hero'}
                  </button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p.id)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-xl transition-colors"><Edit size={14} /></button>
                  <button onClick={() => setDeleteId(p.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 15 && (
        <div className="flex justify-center gap-2">
          <BubbleButton variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</BubbleButton>
          <span className="flex items-center px-4 text-sm text-rose-400">Page {page} of {Math.ceil(total / 15)}</span>
          <BubbleButton variant="secondary" size="sm" disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)}>Next →</BubbleButton>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-xl border border-rose-100 my-4 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#3d1520] text-lg">{editingId ? '✏️ Edit Product' : '➕ New Product'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-rose-50 rounded-full text-rose-400"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <FloatingInput label="Product name *" type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <FloatingInput label="Price (₨) *" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                <div className="relative">
                  <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                    className="w-full px-4 py-4 bg-rose-50 rounded-2xl border border-rose-200 text-sm text-[#3d1520] outline-none focus:border-rose-400 appearance-none">
                    <option value="">No category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none" />
                </div>
              </div>
              <div className="relative bg-rose-50 rounded-2xl border border-rose-200 focus-within:border-rose-400 transition-all">
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={3}
                  className="w-full px-4 py-3 bg-transparent text-[#3d1520] text-sm outline-none resize-none placeholder-rose-300" />
              </div>
              <FloatingInput label="Tags (comma-separated)" type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} icon={<Tag size={16} />} />
              <div className="flex gap-4">
                {[{ key: 'is_featured', label: '✨ Featured' }, { key: 'show_on_hero', label: '🎬 Show on Hero' }].map(({ key, label }) => (
                  <button key={key} type="button" onClick={() => setForm(f => ({ ...f, [key]: !f[key as keyof typeof f] }))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-[1.5px] text-sm font-semibold transition-all ${(form as any)[key] ? 'bg-rose-500 border-rose-500 text-white' : 'border-rose-200 text-rose-400'}`}>
                    {(form as any)[key] ? <ToggleRight size={16} /> : <ToggleLeft size={16} />} {label}
                  </button>
                ))}
              </div>
              <ImageUploadBox onImages={imgs => setNewImages(p => [...p, ...imgs])} />
              <div className="flex gap-3 pt-2">
                <BubbleButton variant="primary" size="md" fullWidth loading={saving} onClick={save}>
                  {editingId ? 'Save Changes' : 'Create Product'}
                </BubbleButton>
                <BubbleButton variant="ghost" size="md" onClick={() => setShowForm(false)}>Cancel</BubbleButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl animate-scale-in">
            <div className="text-4xl text-center mb-3">⚠️</div>
            <h3 className="font-bold text-[#3d1520] text-center mb-1">Delete Product?</h3>
            <p className="text-rose-400 text-sm text-center mb-5">This will hide the product from the shop.</p>
            <div className="flex gap-3">
              <BubbleButton variant="danger" size="md" fullWidth onClick={() => del(deleteId)}>Delete</BubbleButton>
              <BubbleButton variant="ghost" size="md" fullWidth onClick={() => setDeleteId(null)}>Cancel</BubbleButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
