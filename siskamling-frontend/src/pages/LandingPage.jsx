import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: '🌙',
    title: 'Jadwal Ronda Digital + Presensi QR',
    desc: 'Penjadwalan ronda otomatis dan presensi kehadiran petugas memakai scan QR Code — tidak ada lagi catatan manual yang mudah hilang.',
  },
  {
    icon: '📋',
    title: 'Lapor Kamtibmas dengan Ringkasan AI',
    desc: 'Warga bisa melapor kejadian seperti pencurian, tawuran, atau KDRT, lalu AI otomatis meringkas dan menilai tingkat urgensi laporan.',
  },
  {
    icon: '🆘',
    title: 'Panic Button Real-Time',
    desc: 'Tombol darurat satu sentuhan langsung mengirim lokasi GPS ke Polsek dan aparat gampong lewat notifikasi real-time.',
  },
  {
    icon: '🏡',
    title: 'Lapor Rumah Kosong',
    desc: 'Warga bisa melaporkan rumah yang ditinggal pergi agar petugas ronda lebih waspada selama pemilik tidak di tempat.',
  },
  {
    icon: '📲',
    title: 'Notifikasi WhatsApp & Telegram',
    desc: 'Setiap laporan dan alert penting otomatis terkirim ke nomor dan grup yang sudah ditentukan — tidak ada yang terlewat.',
  },
  {
    icon: '📊',
    title: 'Dashboard Analitik Berbasis AI',
    desc: 'Grafik tren kriminalitas, peta panas titik rawan, dan insight keamanan berbasis data untuk membantu keputusan aparat.',
  },
]

const roles = [
  {
    icon: '👤',
    title: 'Warga',
    color: 'blue',
    items: [
      'Melapor kejadian hanya dalam hitungan detik',
      'Panic button darurat dengan lokasi GPS otomatis',
      'Cek jadwal ronda dan status kehadiran petugas',
      'Laporkan rumah kosong agar lebih terpantau',
    ],
  },
  {
    icon: '🏛️',
    title: 'Aparat Gampong',
    color: 'indigo',
    items: [
      'Kelola jadwal ronda seluruh lingkungan',
      'Pantau presensi kehadiran petugas lewat QR',
      'Akses data keamanan gampong secara real-time',
      'Koordinasi langsung dengan pihak Polsek',
    ],
  },
  {
    icon: '👮',
    title: 'Polsek',
    color: 'slate',
    items: [
      'Dashboard kriminalitas terpusat semua gampong',
      'Peta panas (heatmap) titik rawan kejahatan',
      'Tanggap panic button warga secara instan',
      'Data analitik berbasis AI untuk patroli presisi',
    ],
  },
]

const steps = [
  {
    num: '01',
    title: 'Warga Melapor',
    desc: 'Kirim laporan kamtibmas atau tekan panic button langsung dari aplikasi di ponsel.',
  },
  {
    num: '02',
    title: 'AI Memproses',
    desc: 'Sistem mencatat data otomatis, AI meringkas kronologi dan menilai tingkat urgensi.',
  },
  {
    num: '03',
    title: 'Aparat Menindaklanjuti',
    desc: 'Aparat gampong dan Polsek terima notifikasi instan, lalu segera merespons.',
  },
]

const stats = [
  { number: '4.616', unit: 'kasus', label: 'Pencurian kendaraan bermotor tercatat di Aceh setiap tahunnya' },
  { number: '72', unit: 'kasus', label: 'KDRT dan kekerasan terhadap perempuan & anak di Lhokseumawe tiap tahun' },
  { number: '70%', unit: 'desa', label: 'Wilayah Aceh masih mengandalkan ronda manual tanpa verifikasi digital' },
]

function useScrollSpy() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return scrolled
}

export default function LandingPage() {
  const scrolled = useScrollSpy()

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${scrolled ? 'bg-white/95 backdrop-blur shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-[#0f172a] tracking-tight">
              SiKamling<span className="text-blue-600"> Digital</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#fitur" className="hover:text-blue-600 transition-colors">Fitur</a>
            <a href="#cara-kerja" className="hover:text-blue-600 transition-colors">Cara Kerja</a>
            <a href="#untuk-siapa" className="hover:text-blue-600 transition-colors">Untuk Siapa</a>
          </div>

          <Link
            to="/login"
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Masuk
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-medium mb-6">
                KMIPN VIII 2026 &middot; Studi Kasus Gampong Kandang
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                Keamanan Lingkungan Gampong,{' '}
                <span className="text-blue-400">Kini Lebih Cepat</span>{' '}
                dan Terhubung.
              </h1>
              <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-xl">
                Menghubungkan warga, aparat gampong, dan Polsek dalam satu platform digital
                untuk ronda, pelaporan kamtibmas, dan tanggap darurat real-time.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Masuk ke Aplikasi
                </Link>
                <a
                  href="#fitur"
                  className="px-6 py-3 border border-white/20 text-white font-medium rounded-lg hover:bg-white/10 transition-colors text-sm"
                >
                  Pelajari Lebih Lanjut
                </a>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#1e293b] p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-[#0f172a] rounded-xl p-4 border border-white/5">
                    <span className="text-2xl">🌙</span>
                    <div>
                      <div className="text-sm font-medium text-white">Jadwal Ronda Malam Ini</div>
                      <div className="text-xs text-gray-400">Lingkungan I &middot; Shift 1 &middot; 8 personel</div>
                    </div>
                    <span className="ml-auto px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">Aktif</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#0f172a] rounded-xl p-4 border border-white/5">
                    <span className="text-2xl">🚨</span>
                    <div>
                      <div className="text-sm font-medium text-white">Laporan Baru Diterima</div>
                      <div className="text-xs text-gray-400">Kategori: Pencurian &middot; Urgensi: Tinggi</div>
                    </div>
                    <span className="ml-auto px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">Baru</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#0f172a] rounded-xl p-4 border border-white/5">
                    <span className="text-2xl">📷</span>
                    <div>
                      <div className="text-sm font-medium text-white">Presensi Tercatat</div>
                      <div className="text-xs text-gray-400">Hasanuddin &middot; Lingkungan I &middot; 19:32 WIB</div>
                    </div>
                    <span className="ml-auto px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">Hadir</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION MASALAH ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">Kenapa Ini Dibutuhkan?</h2>
            <p className="mt-3 text-gray-500">Data ini menunjukkan mengapa sistem keamanan lingkungan yang terdigitalisasi bukan lagi sekadar pilihan, melainkan kebutuhan mendesak.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                <div className="text-4xl font-extrabold text-[#0f172a]">{s.number}</div>
                <div className="text-sm font-semibold text-blue-600 mt-1">{s.unit}</div>
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-600 mt-10 max-w-2xl mx-auto text-sm leading-relaxed">
            Sistem ini hadir untuk menjawab kondisi tersebut secara digital dan real-time —
            mengubah ronda konvensional menjadi sistem terukur, verifiable, dan terhubung langsung
            dengan pihak keamanan.
          </p>
        </div>
      </section>

      {/* ── SECTION FITUR ── */}
      <section id="fitur" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">Fitur Unggulan</h2>
            <p className="mt-3 text-gray-500">Solusi lengkap mulai dari penjadwalan ronda hingga analitik berbasis kecerdasan buatan.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-blue-100 transition-all">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-[#0f172a] mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION CARA KERJA ── */}
      <section id="cara-kerja" className="py-20 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Cara Kerja</h2>
            <p className="mt-3 text-gray-400">Tiga langkah sederhana dari laporan warga hingga tindak lanjut aparat.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 relative">
            <div className="hidden sm:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0" />

            {steps.map((s, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold mb-6 relative z-10">
                  {s.num}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION UNTUK SIAPA ── */}
      <section id="untuk-siapa" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">Untuk Siapa?</h2>
            <p className="mt-3 text-gray-500">Setiap peran punya manfaat langsung dari satu platform yang sama.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {roles.map((r, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <div className="text-3xl mb-4">{r.icon}</div>
                <h3 className="font-semibold text-[#0f172a] text-lg mb-4">{r.title}</h3>
                <ul className="space-y-3">
                  {r.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION STUDI KASUS ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-10 sm:p-14">
            <div className="flex flex-col sm:flex-row items-start gap-8">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl">
                📍
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a] mb-4">Lokasi Pilot Project</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Sistem Siskamling Digital ini dirancang untuk diterapkan secara langsung di{' '}
                  <strong className="text-[#0f172a]">Gampong Kandang, Kecamatan Muara Dua</strong>,
                  di bawah wilayah hukum{' '}
                  <strong className="text-[#0f172a]">Polsek Muara Dua, Kota Lhokseumawe, Aceh</strong>,
                  sebagai lokasi uji coba awal (pilot project).
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Pemilihan lokasi ini berdasarkan kebutuhan nyata akan sistem keamanan lingkungan
                  yang terintegrasi di gampong dengan struktur pemerintahan tradisional Aceh — mulai
                  dari Keuchik, Tuha Peut, hingga jaringan ronda yang aktif di tiap lingkungan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BAWAH ── */}
      <section className="py-20 bg-[#0f172a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Siap Meningkatkan Keamanan Gampong?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Masuk ke aplikasi dan mulai kelola jadwal ronda, laporan kamtibmas, dan tanggap darurat
            secara digital.
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-3.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Masuk ke Aplikasi
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0b1120] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8 mb-10">
            <div>
              <span className="text-lg font-extrabold text-white">
                SiKamling<span className="text-blue-500"> Digital</span>
              </span>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Sistem Keamanan Lingkungan Gampong Berbasis Digital dan Real-Time.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Tautan</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#fitur" className="hover:text-white transition-colors">Fitur</a></li>
                <li><a href="#cara-kerja" className="hover:text-white transition-colors">Cara Kerja</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Masuk</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Pengembang</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Dikembangkan oleh <strong className="text-gray-400">Tim Mon Seven</strong>
                <br />
                Politeknik Negeri Lhokseumawe
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Kompetisi Mahasiswa Informatika Politeknik Negeri (KMIPN) VIII 2026
              </p>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} Siskamling Digital. Hak cipta dilindungi.</p>
            <p className="text-xs text-gray-600">Gampong Kandang &middot; Kec. Muara Dua &middot; Kota Lhokseumawe, Aceh</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
