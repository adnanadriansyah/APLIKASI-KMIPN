<?php

namespace Database\Factories;

use App\Models\JadwalRondaPetugas;
use App\Models\QrcodeRonda;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<QrcodeRonda>
 */
class QrcodeRondaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'jadwal_ronda_petugas_id' => JadwalRondaPetugas::factory(),
            'code' => Str::uuid()->toString(),
            'is_used' => false,
            'expired_at' => fake()->dateTimeThisDay('+2 hours'),
        ];
    }
}
