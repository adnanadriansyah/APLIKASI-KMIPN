import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import AppRoutes from './routes/AppRoutes'
import SplashScreen from './components/SplashScreen'
import { ToastProvider } from './components/Toast'

function AppContent() {
  const { loading } = useAuth()

  return (
    <>
      <SplashScreen isVisible={loading} />
      {!loading && <AppRoutes />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
