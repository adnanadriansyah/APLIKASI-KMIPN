<?php

namespace Database\Seeders;

use App\Models\AiInsight;
use App\Models\Dusun;
use App\Models\JadwalRonda;
use App\Models\JadwalRondaPetugas;
use App\Models\LaporanKamtibmas;
use App\Models\LaporanRumahKosong;
use App\Models\Linmas;
use App\Models\NotificationLog;
use App\Models\PanicButtonLog;
use App\Models\Polsek;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        $polsek = Polsek::first();
        $dusuns = Dusun::all();
        $polsekUsers = User::where('role_id', 1)->get(); // polsek
        $desaUsers = User::where('role_id', 2)->get();   // aparatur_desa
        $wargaUsers = User::where('role_id', 3)->get();  // warga

        // ──────────────────────────────────────────────
        // 1. LAPORAN KAMTIBMAS (data untuk Polsek + Desa + Warga)
        // ──────────────────────────────────────────────
        $kategoriList = ['pencurian', 'kdrt', 'narkoba', 'tawuran', 'pembunuhan', 'begal'];
        $statusList = ['baru', 'diproses', 'selesai'];
        $lokasiList = [
            'Depan Masjid Al-Ikhlas, Lingkungan I',
            'Jl. Meunasah No. 5, Lingkungan II',
            'Belakang Pasar Tradisional, Lingkungan III',
            'Simpang Tiga Gampong Kandang',
            'Dekat Lapangan Bola, Lingkungan I',
            'Gang Melati No. 3, Lingkungan II',
            'SD Negeri Gampong Kandang',
            'Kantor Keuchik Gampong Kandang',
            'Puskesmas Pembantu, Lingkungan III',
            'Samping Sungai, Lingkungan II',
            'Jl. Banda Aceh-Medan KM 12',
            'Kafe Malam, Lingkungan I',
        ];
        $kronologiList = [
            'Pelaku mengambil barang milik korban saat korban sedang tidak di rumah. Barang yang hilang berupa 1 unit hp dan uang tunai Rp 500.000.',
            'Korban mengalami kekerasan fisik dari suami. Korban melaporkan kejadian malam hari sekitar pukul 22.00 WIB.',
            'Warga mencurigai adanya transaksi narkoba di sebuah rumah kosong. Barang bukti sudah diamankan oleh warga.',
            'Dua kelompok pemuda terlibat perkelahian massal. Beruntung warga setempat berhasil melerai sebelum ada korban jiwa.',
            'Korban ditemukan oleh warga dalam kondisi luka parah. Korban dilarikan ke RSUD Lhokseumawe untuk penanganan lebih lanjut.',
            'Pelaku beraksi dengan modus berpura-pura meminjam telepon kemudian membawa kabur sepeda motor korban.',
            'Warga melaporkan adanya peredaran minuman keras ilegal di salah satu warung di lingkungan setempat.',
            'Terjadi percobaan pencurian kendaraan bermotor di parkiran masjid saat jamaah sedang shalat subuh.',
            'Dua rumah warga dirusak oleh orang tidak dikenal pada malam hari. Kerugian ditaksir mencapai Rp 2 juta.',
            'Warga menemukan anak kecil yang diduga hilang dari orang tuanya di sekitar pasar. Saat ini anak tersebut diamankan oleh perangkat desa.',
        ];

        // Buat 20 laporan kamtibmas
        for ($i = 0; $i < 20; $i++) {
            $user = $wargaUsers->random();
            $dusun = $dusuns->random();
            $kategori = $kategoriList[array_rand($kategoriList)];
            $status = $statusList[array_rand($statusList)];
            $daysAgo = rand(0, 60);
            $aiRandom = rand(0, 1);

            LaporanKamtibmas::create([
                'user_id' => $user->id,
                'dusun_id' => $dusun->id,
                'kategori' => $kategori,
                'lokasi_text' => $lokasiList[array_rand($lokasiList)],
                'latitude' => 5.185 + (rand(-50, 50) / 1000),
                'longitude' => 96.69 + (rand(-50, 50) / 1000),
                'kronologi' => $kronologiList[array_rand($kronologiList)],
                'ai_summary' => $aiRandom ? 'Laporan ini terkait ' . $kategori . ' di wilayah Gampong Kandang. Perlu penanganan lebih lanjut oleh pihak berwenang.' : null,
                'ai_urgency_level' => $aiRandom ? collect(['rendah', 'sedang', 'tinggi'])->random() : null,
                'status' => $status,
                'created_at' => Carbon::now()->subDays($daysAgo)->subHours(rand(0, 23)),
                'updated_at' => Carbon::now()->subDays(rand(0, 3)),
            ]);
        }

        // ──────────────────────────────────────────────
        // 2. JADWAL RONDA (data untuk Desa + Warga)
        // ──────────────────────────────────────────────
        $now = Carbon::now();
        $shiftOptions = ['shift_1', 'shift_2'];
        $shiftNames = ['shift_1' => 'Malam (20:00–02:00)', 'shift_2' => 'Subuh (02:00–06:00)'];
        $rondaStatuses = ['dijadwalkan', 'berlangsung', 'selesai'];

        // Buat jadwal untuk bulan ini dan bulan lalu
        foreach ([-1, 0] as $monthOffset) {
            $date = Carbon::now()->startOfMonth()->addMonths($monthOffset);
            $daysInMonth = $date->daysInMonth;

            foreach ($dusuns as $dusun) {
                // Buat ~8 jadwal per dusun per bulan (2 per minggu)
                $jadwalCount = 0;
                for ($d = 1; $d <= $daysInMonth && $jadwalCount < 8; $d++) {
                    // Skip beberapa hari secara acak
                    if (rand(0, 2) === 0) continue;

                    $dayDate = $date->copy()->addDays($d - 1);
                    if ($dayDate->isPast() || $dayDate->isToday() || $dayDate->diffInDays($now) < 2) {
                        // Jangan buat jadwal terlalu jauh ke depan
                    }

                    $shift = $shiftOptions[array_rand($shiftOptions)];
                    $isPast = $dayDate->isPast();
                    $status = $isPast ? (rand(0, 3) === 3 ? 'berlangsung' : 'selesai') : 'dijadwalkan';
                    if ($dayDate->isToday()) $status = 'berlangsung';

                    $jadwal = JadwalRonda::create([
                        'dusun_id' => $dusun->id,
                        'tanggal' => $dayDate->format('Y-m-d'),
                        'shift' => $shift,
                        'status' => $status,
                        'created_at' => $dayDate->copy()->subDays(rand(1, 7)),
                        'updated_at' => $now,
                    ]);

                    // Assign 3-5 petugas dari warga lingkungan yang sama
                    $petugasCount = rand(3, 5);
                    $wargaDusun = User::where('role_id', 3)->where('dusun_id', $dusun->id)->get();
                    $petugasIds = $wargaDusun->random(min($petugasCount, $wargaDusun->count()))->pluck('id')->toArray();

                    foreach ($petugasIds as $userId) {
                        $hadir = $isPast && !$dayDate->isToday() ? (rand(0, 1) ? 'hadir' : 'tidak_hadir') : null;
                        JadwalRondaPetugas::create([
                            'jadwal_ronda_id' => $jadwal->id,
                            'user_id' => $userId,
                            'status_hadir' => $hadir,
                        ]);
                    }

                    $jadwalCount++;
                }
            }
        }

        // ──────────────────────────────────────────────
        // 3. PANIC BUTTON LOGS (data untuk Polsek)
        // ──────────────────────────────────────────────
        $panicStatuses = ['terkirim', 'direspon', 'selesai'];

        for ($i = 0; $i < 10; $i++) {
            $user = $wargaUsers->random();
            $dusun = $user->dusun_id ? Dusun::find($user->dusun_id) : $dusuns->random();
            $status = $panicStatuses[array_rand($panicStatuses)];
            $daysAgo = rand(0, 30);

            $data = [
                'user_id' => $user->id,
                'dusun_id' => $dusun->id,
                'latitude' => 5.185 + (rand(-50, 50) / 1000),
                'longitude' => 96.69 + (rand(-50, 50) / 1000),
                'status' => $status,
                'created_at' => Carbon::now()->subDays($daysAgo)->subHours(rand(0, 12)),
                'updated_at' => Carbon::now()->subDays(rand(0, 3)),
            ];

            if (in_array($status, ['direspon', 'selesai'])) {
                $responder = $polsekUsers->random();
                $data['responded_by'] = $responder->id;
                $data['responded_at'] = Carbon::parse($data['created_at'])->addMinutes(rand(2, 30));
            }

            if ($status === 'selesai') {
                $completer = $polsekUsers->random();
                $data['completed_by'] = $completer->id;
                $data['completed_at'] = Carbon::parse($data['responded_at'] ?? $data['created_at'])->addHours(rand(1, 6));
            }

            PanicButtonLog::create($data);
        }

        // ──────────────────────────────────────────────
        // 4. LAPORAN RUMAH KOSONG (data untuk Warga + Desa)
        // ──────────────────────────────────────────────
        for ($i = 0; $i < 8; $i++) {
            $user = $wargaUsers->random();
            $start = Carbon::now()->addDays(rand(-5, 10))->addHours(rand(0, 23));
            $end = $start->copy()->addDays(rand(2, 14));

            LaporanRumahKosong::create([
                'user_id' => $user->id,
                'alamat' => 'Jl. ' . collect(['Meunasah', 'Pahlawan', 'Pendidikan', 'Pertanian', 'Nelayan'])->random()
                    . ' No. ' . rand(1, 50) . ', ' . $dusuns->random()->nama,
                'tanggal_berangkat' => $start->format('Y-m-d'),
                'tanggal_pulang' => $end->format('Y-m-d'),
                'kontak_darurat' => rand(0, 1) ? '08' . rand(1000000000, 9999999999) : null,
                'status' => $start->isPast() && $end->isPast() ? 'selesai' : 'aktif',
                'created_at' => Carbon::now()->subDays(rand(0, 30)),
                'updated_at' => Carbon::now()->subDays(rand(0, 5)),
            ]);
        }

        // ──────────────────────────────────────────────
        // 5. AI INSIGHT (data untuk Desa Dashboard)
        // ──────────────────────────────────────────────
        AiInsight::create([
            'desa_id' => 1,
            'insight' => "Berdasarkan analisis data kamtibmas di Gampong Kandang selama 7 hari terakhir:\n\n"
                . "📊 **Tren Positif:** Laporan kamtibmas menurun 15% dibanding minggu lalu. "
                . "Patroli ronda rutin terbukti efektif menekan angka kriminalitas.\n\n"
                . "⚠️ **Perhatian Khusus:**\n"
                . "- Kategori pencurian masih mendominasi (40% dari total laporan)\n"
                . "- Lingkungan II memiliki jumlah laporan tertinggi\n"
                . "- Jam rawan terjadi pada pukul 22.00 - 02.00 WIB\n\n"
                . "✅ **Rekomendasi:**\n"
                . "1. Tingkatkan patroli di Lingkungan II pada jam rawan\n"
                . "2. Adakan sosialisasi keamanan lingkungan bagi warga\n"
                . "3. Aktifkan kembali poskamling yang tidak aktif\n\n"
                . "📈 **Target Minggu Depan:** Zero laporan baru di Lingkungan I.",
            'raw_data' => [
                'total_laporan' => rand(15, 25),
                'laporan_baru' => rand(2, 5),
                'kategori_dominan' => 'pencurian',
                'lingkungan_rawan' => 'Lingkungan II',
                'jam_rawan' => '22:00 - 02:00',
            ],
            'period_start' => Carbon::now()->subWeek()->format('Y-m-d'),
            'period_end' => Carbon::now()->format('Y-m-d'),
        ]);

        // ──────────────────────────────────────────────
        // 6. NOTIFICATION LOGS (data untuk monitoring)
        // ──────────────────────────────────────────────
        $channels = ['telegram', 'whatsapp', 'reverb'];
        $statuses = ['berhasil', 'berhasil', 'berhasil', 'gagal'];

        for ($i = 0; $i < 15; $i++) {
            NotificationLog::create([
                'polsek_id' => $polsek->id,
                'panic_button_log_id' => rand(0, 1) ? PanicButtonLog::inRandomOrder()->first()?->id : null,
                'laporan_kamtibmas_id' => rand(0, 1) ? LaporanKamtibmas::inRandomOrder()->first()?->id : null,
                'channel' => $channels[array_rand($channels)],
                'target_number' => '08' . rand(1000000000, 9999999999),
                'status' => $statuses[array_rand($statuses)],
                'payload' => ['message' => 'Notifikasi kamtibmas dari Gampong Kandang'],
                'created_at' => Carbon::now()->subDays(rand(0, 7)),
            ]);
        }

        // ──────────────────────────────────────────────
        // 7. TAMBAH ANGGOTA LINMAS (media data lapangan)
        // ──────────────────────────────────────────────
        $additionalLinmas = [
            ['nama' => 'Teuku Zulfikar', 'jabatan' => 'Koordinator Lapangan', 'no_hp' => '083333333304', 'wilayah_tugas' => 'Gampong Kandang - Semua Lingkungan'],
            ['nama' => 'Mahlil', 'jabatan' => 'Anggota Linmas Lingkungan I', 'no_hp' => '083333333305', 'wilayah_tugas' => 'Gampong Kandang - Lingkungan I'],
            ['nama' => 'Saiful Bahri', 'jabatan' => 'Anggota Linmas Lingkungan II', 'no_hp' => '083333333306', 'wilayah_tugas' => 'Gampong Kandang - Lingkungan II'],
            ['nama' => 'Zulkarnaini', 'jabatan' => 'Anggota Linmas Lingkungan III', 'no_hp' => '083333333307', 'wilayah_tugas' => 'Gampong Kandang - Lingkungan III'],
        ];

        foreach ($additionalLinmas as $data) {
            Linmas::create(array_merge($data, ['polsek_id' => $polsek->id]));
        }

        $this->command->info('✅ Data dummy untuk 3 role berhasil dibuat!');
    }
}
