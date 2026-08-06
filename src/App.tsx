import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { PageLoader } from '@/components/shared/PageLoader'
import { ScrollRestoration } from '@/components/shared/ScrollRestoration'
import { PortfolioContentProvider } from '@/hooks/PortfolioContentProvider'
import { useAppReady } from '@/hooks/useAppReady'
import { GamePage } from '@/pages/GamePage'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { LoginPage } from '@/pages/LoginPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'

const ChessPage = lazy(() =>
  import('@/pages/ChessPage').then((module) => ({ default: module.ChessPage })),
)

const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
)
const AdminAnalyticsPage = lazy(() =>
  import('@/pages/admin/AdminAnalyticsPage').then((m) => ({ default: m.AdminAnalyticsPage })),
)
const AdminMessagesPage = lazy(() =>
  import('@/pages/admin/AdminMessagesPage').then((m) => ({ default: m.AdminMessagesPage })),
)
const AdminChessPage = lazy(() =>
  import('@/pages/admin/AdminChessPage').then((m) => ({ default: m.AdminChessPage })),
)
const AdminChessGamePage = lazy(() =>
  import('@/pages/admin/AdminChessGamePage').then((m) => ({ default: m.AdminChessGamePage })),
)
const AdminScoresPage = lazy(() =>
  import('@/pages/admin/AdminScoresPage').then((m) => ({ default: m.AdminScoresPage })),
)
const AdminNewsletterPage = lazy(() =>
  import('@/pages/admin/AdminNewsletterPage').then((m) => ({ default: m.AdminNewsletterPage })),
)
const AdminGuidePage = lazy(() =>
  import('@/pages/admin/AdminGuidePage').then((m) => ({ default: m.AdminGuidePage })),
)
const AdminContentHubPage = lazy(() =>
  import('@/pages/admin/content/AdminContentHubPage').then((m) => ({
    default: m.AdminContentHubPage,
  })),
)
const AdminEducationPage = lazy(() =>
  import('@/pages/admin/content/AdminEducationPage').then((m) => ({
    default: m.AdminEducationPage,
  })),
)
const AdminExperiencePage = lazy(() =>
  import('@/pages/admin/content/AdminExperiencePage').then((m) => ({
    default: m.AdminExperiencePage,
  })),
)
const AdminProfilePage = lazy(() =>
  import('@/pages/admin/content/AdminProfilePage').then((m) => ({
    default: m.AdminProfilePage,
  })),
)
const AdminProjectsPage = lazy(() =>
  import('@/pages/admin/content/AdminProjectsPage').then((m) => ({
    default: m.AdminProjectsPage,
  })),
)
const AdminSkillsPage = lazy(() =>
  import('@/pages/admin/content/AdminSkillsPage').then((m) => ({ default: m.AdminSkillsPage })),
)

function AppRoutes() {
  return (
    <>
      <ScrollRestoration />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<GamePage />} />
        <Route
          path="/game/chess"
          element={
            <Suspense fallback={<PageLoader />}>
              <ErrorBoundary>
                <ChessPage />
              </ErrorBoundary>
            </Suspense>
          }
        />
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
          <Route
            index
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <AdminDashboardPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="content"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <AdminContentHubPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="content/profile"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <AdminProfilePage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="content/projects"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <AdminProjectsPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="content/skills"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <AdminSkillsPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="content/experience"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <AdminExperiencePage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="content/education"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <AdminEducationPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="messages"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <AdminMessagesPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="analytics"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <AdminAnalyticsPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="scores"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <AdminScoresPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="chess"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <AdminChessPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="chess/:id"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <AdminChessGamePage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="newsletter"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <AdminNewsletterPage />
                </ErrorBoundary>
              </Suspense>
            }
          />
          <Route
            path="guide"
            element={
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <AdminGuidePage />
                </ErrorBoundary>
              </Suspense>
            }
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
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
