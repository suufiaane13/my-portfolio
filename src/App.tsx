import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { PageLoader } from '@/components/shared/PageLoader'
import { ScrollRestoration } from '@/components/shared/ScrollRestoration'
import { PortfolioContentProvider } from '@/hooks/PortfolioContentProvider'
import { useAppReady } from '@/hooks/useAppReady'
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminMessagesPage } from '@/pages/admin/AdminMessagesPage'
import { AdminScoresPage } from '@/pages/admin/AdminScoresPage'
import { AdminContentHubPage } from '@/pages/admin/content/AdminContentHubPage'
import { AdminEducationPage } from '@/pages/admin/content/AdminEducationPage'
import { AdminExperiencePage } from '@/pages/admin/content/AdminExperiencePage'
import { AdminProfilePage } from '@/pages/admin/content/AdminProfilePage'
import { AdminProjectsPage } from '@/pages/admin/content/AdminProjectsPage'
import { AdminSkillsPage } from '@/pages/admin/content/AdminSkillsPage'
import { GamePage } from '@/pages/GamePage'
import { HomePage } from '@/pages/HomePage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { LoginPage } from '@/pages/LoginPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { AdminNewsletterPage } from '@/pages/admin/AdminNewsletterPage'

function AppRoutes() {
  return (
    <>
      <ScrollRestoration />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="content" element={<AdminContentHubPage />} />
          <Route path="content/profile" element={<AdminProfilePage />} />
          <Route path="content/projects" element={<AdminProjectsPage />} />
          <Route path="content/skills" element={<AdminSkillsPage />} />
          <Route path="content/experience" element={<AdminExperiencePage />} />
          <Route path="content/education" element={<AdminEducationPage />} />
          <Route path="messages" element={<AdminMessagesPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="scores" element={<AdminScoresPage />} />
          <Route path="newsletter" element={<AdminNewsletterPage />} />
        </Route>
      </Routes>
    </>
  )
}

function App() {
  const { isExiting, isReady } = useAppReady()

  return (
    <BrowserRouter>
      <PortfolioContentProvider>
        {!isReady && <PageLoader exiting={isExiting} />}
        {(isExiting || isReady) && <AppRoutes />}
      </PortfolioContentProvider>
    </BrowserRouter>
  )
}

export default App
