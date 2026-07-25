<?php

namespace Database\Factories;

use App\Models\Dusun;
use App\Models\LaporanKamtibmas;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LaporanKamtibmas>
 */
class LaporanKamtibmasFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'dusun_id' => Dusun::factory(),
            'kategori' => fake()->randomElement(array_keys(config('siskamling.kategori_kamtibmas', []))),
            'lokasi_text' => fake()->address(),
            'latitude' => fake()->latitude(-5, 6),
            'longitude' => fake()->longitude(95, 141),
            'kronologi' => fake()->sentence(),
            'status' => 'terkirim',
        ];
    }
}
