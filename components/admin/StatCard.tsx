interface StatCardProps {
  icon: string
  label: string
  value: string | number
  sub?: string
  gradient?: string
}

export function StatCard({ icon, label, value, sub, gradient = 'from-rose-400 to-pink-500' }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl shadow-sm`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-black text-[#3d1520]">{value}</p>
      <p className="text-rose-400 text-sm font-medium mt-0.5">{label}</p>
      {sub && <p className="text-rose-300 text-xs mt-1">{sub}</p>}
    </div>
  )
}
