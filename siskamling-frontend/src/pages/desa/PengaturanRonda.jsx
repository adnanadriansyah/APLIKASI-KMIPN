import { useEffect, useState, useCallback, useMemo } from 'react'
import { getJadwalRonda, createJadwalRonda } from '../../api/ronda'
import { getDusuns } from '../../api/warga'
import { getWarga } from '../../api/warga'
import { Card, Badge, Modal, LoadingSpinner } from '../../components'
import { useToast } from '../../components/Toast'

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export default function PengaturanRonda() {
  const toast = useToast()
  const [dusuns, setDusuns] = useState([])
  const [wargas, setWargas] = useState([])
  const [jadwal, setJadwal] = useState([])
  const [loading, setLoading] = useState(true)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDusun, setSelectedDusun] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [formDate, setFormDate] = useState('')
  const [formShift, setFormShift] = useState('shift_1')
  const [formPetugas, setFormPetugas] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      getDusuns().catch(() => ({ data: [] })),
      getWarga({ per_page: 100 }).catch(() => ({ data: [] })),
    ]).then(([d, w]) => {
      setDusuns(d.data || [])
      setWargas(w.data || [])
      if (d.data?.length > 0) setSelectedDusun(d.data[0].id)
    })
  }, [])

  const fetchJadwal = useCallback(() => {
    if (!selectedDusun) return
    setLoading(true)
    const bulan = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    getJadwalRonda({ dusun_id: selectedDusun, bulan, per_page: 50 })
      .then((res) => setJadwal(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedDusun, currentDate])

  useEffect(() => { fetchJadwal() }, [fetchJadwal])

  const filteredWargas = useMemo(() => {
    if (!selectedDusun) return []
    return wargas.filter((w) => w.dusun?.id === Number(selectedDusun))
  }, [wargas, selectedDusun])

  const jadwalByDate = useMemo(() => {
    const map = {}
    jadwal.forEach((j) => {
      if (!map[j.tanggal]) map[j.tanggal] = []
      map[j.tanggal].push(j)
    })
    return map
  }, [jadwal])

  const openForm = (dateStr) => {
    setFormDate(dateStr)
    setFormShift('shift_1')
    setFormPetugas([])
    setFormOpen(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!formDate || formPetugas.length === 0) {
      return toast.error('Pilih tanggal dan minimal 1 petugas')
    }

    setSubmitting(true)
    try {
      await createJadwalRonda({
        dusun_id: Number(selectedDusun),
        tanggal: formDate,
        shift: formShift,
        petugas_ids: formPetugas.map(Number),
      })
      setFormOpen(false)
      fetchJadwal()
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

  const togglePetugas = (id) => {
    setFormPetugas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== Number(id)) : [...prev, Number(id)]
    )
  }

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    return days
  }, [currentDate])

  const formatDate = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))

  const shiftLabel = (s) => s === 'shift_1' ? 'Malam (20:00–02:00)' : 'Subuh (02:00–06:00)'

  const statusColor = (s) => {
    if (s === 'berlangsung') return 'warning'
    if (s === 'selesai') return 'success'
    return 'info'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Penjadwalan Ronda</h1>
        <div className="flex items-center gap-3">
          <select value={selectedDusun} onChange={(e) => setSelectedDusun(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {dusuns.map((d) => <option key={d.id} value={d.id}>{d.nama}</option>)}
          </select>
        </div>
      </div>

      <Card>
        {loading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="px-3 py-1 text-sm rounded-lg hover:bg-gray-100">&larr; Sebelumnya</button>
              <h2 className="text-lg font-semibold text-gray-900">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button onClick={nextMonth} className="px-3 py-1 text-sm rounded-lg hover:bg-gray-100">Berikutnya &rarr;</button>
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {DAYS.map((day) => (
                <div key={day} className="bg-gray-50 px-2 py-2 text-center text-xs font-medium text-gray-500">{day}</div>
              ))}

              {calendarDays.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} className="bg-white min-h-[80px]" />
                const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
                const jadwalHari = jadwalByDate[dateStr] || []
                const isToday = dateStr === formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

                return (
                  <div key={dateStr} className="bg-white min-h-[80px] p-1.5 relative group">
                    <div className={`text-xs font-medium mb-1 ${isToday ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {jadwalHari.slice(0, 2).map((j) => (
                        <div key={j.id} className="text-[10px] leading-tight truncate px-1 py-0.5 rounded bg-blue-50 text-blue-700">
                          {j.shift === 'shift_1' ? '🌙' : '🌅'} {j.petugas?.length || 0}p
                        </div>
                      ))}
                      {jadwalHari.length > 2 && (
                        <div className="text-[10px] text-gray-400 px-1">+{jadwalHari.length - 2} lagi</div>
                      )}
                    </div>
                    <button
                      onClick={() => openForm(dateStr)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Card>

      {jadwal.length > 0 && (
        <Card title="Jadwal Bulan Ini">
          <div className="space-y-2">
            {jadwal.map((j) => (
              <div key={j.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-900">{j.tanggal}</div>
                  <Badge color={j.shift === 'shift_1' ? 'purple' : 'info'}>{shiftLabel(j.shift)}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{j.petugas?.length || 0} petugas</span>
                  <Badge color={statusColor(j.status)}>{j.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal isOpen={formOpen} onClose={() => !submitting && setFormOpen(false)} title={`Buat Jadwal Ronda - ${formDate}`} size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shift *</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setFormShift('shift_1')}
                className={`border-2 rounded-xl p-3 text-center transition-all ${formShift === 'shift_1' ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="text-lg mb-1">🌙</div>
                <div className="text-sm font-medium text-gray-800">Shift Malam</div>
                <div className="text-xs text-gray-500">20:00 – 02:00</div>
              </button>
              <button type="button" onClick={() => setFormShift('shift_2')}
                className={`border-2 rounded-xl p-3 text-center transition-all ${formShift === 'shift_2' ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="text-lg mb-1">🌅</div>
                <div className="text-sm font-medium text-gray-800">Shift Subuh</div>
                <div className="text-xs text-gray-500">02:00 – 06:00</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Petugas *</label>
            {filteredWargas.length === 0 ? (
              <p className="text-sm text-gray-400">Tidak ada warga di lingkungan ini</p>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-50">
                {filteredWargas.map((w) => (
                  <label key={w.id}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${formPetugas.includes(w.id) ? 'bg-blue-50' : ''}`}>
                    <input
                      type="checkbox"
                      checked={formPetugas.includes(w.id)}
                      onChange={() => togglePetugas(w.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{w.nama}</div>
                      {w.jabatan && <div className="text-xs text-gray-500">{w.jabatan}</div>}
                    </div>
                  </label>
                ))}
              </div>
            )}
            {formPetugas.length > 0 && (
              <div className="text-xs text-gray-400 mt-1">{formPetugas.length} petugas dipilih</div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setFormOpen(false)} disabled={submitting}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
              Batal
            </button>
            <button type="submit" disabled={submitting || formPetugas.length === 0}
              className="px-5 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {submitting ? 'Menyimpan...' : 'Buat Jadwal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
