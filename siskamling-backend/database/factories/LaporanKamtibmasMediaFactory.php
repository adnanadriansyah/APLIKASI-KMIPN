<?php

namespace Database\Factories;

use App\Models\LaporanKamtibmas;
use App\Models\LaporanKamtibmasMedia;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LaporanKamtibmasMedia>
 */
class LaporanKamtibmasMediaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'laporan_kamtibmas_id' => LaporanKamtibmas::factory(),
            'type' => fake()->randomElement(['image', 'video', 'audio']),
            'file_path' => 'media/'.fake()->uuid().'.jpg',
        ];
    }
}
