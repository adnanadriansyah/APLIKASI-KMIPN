<?php

namespace Database\Seeders;

use App\Models\Linmas;
use App\Models\Polsek;
use Illuminate\Database\Seeder;

class LinmasSeeder extends Seeder
{
    public function run(): void
    {
        $polsekId = Polsek::value('id');

        $linmasData = [
            [
                'nama' => 'Syamsul Rijal',
                'jabatan' => 'Ketua Linmas Gampong Kandang',
                'no_hp' => '083333333301',
                'wilayah_tugas' => 'Gampong Kandang - Lingkungan I',
            ],
            [
                'nama' => 'M. Thahir',
                'jabatan' => 'Anggota Linmas',
                'no_hp' => '083333333302',
                'wilayah_tugas' => 'Gampong Kandang - Lingkungan II',
            ],
            [
                'nama' => 'Ruslan',
                'jabatan' => 'Anggota Linmas',
                'no_hp' => '083333333303',
                'wilayah_tugas' => 'Gampong Kandang - Lingkungan III',
            ],
        ];

        foreach ($linmasData as $data) {
            Linmas::create(array_merge($data, [
                'polsek_id' => $polsekId,
            ]));
        }
    }
}
