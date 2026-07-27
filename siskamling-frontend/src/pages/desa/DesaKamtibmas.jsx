import { useEffect, useState } from 'react'
import { getKamtibmas, updateKamtibmasStatus } from '../../api/kamtibmas'
import { Card, Table, Badge, LoadingSpinner } from '../../components'

export default function DesaKamtibmas() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    getKamtibmas()
      .then((res) => setData(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleStatus = async (id, status) => {
    await updateKamtibmasStatus(id, status)
    load()
  }

  const statusColor = (s) => s === 'baru' ? 'danger' : s === 'diproses' ? 'warning' : 'success'

  const columns = [
    { key: 'kategori', label: 'Kategori' },
    { key: 'lokasi_text', label: 'Lokasi' },
    { key: 'created_at', label: 'Waktu' },
    { key: 'status', label: 'Status', render: (r) => <Badge color={statusColor(r.status)}>{r.status}</Badge> },
    { key: 'aksi', label: 'Aksi', render: (r) => (
      <div className="flex gap-1">
        {r.status === 'baru' && <button onClick={() => handleStatus(r.id, 'diproses')} className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">Proses</button>}
        {r.status === 'diproses' && <button onClick={() => handleStatus(r.id, 'selesai')} className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">Selesai</button>}
      </div>
    )},
  ]

  if (loading) return <LoadingSpinner className="py-20" />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Laporan Kamtibmas</h1>
      <Card>
        <Table columns={columns} data={data} emptyText="Belum ada laporan" />
      </Card>
    </div>
  )
}
