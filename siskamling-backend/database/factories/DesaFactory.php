<?php

namespace Database\Factories;

use App\Models\Desa;
use App\Models\Polsek;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Desa>
 */
class DesaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'polsek_id' => Polsek::factory(),
            'nama' => 'Gampong '.fake()->citySuffix(),
        ];
    }
}
