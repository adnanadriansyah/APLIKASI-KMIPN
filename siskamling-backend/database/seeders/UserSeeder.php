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

        // aparatur_desa (tanpa dusun, tapi punya desa_id)
        User::create([
            'role_id' => $aparaturDesaRoleId,
            'dusun_id' => null,
            'desa_id' => $desaId,
            'nama' => 'Aparatur Desa',
            'email' => 'aparatur@example.test',
            'phone' => '081111111111',
            'nik' => '1111111111111111',
            'alamat' => 'Kantor Desa',
            'password' => $password,
        ]);

        // user polsek (tanpa dusun, punya polsek_id)
        User::create([
            'role_id' => $polsekRoleId,
            'dusun_id' => null,
            'polsek_id' => $polsekId,
            'nama' => 'Anggota Polsek',
            'email' => 'polsek@example.test',
            'phone' => '082222222222',
            'nik' => '2222222222222222',
            'alamat' => 'Mapolsek',
            'password' => $password,
        ]);

        // 5 warga per dusun
        $dusunNames = ['a', 'b', 'c'];
        foreach ($dusunNames as $index => $slug) {
            $dusunId = $index + 1;

            for ($w = 1; $w <= 5; $w++) {
                User::create([
                    'role_id' => $wargaRoleId,
                    'dusun_id' => $dusunId,
                    'nama' => "Warga $w Dusun ".strtoupper($slug),
                    'email' => "warga$w@dusun$slug.test",
                    'phone' => '0850000'.$dusunId.sprintf('%02d', $w),
                    'nik' => '4444444444444'.$dusunId.sprintf('%02d', $w),
                    'alamat' => 'RT 00'.$w.' Dusun '.strtoupper($slug),
                    'password' => $password,
                ]);
            }
        }
    }
}
