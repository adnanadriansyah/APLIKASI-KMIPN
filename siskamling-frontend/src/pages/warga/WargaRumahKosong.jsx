import { useEffect, useState, useCallback } from 'react'
import { getRumahKosong, createRumahKosong } from '../../api/rumahKosong'
import { Card, Table, Badge, Modal, LoadingSpinner } from '../../components'
import { useToast } from '../../components/Toast'

export default function WargaRumahKosong() {
  const toast = useToast()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)

  const [formOpen, setFormOpen] = useState(false)
  const [alamat, setAlamat] = useState('')
  const [tanggalBerangkat, setTanggalBerangkat] = useState('')
  const [tanggalPulang, setTanggalPulang] = useState('')
  const [kontakDarurat, setKontakDarurat] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback((p = 1) => {
    setLoading(true)
    getRumahKosong({ page: p, per_page: 10 })
      .then((res) => {
        setData(res.data || [])
        setMeta(res.meta || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData(page) }, [page, fetchData])

  const resetForm = () => {
    setAlamat('')
    setTanggalBerangkat('')
    setTanggalPulang('')
    setKontakDarurat('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!alamat.trim()) return toast.error('Alamat rumah wajib diisi')
    if (!tanggalBerangkat) return toast.error('Tanggal berangkat wajib diisi')
    if (!tanggalPulang) return toast.error('Tanggal pulang wajib diisi')
    if (tanggalPulang <= tanggalBerangkat) return toast.error('Tanggal pulang harus setelah tanggal berangkat')

    setSubmitting(true)
    try {
      await createRumahKosong({
        alamat: alamat.trim(),
        tanggal_berangkat: tanggalBerangkat,
        tanggal_pulang: tanggalPulang,
        kontak_darurat: kontakDarurat.trim() || undefined,
      })
      toast.success('Laporan rumah kosong berhasil dibuat!')
      setFormOpen(false)
      resetForm()
      fetchData(1)
      setPage(1)
    } catch (err) {
      const msg = err.response?.data?.message || err.message
      const errors = err.response?.data?.errors
      if (errors) {
        const first = Object.values(errors)[0]
        toast.error('Validasi gagal: ' + (Array.isArray(first) ? first[0] : first))
      } else {
        toast.error('Gagal: ' + msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    { key: 'alamat', label: 'Alamat' },
    {
      key: 'tanggal_berangkat', label: 'Berangkat',
      render: (r) => new Date(r.tanggal_berangkat).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    },
    {
      key: 'tanggal_pulang', label: 'Pulang',
      render: (r) => new Date(r.tanggal_pulang).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    },
    { key: 'kontak_darurat', label: 'Kontak Darurat', render: (r) => r.kontak_darurat || '-' },
    {
      key: 'status', label: 'Status',
      render: (r) => <Badge color={r.status === 'aktif' ? 'warning' : 'success'}>{r.status === 'aktif' ? 'Aktif' : 'Selesai'}</Badge>,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Lapor Rumah Kosong</h1>
        <button
          onClick={() => setFormOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Lapor Rumah Kosong
        </button>
      </div>

      <Card>
        {loading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <Table columns={columns} data={data} emptyText="Belum ada laporan rumah kosong" />
        )}
      </Card>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-gray-500">Halaman {meta.current_page} / {meta.last_page}</span>
          <button
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            disabled={page >= meta.last_page}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      )}

      <Modal isOpen={formOpen} onClose={() => { if (!submitting) { setFormOpen(false); resetForm(); } }} title="Lapor Rumah Kosong">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
            Laporkan jika Anda atau tetangga akan meninggalkan rumah dalam waktu tertentu agar bisa dipantau oleh petugas ronda.
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Rumah *</label>
            <input
              type="text"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Contoh: Jl. Meunasah No. 12, Lingkungan II"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Berangkat *</label>
              <input
                type="date"
                value={tanggalBerangkat}
                onChange={(e) => setTanggalBerangkat(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pulang *</label>
              <input
                type="date"
                value={tanggalPulang}
                onChange={(e) => setTanggalPulang(e.target.value)}
                min={tanggalBerangkat || new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kontak Darurat</label>
            <input
              type="text"
              value={kontakDarurat}
              onChange={(e) => setKontakDarurat(e.target.value)}
              placeholder="Nomor HP yang bisa dihubungi"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { setFormOpen(false); resetForm(); }}
              disabled={submitting}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !alamat.trim() || !tanggalBerangkat || !tanggalPulang}
              className="px-5 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
