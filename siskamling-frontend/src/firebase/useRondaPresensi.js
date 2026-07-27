import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from './firebase'

/**
 * Subscribe ke path ronda_presensi/{dusunId}/{tanggal} di Firebase Realtime Database.
 *
 * Backend menulis data dengan path:
 *   ronda_presensi/{dusun_id}/{tanggal}/{petugas_id} = {
 *     user_id, nama, jabatan, status_hadir, scanned_at
 *   }
 *
 * @param {number|null} dusunId - ID dusun/lingkungan
 * @param {string|null} tanggal - Format YYYY-MM-DD
 * @returns {{ presensi: Array, loading: boolean, error: Error|null }}
 */
export function useRondaPresensi(dusunId, tanggal) {
  const [presensi, setPresensi] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!dusunId || !tanggal) {
      setPresensi([])
      setLoading(false)
      return
    }

    const path = `ronda_presensi/${dusunId}/${tanggal}`
    const presensiRef = ref(db, path)

    const unsubscribe = onValue(
      presensiRef,
      (snapshot) => {
        const val = snapshot.val()
        if (!val) {
          setPresensi([])
        } else {
          const list = Object.entries(val).map(([petugasId, data]) => ({
            petugasId,
            ...data,
          }))
          // Sort berdasarkan waktu scan (terbaru di atas)
          list.sort((a, b) => {
            if (!a.scanned_at) return 1
            if (!b.scanned_at) return -1
            return new Date(b.scanned_at) - new Date(a.scanned_at)
          })
          setPresensi(list)
        }
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [dusunId, tanggal])

  return { presensi, loading, error }
}
