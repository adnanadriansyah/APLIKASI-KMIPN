<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Kategori Laporan Kamtibmas
    |--------------------------------------------------------------------------
    |
    | Daftar kategori laporan kamtibmas yang valid. Digunakan di backend
    | (validation, query) dan frontend (dropdown, filter).
    | Ubah di sini saja jika ada penambahan/pengurusan kategori.
    |
    */

    'kategori_kamtibmas' => [
        'pencurian' => 'Pencurian',
        'mencurigakan' => 'Mencurigakan',
        'vandalisme' => 'Vandalisme',
        'kebakaran' => 'Kebakaran',
        'keributan' => 'Keributan',
        'lainnya' => 'Lainnya',
    ],

    'status_kamtibmas' => [
        'baru' => 'Baru',
        'diproses' => 'Diproses',
        'selesai' => 'Selesai',
    ],

    'status_rumah_kosong' => [
        'aktif' => 'Aktif',
        'selesai' => 'Selesai',
    ],

];
