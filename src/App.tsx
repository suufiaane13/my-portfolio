import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PageLoader } from '@/components/shared/PageLoader'
import { ScrollRestoration } from '@/components/shared/ScrollRestoration'
import { useAppReady } from '@/hooks/useAppReady'
import { GamePage } from '@/pages/GamePage'
import { HomePage } from '@/pages/HomePage'

function AppRoutes() {
  return (
    <>
      <ScrollRestoration />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </>
  )
}

function App() {
  const { isExiting, isReady } = useAppReady()

  return (
    <BrowserRouter>
      {!isReady && <PageLoader exiting={isExiting} />}
      {(isExiting || isReady) && <AppRoutes />}
    </BrowserRouter>
  )
}

export default App
