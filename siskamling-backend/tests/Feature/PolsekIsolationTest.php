<?php

namespace Tests\Feature;

use App\Models\Desa;
use App\Models\Dusun;
use App\Models\LaporanKamtibmas;
use App\Models\Linmas;
use App\Models\PanicButtonLog;
use App\Models\Polsek;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PolsekIsolationTest extends TestCase
{
    use RefreshDatabase;

    private Polsek $polsekA;
    private Polsek $polsekB;

    private Desa $desaA;
    private Desa $desaB;

    private array $dusunIdsA;
    private array $dusunIdsB;

    private User $polsekUserA;
    private User $polsekUserB;

    private User $wargaA;
    private User $wargaB;

    protected function setUp(): void
    {
        parent::setUp();

        // ── Polsek A ──
        $this->polsekA = Polsek::create([
            'nama' => 'Polsek A',
            'alamat' => 'Jl. A',
            'kontak_wa' => '081111111111',
            'telegram_chat_id' => '-1001',
        ]);

        $this->desaA = Desa::create([
            'polsek_id' => $this->polsekA->id,
            'nama' => 'Desa Alpha',
        ]);

        $this->dusunIdsA = [];
        foreach (['Dusun A1', 'Dusun A2'] as $nama) {
            $d = Dusun::create(['desa_id' => $this->desaA->id, 'nama' => $nama]);
            $this->dusunIdsA[] = $d->id;
        }

        // ── Polsek B ──
        $this->polsekB = Polsek::create([
            'nama' => 'Polsek B',
            'alamat' => 'Jl. B',
            'kontak_wa' => '082222222222',
            'telegram_chat_id' => '-1002',
        ]);

        $this->desaB = Desa::create([
            'polsek_id' => $this->polsekB->id,
            'nama' => 'Desa Beta',
        ]);

        $this->dusunIdsB = [];
        foreach (['Dusun B1', 'Dusun B2'] as $nama) {
            $d = Dusun::create(['desa_id' => $this->desaB->id, 'nama' => $nama]);
            $this->dusunIdsB[] = $d->id;
        }

        // ── Users ──
        $polsekRole = Role::firstOrCreate(['name' => 'polsek']);
        $wargaRole = Role::firstOrCreate(['name' => 'warga']);

        $this->polsekUserA = User::create([
            'role_id' => $polsekRole->id,
            'polsek_id' => $this->polsekA->id,
            'nama' => 'Polsek A User',
            'email' => 'polsek_a@test.test',
            'password' => 'password',
        ]);

        $this->polsekUserB = User::create([
            'role_id' => $polsekRole->id,
            'polsek_id' => $this->polsekB->id,
            'nama' => 'Polsek B User',
            'email' => 'polsek_b@test.test',
            'password' => 'password',
        ]);

        $this->wargaA = User::create([
            'role_id' => $wargaRole->id,
            'dusun_id' => $this->dusunIdsA[0],
            'nama' => 'Warga A',
            'email' => 'warga_a@test.test',
            'password' => 'password',
        ]);

        $this->wargaB = User::create([
            'role_id' => $wargaRole->id,
            'dusun_id' => $this->dusunIdsB[0],
            'nama' => 'Warga B',
            'email' => 'warga_b@test.test',
            'password' => 'password',
        ]);
    }

    // ─── USER MODEL: getPolsekId() ──────────────────────────

    public function test_polsek_a_get_polsek_id_returns_own_polsek(): void
    {
        $this->assertEquals($this->polsekA->id, $this->polsekUserA->getPolsekId());
    }

    public function test_polsek_b_get_polsek_id_returns_own_polsek(): void
    {
        $this->assertEquals($this->polsekB->id, $this->polsekUserB->getPolsekId());
    }

    public function test_polsek_users_have_different_polsek_ids(): void
    {
        $this->assertNotEquals(
            $this->polsekUserA->getPolsekId(),
            $this->polsekUserB->getPolsekId(),
        );
    }

    // ─── USER MODEL: getDusunIds() ──────────────────────────

    public function test_polsek_a_get_dusun_ids_scoped_to_own_desas(): void
    {
        $ids = $this->polsekUserA->getDusunIds();

        $this->assertEqualsCanonicalizing($this->dusunIdsA, $ids);
    }

    public function test_polsek_b_get_dusun_ids_scoped_to_own_desas(): void
    {
        $ids = $this->polsekUserB->getDusunIds();

        $this->assertEqualsCanonicalizing($this->dusunIdsB, $ids);
    }

    public function test_polsek_a_dusun_ids_do_not_include_polsek_b(): void
    {
        $ids = $this->polsekUserA->getDusunIds();

        foreach ($this->dusunIdsB as $bId) {
            $this->assertNotContains($bId, $ids);
        }
    }

    // ─── KAMTIBMAS ISOLATION ────────────────────────────────

    public function test_polsek_a_cannot_see_polsek_b_kamtibmas(): void
    {
        $laporanA = LaporanKamtibmas::create([
            'user_id' => $this->wargaA->id,
            'dusun_id' => $this->dusunIdsA[0],
            'kategori' => 'pencurian',
            'lokasi_text' => 'Jl. Alpha',
            'latitude' => 5.0,
            'longitude' => 97.0,
            'kronologi' => 'Kejadian di wilayah Polsek A.',
            'status' => 'baru',
        ]);

        $laporanB = LaporanKamtibmas::create([
            'user_id' => $this->wargaB->id,
            'dusun_id' => $this->dusunIdsB[0],
            'kategori' => 'tawuran',
            'lokasi_text' => 'Jl. Beta',
            'latitude' => 5.1,
            'longitude' => 97.1,
            'kronologi' => 'Kejadian di wilayah Polsek B.',
            'status' => 'baru',
        ]);

        $response = $this->actingAs($this->polsekUserA)->getJson('/api/kamtibmas');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains($laporanA->id, $ids);
        $this->assertNotContains($laporanB->id, $ids);
    }

    public function test_polsek_b_cannot_see_polsek_a_kamtibmas(): void
    {
        LaporanKamtibmas::create([
            'user_id' => $this->wargaA->id,
            'dusun_id' => $this->dusunIdsA[0],
            'kategori' => 'pencurian',
            'lokasi_text' => 'Jl. Alpha',
            'latitude' => 5.0,
            'longitude' => 97.0,
            'kronologi' => 'Kejadian di wilayah Polsek A.',
            'status' => 'baru',
        ]);

        $response = $this->actingAs($this->polsekUserB)->getJson('/api/kamtibmas');

        $response->assertOk();
        $this->assertEmpty($response->json('data'));
    }

    public function test_polsek_a_cannot_update_status_polsek_b_kamtibmas(): void
    {
        $laporanB = LaporanKamtibmas::create([
            'user_id' => $this->wargaB->id,
            'dusun_id' => $this->dusunIdsB[0],
            'kategori' => 'pencurian',
            'lokasi_text' => 'Jl. Beta',
            'latitude' => 5.1,
            'longitude' => 97.1,
            'kronologi' => 'Kejadian di wilayah Polsek B.',
            'status' => 'baru',
        ]);

        $response = $this->actingAs($this->polsekUserA)->putJson("/api/kamtibmas/{$laporanB->id}/status", [
            'status' => 'diproses',
        ]);

        $response->assertForbidden();
    }

    // ─── PANIC ISOLATION ────────────────────────────────────

    public function test_polsek_a_cannot_see_polsek_b_panic(): void
    {
        PanicButtonLog::create([
            'user_id' => $this->wargaB->id,
            'latitude' => 5.1,
            'longitude' => 97.1,
            'status' => 'terkirim',
        ]);

        $response = $this->actingAs($this->polsekUserA)->getJson('/api/panic/active');

        $response->assertOk();
        $this->assertEmpty($response->json('data'));
    }

    public function test_polsek_b_cannot_see_polsek_a_panic(): void
    {
        PanicButtonLog::create([
            'user_id' => $this->wargaA->id,
            'latitude' => 5.0,
            'longitude' => 97.0,
            'status' => 'terkirim',
        ]);

        $response = $this->actingAs($this->polsekUserB)->getJson('/api/panic/active');

        $response->assertOk();
        $this->assertEmpty($response->json('data'));
    }

    public function test_polsek_a_can_see_own_panic(): void
    {
        $panicA = PanicButtonLog::create([
            'user_id' => $this->wargaA->id,
            'latitude' => 5.0,
            'longitude' => 97.0,
            'status' => 'terkirim',
        ]);

        $response = $this->actingAs($this->polsekUserA)->getJson('/api/panic/active');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains($panicA->id, $ids);
    }

    public function test_polsek_a_cannot_respond_polsek_b_panic(): void
    {
        $panicB = PanicButtonLog::create([
            'user_id' => $this->wargaB->id,
            'latitude' => 5.1,
            'longitude' => 97.1,
            'status' => 'terkirim',
        ]);

        $response = $this->actingAs($this->polsekUserA)->putJson("/api/panic/{$panicB->id}/respond");

        $response->assertForbidden();
    }

    // ─── LINMAS ISOLATION ───────────────────────────────────

    public function test_polsek_a_cannot_see_polsek_b_linmas_in_index(): void
    {
        Linmas::create([
            'polsek_id' => $this->polsekB->id,
            'nama' => 'Linmas B1',
            'jabatan' => 'Anggota',
            'no_hp' => '082222222222',
            'wilayah_tugas' => 'Dusun B1',
        ]);

        Linmas::create([
            'polsek_id' => $this->polsekA->id,
            'nama' => 'Linmas A1',
            'jabatan' => 'Anggota',
            'no_hp' => '081111111111',
            'wilayah_tugas' => 'Dusun A1',
        ]);

        $response = $this->actingAs($this->polsekUserA)->getJson('/api/linmas');

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('nama')->toArray();
        $this->assertContains('Linmas A1', $names);
        $this->assertNotContains('Linmas B1', $names);
    }

    public function test_polsek_a_cannot_see_polsek_b_linmas_directly(): void
    {
        $linmasB = Linmas::create([
            'polsek_id' => $this->polsekB->id,
            'nama' => 'Linmas B1',
            'jabatan' => 'Anggota',
            'no_hp' => '082222222222',
            'wilayah_tugas' => 'Dusun B1',
        ]);

        $response = $this->actingAs($this->polsekUserA)->getJson("/api/linmas/{$linmasB->id}");

        $response->assertForbidden();
    }

    public function test_polsek_a_cannot_update_polsek_b_linmas(): void
    {
        $linmasB = Linmas::create([
            'polsek_id' => $this->polsekB->id,
            'nama' => 'Linmas B1',
            'jabatan' => 'Anggota',
            'no_hp' => '082222222222',
            'wilayah_tugas' => 'Dusun B1',
        ]);

        $response = $this->actingAs($this->polsekUserA)->putJson("/api/linmas/{$linmasB->id}", [
            'nama' => 'Hacked',
            'jabatan' => 'Ketua',
            'no_hp' => '081111111111',
            'wilayah_tugas' => 'Dusun A1',
        ]);

        $response->assertForbidden();
    }

    public function test_polsek_a_cannot_delete_polsek_b_linmas(): void
    {
        $linmasB = Linmas::create([
            'polsek_id' => $this->polsekB->id,
            'nama' => 'Linmas B1',
            'jabatan' => 'Anggota',
            'no_hp' => '082222222222',
            'wilayah_tugas' => 'Dusun B1',
        ]);

        $response = $this->actingAs($this->polsekUserA)->deleteJson("/api/linmas/{$linmasB->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('linmas', ['id' => $linmasB->id]);
    }

}
