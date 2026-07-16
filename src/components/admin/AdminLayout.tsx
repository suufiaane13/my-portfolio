import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { LanguageTransition } from '@/components/shared/LanguageTransition'

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar />
        <main className="flex-1">
          <LanguageTransition>
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              <Outlet />
            </div>
          </LanguageTransition>
        </main>
      </div>
      <Toaster richColors closeButton position="top-right" />
    </div>
  )
}
