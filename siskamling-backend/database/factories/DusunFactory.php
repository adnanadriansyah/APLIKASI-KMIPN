<?php

namespace Database\Factories;

use App\Models\Desa;
use App\Models\Dusun;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Dusun>
 */
class DusunFactory extends Factory
{
    public function definition(): array
    {
        return [
            'desa_id' => Desa::factory(),
            'nama' => 'Dusun '.fake()->randomLetter(),
        ];
    }
}
