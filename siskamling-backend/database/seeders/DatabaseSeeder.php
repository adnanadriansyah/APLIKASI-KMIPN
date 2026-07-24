<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            PolsekSeeder::class,
            DesaSeeder::class,
            DusunSeeder::class,
            UserSeeder::class,
        ]);
    }
}
