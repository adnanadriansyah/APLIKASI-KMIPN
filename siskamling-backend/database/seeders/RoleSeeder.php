<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = ['polsek', 'aparatur_desa', 'warga'];

        foreach ($roles as $role) {
            Role::create(['name' => $role]);
        }
    }
}
