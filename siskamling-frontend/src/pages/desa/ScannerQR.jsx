import { useEffect, useRef, useState } from 'react'
import { scanQrCode } from '../../api/ronda'
import { Card, Badge } from '../../components'
import { Html5Qrcode } from 'html5-qrcode'

export default function ScannerQR() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [scanning, setScanning] = useState(true)
  const scannerRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          scanner.stop().catch(() => {})
          setScanning(false)
          try {
            const res = await scanQrCode(decodedText)
            setResult(res)
            setError(null)
          } catch (e) {
            setError(e.response?.data?.message || 'Gagal memproses QR code')
            setResult(null)
          }
        },
        () => {}
      )
      .catch(() => {
        setScanning(false)
        setError('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.')
      })

    return () => {
      scanner.stop().catch(() => {})
      scanner.clear().catch(() => {})
    }
  }, [])

  const restart = () => {
    setResult(null)
    setError(null)
    setScanning(true)
    scannerRef.current?.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        scannerRef.current?.stop().catch(() => {})
        setScanning(false)
        try {
          const res = await scanQrCode(decodedText)
          setResult(res)
          setError(null)
        } catch (e) {
          setError(e.response?.data?.message || 'Gagal memproses QR code')
        }
      },
      () => {}
    ).catch(() => setError('Gagal memulai ulang kamera'))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Scan QR Presensi</h1>

      <Card className="max-w-md mx-auto">
        <div id="qr-reader" ref={containerRef} className="rounded-lg overflow-hidden" />

        {scanning && (
          <p className="text-sm text-gray-500 text-center mt-4">
            Arahkan kamera ke QR Code petugas ronda
          </p>
        )}

        {result && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
            <Badge color="success">Berhasil</Badge>
            <p className="text-sm text-gray-700 mt-2">
              Absensi tercatat untuk jadwal ronda.
            </p>
            <button onClick={restart} className="mt-3 text-sm text-blue-600 hover:underline">
              Scan Lagi
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            <Badge color="danger">Gagal</Badge>
            <p className="text-sm text-red-700 mt-2">{error}</p>
            <button onClick={restart} className="mt-3 text-sm text-blue-600 hover:underline">
              Coba Lagi
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}
