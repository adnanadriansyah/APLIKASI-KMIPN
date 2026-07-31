import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getRumahKosong, createRumahKosong, updateRumahKosong, deleteRumahKosong } from '../../api/rumahKosong'
import { Card, Table, Badge, Modal, LoadingSpinner } from '../../components'
import { useToast } from '../../components/Toast'

export default function WargaRumahKosong() {
  const toast = useToast()
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [namaPenghuni, setNamaPenghuni] = useState('')
  const [alamat, setAlamat] = useState('')
  const [tanggalBerangkat, setTanggalBerangkat] = useState('')
  const [tanggalPulang, setTanggalPulang] = useState('')
  const [kontakDarurat, setKontakDarurat] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailData, setDetailData] = useState(null)

  const todayStr = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const isOverdue = (r) => r.status === 'aktif' && r.tanggal_pulang < todayStr()

  const formatDate = (value) =>
    new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

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
    setNamaPenghuni(user?.nama || '')
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
      const payload = {
        nama_penghuni: namaPenghuni.trim() || undefined,
        alamat: alamat.trim(),
        tanggal_berangkat: tanggalBerangkat,
        tanggal_pulang: tanggalPulang,
        kontak_darurat: kontakDarurat.trim() || undefined,
      }

      if (editId) {
        await updateRumahKosong(editId, payload)
        toast.success('Laporan rumah kosong berhasil diperbarui!')
      } else {
        await createRumahKosong(payload)
        toast.success('Laporan rumah kosong berhasil dibuat!')
      }
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

  const handleSelesai = async (id) => {
    setSubmitting(true)
    try {
      await updateRumahKosong(id, { status: 'selesai' })
      toast.success('Laporan ditandai selesai. Selamat kembali!')
      fetchData(page)
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus laporan rumah kosong ini?')) return
    setSubmitting(true)
    try {
      await deleteRumahKosong(id)
      toast.success('Laporan dihapus.')
      fetchData(page)
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const openForm = () => {
    setEditId(null)
    setNamaPenghuni(user?.nama || '')
    setAlamat('')
    setTanggalBerangkat('')
    setTanggalPulang('')
    setKontakDarurat('')
    setFormOpen(true)
  }

  const openEdit = (row) => {
    setEditId(row.id)
    setNamaPenghuni(row.nama_penghuni || '')
    setAlamat(row.alamat || '')
    setTanggalBerangkat(row.tanggal_berangkat || '')
    setTanggalPulang(row.tanggal_pulang || '')
    setKontakDarurat(row.kontak_darurat || '')
    setFormOpen(true)
  }

  const columns = [
    { key: 'alamat', label: 'Alamat' },
    { key: 'nama_penghuni', label: 'Penghuni', render: (r) => r.nama_penghuni || '-' },
    {
      key: 'tanggal_berangkat', label: 'Berangkat',
      render: (r) => formatDate(r.tanggal_berangkat),
    },
    {
      key: 'tanggal_pulang', label: 'Pulang',
      render: (r) => formatDate(r.tanggal_pulang),
    },
    { key: 'kontak_darurat', label: 'Kontak Darurat', render: (r) => r.kontak_darurat || '-' },
    {
      key: 'status', label: 'Status',
      render: (r) => {
        if (r.status === 'selesai') return <Badge color="success">Selesai</Badge>
        return isOverdue(r)
          ? <Badge color="danger">Melewati Jadwal</Badge>
          : <Badge color="warning">Aktif</Badge>
      },
    },
    {
      key: 'aksi', label: 'Aksi',
      render: (r) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setDetailData(r); setDetailOpen(true) }}
            className="text-xs text-blue-600 hover:underline"
          >
            Detail
          </button>
          {r.status === 'aktif' && (
            <>
              <button
                onClick={() => openEdit(r)}
                disabled={submitting}
                className="text-xs text-blue-600 hover:underline disabled:opacity-50"
              >
                Edit
              </button>
              <button
                onClick={() => handleSelesai(r.id)}
                disabled={submitting}
                className="text-xs text-emerald-600 hover:underline disabled:opacity-50"
              >
                Tandai Selesai
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                disabled={submitting}
                className="text-xs text-red-600 hover:underline disabled:opacity-50"
              >
                Hapus
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Lapor Rumah Kosong</h1>
        <button
          onClick={openForm}
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

      <Modal isOpen={formOpen} onClose={() => { if (!submitting) { setFormOpen(false); resetForm(); } }} title={editId ? 'Edit Laporan Rumah Kosong' : 'Lapor Rumah Kosong'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
            Laporkan jika Anda atau tetangga akan meninggalkan rumah dalam waktu tertentu agar bisa dipantau oleh petugas ronda.
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Pemilik / Penghuni
              <span className="text-gray-400 font-normal"> (opsional)</span>
            </label>
            <input
              type="text"
              value={namaPenghuni}
              onChange={(e) => setNamaPenghuni(e.target.value)}
              placeholder="Kosongkan jika rumah milik sendiri"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              {submitting ? 'Mengirim...' : (editId ? 'Simpan Perubahan' : 'Kirim Laporan')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={detailOpen}
        onClose={() => { setDetailOpen(false); setDetailData(null) }}
        title="Detail Rumah Kosong"
        size="lg"
      >
        {detailData && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold text-gray-900">{detailData.alamat}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Dibuat pada {new Date(detailData.created_at).toLocaleString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </div>
              </div>
              {detailData.status === 'selesai'
                ? <Badge color="success">Selesai</Badge>
                : isOverdue(detailData)
                  ? <Badge color="danger">Melewati Jadwal</Badge>
                  : <Badge color="warning">Aktif</Badge>}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-400">Tanggal Berangkat</div>
                <div className="font-medium text-gray-900">{formatDate(detailData.tanggal_berangkat)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-400">Tanggal Pulang</div>
                <div className="font-medium text-gray-900">{formatDate(detailData.tanggal_pulang)}</div>
              </div>
            </div>

            <div className="text-sm">
              <div className="text-xs text-gray-400 mb-1">Nama Pemilik / Penghuni</div>
              <div className="font-medium text-gray-900">{detailData.nama_penghuni || '-'}</div>
            </div>

            <div className="text-sm">
              <div className="text-xs text-gray-400 mb-1">Kontak Darurat</div>
              <div className="font-medium text-gray-900">{detailData.kontak_darurat || '-'}</div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              {detailData.status === 'aktif' && (
                <>
                  <button
                    onClick={() => handleDelete(detailData.id)}
                    disabled={submitting}
                    className="px-4 py-2 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Hapus Laporan
                  </button>
                  <button
                    onClick={() => { openEdit(detailData); setDetailOpen(false) }}
                    disabled={submitting}
                    className="px-5 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    Edit Laporan
                  </button>
                  <button
                    onClick={() => { handleSelesai(detailData.id); setDetailOpen(false) }}
                    disabled={submitting}
                    className="px-5 py-2 text-sm rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Tandai Sudah Pulang
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
