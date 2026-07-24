<?php

namespace Database\Factories;

use App\Models\JadwalRonda;
use App\Models\JadwalRondaPetugas;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JadwalRondaPetugas>
 */
class JadwalRondaPetugasFactory extends Factory
{
    public function definition(): array
    {
        return [
            'jadwal_ronda_id' => JadwalRonda::factory(),
            'user_id' => User::factory(),
            'status_hadir' => false,
        ];
    }
}
