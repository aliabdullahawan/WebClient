'use client'
import { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#fb7185', '#ec4899', '#8b5cf6', '#22c55e', '#f59e0b', '#3b82f6']

// Defined outside component to avoid "component created during render" error
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-rose-100 rounded-2xl p-3 shadow-lg text-xs">
      <p className="font-bold text-[#3d1520] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.name.includes('Revenue') || p.name.includes('₨') ? '₨' : ''}{Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<7 | 30 | 90>(30)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-3"><div className="text-5xl animate-bounce">📊</div>
        <p className="text-rose-400 text-sm">Loading analytics...</p></div>
    </div>
  )

  if (!data) return null

  const { stats, chartData, recentOrders } = data
  const displayData = chartData.slice(-period)

  const totalRevPeriod = displayData.reduce((s: number, d: { revenue: number }) => s + d.revenue, 0)
  const totalOrdPeriod = displayData.reduce((s: number, d: { orders: number }) => s + d.orders, 0)
  const avgRevPerDay = period > 0 ? totalRevPeriod / period : 0

  const statusBreakdown = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: (recentOrders as { status: string }[]).filter(o => o.status === s).length,
  })).filter(d => d.value > 0)

  const weeklyData = []
  for (let w = 3; w >= 0; w--) {
    const start = period === 30 ? w * 7 : w * 22
    const end = start + (period === 30 ? 7 : 22)
    const slice = (chartData as { revenue: number; orders: number }[]).slice(-90).slice(-(end + 1)).slice(0, end - start + 1)
    weeklyData.push({
      week: `W${4 - w}`,
      revenue: slice.reduce((s, d) => s + d.revenue, 0),
      orders: slice.reduce((s, d) => s + d.orders, 0),
    })
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#3d1520]">Analytics 📊</h1>
          <p className="text-rose-400 text-sm">Business performance overview</p>
        </div>
        <div className="flex gap-1">
          {([7, 30, 90] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${period === p ? 'bg-rose-500 text-white' : 'bg-white border border-rose-200 text-rose-400 hover:bg-rose-50'}`}>
              {p}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: `Revenue (${period}d)`, value: `₨${totalRevPeriod >= 1000 ? (totalRevPeriod/1000).toFixed(1)+'K' : totalRevPeriod}`, icon: '💰', color: 'from-green-400 to-emerald-500' },
          { label: `Orders (${period}d)`, value: totalOrdPeriod, icon: '📦', color: 'from-blue-400 to-indigo-500' },
          { label: 'Avg/Day', value: `₨${avgRevPerDay >= 1000 ? (avgRevPerDay/1000).toFixed(1)+'K' : Math.round(avgRevPerDay)}`, icon: '📈', color: 'from-rose-400 to-pink-500' },
          { label: 'Total Revenue', value: `₨${stats.totalRevenue >= 1000 ? (stats.totalRevenue/1000).toFixed(1)+'K' : stats.totalRevenue}`, icon: '🏆', color: 'from-amber-400 to-orange-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-rose-100 shadow-sm">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-lg mb-3 shadow-sm`}>{s.icon}</div>
            <p className="text-xl font-black text-[#3d1520]">{s.value}</p>
            <p className="text-rose-400 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue trend */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm">
        <h2 className="font-bold text-[#3d1520] text-base mb-4">Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={displayData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb7185" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#fda4af' }} tickLine={false} axisLine={false}
              interval={Math.floor(displayData.length / 6)} />
            <YAxis tick={{ fontSize: 10, fill: '#fda4af' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#fb7185" strokeWidth={2.5}
              fill="url(#areaGrad)" name="Revenue (₨)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Orders bar */}
        <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm">
          <h2 className="font-bold text-[#3d1520] text-base mb-4">Daily Orders</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={displayData.slice(-14)} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#fda4af' }} tickLine={false} axisLine={false} interval={1} />
              <YAxis tick={{ fontSize: 9, fill: '#fda4af' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="#fb7185" radius={[6, 6, 0, 0]} name="Orders" maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order status pie */}
        <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm">
          <h2 className="font-bold text-[#3d1520] text-base mb-4">Order Status Distribution</h2>
          {statusBreakdown.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={35} outerRadius={65}
                    paddingAngle={3} dataKey="value">
                    {statusBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {statusBreakdown.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-rose-500">{d.name}</span>
                    </div>
                    <span className="font-bold text-[#3d1520]">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="flex items-center justify-center h-40 text-rose-300 text-sm">No orders yet</div>}
        </div>
      </div>

      {/* Weekly comparison */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm">
        <h2 className="font-bold text-[#3d1520] text-base mb-4">Weekly Comparison</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#fda4af' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#fda4af' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#fda4af' }} />
            <Bar dataKey="revenue" fill="#fb7185" radius={[6, 6, 0, 0]} name="Revenue (₨)" maxBarSize={40} />
            <Bar dataKey="orders" fill="#ec4899" radius={[6, 6, 0, 0]} name="Orders" maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
