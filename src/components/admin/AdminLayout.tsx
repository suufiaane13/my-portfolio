import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { LanguageTransition } from '@/components/shared/LanguageTransition'

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="pt-16 md:pt-[4.5rem]">
        <LanguageTransition>
          <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </LanguageTransition>
      </main>
      <Toaster richColors closeButton position="top-right" />
    </div>
  )
}
