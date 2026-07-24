<?php

namespace Database\Seeders;

use App\Models\Desa;
use Illuminate\Database\Seeder;

class DesaSeeder extends Seeder
{
    public function run(): void
    {
        Desa::create([
            'polsek_id' => 1,
            'nama' => 'Desa Contoh',
        ]);
    }
}
