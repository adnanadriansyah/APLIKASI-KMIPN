import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Moon, ClipboardList, AlertTriangle, Home, MessageSquare, BarChart3,
  Users, Shield, ChevronRight, MapPin,
} from 'lucide-react'
import { HeroSection } from '../components'

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
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      <HeroSection />

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
      <section id="fitur" className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeScale}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Fitur Unggulan</h2>
            <p className="mt-3 text-slate-500">Solusi lengkap mulai dari penjadwalan ronda hingga analitik berbasis kecerdasan buatan.</p>
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
                className="group relative p-6 rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center mb-4 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-500"
                  whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                >
                  <f.icon className="w-5 h-5" />
                </motion.div>
                <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SECTION CARA KERJA ── */}
      <section id="cara-kerja" className="py-20 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 h-80 w-80 rounded-full bg-indigo-500/5 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeScale}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Cara Kerja</h2>
            <p className="mt-3 text-slate-500">Tiga langkah sederhana dari laporan warga hingga tindak lanjut aparat.</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8 relative">
            <div className="hidden sm:block absolute top-16 left-[20%] right-[20%] h-px border-t border-dashed border-blue-300" />

            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative text-center group"
              >
                <motion.div
                  className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-bold mb-6 relative z-10 shadow-lg shadow-blue-600/30 group-hover:shadow-blue-600/50 group-hover:scale-110 transition-all duration-300"
                >
                  {s.num}
                </motion.div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
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
      <section id="studi-kasus" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeScale}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">Lokasi Pilot Project</h2>
            <p className="mt-3 text-gray-500">Gampong Kandang, Kecamatan Muara Dua, Kota Lhokseumawe, Aceh</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10 flex flex-col"
            >
              <motion.div
                className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-5"
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.3 }}
              >
                <MapPin className="w-6 h-6" />
              </motion.div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-3">Kenapa Gampong Kandang?</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Sistem Siskamling Digital ini dirancang untuk diterapkan secara langsung di{' '}
                <strong className="text-[#0f172a]">Gampong Kandang, Kecamatan Muara Dua</strong>,
                di bawah wilayah hukum{' '}
                <strong className="text-[#0f172a]">Polsek Muara Dua, Kota Lhokseumawe, Aceh</strong>,
                sebagai lokasi uji coba awal (pilot project).
              </p>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Pemilihan lokasi ini berdasarkan kebutuhan nyata akan sistem keamanan lingkungan
                yang terintegrasi di gampong dengan struktur pemerintahan tradisional Aceh mulai
                dari Keuchik, Tuha Peut, hingga jaringan ronda yang aktif di tiap lingkungan.
              </p>
              <div className="mt-auto grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">3</div>
                  <div className="text-xs text-gray-500">Lingkungan</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">1</div>
                  <div className="text-xs text-gray-500">Polsek Wilayah</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">4</div>
                  <div className="text-xs text-gray-500">Aparatur Gampong</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full"
            >
              <div className="w-full h-80 sm:h-full min-h-[300px]">
                <iframe
                  title="Lokasi Gampong Kandang"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31849.82658951884!2d96.66066231767595!3d5.185451441813887!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30477b6d0e6d9d0d%3A0x3039d80b220d7c0!2sMuara%20Dua%2C%20Lhokseumawe%20City%2C%20Aceh!5e1!3m2!1sen!2sid!4v1"
                  className="w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA BAWAH ── */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 -ml-40 -mt-40 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 -mr-40 -mb-40 h-80 w-80 rounded-full bg-indigo-500/5 blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Siap Meningkatkan Keamanan Gampong?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-500 mb-8 max-w-lg mx-auto">
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
                  className="inline-block px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
                >
                  Masuk ke Aplikasi
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-lg font-extrabold text-slate-900">
                SiKamling<span className="text-blue-600"> Digital</span>
              </span>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Sistem Keamanan Lingkungan Gampong Berbasis Digital dan Real-Time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Tautan</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#fitur" className="hover:text-blue-600 transition-colors">Fitur</a></li>
                <li><a href="#cara-kerja" className="hover:text-blue-600 transition-colors">Cara Kerja</a></li>
                <li><Link to="/login" className="hover:text-blue-600 transition-colors">Masuk</Link></li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Pengembang</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Dikembangkan oleh <strong className="text-slate-700">Tim Mon Seven</strong>
                <br />
                Politeknik Negeri Lhokseumawe
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Kompetisi Mahasiswa Informatika Politeknik Negeri (KMIPN) VIII 2026
              </p>
            </motion.div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} Siskamling Digital. Hak cipta dilindungi.</p>
            <p className="text-xs text-slate-400">Gampong Kandang &middot; Kec. Muara Dua &middot; Kota Lhokseumawe, Aceh</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
