<?php

namespace Database\Seeders;

use App\Models\Desa;
use App\Models\Polsek;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password');

        $aparaturDesaRoleId = Role::where('name', 'aparatur_desa')->value('id');
        $polsekRoleId = Role::where('name', 'polsek')->value('id');
        $wargaRoleId = Role::where('name', 'warga')->value('id');

        $desaId = Desa::value('id');
        $polsekId = Polsek::value('id');

        // Aparatur Gampong (4 akun)
        $aparaturUsers = [
            [
                'nama' => 'Mukhtar',
                'email' => 'keuchik@gampong.test',
                'phone' => '081111111101',
                'nik' => '1111111111111001',
                'alamat' => 'Kantor Gampong Kandang',
                'jabatan' => 'Keuchik',
            ],
            [
                'nama' => 'Faridah',
                'email' => 'sekdes@gampong.test',
                'phone' => '081111111102',
                'nik' => '1111111111111002',
                'alamat' => 'Kantor Gampong Kandang',
                'jabatan' => 'Sekretaris Desa',
            ],
            [
                'nama' => 'Abdul Hamid',
                'email' => 'tuhapeut@gampong.test',
                'phone' => '081111111103',
                'nik' => '1111111111111003',
                'alamat' => 'Lingkungan I, Gampong Kandang',
                'jabatan' => 'Tuha Peut',
            ],
            [
                'nama' => 'Nurbaiti',
                'email' => 'kaur@gampong.test',
                'phone' => '081111111104',
                'nik' => '1111111111111004',
                'alamat' => 'Lingkungan II, Gampong Kandang',
                'jabatan' => 'Kaur Pemerintahan',
            ],
        ];

        foreach ($aparaturUsers as $data) {
            User::create(array_merge($data, [
                'role_id' => $aparaturDesaRoleId,
                'dusun_id' => null,
                'desa_id' => $desaId,
                'password' => $password,
            ]));
        }

        // Polsek Muara Dua (4 akun)
        $polsekUsers = [
            [
                'nama' => 'Iptu Santoso',
                'email' => 'kapolsek@polsek.test',
                'phone' => '082222222201',
                'nik' => '2222222222222001',
                'alamat' => 'Mapolsek Muara Dua',
                'jabatan' => 'Kapolsek',
            ],
            [
                'nama' => 'Aipda Rahmat',
                'email' => 'kanitbinmas@polsek.test',
                'phone' => '082222222202',
                'nik' => '2222222222222002',
                'alamat' => 'Mapolsek Muara Dua',
                'jabatan' => 'Kanit Binmas',
            ],
            [
                'nama' => 'Bripka Faisal',
                'email' => 'bhabinkamtibmas@polsek.test',
                'phone' => '082222222203',
                'nik' => '2222222222222003',
                'alamat' => 'Lingkungan I, Gampong Kandang',
                'jabatan' => 'Bhabinkamtibmas',
            ],
            [
                'nama' => 'Bripda Hendra',
                'email' => 'spkt@polsek.test',
                'phone' => '082222222204',
                'nik' => '2222222222222004',
                'alamat' => 'Mapolsek Muara Dua',
                'jabatan' => 'Personel SPKT',
            ],
        ];

        foreach ($polsekUsers as $data) {
            User::create(array_merge($data, [
                'role_id' => $polsekRoleId,
                'dusun_id' => null,
                'polsek_id' => $polsekId,
                'password' => $password,
            ]));
        }

        // Warga per Lingkungan
        $lingkunganData = [
            1 => [ // Lingkungan I
                ['nama' => 'Hasanuddin', 'email' => 'koordinator1@gampong.test', 'phone' => '085111111101', 'nik' => '4444444444444101', 'alamat' => 'Lingkungan I, Gampong Kandang', 'jabatan' => 'Ketua (Koordinator Warga)'],
                ['nama' => 'Jamaluddin', 'email' => 'warga1_1@gampong.test', 'phone' => '085111111102', 'nik' => '4444444444444102', 'alamat' => 'Lingkungan I, Gampong Kandang', 'jabatan' => null],
                ['nama' => 'Rohani', 'email' => 'warga1_2@gampong.test', 'phone' => '085111111103', 'nik' => '4444444444444103', 'alamat' => 'Lingkungan I, Gampong Kandang', 'jabatan' => null],
                ['nama' => 'Siti Aminah', 'email' => 'warga1_3@gampong.test', 'phone' => '085111111104', 'nik' => '4444444444444104', 'alamat' => 'Lingkungan I, Gampong Kandang', 'jabatan' => null],
                ['nama' => 'Muhammad Yunus', 'email' => 'warga1_4@gampong.test', 'phone' => '085111111105', 'nik' => '4444444444444105', 'alamat' => 'Lingkungan I, Gampong Kandang', 'jabatan' => null],
            ],
            2 => [ // Lingkungan II
                ['nama' => 'Tarmizi', 'email' => 'koordinator2@gampong.test', 'phone' => '085222222201', 'nik' => '4444444444444201', 'alamat' => 'Lingkungan II, Gampong Kandang', 'jabatan' => 'Ketua (Koordinator Warga)'],
                ['nama' => 'Zainuddin', 'email' => 'warga2_1@gampong.test', 'phone' => '085222222202', 'nik' => '4444444444444202', 'alamat' => 'Lingkungan II, Gampong Kandang', 'jabatan' => null],
                ['nama' => 'Nurbiah', 'email' => 'warga2_2@gampong.test', 'phone' => '085222222203', 'nik' => '4444444444444203', 'alamat' => 'Lingkungan II, Gampong Kandang', 'jabatan' => null],
                ['nama' => 'Abdul Rahman', 'email' => 'warga2_3@gampong.test', 'phone' => '085222222204', 'nik' => '4444444444444204', 'alamat' => 'Lingkungan II, Gampong Kandang', 'jabatan' => null],
                ['nama' => 'Halimah', 'email' => 'warga2_4@gampong.test', 'phone' => '085222222205', 'nik' => '4444444444444205', 'alamat' => 'Lingkungan II, Gampong Kandang', 'jabatan' => null],
            ],
            3 => [ // Lingkungan III
                ['nama' => 'Ismail', 'email' => 'koordinator3@gampong.test', 'phone' => '085333333301', 'nik' => '4444444444444301', 'alamat' => 'Lingkungan III, Gampong Kandang', 'jabatan' => 'Ketua (Koordinator Warga)'],
                ['nama' => 'Yusuf', 'email' => 'warga3_1@gampong.test', 'phone' => '085333333302', 'nik' => '4444444444444302', 'alamat' => 'Lingkungan III, Gampong Kandang', 'jabatan' => null],
                ['nama' => 'Fatimah', 'email' => 'warga3_2@gampong.test', 'phone' => '085333333303', 'nik' => '4444444444444303', 'alamat' => 'Lingkungan III, Gampong Kandang', 'jabatan' => null],
                ['nama' => 'Ahmad Kamil', 'email' => 'warga3_3@gampong.test', 'phone' => '085333333304', 'nik' => '4444444444444304', 'alamat' => 'Lingkungan III, Gampong Kandang', 'jabatan' => null],
                ['nama' => 'Mariam', 'email' => 'warga3_4@gampong.test', 'phone' => '085333333305', 'nik' => '4444444444444305', 'alamat' => 'Lingkungan III, Gampong Kandang', 'jabatan' => null],
            ],
        ];

        foreach ($lingkunganData as $dusunId => $wargas) {
            foreach ($wargas as $data) {
                User::create(array_merge($data, [
                    'role_id' => $wargaRoleId,
                    'dusun_id' => $dusunId,
                    'password' => $password,
                ]));
            }
        }
    }
}
