<?php

namespace Tests\Feature;

use App\Models\Desa;
use App\Models\Dusun;
use App\Models\LaporanRumahKosong;
use App\Models\Polsek;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RumahKosongControllerTest extends TestCase
{
    use RefreshDatabase;

    private Polsek $polsek;

    private Desa $desa;

    private array $dusunIds;

    private User $warga;

    private User $adminDesa;

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

        $this->warga = User::create([
            'role_id' => $wargaRole->id, 'dusun_id' => $this->dusunIds[0],
            'nama' => 'Warga A', 'email' => 'warga_a@test.test', 'password' => 'password',
        ]);

        $this->adminDesa = User::create([
            'role_id' => $adminRole->id, 'desa_id' => $this->desa->id,
            'nama' => 'Admin Desa', 'email' => 'admin@test.test', 'password' => 'password',
        ]);
    }

    private function createLaporan(User $user): LaporanRumahKosong
    {
        return LaporanRumahKosong::create([
            'user_id' => $user->id,
            'alamat' => 'Jl. Test No. 1',
            'tanggal_berangkat' => Carbon::today(),
            'tanggal_pulang' => Carbon::today()->addDays(7),
            'kontak_darurat' => '081234567890',
            'status' => 'aktif',
        ]);
    }

    // ─── INDEX SCOPING ──────────────────────────────────────

    public function test_warga_sees_only_own(): void
    {
        $mine = $this->createLaporan($this->warga);
        $other = User::create([
            'role_id' => Role::firstOrCreate(['name' => 'warga'])->id,
            'dusun_id' => $this->dusunIds[1],
            'nama' => 'Other', 'email' => 'other@test.test', 'password' => 'password',
        ]);
        $otherLaporan = $this->createLaporan($other);

        $response = $this->actingAs($this->warga)->getJson('/api/rumah-kosong');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains($mine->id, $ids);
        $this->assertNotContains($otherLaporan->id, $ids);
    }

    public function test_aparatur_desa_sees_all_dusun(): void
    {
        $laporan1 = $this->createLaporan($this->warga);
        $other = User::create([
            'role_id' => Role::firstOrCreate(['name' => 'warga'])->id,
            'dusun_id' => $this->dusunIds[1],
            'nama' => 'Other', 'email' => 'other@test.test', 'password' => 'password',
        ]);
        $laporan2 = $this->createLaporan($other);

        $response = $this->actingAs($this->adminDesa)->getJson('/api/rumah-kosong');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains($laporan1->id, $ids);
        $this->assertContains($laporan2->id, $ids);
    }

    // ─── STORE ──────────────────────────────────────────────

    public function test_warga_can_store(): void
    {
        $response = $this->actingAs($this->warga)->postJson('/api/rumah-kosong', [
            'alamat' => 'Jl. Baru No. 2',
            'tanggal_berangkat' => Carbon::today()->toDateString(),
            'tanggal_pulang' => Carbon::today()->addDays(14)->toDateString(),
            'kontak_darurat' => '081234567891',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('laporan_rumah_kosongs', [
            'user_id' => $this->warga->id,
            'status' => 'aktif',
        ]);
    }

    // ─── SHOW ───────────────────────────────────────────────

    public function test_warga_can_see_own(): void
    {
        $laporan = $this->createLaporan($this->warga);

        $response = $this->actingAs($this->warga)->getJson("/api/rumah-kosong/{$laporan->id}");

        $response->assertOk();
    }

    public function test_warga_cannot_see_other(): void
    {
        $other = User::create([
            'role_id' => Role::firstOrCreate(['name' => 'warga'])->id,
            'dusun_id' => $this->dusunIds[1],
            'nama' => 'Other', 'email' => 'other@test.test', 'password' => 'password',
        ]);
        $laporan = $this->createLaporan($other);

        $response = $this->actingAs($this->warga)->getJson("/api/rumah-kosong/{$laporan->id}");

        $response->assertForbidden();
    }

    // ─── UPDATE ─────────────────────────────────────────────

    public function test_warga_can_update_own(): void
    {
        $laporan = $this->createLaporan($this->warga);

        $response = $this->actingAs($this->warga)->putJson("/api/rumah-kosong/{$laporan->id}", [
            'alamat' => 'Alamat Updated No 99',
            'tanggal_berangkat' => Carbon::today()->toDateString(),
            'tanggal_pulang' => Carbon::today()->addDays(10)->toDateString(),
            'kontak_darurat' => '081234567892',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('laporan_rumah_kosongs', [
            'id' => $laporan->id, 'alamat' => 'Alamat Updated No 99',
        ]);
    }

    public function test_warga_cannot_update_other(): void
    {
        $other = User::create([
            'role_id' => Role::firstOrCreate(['name' => 'warga'])->id,
            'dusun_id' => $this->dusunIds[1],
            'nama' => 'Other', 'email' => 'other@test.test', 'password' => 'password',
        ]);
        $laporan = $this->createLaporan($other);

        $response = $this->actingAs($this->warga)->putJson("/api/rumah-kosong/{$laporan->id}", [
            'alamat' => 'Hacked',
            'tanggal_berangkat' => Carbon::today()->toDateString(),
            'tanggal_pulang' => Carbon::today()->addDays(5)->toDateString(),
            'kontak_darurat' => '081234567893',
        ]);

        $response->assertForbidden();
    }

    // ─── DESTROY ────────────────────────────────────────────

    public function test_warga_can_delete_own(): void
    {
        $laporan = $this->createLaporan($this->warga);

        $response = $this->actingAs($this->warga)->deleteJson("/api/rumah-kosong/{$laporan->id}");

        $response->assertOk();
        $this->assertSoftDeleted('laporan_rumah_kosongs', ['id' => $laporan->id]);
    }

    public function test_warga_cannot_delete_other(): void
    {
        $other = User::create([
            'role_id' => Role::firstOrCreate(['name' => 'warga'])->id,
            'dusun_id' => $this->dusunIds[1],
            'nama' => 'Other', 'email' => 'other@test.test', 'password' => 'password',
        ]);
        $laporan = $this->createLaporan($other);

        $response = $this->actingAs($this->warga)->deleteJson("/api/rumah-kosong/{$laporan->id}");

        $response->assertForbidden();
    }

    // ─── PAGINATION ─────────────────────────────────────────

    public function test_index_returns_pagination_meta(): void
    {
        $this->createLaporan($this->warga);

        $response = $this->actingAs($this->warga)->getJson('/api/rumah-kosong');

        $response->assertOk();
        $response->assertJsonStructure([
            'data',
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
    }
}
