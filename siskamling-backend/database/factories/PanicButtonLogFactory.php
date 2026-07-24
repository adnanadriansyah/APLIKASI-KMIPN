<?php

namespace Database\Factories;

use App\Models\Dusun;
use App\Models\PanicButtonLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PanicButtonLog>
 */
class PanicButtonLogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'dusun_id' => Dusun::factory(),
            'latitude' => fake()->latitude(-5, 6),
            'longitude' => fake()->longitude(95, 141),
            'status' => 'terkirim',
        ];
    }
}
