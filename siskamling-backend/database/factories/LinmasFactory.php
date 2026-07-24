<?php

namespace Database\Factories;

use App\Models\Linmas;
use App\Models\Polsek;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Linmas>
 */
class LinmasFactory extends Factory
{
    public function definition(): array
    {
        return [
            'polsek_id' => Polsek::factory(),
            'nama' => fake()->name(),
            'jabatan' => fake()->randomElement(['Ketua', 'Wakil', 'Anggota']),
            'no_hp' => fake()->numerify('08##########'),
            'wilayah_tugas' => 'Dusun '.fake()->randomLetter(),
        ];
    }
}
