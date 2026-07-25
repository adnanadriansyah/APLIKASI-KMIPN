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
        'kdrt' => 'KDRT',
        'narkoba' => 'Narkoba',
        'tawuran' => 'Tawuran',
        'pembunuhan' => 'Pembunuhan',
        'begal' => 'Begal',
    ],

    'status_kamtibmas' => [
        'baru' => 'Baru',
        'diproses' => 'Diproses',
        'selesai' => 'Selesai',
    ],

    'urgency_level_kamtibmas' => [
        'rendah' => 'Rendah',
        'sedang' => 'Sedang',
        'tinggi' => 'Tinggi',
    ],

    'status_rumah_kosong' => [
        'aktif' => 'Aktif',
        'selesai' => 'Selesai',
    ],

];
