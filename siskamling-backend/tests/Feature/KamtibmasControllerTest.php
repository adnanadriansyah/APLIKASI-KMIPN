<?php

namespace Tests\Feature;

use App\Models\Desa;
use App\Models\Dusun;
use App\Models\LaporanKamtibmas;
use App\Models\Polsek;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KamtibmasControllerTest extends TestCase
{
    use RefreshDatabase;

    private Polsek $polsek;

    private Desa $desa;

    private array $dusunIds;

    private User $warga;

    private User $adminDesa;

    private User $polsekUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->polsek = Polsek::create(['nama' => 'Polsek Test', 'alamat' => 'Jl. Test']);
        $this->desa = Desa::create(['polsek_id' => $this->polsek->id, 'nama' => 'Desa Test']);

        $this->dusunIds = [];
        foreach (['Dusun A', 'Dusun B'] as $nama) {
            $d = Dusun::create(['desa_id' => $this->desa->id, 'nama' => $nama]);
            $this->dusunIds[] = $d->id;
        }

        $wargaRole = Role::firstOrCreate(['name' => 'warga']);
        $adminRole = Role::firstOrCreate(['name' => 'aparatur_desa']);
        $polsekRole = Role::firstOrCreate(['name' => 'polsek']);

        $this->warga = User::create([
            'role_id' => $wargaRole->id, 'dusun_id' => $this->dusunIds[0],
            'nama' => 'Warga A', 'email' => 'warga_a@test.test', 'password' => 'password',
        ]);

        $this->adminDesa = User::create([
            'role_id' => $adminRole->id, 'desa_id' => $this->desa->id,
            'nama' => 'Admin Desa', 'email' => 'admin@test.test', 'password' => 'password',
        ]);

        $this->polsekUser = User::create([
            'role_id' => $polsekRole->id, 'polsek_id' => $this->polsek->id,
            'nama' => 'Polsek User', 'email' => 'polsek@test.test', 'password' => 'password',
        ]);
    }

    private function createLaporan(User $user, int $dusunId, string $kategori = 'pencurian'): LaporanKamtibmas
    {
        return LaporanKamtibmas::create([
            'user_id' => $user->id,
            'dusun_id' => $dusunId,
            'kategori' => $kategori,
            'lokasi_text' => 'Jl. Test No. 1',
            'latitude' => 5.0,
            'longitude' => 97.0,
            'kronologi' => 'Ini adalah kronologi kejadian pencurian di area test.',
            'status' => 'baru',
        ]);
    }

    // ─── INDEX SCOPING ──────────────────────────────────────

    public function test_warga_sees_only_own_laporan(): void
    {
        $mine = $this->createLaporan($this->warga, $this->dusunIds[0]);
        $other = User::create([
            'role_id' => Role::firstOrCreate(['name' => 'warga'])->id,
            'dusun_id' => $this->dusunIds[1],
            'nama' => 'Other', 'email' => 'other_warga@test.test', 'password' => 'password',
        ]);
        $otherLaporan = $this->createLaporan($other, $this->dusunIds[1]);

        $response = $this->actingAs($this->warga)->getJson('/api/kamtibmas');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains($mine->id, $ids);
        $this->assertNotContains($otherLaporan->id, $ids);
    }

    public function test_aparatur_desa_sees_all_dusun_in_desa(): void
    {
        $laporan1 = $this->createLaporan($this->warga, $this->dusunIds[0]);
        $warga2 = User::create([
            'role_id' => Role::firstOrCreate(['name' => 'warga'])->id,
            'dusun_id' => $this->dusunIds[1],
            'nama' => 'Warga B', 'email' => 'warga_b@test.test', 'password' => 'password',
        ]);
        $laporan2 = $this->createLaporan($warga2, $this->dusunIds[1]);

        $response = $this->actingAs($this->adminDesa)->getJson('/api/kamtibmas');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains($laporan1->id, $ids);
        $this->assertContains($laporan2->id, $ids);
    }

    public function test_polsek_sees_all_in_jurisdiction(): void
    {
        $warga = User::create([
            'role_id' => Role::firstOrCreate(['name' => 'warga'])->id,
            'dusun_id' => $this->dusunIds[0],
            'nama' => 'Warga X', 'email' => 'wargax@test.test', 'password' => 'password',
        ]);
        $laporan = $this->createLaporan($warga, $this->dusunIds[0]);

        $response = $this->actingAs($this->polsekUser)->getJson('/api/kamtibmas');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains($laporan->id, $ids);
    }

    public function test_index_returns_pagination_meta(): void
    {
        $this->createLaporan($this->warga, $this->dusunIds[0]);

        $response = $this->actingAs($this->warga)->getJson('/api/kamtibmas');

        $response->assertOk();
        $response->assertJsonStructure([
            'data',
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
    }

    // ─── STORE ──────────────────────────────────────────────

    public function test_warga_can_store_laporan(): void
    {
        $response = $this->actingAs($this->warga)->postJson('/api/kamtibmas', [
            'kategori' => 'pencurian',
            'lokasi_text' => 'Jl. Test No. 2',
            'latitude' => 5.1,
            'longitude' => 97.1,
            'kronologi' => 'Kejadian pencurian terjadi di warung.',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('laporan_kamtibmas', [
            'user_id' => $this->warga->id,
            'kategori' => 'pencurian',
        ]);
    }

    public function test_store_validation_error(): void
    {
        $response = $this->actingAs($this->warga)->postJson('/api/kamtibmas', [
            'kategori' => 'invalid_kategori',
            'lokasi_text' => '',
        ]);

        $response->assertStatus(422);
    }

    // ─── SHOW ───────────────────────────────────────────────

    public function test_warga_can_see_own_laporan(): void
    {
        $laporan = $this->createLaporan($this->warga, $this->dusunIds[0]);

        $response = $this->actingAs($this->warga)->getJson("/api/kamtibmas/{$laporan->id}");

        $response->assertOk();
        $response->assertJson(['data' => ['id' => $laporan->id]]);
    }

    public function test_warga_cannot_see_other_laporan(): void
    {
        $other = User::create([
            'role_id' => Role::firstOrCreate(['name' => 'warga'])->id,
            'dusun_id' => $this->dusunIds[0],
            'nama' => 'Other', 'email' => 'other@test.test', 'password' => 'password',
        ]);
        $laporan = $this->createLaporan($other, $this->dusunIds[0]);

        $response = $this->actingAs($this->warga)->getJson("/api/kamtibmas/{$laporan->id}");

        $response->assertForbidden();
    }

    // ─── UPDATE STATUS ──────────────────────────────────────

    public function test_polsek_can_update_status(): void
    {
        $laporan = $this->createLaporan($this->warga, $this->dusunIds[0]);

        $response = $this->actingAs($this->polsekUser)->putJson("/api/kamtibmas/{$laporan->id}/status", [
            'status' => 'diproses',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('laporan_kamtibmas', [
            'id' => $laporan->id, 'status' => 'diproses',
        ]);
    }

    public function test_warga_cannot_update_status(): void
    {
        $laporan = $this->createLaporan($this->warga, $this->dusunIds[0]);

        $response = $this->actingAs($this->warga)->putJson("/api/kamtibmas/{$laporan->id}/status", [
            'status' => 'diproses',
        ]);

        $response->assertForbidden();
    }

    // ─── FILTER ─────────────────────────────────────────────

    public function test_filter_by_kategori(): void
    {
        $this->createLaporan($this->warga, $this->dusunIds[0], 'pencurian');
        $this->createLaporan($this->warga, $this->dusunIds[0], 'begal');

        $response = $this->actingAs($this->warga)->getJson('/api/kamtibmas?kategori=pencurian');

        $response->assertOk();
        $kategoris = collect($response->json('data'))->pluck('kategori')->unique()->toArray();
        $this->assertEquals(['pencurian'], $kategoris);
    }
}
