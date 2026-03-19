'use client'
import { useState, useEffect } from 'react'
import { Plus, X, Tag, ToggleLeft, ToggleRight, Trash2, ChevronDown } from 'lucide-react'
import { BubbleButton } from '@/components/ui/BubbleButton'
import { FloatingInput } from '@/components/ui/FloatingInput'

interface Discount { id: string; code: string; description?: string; percentage: number; scope: string; product_name?: string; category_name?: string; is_active: boolean; end_date?: string; usage_count: number; max_usage?: number; created_at: string }
interface Category { id: string; name: string }
interface Product { id: string; name: string }

const scopeLabels: Record<string, string> = { site_wide: '🌐 Site-wide', product: '📦 Product', category: '🗂️ Category' }

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ code: '', description: '', percentage: '', scope: 'site_wide', product_id: '', category_id: '', end_date: '', max_usage: '' })

  const fetch_ = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/discounts')
    const d = await res.json()
    setDiscounts(d.discounts || [])
    setLoading(false)
  }

  useEffect(() => {
    fetch_()
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []))
    fetch('/api/admin/products?limit=100').then(r => r.json()).then(d => setProducts(d.products || []))
  }, [])

  const save = async () => {
    if (!form.code.trim() || !form.percentage) return
    setSaving(true)
    const res = await fetch('/api/admin/discounts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await res.json()
    if (d.error) { alert(d.error); setSaving(false); return }
    setSaving(false); setShowForm(false)
    setForm({ code: '', description: '', percentage: '', scope: 'site_wide', product_id: '', category_id: '', end_date: '', max_usage: '' })
    fetch_()
  }

  const toggle = async (id: string, is_active: boolean) => {
    await fetch(`/api/admin/discounts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active }) })
    setDiscounts(prev => prev.map(d => d.id === id ? { ...d, is_active } : d))
  }

  const del = async (id: string) => {
    await fetch(`/api/admin/discounts/${id}`, { method: 'DELETE' })
    setDeleteId(null); fetch_()
  }

  const isExpired = (d: Discount) => d.end_date && new Date(d.end_date) < new Date()

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#3d1520]">Discounts 🎀</h1>
          <p className="text-rose-400 text-sm">{discounts.filter(d => d.is_active && !isExpired(d)).length} active discounts</p>
        </div>
        <BubbleButton variant="primary" size="sm" onClick={() => setShowForm(true)}><Plus size={16} /> New Discount</BubbleButton>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : discounts.length === 0 ? (
        <div className="text-center py-16 text-rose-300"><div className="text-5xl mb-3">🎀</div><p>No discounts created yet</p></div>
      ) : (
        <div className="space-y-3">
          {discounts.map(d => {
            const expired = isExpired(d)
            return (
              <div key={d.id} className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${expired ? 'opacity-60 border-rose-50' : d.is_active ? 'border-rose-200' : 'border-rose-100'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-rose-500 shrink-0">
                      <Tag size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-base text-[#3d1520] tracking-wider">{d.code}</span>
                        <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">{d.percentage}% OFF</span>
                        <span className="bg-purple-50 text-purple-500 text-[11px] font-semibold px-2 py-0.5 rounded-full">{scopeLabels[d.scope]}</span>
                        {expired && <span className="bg-red-50 text-red-400 text-[11px] font-semibold px-2 py-0.5 rounded-full">Expired</span>}
                        {!expired && !d.is_active && <span className="bg-gray-100 text-gray-400 text-[11px] font-semibold px-2 py-0.5 rounded-full">Inactive</span>}
                      </div>
                      {d.description && <p className="text-rose-400 text-xs mt-0.5">{d.description}</p>}
                      <div className="flex gap-3 mt-1.5 text-xs text-rose-300">
                        {(d.product_name || d.category_name) && <span>📦 {d.product_name || d.category_name}</span>}
                        <span>Used: {d.usage_count}{d.max_usage ? `/${d.max_usage}` : ''}</span>
                        {d.end_date && <span>Expires: {new Date(d.end_date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!expired && (
                      <button onClick={() => toggle(d.id, !d.is_active)} title={d.is_active ? 'Deactivate' : 'Activate'}
                        className={`p-2 rounded-xl transition-all ${d.is_active ? 'text-green-500 bg-green-50 hover:bg-green-100' : 'text-rose-300 bg-rose-50 hover:bg-rose-100'}`}>
                        {d.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                    )}
                    <button onClick={() => setDeleteId(d.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border border-rose-100 my-4 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#3d1520] text-lg">➕ New Discount Code</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-rose-50 rounded-full text-rose-400"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <FloatingInput label="Discount code *" type="text" value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="font-mono tracking-widest" icon={<Tag size={16} />} />
              <FloatingInput label="Description" type="text" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <FloatingInput label="Discount % *" type="number" value={form.percentage}
                  onChange={e => setForm(f => ({ ...f, percentage: e.target.value }))} />
                <FloatingInput label="Max uses (optional)" type="number" value={form.max_usage}
                  onChange={e => setForm(f => ({ ...f, max_usage: e.target.value }))} />
              </div>
              {/* Scope */}
              <div>
                <label className="text-xs font-bold text-rose-400 uppercase tracking-wide block mb-2">Applies To</label>
                <div className="flex gap-2">
                  {['site_wide', 'category', 'product'].map(s => (
                    <button key={s} type="button" onClick={() => setForm(f => ({ ...f, scope: s }))}
                      className={`flex-1 text-xs py-2.5 rounded-xl font-semibold border transition-all ${form.scope === s ? 'bg-rose-500 border-rose-500 text-white' : 'border-rose-200 text-rose-500 hover:bg-rose-50'}`}>
                      {scopeLabels[s]}
                    </button>
                  ))}
                </div>
              </div>
              {form.scope === 'category' && (
                <div className="relative">
                  <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                    className="w-full px-4 py-4 bg-rose-50 rounded-2xl border border-rose-200 text-sm text-[#3d1520] outline-none focus:border-rose-400 appearance-none">
                    <option value="">Select category...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none" />
                </div>
              )}
              {form.scope === 'product' && (
                <div className="relative">
                  <select value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}
                    className="w-full px-4 py-4 bg-rose-50 rounded-2xl border border-rose-200 text-sm text-[#3d1520] outline-none focus:border-rose-400 appearance-none">
                    <option value="">Select product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none" />
                </div>
              )}
              <FloatingInput label="Expiry date (optional)" type="datetime-local" value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
              <div className="flex gap-3 pt-1">
                <BubbleButton variant="primary" size="md" fullWidth loading={saving} onClick={save}>Create Discount</BubbleButton>
                <BubbleButton variant="ghost" size="md" onClick={() => setShowForm(false)}>Cancel</BubbleButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl animate-scale-in text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="font-bold text-[#3d1520] mb-1">Delete Discount?</h3>
            <p className="text-rose-400 text-sm mb-5">This cannot be undone.</p>
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
