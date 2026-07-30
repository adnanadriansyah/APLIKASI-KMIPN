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

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const fadeScale = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
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
      <motion.nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100' : 'bg-transparent'
        }`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.img
              src={logoImage}
              alt="SiKamling Digital"
              className="w-8 h-8 object-contain"
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">
              SiKamling<span className="text-blue-600"> Digital</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            {['Fitur', 'Cara Kerja', 'Untuk Siapa'].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="relative hover:text-blue-600 transition-colors"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
              >
                {item}
              </motion.a>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Link
              to="/login"
              className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 inline-block"
            >
              Masuk
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="relative pt-24 pb-16 lg:pt-28 lg:pb-24 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 h-80 w-80 rounded-full bg-violet-100/30 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="inline-block px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium mb-6"
              >
                KMIPN VIII 2026 &middot; Studi Kasus Gampong Kandang
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.15]"
              >
                Keamanan Lingkungan Gampong,{' '}
                <span className="text-blue-600">Kini Lebih Cepat</span>{' '}
                dan Terhubung.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl"
              >
                Menghubungkan warga, aparat gampong, dan Polsek dalam satu platform digital
                untuk ronda, pelaporan kamtibmas, dan tanggap darurat real-time.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Link
                  to="/login"
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm"
                >
                  Masuk ke Aplikasi
                </Link>
                <a
                  href="#fitur"
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-300 hover:-translate-y-0.5 text-sm"
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
                    {[
                      { icon: Moon, label: 'Jadwal Ronda Malam Ini', sub: 'Lingkungan I \u00b7 Shift 1 \u00b7 8 personel', badge: 'Aktif', badgeClass: 'bg-emerald-500/20 text-emerald-400' },
                      { icon: AlertTriangle, label: 'Laporan Baru Diterima', sub: 'Kategori: Pencurian \u00b7 Urgensi: Tinggi', badge: 'Baru', badgeClass: 'bg-red-500/20 text-red-400' },
                      { icon: ClipboardList, label: 'Presensi Tercatat', sub: 'Hasanuddin \u00b7 Lingkungan I \u00b7 19:32 WIB', badge: 'Hadir', badgeClass: 'bg-blue-500/20 text-blue-400' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                        className="flex items-center gap-3 bg-[#0f172a] rounded-xl p-4 border border-white/5"
                      >
                        <item.icon className="w-6 h-6 text-blue-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white">{item.label}</div>
                          <div className="text-xs text-gray-400">{item.sub}</div>
                        </div>
                        <span className={`ml-auto px-2 py-0.5 text-xs rounded-full shrink-0 ${item.badgeClass}`}>{item.badge}</span>
                      </motion.div>
                    ))}
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
            variants={fadeScale}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">Kenapa Ini Dibutuhkan?</h2>
            <p className="mt-3 text-gray-500">Data ini menunjukkan mengapa sistem keamanan lingkungan yang terdigitalisasi bukan lagi sekadar pilihan, melainkan kebutuhan mendesak.</p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <motion.div
                  className="text-4xl font-extrabold text-[#0f172a]"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {s.number}
                </motion.div>
                <div className="text-sm font-semibold text-blue-600 mt-1">{s.unit}</div>
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>

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
            variants={fadeScale}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">Fitur Unggulan</h2>
            <p className="mt-3 text-gray-500">Solusi lengkap mulai dari penjadwalan ronda hingga analitik berbasis kecerdasan buatan.</p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="group p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
              >
                <motion.div
                  className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4"
                  whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                >
                  <f.icon className="w-5 h-5" />
                </motion.div>
                <h3 className="font-semibold text-[#0f172a] mb-2 group-hover:text-blue-600 transition-colors duration-300">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SECTION CARA KERJA ── */}
      <section id="cara-kerja" className="py-20 bg-[#0f172a] relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 h-72 w-72 rounded-full bg-violet-500/5 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeScale}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Cara Kerja</h2>
            <p className="mt-3 text-gray-400">Tiga langkah sederhana dari laporan warga hingga tindak lanjut aparat.</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8 relative">
            <div className="hidden sm:block absolute top-16 left-[20%] right-[20%] h-px border-t border-dashed border-blue-500/30" />

            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative text-center"
              >
                <motion.div
                  className="w-16 h-16 mx-auto rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold mb-6 relative z-10"
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  {s.num}
                </motion.div>
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
            variants={fadeScale}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">Untuk Siapa?</h2>
            <p className="mt-3 text-gray-500">Setiap peran punya manfaat langsung dari satu platform yang sama.</p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {roles.map((r, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-400"
              >
                <motion.div
                  className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <r.icon className="w-5 h-5" />
                </motion.div>
                <h3 className="font-semibold text-[#0f172a] text-lg mb-4">{r.title}</h3>
                <ul className="space-y-3">
                  {r.items.map((item, j) => (
                    <motion.li
                      key={j}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + j * 0.05 }}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <ChevronRight className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
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
            className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-10 sm:p-14"
          >
            <motion.div
              className="flex flex-col sm:flex-row items-start gap-8"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div
                variants={fadeUp}
                className="shrink-0 w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center"
              >
                <MapPin className="w-6 h-6" />
              </motion.div>
              <div>
                <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-[#0f172a] mb-4">Lokasi Pilot Project</motion.h2>
                <motion.p variants={fadeUp} className="text-gray-600 leading-relaxed mb-4">
                  Sistem Siskamling Digital ini dirancang untuk diterapkan secara langsung di{' '}
                  <strong className="text-[#0f172a]">Gampong Kandang, Kecamatan Muara Dua</strong>,
                  di bawah wilayah hukum{' '}
                  <strong className="text-[#0f172a]">Polsek Muara Dua, Kota Lhokseumawe, Aceh</strong>,
                  sebagai lokasi uji coba awal (pilot project).
                </motion.p>
                <motion.p variants={fadeUp} className="text-sm text-gray-500 leading-relaxed">
                  Pemilihan lokasi ini berdasarkan kebutuhan nyata akan sistem keamanan lingkungan
                  yang terintegrasi di gampong dengan struktur pemerintahan tradisional Aceh mulai
                  dari Keuchik, Tuha Peut, hingga jaringan ronda yang aktif di tiap lingkungan.
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA BAWAH ── */}
      <section className="py-20 bg-[#0f172a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-violet-600/5" />
        <motion.div
          className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl"
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Siap Meningkatkan Keamanan Gampong?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 mb-8 max-w-lg mx-auto">
              Masuk ke aplikasi dan mulai kelola jadwal ronda, laporan kamtibmas, dan tanggap darurat secara digital.
            </motion.p>
            <motion.div variants={fadeUp}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Link
                  to="/login"
                  className="inline-block px-8 py-3.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Masuk ke Aplikasi
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0b1120] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-lg font-extrabold text-white">
                SiKamling<span className="text-blue-500"> Digital</span>
              </span>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Sistem Keamanan Lingkungan Gampong Berbasis Digital dan Real-Time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Tautan</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#fitur" className="hover:text-white transition-colors">Fitur</a></li>
                <li><a href="#cara-kerja" className="hover:text-white transition-colors">Cara Kerja</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Masuk</Link></li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Pengembang</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Dikembangkan oleh <strong className="text-gray-400">Tim Mon Seven</strong>
                <br />
                Politeknik Negeri Lhokseumawe
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Kompetisi Mahasiswa Informatika Politeknik Negeri (KMIPN) VIII 2026
              </p>
            </motion.div>
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
