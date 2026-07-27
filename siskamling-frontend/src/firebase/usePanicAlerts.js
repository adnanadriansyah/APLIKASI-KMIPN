import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from './firebase'

/**
 * Subscribe ke path panic_alerts/{polsekId} di Firebase Realtime Database.
 *
 * Backend menulis data dengan path:
 *   panic_alerts/{polsek_id}/{panic_id} = {
 *     id, user: { nama, phone }, latitude, longitude,
 *     status, created_at, responded_at
 *   }
 *
 * @param {number|null} polsekId - ID polsek yang sedang login
 * @returns {{ alerts: Array, loading: boolean, error: Error|null }}
 */
export function usePanicAlerts(polsekId) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!polsekId) {
      setAlerts([])
      setLoading(false)
      return
    }

    const panicRef = ref(db, `panic_alerts/${polsekId}`)

    const unsubscribe = onValue(
      panicRef,
      (snapshot) => {
        const val = snapshot.val()
        if (!val) {
          setAlerts([])
        } else {
          const list = Object.entries(val).map(([key, data]) => ({
            firebaseKey: key,
            ...data,
          }))
          // Sort terbaru di atas
          list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          setAlerts(list)
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
  }, [polsekId])

  return { alerts, loading, error }
}
