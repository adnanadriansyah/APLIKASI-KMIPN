import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { scanQrCode } from '../../api/ronda'
import { getDusuns } from '../../api/warga'
import { useRondaPresensi } from '../../firebase/useRondaPresensi'
import { Card, Badge, LoadingSpinner } from '../../components'
import { Html5Qrcode } from 'html5-qrcode'

export default function ScannerQR() {
  const { user } = useAuth()
  const scannerRef = useRef(null)
  const containerRef = useRef(null)
  const isScanningRef = useRef(false)
  const unmountedRef = useRef(false)

  const [scanning, setScanning] = useState(true)
  const [cameraError, setCameraError] = useState(null)

  const [scanResult, setScanResult] = useState(null)
  const [scanError, setScanError] = useState(null)

  const [manualCode, setManualCode] = useState('')
  const [manualLoading, setManualLoading] = useState(false)

  const [dusunId, setDusunId] = useState(user?.dusun_id || null)
  const [dusuns, setDusuns] = useState([])
  const [tanggal, setTanggal] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })

  const { presensi, loading: presensiLoading } = useRondaPresensi(dusunId, tanggal)

  useEffect(() => {
    if (!user?.dusun_id) {
      getDusuns()
        .then((res) => {
          const list = res.data || []
          setDusuns(list)
          if (list.length === 1) setDusunId(list[0].id)
        })
        .catch(console.error)
    }
  }, [user])

  const processScan = useCallback(async (code) => {
    setScanError(null)
    setScanResult(null)
    try {
      const res = await scanQrCode(code)
      setScanResult(res)
      if (res?.data?.tanggal) setTanggal(res.data.tanggal)
      if (res?.data?.dusun?.id && !user?.dusun_id) setDusunId(res.data.dusun.id)
    } catch (e) {
      setScanError(e.response?.data?.message || 'Gagal memproses QR code')
    }
  }, [user?.dusun_id])

  useEffect(() => {
    if (!containerRef.current) return
    unmountedRef.current = false

    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (unmountedRef.current || !isScanningRef.current) return
          isScanningRef.current = false
          try { scanner.stop() } catch {}
          setScanning(false)
          await processScan(decodedText)
        },
        () => {}
      )
      .then(() => {
        if (!unmountedRef.current) isScanningRef.current = true
      })
      .catch(() => {
        if (unmountedRef.current) return
        setScanning(false)
        setCameraError('Tidak dapat mengakses kamera. Gunakan input manual di bawah.')
      })

    return () => {
      unmountedRef.current = true
      if (isScanningRef.current) {
        try { scanner.stop() } catch {}
        isScanningRef.current = false
      }
      try { scanner.clear() } catch {}
    }
  }, [processScan])

  const restartCamera = () => {
    setScanResult(null)
    setScanError(null)
    setCameraError(null)
    setScanning(true)
    const scanner = scannerRef.current
    if (!scanner) {
      setScanning(false)
      setCameraError('Gagal memulai ulang kamera.')
      return
    }
    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (!isScanningRef.current) return
          isScanningRef.current = false
          try { scanner.stop() } catch {}
          setScanning(false)
          await processScan(decodedText)
        },
        () => {}
      )
      .then(() => {
        isScanningRef.current = true
      })
      .catch(() => {
        setScanning(false)
        setCameraError('Gagal memulai ulang kamera.')
      })
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    const code = manualCode.trim()
    if (!code) return
    setManualLoading(true)
    await processScan(code)
    setManualLoading(false)
    setManualCode('')
  }

  return (
    <div className="space-y-6">
      <style>{`
        #qr-reader video { transform: scaleX(-1); width: 100%; height: 100%; object-fit: cover; }
      `}</style>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scanner Presensi Ronda</h1>
        <p className="text-sm text-gray-500 mt-1">Scan QR Code warga atau masukkan kode secara manual</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kiri: Scanner + Manual Input */}
        <div className="space-y-6 overflow-hidden">
          <Card title="Scan QR Code">
            <div className="max-w-md mx-auto aspect-[4/3] rounded-lg overflow-hidden">
              <div id="qr-reader" ref={containerRef} />
            </div>

            {scanning && (
              <p className="text-sm text-gray-500 text-center mt-4">
                Arahkan kamera ke QR Code petugas ronda
              </p>
            )}

            {scanResult && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <Badge color="success">Berhasil</Badge>
                  {scanResult.data?.scanned_at && (
                    <span className="text-xs text-emerald-700 font-medium">
                      {new Date(scanResult.data.scanned_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                <div className="mt-3 text-left">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-gray-900">
                      {scanResult.data?.petugas?.nama || 'Absensi tercatat'}
                    </div>
                    <Badge color="success">Hadir</Badge>
                  </div>
                  {scanResult.data?.petugas?.jabatan && (
                    <div className="text-xs text-gray-500">{scanResult.data.petugas.jabatan}</div>
                  )}
                  {scanResult.data?.dusun?.nama && (
                    <div className="text-xs text-gray-500">
                      Lingkungan {scanResult.data.dusun.nama}
                      {scanResult.data.tanggal ? ` · ${scanResult.data.tanggal}` : ''}
                    </div>
                  )}
                </div>

                <button
                  onClick={restartCamera}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  Scan Lagi
                </button>
              </div>
            )}

            {scanError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                <Badge color="danger">Gagal</Badge>
                <p className="text-sm text-red-700 mt-2">{scanError}</p>
                <button
                  onClick={restartCamera}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {cameraError && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700 text-center">{cameraError}</p>
              </div>
            )}
          </Card>

          <Card title="Input Manual">
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Masukkan kode QR..."
                disabled={manualLoading}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={manualLoading || !manualCode.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {manualLoading ? 'Proses...' : 'Proses'}
              </button>
            </form>
          </Card>
        </div>

        {/* Kanan: Scan Terakhir */}
        <Card
          title="Scan Terakhir"
          subtitle={
            <span className="text-xs text-gray-400">
              Update real-time dari Firebase
            </span>
          }
        >
          <div className="space-y-3 mb-4">
            {!user?.dusun_id && dusuns.length > 1 && (
              <select
                value={dusunId || ''}
                onChange={(e) => setDusunId(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Lingkungan</option>
                {dusuns.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama}
                  </option>
                ))}
              </select>
            )}
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {presensiLoading ? (
            <LoadingSpinner className="py-12" />
          ) : presensi.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400">Belum ada scan hari ini</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {presensi.map((item) => (
                <div
                  key={item.petugasId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {item.nama}
                    </div>
                    <div className="text-xs text-gray-500">{item.jabatan || '-'}</div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <Badge color={item.status_hadir === 'hadir' ? 'success' : 'warning'}>
                      {item.status_hadir === 'hadir' ? 'Hadir' : 'Tidak Hadir'}
                    </Badge>
                    <div className="text-xs text-gray-400 mt-1">
                      {item.scanned_at
                        ? new Date(item.scanned_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
