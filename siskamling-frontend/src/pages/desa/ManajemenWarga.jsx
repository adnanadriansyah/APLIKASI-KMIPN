import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getWarga, createWarga, updateWarga, deleteWarga, getDusuns } from '../../api/warga'
import { Card, Table, Badge, Modal, LoadingSpinner } from '../../components'
import { useToast } from '../../components/Toast'

export default function ManajemenWarga() {
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const [data, setData] = useState([])
  const [dusuns, setDusuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)
  const [search, setSearch] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ nama: '', email: '', phone: '', nik: '', alamat: '', dusun_id: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback((p = 1, q = '') => {
    setLoading(true)
    const params = { page: p, per_page: 10 }
    if (q) params.search = q
    getWarga(params)
      .then((res) => {
        setData(res.data || [])
        setMeta(res.meta || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData(page, search) }, [page, search, fetchData])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setSearch(q)
      setPage(1)
    }
  }, [searchParams])

  useEffect(() => {
    getDusuns().then((res) => setDusuns(res.data || [])).catch(console.error)
  }, [])

  const handleSearch = () => {
    setPage(1)
    fetchData(1, search)
  }

  const openAdd = () => {
    setEditId(null)
    setForm({ nama: '', email: '', phone: '', nik: '', alamat: '', dusun_id: dusuns[0]?.id || '', password: '' })
    setFormOpen(true)
  }

  const openEdit = (row) => {
    setEditId(row.id)
    setForm({
      nama: row.nama || '',
      email: row.email || '',
      phone: row.phone || '',
      nik: row.nik || '',
      alamat: row.alamat || '',
      dusun_id: row.dusun?.id || '',
      password: '',
    })
    setFormOpen(true)
  }

  const resetForm = () => {
    setEditId(null)
    setForm({ nama: '', email: '', phone: '', nik: '', alamat: '', dusun_id: '', password: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nama.trim() || !form.email.trim() || !form.dusun_id) {
      return toast.error('Nama, email, dan lingkungan wajib diisi')
    }
    if (!editId && !form.password) {
      return toast.error('Password wajib diisi untuk warga baru')
    }

    setSubmitting(true)
    try {
      const payload = {
        nama: form.nama.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        nik: form.nik.trim() || undefined,
        alamat: form.alamat.trim() || undefined,
        dusun_id: Number(form.dusun_id),
      }
      if (!editId) {
        payload.password = form.password
      } else if (form.password) {
        payload.password = form.password
      }

      if (editId) {
        await updateWarga(editId, payload)
      } else {
        await createWarga(payload)
      }
      setFormOpen(false)
      resetForm()
      fetchData(page, search)
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

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteWarga(deleteId)
      setDeleteId(null)
      fetchData(page, search)
    } catch (e) {
      toast.error('Gagal menghapus: ' + (e.response?.data?.message || e.message))
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'nama', label: 'Nama' },
    {
      key: 'jabatan', label: 'Jabatan',
      render: (r) => r.jabatan ? <Badge color="purple">{r.jabatan}</Badge> : <span className="text-gray-400">-</span>,
    },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'No. HP', render: (r) => r.phone || '-' },
    { key: 'dusun', label: 'Lingkungan', render: (r) => r.dusun?.nama || '-' },
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
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Warga</h1>
        <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + Tambah Warga
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Cari nama, email, NIK, atau HP..."
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={handleSearch} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
          Cari
        </button>
      </div>

      <Card>
        {loading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <Table columns={columns} data={data} emptyText="Belum ada data warga" />
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
        title={editId ? 'Edit Warga' : 'Tambah Warga Baru'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
              <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
              <input type="text" value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lingkungan *</label>
              <select value={form.dusun_id} onChange={(e) => setForm({ ...form, dusun_id: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">Pilih Lingkungan</option>
                {dusuns.map((d) => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <input type="text" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {editId ? '(kosongkan jika tidak diubah)' : '*'}
              </label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...(!editId ? { required: true } : {})} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => { setFormOpen(false); resetForm(); }} disabled={submitting}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
              Batal
            </button>
            <button type="submit" disabled={submitting}
              className="px-5 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {submitting ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah Warga'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Warga" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Apakah Anda yakin ingin menghapus warga ini? Tindakan ini tidak dapat dibatalkan.</p>
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
