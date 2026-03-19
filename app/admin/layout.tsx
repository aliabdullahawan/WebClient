import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FEFCF7' }}>
      <AdminSidebar />
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        <div style={{ height: 64 }} className="lg:hidden" />
        {children}
      </main>
    </div>
  )
}
