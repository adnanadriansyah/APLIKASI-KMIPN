<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Firebase Credentials
    |--------------------------------------------------------------------------
    |
    | Path ke file service account JSON yang diunduh dari Firebase Console
    | (Project Settings > Service Accounts > Generate New Private Key).
    |
    */
    'credentials' => (function () {
        $value = env('FIREBASE_CREDENTIALS');

        if (! $value) {
            return base_path('firebase-credentials.json');
        }

        // Absolute path (unix '/', windows 'C:\') -> pakai langsung.
        if (str_starts_with($value, '/') || preg_match('/^[A-Za-z]:[\\\\\/]/', $value)) {
            return $value;
        }

        // Relative path -> resolve dari base_path agar tidak bergantung CWD.
        return base_path($value);
    })(),

    /*
    |--------------------------------------------------------------------------
    | Firebase Realtime Database URL
    |--------------------------------------------------------------------------
    |
    | URL database Realtime Database proyek Firebase.
    | Format: https://<project-id>-default-rtdb.<region>.firebasedatabase.app
    |
    */
    'database_url' => env('FIREBASE_DATABASE_URL'),

];
