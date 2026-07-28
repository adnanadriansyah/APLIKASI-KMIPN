import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import logoImage from '../assets/images/icon.png'
import {
  Moon, ClipboardList, AlertTriangle, Home, MessageSquare, BarChart3,
  Users, Shield, ChevronRight, MapPin,
} from 'lucide-react'

const features = [
  {
    icon: Moon,
    title: 'Jadwal Ronda Digital + Presensi QR',
    desc: 'Penjadwalan ronda otomatis dan presensi kehadiran petugas memakai scan QR Code — tidak ada lagi catatan manual yang mudah hilang.',
  },
  {
    icon: ClipboardList,
    title: 'Lapor Kamtibmas dengan Ringkasan AI',
    desc: 'Warga bisa melapor kejadian seperti pencurian, tawuran, atau KDRT, lalu AI otomatis meringkas dan menilai tingkat urgensi laporan.',
  },
  {
    icon: AlertTriangle,
    title: 'Panic Button Real-Time',
    desc: 'Tombol darurat satu sentuhan langsung mengirim lokasi GPS ke Polsek dan aparat gampong lewat notifikasi real-time.',
  },
  {
    icon: Home,
    title: 'Lapor Rumah Kosong',
    desc: 'Warga bisa melaporkan rumah yang ditinggal pergi agar petugas ronda lebih waspada selama pemilik tidak di tempat.',
  },
  {
    icon: MessageSquare,
    title: 'Notifikasi WhatsApp & Telegram',
    desc: 'Setiap laporan dan alert penting otomatis terkirim ke nomor dan grup yang sudah ditentukan — tidak ada yang terlewat.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Analitik Berbasis AI',
    desc: 'Grafik tren kriminalitas, peta panas titik rawan, dan insight keamanan berbasis data untuk membantu keputusan aparat.',
  },
]

const roles = [
  {
    icon: Users,
    title: 'Warga',
    items: [
      'Melapor kejadian hanya dalam hitungan detik',
      'Panic button darurat dengan lokasi GPS otomatis',
      'Cek jadwal ronda dan status kehadiran petugas',
      'Laporkan rumah kosong agar lebih terpantau',
    ],
  },
  {
    icon: Shield,
    title: 'Aparat Gampong',
    items: [
      'Kelola jadwal ronda seluruh lingkungan',
      'Pantau presensi kehadiran petugas lewat QR',
      'Akses data keamanan gampong secara real-time',
      'Koordinasi langsung dengan pihak Polsek',
    ],
  },
  {
    icon: Shield,
    title: 'Polsek',
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur shadow-md border-b border-gray-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImage} alt="SiKamling Digital" className="w-8 h-8 object-contain" />
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">
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
      <section className="relative pt-24 pb-16 lg:pt-28 lg:pb-24 overflow-hidden bg-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-block px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium mb-6"
              >
                KMIPN VIII 2026 &middot; Studi Kasus Gampong Kandang
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.15]"
              >
                Keamanan Lingkungan Gampong,{' '}
                <span className="text-blue-600">Kini Lebih Cepat</span>{' '}
                dan Terhubung.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl"
              >
                Menghubungkan warga, aparat gampong, dan Polsek dalam satu platform digital
                untuk ronda, pelaporan kamtibmas, dan tanggap darurat real-time.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Link
                  to="/login"
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Masuk ke Aplikasi
                </Link>
                <a
                  href="#fitur"
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Pelajari Lebih Lanjut
                </a>
              </motion.div>
            </div>

            <div className="hidden lg:block relative">
              {/* Decorative blur behind panel */}
              <div className="absolute -inset-4 bg-blue-500/10 blur-3xl rounded-full" />

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative rounded-2xl shadow-2xl bg-[#1e293b] p-6 border border-gray-800"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-[#0f172a] rounded-xl p-4 border border-white/5">
                    <Moon className="w-6 h-6 text-blue-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white">Jadwal Ronda Malam Ini</div>
                      <div className="text-xs text-gray-400">Lingkungan I &middot; Shift 1 &middot; 8 personel</div>
                    </div>
                    <span className="ml-auto px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full shrink-0">Aktif</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#0f172a] rounded-xl p-4 border border-white/5">
                    <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white">Laporan Baru Diterima</div>
                      <div className="text-xs text-gray-400">Kategori: Pencurian &middot; Urgensi: Tinggi</div>
                    </div>
                    <span className="ml-auto px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full shrink-0">Baru</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#0f172a] rounded-xl p-4 border border-white/5">
                    <ClipboardList className="w-6 h-6 text-blue-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white">Presensi Tercatat</div>
                      <div className="text-xs text-gray-400">Hasanuddin &middot; Lingkungan I &middot; 19:32 WIB</div>
                    </div>
                    <span className="ml-auto px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full shrink-0">Hadir</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION MASALAH ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">Kenapa Ini Dibutuhkan?</h2>
            <p className="mt-3 text-gray-500">Data ini menunjukkan mengapa sistem keamanan lingkungan yang terdigitalisasi bukan lagi sekadar pilihan, melainkan kebutuhan mendesak.</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm"
              >
                <div className="text-4xl font-extrabold text-[#0f172a]">{s.number}</div>
                <div className="text-sm font-semibold text-blue-600 mt-1">{s.unit}</div>
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-gray-600 mt-10 max-w-2xl mx-auto text-sm leading-relaxed">
            Sistem ini hadir untuk menjawab kondisi tersebut secara digital dan real-time
            mengubah ronda konvensional menjadi sistem terukur, verifiable, dan terhubung langsung
            dengan pihak keamanan.
          </p>
        </div>
      </section>

      {/* ── SECTION FITUR ── */}
      <section id="fitur" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">Fitur Unggulan</h2>
            <p className="mt-3 text-gray-500">Solusi lengkap mulai dari penjadwalan ronda hingga analitik berbasis kecerdasan buatan.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-[#0f172a] mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION CARA KERJA ── */}
      <section id="cara-kerja" className="py-20 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Cara Kerja</h2>
            <p className="mt-3 text-gray-400">Tiga langkah sederhana dari laporan warga hingga tindak lanjut aparat.</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8 relative">
            {/* Connector line — desktop only */}
            <div className="hidden sm:block absolute top-16 left-[20%] right-[20%] h-px border-t border-dashed border-blue-500/30" />

            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold mb-6 relative z-10">
                  {s.num}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION UNTUK SIAPA ── */}
      <section id="untuk-siapa" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">Untuk Siapa?</h2>
            <p className="mt-3 text-gray-500">Setiap peran punya manfaat langsung dari satu platform yang sama.</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {roles.map((r, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <r.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-[#0f172a] text-lg mb-4">{r.title}</h3>
                <ul className="space-y-3">
                  {r.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <ChevronRight className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION STUDI KASUS ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-10 sm:p-14"
          >
            <div className="flex flex-col sm:flex-row items-start gap-8">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                <MapPin className="w-6 h-6" />
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
                  yang terintegrasi di gampong dengan struktur pemerintahan tradisional Aceh mulai
                  dari Keuchik, Tuha Peut, hingga jaringan ronda yang aktif di tiap lingkungan.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA BAWAH ── */}
      <section className="py-20 bg-[#0f172a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
          >
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
          </motion.div>
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
