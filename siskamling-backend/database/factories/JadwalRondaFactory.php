<?php

namespace Database\Factories;

use App\Models\Dusun;
use App\Models\JadwalRonda;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JadwalRonda>
 */
class JadwalRondaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'dusun_id' => Dusun::factory(),
            'tanggal' => fake()->dateTimeThisMonth(),
            'shift' => fake()->randomElement(['malam', 'subuh']),
            'status' => 'dijadwalkan',
        ];
    }
}
