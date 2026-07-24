<?php

namespace Database\Factories;

use App\Models\NotificationLog;
use App\Models\Polsek;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NotificationLog>
 */
class NotificationLogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'polsek_id' => Polsek::factory(),
            'channel' => fake()->randomElement(['whatsapp', 'telegram']),
            'target_number' => fake()->numerify('08##########'),
            'status' => 'sent',
            'payload' => ['message' => fake()->sentence()],
        ];
    }
}
