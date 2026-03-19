'use client'
import { useState, useEffect, useRef } from 'react'
import { Plus, Search, Edit, Trash2, X, Upload, ArrowUpDown } from 'lucide-react'
import { BubbleButton } from '@/components/ui/BubbleButton'
import { FloatingInput } from '@/components/ui/FloatingInput'

interface Category { id: string; name: string; description?: string; image_mime: string; is_active: boolean; created_at: string }

function ImagePicker({ value, onChange }: { value: string; onChange: (data: string, mime: string) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <div onClick={() => ref.current?.click()}
        className="relative border-2 border-dashed border-rose-200 rounded-2xl overflow-hidden cursor-pointer hover:border-rose-400 transition-all group"
        style={{ height: 140 }}>
        {value
          ? <img src={value} alt="" className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
          : <div className="flex flex-col items-center justify-center h-full gap-2">
              <Upload size={22} className="text-rose-300" />
              <p className="text-rose-400 text-sm font-medium">Upload category image</p>
            </div>
        }
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-xs font-bold bg-black/40 px-3 py-1.5 rounded-full">Change Image</span>
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = ev => {
            const result = ev.target?.result as string
            onChange(result.split(',')[1], file.type)
          }
          reader.readAsDataURL(file)
        }} />
    </div>
  )
}

export default function AdminCategories() {
  const [cats, setCats] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortAsc, setSortAsc] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [imgData, setImgData] = useState<{ data: string; mime: string } | null>(null)
  const [imgPreview, setImgPreview] = useState('')

  const fetch_ = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/categories' + (search ? `?q=${search}` : ''))
    const d = await res.json()
    let list = d.categories || []
    list = list.sort((a: Category, b: Category) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))
    setCats(list)
    setLoading(false)
  }

  useEffect(() => { fetch_() }, [search, sortAsc]) // eslint-disable-line react-hooks/exhaustive-deps

  const openNew = () => {
    setEditingId(null); setForm({ name: '', description: '' })
    setImgData(null); setImgPreview(''); setShowForm(true)
  }

  const openEdit = (cat: Category) => {
    setEditingId(cat.id); setForm({ name: cat.name, description: cat.description || '' })
    setImgData(null); setImgPreview(''); setShowForm(true)
  }

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const body: Record<string, unknown> = { name: form.name.trim(), description: form.description.trim() || null }
    if (imgData) body.image = imgData
    const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories'
    const method = editingId ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const d = await res.json()
    if (d.error) { alert(d.error); setSaving(false); return }
    setSaving(false); setShowForm(false); fetch_()
  }

  const del = async (id: string) => {
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    setDeleteId(null); fetch_()
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#3d1520]">Categories 🗂️</h1>
          <p className="text-rose-400 text-sm">{cats.length} categories</p>
        </div>
        <BubbleButton variant="primary" size="sm" onClick={openNew}><Plus size={16} /> Add Category</BubbleButton>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories..."
            className="w-full pl-9 pr-4 py-3 bg-white rounded-2xl border border-rose-200 text-sm outline-none focus:border-rose-400 placeholder-rose-300 transition-all" />
        </div>
        <button onClick={() => setSortAsc(!sortAsc)}
          className="flex items-center gap-2 px-4 py-3 bg-white border border-rose-200 rounded-2xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-all">
          <ArrowUpDown size={15} /> {sortAsc ? 'A–Z' : 'Z–A'}
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton aspect-square rounded-2xl" />)}
        </div>
      ) : cats.length === 0 ? (
        <div className="text-center py-16 text-rose-300"><div className="text-5xl mb-3">🗂️</div><p>No categories yet</p></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {cats.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              {/* Image */}
              <div className="aspect-video bg-gradient-to-br from-rose-50 to-pink-50 relative overflow-hidden">
                <img src={`/api/categories/image/${cat.id}`} alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                  <span className="text-4xl">🗂️</span>
                </div>
              </div>
              {/* Info */}
              <div className="p-3">
                <p className="font-bold text-[#3d1520] text-sm">{cat.name}</p>
                {cat.description && <p className="text-rose-300 text-xs mt-0.5 line-clamp-2">{cat.description}</p>}
                <div className="flex gap-1.5 mt-3">
                  <button onClick={() => openEdit(cat)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-50 text-blue-500 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors">
                    <Edit size={12} /> Edit
                  </button>
                  <button onClick={() => setDeleteId(cat.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-50 text-red-400 hover:bg-red-100 rounded-xl text-xs font-semibold transition-colors">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border border-rose-100 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#3d1520] text-lg">{editingId ? '✏️ Edit Category' : '➕ New Category'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-rose-50 rounded-full text-rose-400"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <ImagePicker value={imgPreview}
                onChange={(data, mime) => { setImgData({ data, mime }); setImgPreview(`data:${mime};base64,${data}`) }} />
              <FloatingInput label="Category name *" type="text" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <div className="relative bg-rose-50 rounded-2xl border border-rose-200 focus-within:border-rose-400 transition-all">
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Description (optional)" rows={3}
                  className="w-full px-4 py-3 bg-transparent text-[#3d1520] text-sm outline-none resize-none placeholder-rose-300" />
              </div>
              <div className="flex gap-3 pt-1">
                <BubbleButton variant="primary" size="md" fullWidth loading={saving} onClick={save}>
                  {editingId ? 'Save Changes' : 'Create Category'}
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
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl animate-scale-in text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="font-bold text-[#3d1520] mb-1">Delete Category?</h3>
            <p className="text-rose-400 text-sm mb-5">Products in this category will be uncategorised.</p>
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
