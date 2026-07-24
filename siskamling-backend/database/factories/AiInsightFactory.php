<?php

namespace Database\Factories;

use App\Models\AiInsight;
use App\Models\Desa;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AiInsight>
 */
class AiInsightFactory extends Factory
{
    public function definition(): array
    {
        $start = fake()->dateTimeThisMonth('-1 week');
        $end = fake()->dateTimeThisMonth('+1 week');

        return [
            'desa_id' => Desa::factory(),
            'insight' => fake()->paragraphs(3, true),
            'raw_data' => ['kamtibmas' => fake()->numberBetween(0, 50), 'rumah_kosong' => fake()->numberBetween(0, 10)],
            'period_start' => $start,
            'period_end' => $end,
        ];
    }
}
