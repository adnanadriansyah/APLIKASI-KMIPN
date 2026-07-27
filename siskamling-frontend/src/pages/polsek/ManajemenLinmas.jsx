import { useEffect, useState, useCallback } from 'react'
import { getLinmas, createLinmas, updateLinmas, deleteLinmas } from '../../api/linmas'
import { Card, Table, Modal, LoadingSpinner } from '../../components'

export default function ManajemenLinmas() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ nama: '', jabatan: '', no_hp: '', wilayah_tugas: '' })
  const [submitting, setSubmitting] = useState(false)

  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback((p = 1) => {
    setLoading(true)
    getLinmas({ page: p, per_page: 10 })
      .then((res) => {
        setData(res.data || [])
        setMeta(res.meta || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData(page) }, [page, fetchData])

  const openAdd = () => {
    setEditId(null)
    setForm({ nama: '', jabatan: '', no_hp: '', wilayah_tugas: '' })
    setFormOpen(true)
  }

  const openEdit = (row) => {
    setEditId(row.id)
    setForm({
      nama: row.nama || '',
      jabatan: row.jabatan || '',
      no_hp: row.no_hp || '',
      wilayah_tugas: row.wilayah_tugas || '',
    })
    setFormOpen(true)
  }

  const resetForm = () => {
    setEditId(null)
    setForm({ nama: '', jabatan: '', no_hp: '', wilayah_tugas: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nama.trim()) return alert('Nama wajib diisi')

    setSubmitting(true)
    try {
      const payload = {
        nama: form.nama.trim(),
        jabatan: form.jabatan.trim() || undefined,
        no_hp: form.no_hp.trim() || undefined,
        wilayah_tugas: form.wilayah_tugas.trim() || undefined,
      }

      if (editId) {
        await updateLinmas(editId, payload)
      } else {
        await createLinmas(payload)
      }
      setFormOpen(false)
      resetForm()
      fetchData(page)
    } catch (err) {
      const msg = err.response?.data?.message || err.message
      const errors = err.response?.data?.errors
      if (errors) {
        const first = Object.values(errors)[0]
        alert('Validasi gagal: ' + (Array.isArray(first) ? first[0] : first))
      } else {
        alert('Gagal: ' + msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteLinmas(deleteId)
      setDeleteId(null)
      fetchData(page)
    } catch (e) {
      alert('Gagal menghapus: ' + (e.response?.data?.message || e.message))
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'nama', label: 'Nama' },
    { key: 'jabatan', label: 'Jabatan', render: (r) => r.jabatan || '-' },
    { key: 'no_hp', label: 'No. HP', render: (r) => r.no_hp || '-' },
    { key: 'wilayah_tugas', label: 'Wilayah Tugas', render: (r) => r.wilayah_tugas || '-' },
    {
      key: 'aksi', label: 'Aksi',
      render: (r) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
            Edit
          </button>
          <button onClick={() => setDeleteId(r.id)} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">
            Hapus
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Linmas</h1>
        <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + Tambah Anggota
        </button>
      </div>

      <Card>
        {loading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <Table columns={columns} data={data} emptyText="Belum ada anggota linmas" />
        )}
      </Card>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
            Sebelumnya
          </button>
          <span className="text-sm text-gray-500">Halaman {meta.current_page} / {meta.last_page}</span>
          <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={page >= meta.last_page}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
            Berikutnya
          </button>
        </div>
      )}

      {/* Form Modal */}
      <Modal isOpen={formOpen} onClose={() => { if (!submitting) { setFormOpen(false); resetForm(); } }}
        title={editId ? 'Edit Anggota Linmas' : 'Tambah Anggota Linmas'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
            <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
            <input type="text" value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
              placeholder="Contoh: Kepala Regu" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
            <input type="text" value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah Tugas</label>
            <input type="text" value={form.wilayah_tugas} onChange={(e) => setForm({ ...form, wilayah_tugas: e.target.value })}
              placeholder="Contoh: Lingkungan I" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => { setFormOpen(false); resetForm(); }} disabled={submitting}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
              Batal
            </button>
            <button type="submit" disabled={submitting || !form.nama.trim()}
              className="px-5 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {submitting ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah Anggota'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Anggota Linmas" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Apakah Anda yakin ingin menghapus anggota linmas ini?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteId(null)} disabled={deleting}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
              Batal
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="px-5 py-2 text-sm rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
              {deleting ? 'Menghapus...' : 'Ya, Hapus'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
