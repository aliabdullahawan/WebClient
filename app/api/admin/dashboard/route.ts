import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin, isNextResponse } from '@/lib/adminAuth'

export async function GET() {
  const auth = await requireAdmin()
  if (isNextResponse(auth)) return auth

  const supabase = createServiceClient()
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalUsers },
    { count: totalOrders },
    { data: revenueData },
    { data: pendingData },
    { data: socialData },
    { count: activeDiscounts },
    { data: recentOrders },
    { data: weeklyOrders },
    { data: monthlyOrders },
    { data: ratingData },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total_amount').eq('status', 'delivered'),
    supabase.from('orders').select('id').eq('status', 'pending'),
    supabase.from('social_links').select('platform, follower_count'),
    supabase.from('discounts').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('v_orders_summary').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('orders').select('total_amount, created_at').gte('created_at', sevenDaysAgo).eq('status', 'delivered'),
    supabase.from('orders').select('total_amount, created_at, status').gte('created_at', thirtyDaysAgo),
    supabase.from('reviews').select('rating'),
  ])

  const totalRevenue = (revenueData || []).reduce((s: number, o: any) => s + (o.total_amount || 0), 0)
  const weeklyRevenue = (weeklyOrders || []).reduce((s: number, o: any) => s + (o.total_amount || 0), 0)
  const avgRating = ratingData && ratingData.length > 0
    ? (ratingData.reduce((s: number, r: any) => s + r.rating, 0) / ratingData.length).toFixed(1)
    : '0.0'

  // Build daily chart data for last 30 days
  const dailyMap: Record<string, { orders: number; revenue: number }> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().split('T')[0]
    dailyMap[key] = { orders: 0, revenue: 0 }
  }
  ;(monthlyOrders || []).forEach((o: any) => {
    const key = o.created_at.split('T')[0]
    if (dailyMap[key]) {
      dailyMap[key].orders++
      if (o.status === 'delivered') dailyMap[key].revenue += o.total_amount || 0
    }
  })
  const chartData = Object.entries(dailyMap).map(([date, v]) => ({
    date, label: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }), ...v,
  }))

  return NextResponse.json({
    stats: {
      totalUsers: totalUsers || 0,
      totalOrders: totalOrders || 0,
      totalRevenue,
      weeklyRevenue,
      pendingOrders: pendingData?.length || 0,
      activeDiscounts: activeDiscounts || 0,
      avgRating,
    },
    socialLinks: socialData || [],
    recentOrders: recentOrders || [],
    chartData,
  })
}
