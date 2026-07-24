<?php

namespace Tests\Feature;

use App\Models\Desa;
use App\Models\Dusun;
use App\Models\Polsek;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::firstOrCreate(['name' => 'warga']);
        $polsek = Polsek::create(['nama' => 'Polsek Test', 'alamat' => 'Jl. Test']);
        $desa = Desa::create(['polsek_id' => $polsek->id, 'nama' => 'Desa Test']);
        $dusun = Dusun::create(['desa_id' => $desa->id, 'nama' => 'Dusun Test']);

        $this->user = User::create([
            'role_id' => $role->id,
            'dusun_id' => $dusun->id,
            'nama' => 'Warga Test',
            'email' => 'warga@test.test',
            'password' => 'password',
        ]);
    }

    public function test_login_success(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'warga@test.test',
            'password' => 'password',
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'message',
            'user' => ['id', 'nama', 'email', 'role'],
        ]);
        $response->assertJson(['user' => ['email' => 'warga@test.test']]);
    }

    public function test_login_wrong_password(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'warga@test.test',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
        $response->assertJson(['message' => 'Email atau password salah.']);
    }

    public function test_login_nonexistent_email(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'notexist@test.test',
            'password' => 'password',
        ]);

        $response->assertStatus(401);
    }

    public function test_login_validation_errors(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => '',
            'password' => '',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_logout_unauthenticated_returns_401(): void
    {
        $response = $this->postJson('/api/logout');

        $response->assertStatus(401);
    }

    public function test_login_returns_role(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'warga@test.test',
            'password' => 'password',
        ]);

        $response->assertOk();
        $response->assertJson(['user' => ['role' => 'warga']]);
    }
}
