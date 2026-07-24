<?php

namespace Tests\Feature;

use App\Models\Desa;
use App\Models\Dusun;
use App\Models\JadwalRonda;
use App\Models\JadwalRondaPetugas;
use App\Models\Polsek;
use App\Models\QrcodeRonda;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RondaQrFlowTest extends TestCase
{
    use RefreshDatabase;

    private Polsek $polsek;

    private Desa $desa;

    private Dusun $dusun;

    private User $koordinator;

    private User $warga;

    private User $warga2;

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

        $this->dusun = Dusun::create([
            'desa_id' => $this->desa->id,
            'nama' => 'Dusun A',
        ]);

        $koorRole = Role::firstOrCreate(['name' => 'aparatur_desa']);
        $wargaRole = Role::firstOrCreate(['name' => 'warga']);

        $this->koordinator = User::create([
            'role_id' => $koorRole->id,
            'dusun_id' => $this->dusun->id,
            'nama' => 'Koordinator A',
            'email' => 'koor@test.test',
            'password' => 'password',
        ]);

        $this->warga = User::create([
            'role_id' => $wargaRole->id,
            'dusun_id' => $this->dusun->id,
            'nama' => 'Warga 1',
            'email' => 'warga1@test.test',
            'password' => 'password',
        ]);

        $this->warga2 = User::create([
            'role_id' => $wargaRole->id,
            'dusun_id' => $this->dusun->id,
            'nama' => 'Warga 2',
            'email' => 'warga2@test.test',
            'password' => 'password',
        ]);
    }

    // ─── SCHEDULE CREATION ──────────────────────────────────

    public function test_koordinator_can_create_jadwal_with_petugas(): void
    {
        $response = $this->actingAs($this->koordinator)->postJson('/api/ronda/jadwal', [
            'dusun_id' => $this->dusun->id,
            'tanggal' => Carbon::today()->toDateString(),
            'shift' => 'shift_1',
            'petugas_ids' => [$this->warga->id, $this->warga2->id],
        ]);

        $response->assertCreated();
        $response->assertJsonStructure([
            'message',
            'data' => ['id', 'dusun', 'tanggal', 'shift', 'status', 'petugas'],
        ]);

        $jadwalId = $response->json('data.id');
        $this->assertDatabaseHas('jadwal_rondas', [
            'id' => $jadwalId,
            'status' => 'terjadwal',
        ]);
        $this->assertCount(2, JadwalRondaPetugas::where('jadwal_ronda_id', $jadwalId)->get());
    }

    // ─── QR CODE GENERATE ───────────────────────────────────

    public function test_warga_can_generate_qr_for_own_petugas(): void
    {
        $jadwal = JadwalRonda::create([
            'dusun_id' => $this->dusun->id,
            'tanggal' => Carbon::today(),
            'shift' => 'shift_1',
            'status' => 'terjadwal',
        ]);

        $petugas = JadwalRondaPetugas::create([
            'jadwal_ronda_id' => $jadwal->id,
            'user_id' => $this->warga->id,
            'status_hadir' => 'dijadwalkan',
        ]);

        $response = $this->actingAs($this->warga)->postJson('/api/ronda/qrcode/generate', [
            'jadwal_ronda_petugas_id' => $petugas->id,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('qrcode_rondas', [
            'jadwal_ronda_petugas_id' => $petugas->id,
            'is_used' => false,
        ]);
    }

    public function test_warga_cannot_generate_qr_for_other_user_petugas(): void
    {
        $jadwal = JadwalRonda::create([
            'dusun_id' => $this->dusun->id,
            'tanggal' => Carbon::today(),
            'shift' => 'shift_1',
            'status' => 'terjadwal',
        ]);

        $petugas = JadwalRondaPetugas::create([
            'jadwal_ronda_id' => $jadwal->id,
            'user_id' => $this->warga2->id,
            'status_hadir' => 'dijadwalkan',
        ]);

        $response = $this->actingAs($this->warga)->postJson('/api/ronda/qrcode/generate', [
            'jadwal_ronda_petugas_id' => $petugas->id,
        ]);

        $response->assertForbidden();
    }

    public function test_generate_qr_returns_409_when_already_used(): void
    {
        $jadwal = JadwalRonda::create([
            'dusun_id' => $this->dusun->id,
            'tanggal' => Carbon::today(),
            'shift' => 'shift_1',
            'status' => 'terjadwal',
        ]);

        $petugas = JadwalRondaPetugas::create([
            'jadwal_ronda_id' => $jadwal->id,
            'user_id' => $this->warga->id,
            'status_hadir' => 'hadir',
        ]);

        QrcodeRonda::create([
            'jadwal_ronda_petugas_id' => $petugas->id,
            'code' => 'used-code',
            'is_used' => true,
            'expired_at' => Carbon::now()->addMinutes(10),
        ]);

        $response = $this->actingAs($this->warga)->postJson('/api/ronda/qrcode/generate', [
            'jadwal_ronda_petugas_id' => $petugas->id,
        ]);

        $response->assertStatus(409);
    }

    // ─── QR CODE SCAN ───────────────────────────────────────

    public function test_koordinator_can_scan_valid_qr(): void
    {
        $jadwal = JadwalRonda::create([
            'dusun_id' => $this->dusun->id,
            'tanggal' => Carbon::today(),
            'shift' => 'shift_1',
            'status' => 'terjadwal',
        ]);

        $petugas = JadwalRondaPetugas::create([
            'jadwal_ronda_id' => $jadwal->id,
            'user_id' => $this->warga->id,
            'status_hadir' => 'dijadwalkan',
        ]);

        $qrcode = QrcodeRonda::create([
            'jadwal_ronda_petugas_id' => $petugas->id,
            'code' => 'valid-scan-code',
            'is_used' => false,
            'expired_at' => Carbon::now()->addMinutes(15),
        ]);

        $response = $this->actingAs($this->koordinator)->postJson('/api/ronda/qrcode/scan', [
            'code' => 'valid-scan-code',
        ]);

        $response->assertOk();
        $response->assertJson(['message' => 'Absensi berhasil. Status kehadiran diperbarui.']);

        $qrcode->refresh();
        $this->assertTrue($qrcode->is_used);
        $this->assertEquals($this->koordinator->id, $qrcode->scanned_by);
        $this->assertNotNull($qrcode->scanned_at);

        $petugas->refresh();
        $this->assertEquals('hadir', $petugas->status_hadir);
    }

    public function test_scan_expired_qr_returns_410(): void
    {
        $jadwal = JadwalRonda::create([
            'dusun_id' => $this->dusun->id,
            'tanggal' => Carbon::today(),
            'shift' => 'shift_1',
            'status' => 'terjadwal',
        ]);

        $petugas = JadwalRondaPetugas::create([
            'jadwal_ronda_id' => $jadwal->id,
            'user_id' => $this->warga->id,
            'status_hadir' => 'dijadwalkan',
        ]);

        QrcodeRonda::create([
            'jadwal_ronda_petugas_id' => $petugas->id,
            'code' => 'expired-code',
            'is_used' => false,
            'expired_at' => Carbon::now()->subMinutes(5),
        ]);

        $response = $this->actingAs($this->koordinator)->postJson('/api/ronda/qrcode/scan', [
            'code' => 'expired-code',
        ]);

        $response->assertStatus(410);
    }

    public function test_scan_already_used_qr_returns_409(): void
    {
        $jadwal = JadwalRonda::create([
            'dusun_id' => $this->dusun->id,
            'tanggal' => Carbon::today(),
            'shift' => 'shift_1',
            'status' => 'terjadwal',
        ]);

        $petugas = JadwalRondaPetugas::create([
            'jadwal_ronda_id' => $jadwal->id,
            'user_id' => $this->warga->id,
            'status_hadir' => 'hadir',
        ]);

        QrcodeRonda::create([
            'jadwal_ronda_petugas_id' => $petugas->id,
            'code' => 'used-code',
            'is_used' => true,
            'expired_at' => Carbon::now()->addMinutes(10),
        ]);

        $response = $this->actingAs($this->koordinator)->postJson('/api/ronda/qrcode/scan', [
            'code' => 'used-code',
        ]);

        $response->assertStatus(409);
    }

    // ─── FULL FLOW ──────────────────────────────────────────

    public function test_full_qr_flow_create_generate_scan(): void
    {
        $jadwalResponse = $this->actingAs($this->koordinator)->postJson('/api/ronda/jadwal', [
            'dusun_id' => $this->dusun->id,
            'tanggal' => Carbon::today()->toDateString(),
            'shift' => 'shift_2',
            'petugas_ids' => [$this->warga->id],
        ]);
        $jadwalResponse->assertCreated();
        $jadwalId = $jadwalResponse->json('data.id');

        $petugas = JadwalRondaPetugas::where('jadwal_ronda_id', $jadwalId)
            ->where('user_id', $this->warga->id)
            ->first();

        $qrResponse = $this->actingAs($this->warga)->postJson('/api/ronda/qrcode/generate', [
            'jadwal_ronda_petugas_id' => $petugas->id,
        ]);
        $qrResponse->assertCreated();

        $petugas->refresh();
        $code = $petugas->qrcodeRonda->code;

        $scanResponse = $this->actingAs($this->koordinator)->postJson('/api/ronda/qrcode/scan', [
            'code' => $code,
        ]);
        $scanResponse->assertOk();

        $petugas->refresh();
        $this->assertEquals('hadir', $petugas->status_hadir);
    }
}
