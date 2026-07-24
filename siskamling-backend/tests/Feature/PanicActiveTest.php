<?php

namespace Tests\Feature;

use App\Models\Desa;
use App\Models\Dusun;
use App\Models\PanicButtonLog;
use App\Models\Polsek;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PanicActiveTest extends TestCase
{
    use RefreshDatabase;

    private Polsek $polsek;

    private Desa $desa;

    private array $dusunIds;

    protected function setUp(): void
    {
        parent::setUp();

        $this->polsek = Polsek::create([
            'nama' => 'Polsek Muara Dua',
            'alamat' => 'Jl. Test',
            'kontak_wa' => '081234567890',
            'telegram_chat_id' => '-123',
        ]);

        $this->desa = Desa::create([
            'polsek_id' => $this->polsek->id,
            'nama' => 'Gampong Kandang',
        ]);

        $this->dusunIds = [];
        foreach (['Dusun A', 'Dusun B', 'Dusun C'] as $nama) {
            $d = Dusun::create(['desa_id' => $this->desa->id, 'nama' => $nama]);
            $this->dusunIds[] = $d->id;
        }
    }

    private function createUser(string $roleName, ?int $dusunId = null, ?int $desaId = null, ?int $polsekId = null): User
    {
        $role = Role::firstOrCreate(['name' => $roleName]);

        return User::create([
            'role_id' => $role->id,
            'dusun_id' => $dusunId,
            'desa_id' => $desaId,
            'polsek_id' => $polsekId,
            'nama' => "Test {$roleName}",
            'email' => fake()->unique()->safeEmail(),
            'password' => 'password',
        ]);
    }

    private function createPanic(User $user, string $status = 'terkirim'): PanicButtonLog
    {
        return PanicButtonLog::create([
            'user_id' => $user->id,
            'latitude' => 5.0,
            'longitude' => 97.0,
            'status' => $status,
        ]);
    }

    // ─── WARGA SCOPING ──────────────────────────────────────

    public function test_warga_can_only_see_own_panic(): void
    {
        $warga = $this->createUser('warga', $this->dusunIds[0]);
        $otherWarga = $this->createUser('warga', $this->dusunIds[1]);

        $myPanic = $this->createPanic($warga);
        $otherPanic = $this->createPanic($otherWarga);

        $response = $this->actingAs($warga)->getJson('/api/panic/active');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains($myPanic->id, $ids);
        $this->assertNotContains($otherPanic->id, $ids);
    }

    // ─── APARATUR DESA SCOPING ──────────────────────────────

    public function test_aparatur_desa_sees_all_dusun_in_desa(): void
    {
        $aparatur = $this->createUser('aparatur_desa', null, $this->desa->id);
        $warga1 = $this->createUser('warga', $this->dusunIds[0]);
        $warga2 = $this->createUser('warga', $this->dusunIds[2]);

        $panic1 = $this->createPanic($warga1);
        $panic2 = $this->createPanic($warga2);

        $response = $this->actingAs($aparatur)->getJson('/api/panic/active');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains($panic1->id, $ids);
        $this->assertContains($panic2->id, $ids);
    }

    public function test_aparatur_desa_without_desa_returns_empty(): void
    {
        $aparatur = $this->createUser('aparatur_desa', null, null);
        $warga = $this->createUser('warga', $this->dusunIds[0]);
        $this->createPanic($warga);

        $response = $this->actingAs($aparatur)->getJson('/api/panic/active');

        $response->assertOk();
        $this->assertEmpty($response->json('data'));
    }

    public function test_aparatur_with_dusun_sees_all_dusun_in_desa(): void
    {
        $aparatur = $this->createUser('aparatur_desa', $this->dusunIds[0]);
        $warga1 = $this->createUser('warga', $this->dusunIds[0]);
        $wargaOther = $this->createUser('warga', $this->dusunIds[1]);

        $panicOwn = $this->createPanic($warga1);
        $panicOther = $this->createPanic($wargaOther);

        $response = $this->actingAs($aparatur)->getJson('/api/panic/active');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains($panicOwn->id, $ids);
        $this->assertContains($panicOther->id, $ids);
    }

    // ─── POLSEK GLOBAL ACCESS ───────────────────────────────

    public function test_polsek_sees_all_panic(): void
    {
        $polsekUser = $this->createUser('polsek', null, null, $this->polsek->id);
        $warga = $this->createUser('warga', $this->dusunIds[0]);
        $panic = $this->createPanic($warga);

        $response = $this->actingAs($polsekUser)->getJson('/api/panic/active');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains($panic->id, $ids);
    }

    public function test_polsek_can_respond_any_panic(): void
    {
        $polsekUser = $this->createUser('polsek', null, null, $this->polsek->id);
        $warga = $this->createUser('warga', $this->dusunIds[0]);
        $panic = $this->createPanic($warga);

        $response = $this->actingAs($polsekUser)->putJson("/api/panic/{$panic->id}/respond");

        $response->assertOk();
        $this->assertDatabaseHas('panic_button_logs', [
            'id' => $panic->id,
            'status' => 'direspon',
            'responded_by' => $polsekUser->id,
        ]);
    }

    public function test_panic_with_status_responded_is_not_shown(): void
    {
        $polsekUser = $this->createUser('polsek', null, null, $this->polsek->id);
        $warga = $this->createUser('warga', $this->dusunIds[0]);
        $this->createPanic($warga, 'direspon');

        $response = $this->actingAs($polsekUser)->getJson('/api/panic/active');

        $response->assertOk();
        $this->assertEmpty($response->json('data'));
    }

    public function test_cannot_respond_already_responded_panic(): void
    {
        $polsekUser = $this->createUser('polsek', null, null, $this->polsek->id);
        $warga = $this->createUser('warga', $this->dusunIds[0]);
        $panic = $this->createPanic($warga, 'direspon');

        $response = $this->actingAs($polsekUser)->putJson("/api/panic/{$panic->id}/respond");

        $response->assertStatus(409);
    }

    // ─── USER MODEL HELPER TESTS ─────────────────────────────

    public function test_user_model_get_dusun_ids_aparatur_desa(): void
    {
        $aparatur = $this->createUser('aparatur_desa', null, $this->desa->id);

        $dusunIds = $aparatur->getDusunIds();

        $this->assertEqualsCanonicalizing($this->dusunIds, $dusunIds);
    }

    public function test_user_model_get_dusun_ids_warga(): void
    {
        $warga = $this->createUser('warga', $this->dusunIds[0]);

        $dusunIds = $warga->getDusunIds();

        $this->assertEquals([$this->dusunIds[0]], $dusunIds);
    }

    public function test_user_model_get_dusun_ids_polsek(): void
    {
        $polsekUser = $this->createUser('polsek', null, null, $this->polsek->id);

        $dusunIds = $polsekUser->getDusunIds();

        $this->assertEqualsCanonicalizing($this->dusunIds, $dusunIds);
    }

    public function test_user_model_get_polsek_id_returns_null_for_polsek(): void
    {
        $polsekUser = $this->createUser('polsek', null, null, $this->polsek->id);

        $this->assertNull($polsekUser->getPolsekId());
    }

    public function test_user_model_get_polsek_id_via_desa(): void
    {
        $aparatur = $this->createUser('aparatur_desa', null, $this->desa->id);

        $this->assertEquals($this->polsek->id, $aparatur->getPolsekId());
    }

    public function test_user_model_get_polsek_id_via_dusun(): void
    {
        $warga = $this->createUser('warga', $this->dusunIds[0]);

        $this->assertEquals($this->polsek->id, $warga->getPolsekId());
    }

    public function test_user_model_get_desa_id_via_desa_column(): void
    {
        $aparatur = $this->createUser('aparatur_desa', null, $this->desa->id);

        $this->assertEquals($this->desa->id, $aparatur->getDesaId());
    }

    public function test_user_model_get_desa_id_via_dusun(): void
    {
        $warga = $this->createUser('warga', $this->dusunIds[0]);

        $this->assertEquals($this->desa->id, $warga->getDesaId());
    }

    public function test_user_model_get_desa_returns_correct_desa(): void
    {
        $aparatur = $this->createUser('aparatur_desa', null, $this->desa->id);

        $this->assertEquals($this->desa->id, $aparatur->getDesa()->id);
    }
}
