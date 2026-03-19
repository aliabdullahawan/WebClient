'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { StatCard } from '@/components/admin/StatCard'
import { Instagram, Facebook } from 'lucide-react'

const TikTokIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.04a8.16 8.16 0 004.77 1.52V7.12a4.85 4.85 0 01-1-.43z"/></svg>
const WhatsAppIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>

const socialIcons: Record<string, { icon: React.ReactNode; cls: string }> = {
  instagram: { icon: <Instagram size={14} />, cls: 'social-instagram' },
  facebook: { icon: <Facebook size={14} />, cls: 'social-facebook' },
  tiktok: { icon: <TikTokIcon />, cls: 'social-tiktok' },
  whatsapp: { icon: <WhatsAppIcon />, cls: 'social-whatsapp' },
}

const statusColors: Record<string, string> = { pending: 'text-amber-600 bg-amber-50', confirmed: 'text-blue-600 bg-blue-50', shipped: 'text-purple-600 bg-purple-50', delivered: 'text-green-600 bg-green-50', cancelled: 'text-red-600 bg-red-50' }

export default function AdminDashboard() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<7 | 30>(30)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => { if (r.status === 401) { router.push('/login?admin=1'); return null } return r.json() })
      .then(d => { if (d) setData(d) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-3">
        <div className="text-5xl animate-bounce">🧶</div>
        <p className="text-rose-400 text-sm">Loading dashboard...</p>
      </div>
    </div>
  )

  if (!data) return null

  const { stats, socialLinks, recentOrders, chartData } = data
  const displayData = period === 7 ? chartData.slice(-7) : chartData

  const pieData = [
    { name: 'Delivered', value: recentOrders.filter((o: any) => o.status === 'delivered').length || 1, color: '#22c55e' },
    { name: 'Pending', value: recentOrders.filter((o: any) => o.status === 'pending').length || 0, color: '#f59e0b' },
    { name: 'Shipped', value: recentOrders.filter((o: any) => o.status === 'shipped').length || 0, color: '#8b5cf6' },
    { name: 'Cancelled', value: recentOrders.filter((o: any) => o.status === 'cancelled').length || 0, color: '#ef4444' },
  ].filter(d => d.value > 0)

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#3d1520]">Dashboard 👑</h1>
          <p className="text-rose-400 text-sm">Welcome back, Admin!</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-rose-300">{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon="👥" label="Total Users" value={stats.totalUsers.toLocaleString()} gradient="from-blue-400 to-indigo-500" />
        <StatCard icon="📦" label="Total Orders" value={stats.totalOrders.toLocaleString()} sub={`${stats.pendingOrders} pending`} gradient="from-amber-400 to-orange-500" />
        <StatCard icon="💰" label="Total Revenue" value={`₨${stats.totalRevenue >= 1000 ? (stats.totalRevenue/1000).toFixed(1)+'K' : stats.totalRevenue}`} sub="Delivered orders" gradient="from-green-400 to-emerald-500" />
        <StatCard icon="⭐" label="Avg Rating" value={stats.avgRating} gradient="from-yellow-400 to-amber-500" />
        <StatCard icon="🎀" label="Active Discounts" value={stats.activeDiscounts} gradient="from-pink-400 to-rose-500" />
        <StatCard icon="📈" label="Weekly Revenue" value={`₨${stats.weeklyRevenue >= 1000 ? (stats.weeklyRevenue/1000).toFixed(1)+'K' : stats.weeklyRevenue}`} gradient="from-rose-400 to-pink-500" />
      </div>

      {/* Social followers */}
      {socialLinks.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm">
          <h2 className="font-bold text-[#3d1520] text-base mb-4">Social Media Followers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {socialLinks.map((link: any) => {
              const cfg = socialIcons[link.platform]
              if (!cfg) return null
              return (
                <div key={link.platform} className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-2xl border border-rose-100">
                  <div className={`w-8 h-8 rounded-xl ${cfg.cls} flex items-center justify-center text-white shrink-0`}>{cfg.icon}</div>
                  <div>
                    <p className="font-bold text-[#3d1520] text-sm">{(link.follower_count || 0).toLocaleString()}</p>
                    <p className="text-rose-300 text-[11px] capitalize">{link.platform}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-rose-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#3d1520] text-base">Orders & Revenue</h2>
            <div className="flex gap-1">
              {([7, 30] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${period === p ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-400 hover:bg-rose-100'}`}>
                  {p}d
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={displayData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#fda4af' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#fda4af' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #fecdd3', borderRadius: '12px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="revenue" stroke="#fb7185" strokeWidth={2} fill="url(#revGrad)" name="Revenue (₨)" />
              <Area type="monotone" dataKey="orders" stroke="#ec4899" strokeWidth={2} fill="url(#ordGrad)" name="Orders" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm">
          <h2 className="font-bold text-[#3d1520] text-base mb-4">Order Status</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #fecdd3', borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-rose-400">{d.name}</span>
                    </div>
                    <span className="font-bold text-[#3d1520]">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-32 text-rose-300 text-sm">No order data yet</div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-rose-50">
          <h2 className="font-bold text-[#3d1520] text-base">Recent Orders</h2>
          <button onClick={() => router.push('/admin/orders')} className="text-xs text-rose-400 hover:text-rose-600 font-semibold transition-colors">View all →</button>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-10 text-rose-300 text-sm">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-rose-50/50">
                <tr>
                  {['Order #', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-rose-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {recentOrders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-rose-50/30 cursor-pointer transition-colors" onClick={() => router.push(`/admin/orders?id=${o.id}`)}>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-rose-500">{o.order_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#3d1520] text-xs">{o.customer_name || 'Guest'}</p>
                      <p className="text-rose-300 text-[11px]">{o.customer_email}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#3d1520] text-xs">₨{Number(o.total_amount).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusColors[o.status] || 'bg-rose-50 text-rose-600'}`}>
                        {o.status?.charAt(0).toUpperCase() + o.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-rose-300 text-xs">{new Date(o.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
