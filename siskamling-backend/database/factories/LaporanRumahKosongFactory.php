<?php

namespace Database\Factories;

use App\Models\LaporanRumahKosong;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LaporanRumahKosong>
 */
class LaporanRumahKosongFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'alamat' => fake()->address(),
            'tanggal_berangkat' => fake()->dateTimeThisYear(),
            'tanggal_pulang' => fake()->dateTimeThisYear('+1 month'),
            'kontak_darurat' => fake()->numerify('08##########'),
            'status' => 'aktif',
        ];
    }
}
