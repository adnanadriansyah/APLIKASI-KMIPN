<?php

namespace Database\Seeders;

use App\Models\Dusun;
use Illuminate\Database\Seeder;

class DusunSeeder extends Seeder
{
    public function run(): void
    {
        $dusunNames = ['Dusun A', 'Dusun B', 'Dusun C'];

        foreach ($dusunNames as $nama) {
            Dusun::create([
                'desa_id' => 1,
                'nama' => $nama,
            ]);
        }
    }
}
