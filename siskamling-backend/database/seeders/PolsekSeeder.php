<?php

namespace Database\Seeders;

use App\Models\Polsek;
use Illuminate\Database\Seeder;

class PolsekSeeder extends Seeder
{
    public function run(): void
    {
        Polsek::create([
            'nama' => 'Polsek Muara Dua',
            'alamat' => 'Jl. Merdeka No. 12, Kecamatan Muara Dua, Kota Lhokseumawe, Aceh',
            'kontak_wa' => '081234567890',
            'telegram_chat_id' => '-123456789',
        ]);
    }
}
