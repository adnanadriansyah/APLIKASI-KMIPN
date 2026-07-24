<?php

namespace Tests\Feature;

use App\Models\Desa;
use App\Models\Dusun;
use App\Models\Linmas;
use App\Models\Polsek;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LinmasControllerTest extends TestCase
{
    use RefreshDatabase;

    private Polsek $polsek;

    private Polsek $otherPolsek;

    private User $polsekUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->polsek = Polsek::create(['nama' => 'Polsek A', 'alamat' => 'Jl. A']);
        $this->otherPolsek = Polsek::create(['nama' => 'Polsek B', 'alamat' => 'Jl. B']);

        $desa = Desa::create(['polsek_id' => $this->polsek->id, 'nama' => 'Desa A']);
        Dusun::create(['desa_id' => $desa->id, 'nama' => 'Dusun A']);

        $polsekRole = Role::firstOrCreate(['name' => 'polsek']);

        $this->polsekUser = User::create([
            'role_id' => $polsekRole->id, 'polsek_id' => $this->polsek->id,
            'nama' => 'Polsek A', 'email' => 'polsek_a@test.test', 'password' => 'password',
        ]);
    }

    private function createLinmas(Polsek $polsek, string $nama = 'Linmas Test'): Linmas
    {
        return Linmas::create([
            'polsek_id' => $polsek->id,
            'nama' => $nama,
            'jabatan' => 'Anggota',
            'no_hp' => '081234567890',
            'wilayah_tugas' => 'Dusun A',
        ]);
    }

    // ─── INDEX ──────────────────────────────────────────────

    public function test_polsek_sees_all_linmas(): void
    {
        $linmas1 = $this->createLinmas($this->polsek, 'Linmas A');
        $linmas2 = $this->createLinmas($this->otherPolsek, 'Linmas B');

        $response = $this->actingAs($this->polsekUser)->getJson('/api/linmas');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains($linmas1->id, $ids);
        $this->assertContains($linmas2->id, $ids);
    }

    // ─── STORE ──────────────────────────────────────────────

    public function test_polsek_can_store(): void
    {
        $response = $this->actingAs($this->polsekUser)->postJson('/api/linmas', [
            'nama' => 'Linmas Baru',
            'jabatan' => 'Ketua',
            'no_hp' => '081234567891',
            'wilayah_tugas' => 'Dusun B',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('linmas', [
            'polsek_id' => $this->polsek->id,
            'nama' => 'Linmas Baru',
        ]);
    }

    // ─── SHOW ───────────────────────────────────────────────

    public function test_polsek_can_see_any_linmas(): void
    {
        $other = $this->createLinmas($this->otherPolsek);

        $response = $this->actingAs($this->polsekUser)->getJson("/api/linmas/{$other->id}");

        $response->assertOk();
    }

    // ─── UPDATE ─────────────────────────────────────────────

    public function test_polsek_can_update_any_linmas(): void
    {
        $other = $this->createLinmas($this->otherPolsek);

        $response = $this->actingAs($this->polsekUser)->putJson("/api/linmas/{$other->id}", [
            'nama' => 'Updated',
            'jabatan' => 'Wakil',
            'no_hp' => '081234567892',
            'wilayah_tugas' => 'Dusun C',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('linmas', ['id' => $other->id, 'nama' => 'Updated']);
    }

    // ─── DESTROY ────────────────────────────────────────────

    public function test_polsek_can_delete_any_linmas(): void
    {
        $other = $this->createLinmas($this->otherPolsek);

        $response = $this->actingAs($this->polsekUser)->deleteJson("/api/linmas/{$other->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('linmas', ['id' => $other->id]);
    }

    // ─── PAGINATION ─────────────────────────────────────────

    public function test_index_returns_pagination_meta(): void
    {
        $this->createLinmas($this->polsek);

        $response = $this->actingAs($this->polsekUser)->getJson('/api/linmas');

        $response->assertOk();
        $response->assertJsonStructure([
            'data',
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
    }
}
