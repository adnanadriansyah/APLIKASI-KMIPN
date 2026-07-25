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
    'credentials' => env('FIREBASE_CREDENTIALS', base_path('firebase-credentials.json')),

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
