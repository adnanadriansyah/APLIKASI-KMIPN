<?php

namespace Database\Seeders;

use App\Models\Dusun;
use Illuminate\Database\Seeder;

class DusunSeeder extends Seeder
{
    public function run(): void
    {
        $dusunNames = ['Lingkungan I', 'Lingkungan II', 'Lingkungan III'];

        foreach ($dusunNames as $nama) {
            Dusun::create([
                'desa_id' => 1,
                'nama' => $nama,
            ]);
        }
    }
}
