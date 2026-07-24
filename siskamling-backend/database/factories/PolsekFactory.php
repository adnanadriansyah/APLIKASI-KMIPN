<?php

namespace Database\Factories;

use App\Models\Polsek;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Polsek>
 */
class PolsekFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nama' => 'Polsek '.fake()->citySuffix(),
            'alamat' => fake()->address(),
            'kontak_wa' => fake()->numerify('08##########'),
            'telegram_chat_id' => (string) fake()->randomNumber(8, true),
        ];
    }
}
