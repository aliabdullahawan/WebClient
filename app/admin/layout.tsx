import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: '#fdf2f8' }}>
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden lg:pl-0 pl-0">
        <div className="lg:hidden h-16" /> {/* spacer for mobile menu button */}
        {children}
      </main>
    </div>
  )
}
