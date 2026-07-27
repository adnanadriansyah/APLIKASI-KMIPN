import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import LoadingSpinner from '../components/LoadingSpinner'

const LandingPage = lazy(() => import('../pages/LandingPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))

const WargaLayout = lazy(() => import('../layouts/WargaLayout'))
const DesaLayout = lazy(() => import('../layouts/DesaLayout'))
const PolsekLayout = lazy(() => import('../layouts/PolsekLayout'))

const WargaDashboard = lazy(() => import('../pages/warga/WargaDashboard'))
const WargaRonda = lazy(() => import('../pages/warga/WargaRonda'))
const WargaKamtibmas = lazy(() => import('../pages/warga/WargaKamtibmas'))
const WargaRumahKosong = lazy(() => import('../pages/warga/WargaRumahKosong'))
const WargaPanic = lazy(() => import('../pages/warga/WargaPanic'))

const DesaDashboard = lazy(() => import('../pages/desa/DesaDashboard'))
const PengaturanRonda = lazy(() => import('../pages/desa/PengaturanRonda'))
const ScannerQR = lazy(() => import('../pages/desa/ScannerQR'))
const DesaKamtibmas = lazy(() => import('../pages/desa/DesaKamtibmas'))
const RekapRumahKosong = lazy(() => import('../pages/desa/RekapRumahKosong'))
const ManajemenWarga = lazy(() => import('../pages/desa/ManajemenWarga'))

const PolsekDashboard = lazy(() => import('../pages/polsek/PolsekDashboard'))
const ManajemenLaporan = lazy(() => import('../pages/polsek/ManajemenLaporan'))
const ManajemenLinmas = lazy(() => import('../pages/polsek/ManajemenLinmas'))
const RiwayatPanicAlert = lazy(() => import('../pages/polsek/RiwayatPanicAlert'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export default function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader />

  const DASHBOARD_MAP = {
    warga: '/warga/dashboard',
    aparatur_desa: '/desa/dashboard',
    polsek: '/polsek/dashboard',
  }
  const dashboardPath = user ? (DASHBOARD_MAP[user.role] || '/login') : '/login'

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={user ? <Navigate to={dashboardPath} replace /> : <LoginPage />}
        />

        {/* ── WARGA ── */}
        <Route
          path="/warga"
          element={
            <ProtectedRoute allowedRoles={['warga']}>
              <WargaLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<WargaDashboard />} />
          <Route path="ronda" element={<WargaRonda />} />
          <Route path="kamtibmas" element={<WargaKamtibmas />} />
          <Route path="rumah-kosong" element={<WargaRumahKosong />} />
          <Route path="panic" element={<WargaPanic />} />
        </Route>

        {/* ── APARATUR DESA ── */}
        <Route
          path="/desa"
          element={
            <ProtectedRoute allowedRoles={['aparatur_desa']}>
              <DesaLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DesaDashboard />} />
          <Route path="penjadwalan-ronda" element={<PengaturanRonda />} />
          <Route path="scan-qr" element={<ScannerQR />} />
          <Route path="kamtibmas" element={<DesaKamtibmas />} />
          <Route path="rekap-rumah-kosong" element={<RekapRumahKosong />} />
          <Route path="manajemen-warga" element={<ManajemenWarga />} />
        </Route>

        {/* ── POLSEK ── */}
        <Route
          path="/polsek"
          element={
            <ProtectedRoute allowedRoles={['polsek']}>
              <PolsekLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PolsekDashboard />} />
          <Route path="manajemen-laporan" element={<ManajemenLaporan />} />
          <Route path="manajemen-linmas" element={<ManajemenLinmas />} />
          <Route path="riwayat-panic" element={<RiwayatPanicAlert />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={dashboardPath} replace />} />
      </Routes>
    </Suspense>
  )
}
