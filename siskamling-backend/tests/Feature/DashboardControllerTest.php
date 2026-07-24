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

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    private Polsek $polsek;

    private Desa $desa;

    private Dusun $dusun;

    private User $polsekUser;

    private User $adminDesa;

    protected function setUp(): void
    {
        parent::setUp();

        $this->polsek = Polsek::create(['nama' => 'Polsek Test', 'alamat' => 'Jl. Test']);
        $this->desa = Desa::create(['polsek_id' => $this->polsek->id, 'nama' => 'Desa Test']);
        $this->dusun = Dusun::create(['desa_id' => $this->desa->id, 'nama' => 'Dusun Test']);

        $polsekRole = Role::firstOrCreate(['name' => 'polsek']);
        $adminRole = Role::firstOrCreate(['name' => 'aparatur_desa']);

        $this->polsekUser = User::create([
            'role_id' => $polsekRole->id, 'polsek_id' => $this->polsek->id,
            'nama' => 'Polsek User', 'email' => 'polsek@test.test', 'password' => 'password',
        ]);

        $this->adminDesa = User::create([
            'role_id' => $adminRole->id, 'desa_id' => $this->desa->id,
            'nama' => 'Admin Desa', 'email' => 'admin@test.test', 'password' => 'password',
        ]);
    }

    // ─── POLSEK SUMMARY ─────────────────────────────────────

    public function test_polsek_can_access_polsek_summary(): void
    {
        $response = $this->actingAs($this->polsekUser)->getJson('/api/dashboard/polsek');

        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                'stats' => ['total_polsek', 'total_desa', 'total_dusun', 'total_warga', 'total_linmas'],
                'kamtibmas_per_polsek',
                'kamtibmas_trend_12_bulan',
                'kamtibmas_kategori',
                'kamtibmas_status',
                'panic_stats' => ['total', 'terkirim', 'direspon', 'rata_rata_response_menit'],
            ],
        ]);
    }

    public function test_polsek_summary_returns_correct_polsek(): void
    {
        $response = $this->actingAs($this->polsekUser)->getJson('/api/dashboard/polsek');

        $response->assertOk();
        $ids = collect($response->json('data.kamtibmas_per_polsek'))->pluck('id')->toArray();
        $this->assertContains($this->polsek->id, $ids);
    }

    public function test_polsek_summary_trend_has_12_months(): void
    {
        $response = $this->actingAs($this->polsekUser)->getJson('/api/dashboard/polsek');

        $response->assertOk();
        $this->assertCount(12, $response->json('data.kamtibmas_trend_12_bulan'));
    }

    public function test_aparatur_desa_cannot_access_polsek_summary(): void
    {
        $response = $this->actingAs($this->adminDesa)->getJson('/api/dashboard/polsek');

        $response->assertForbidden();
    }

    // ─── DESA SUMMARY ───────────────────────────────────────

    public function test_aparatur_desa_can_access_desa_summary(): void
    {
        $response = $this->actingAs($this->adminDesa)->getJson('/api/dashboard/desa');

        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                'desa',
                'stats' => ['total_warga', 'rumah_kosong_aktif', 'anggota_linmas', 'ronda_bulan_ini', 'panic_aktif'],
                'kamtibmas_per_dusun',
                'kamtibmas_trend_12_bulan',
                'kamtibmas_kategori',
                'kamtibmas_status',
                'ronda_per_dusun',
                'panic_stats',
            ],
        ]);
    }

    public function test_desa_summary_returns_correct_desa(): void
    {
        $response = $this->actingAs($this->adminDesa)->getJson('/api/dashboard/desa');

        $response->assertOk();
        $response->assertJson(['data' => ['desa' => ['id' => $this->desa->id]]]);
    }

    public function test_desa_summary_trend_has_12_months(): void
    {
        $response = $this->actingAs($this->adminDesa)->getJson('/api/dashboard/desa');

        $response->assertOk();
        $this->assertCount(12, $response->json('data.kamtibmas_trend_12_bulan'));
    }

    public function test_desa_summary_kamtibmas_per_dusun(): void
    {
        LaporanKamtibmas::factory()->create(['dusun_id' => $this->dusun->id]);

        $response = $this->actingAs($this->adminDesa)->getJson('/api/dashboard/desa');

        $response->assertOk();
        $dusunData = collect($response->json('data.kamtibmas_per_dusun'));
        $this->assertEquals(1, $dusunData->firstWhere('dusun', 'Dusun Test')['total']);
    }

    public function test_polsek_cannot_access_desa_summary(): void
    {
        $response = $this->actingAs($this->polsekUser)->getJson('/api/dashboard/desa');

        $response->assertStatus(404);
    }

    // ─── AI INSIGHT ─────────────────────────────────────────

    public function test_aparatur_desa_can_access_ai_insight(): void
    {
        $response = $this->actingAs($this->adminDesa)->getJson('/api/dashboard/desa/ai-insight');

        $response->assertOk();
        $response->assertJsonStructure(['data']);
    }

    // ─── UNAUTHENTICATED ────────────────────────────────────

    public function test_unauthenticated_cannot_access_dashboard(): void
    {
        $response = $this->getJson('/api/dashboard/polsek');

        $response->assertStatus(401);
    }
}
