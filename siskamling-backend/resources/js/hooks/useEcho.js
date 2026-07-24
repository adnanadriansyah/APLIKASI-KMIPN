/**
 * Contoh integrasi Laravel Echo + Reverb untuk frontend React.
 *
 * Instalasi npm packages:
 *   npm install laravel-echo pusher-js
 *
 * Pastikan .env frontend (atau Vite env) berisi:
 *   VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
 *   VITE_REVERB_HOST="${REVERB_HOST}"
 *   VITE_REVERB_PORT=${REVERB_PORT}
 *   VITE_REVERB_SCHEME=${REVERB_SCHEME}
 */

import { useEffect, useState } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echoInstance = null;

function getEcho() {
    if (echoInstance) return echoInstance;

    window.Pusher = Pusher;

    echoInstance = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
        wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
        // Token untuk otorisasi channel privat — ambil dari cookie/session Sanctum
        authEndpoint: '/broadcasting/auth',
        auth: {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
            },
        },
    });

    return echoInstance;
}

export function useEcho(polsekId) {
    const [panic, setPanic] = useState(null);

    useEffect(() => {
        if (!polsekId) return;

        const echo = getEcho();

        const channel = echo.private(`polsek.${polsekId}`);

        channel.listen('.panic.triggered', (e) => {
            console.log('[PanicTriggered]', e);
            setPanic(e);
        });

        return () => {
            channel.stopListening('.panic.triggered');
            echo.leave(`polsek.${polsekId}`);
        };
    }, [polsekId]);

    return panic;
}

// ============================================================
// Contoh penggunaan di komponen Dashboard Polsek:
//
// import { useEcho } from '@/hooks/useEcho';
//
// function DashboardPolsek() {
//   const polsekId = 1; // dari API /me atau dari konteks user
//   const panic = useEcho(polsekId);
//
//   useEffect(() => {
//     if (panic) {
//       alert(`Panic dari ${panic.user.nama} di (${panic.latitude}, ${panic.longitude})`);
//     }
//   }, [panic]);
//
//   return <div>{panic && <PanicCard data={panic} />}</div>;
// }
// ============================================================
