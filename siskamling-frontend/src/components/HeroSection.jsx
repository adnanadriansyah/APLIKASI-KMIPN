import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ArrowRight, Menu, X } from 'lucide-react'
import heroImage from '../assets/images/hero-section2.jpg'
import logoIcon from '../assets/images/icon.png'

const navLinks = [
  { label: 'Fitur', href: '#fitur' },
  { label: 'Cara Kerja', href: '#cara-kerja' },
  { label: 'Untuk Siapa', href: '#untuk-siapa' },
  { label: 'Studi Kasus', href: '#studi-kasus' },
]

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
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

export default function HeroSection() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 overflow-hidden">
      <style>{`
        .parallax-wave > use {
          animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
        }
        .parallax-wave > use:nth-child(1) { animation-delay: -2s; animation-duration: 7s; }
        .parallax-wave > use:nth-child(2) { animation-delay: -3s; animation-duration: 10s; }
        .parallax-wave > use:nth-child(3) { animation-delay: -4s; animation-duration: 13s; }
        .parallax-wave > use:nth-child(4) { animation-delay: -5s; animation-duration: 20s; }
        @keyframes move-forever {
          0%   { transform: translate3d(-90px, 0, 0); }
          100% { transform: translate3d(85px, 0, 0); }
        }
      `}</style>
      <div className="absolute top-0 right-0 -mr-40 -mt-40 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 h-80 w-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <nav className={`fixed top-0 inset-x-0 z-50 w-full px-6 md:px-12 py-4 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
            <img src={logoIcon} alt="SiKamling" className="w-10 h-10 object-contain" />
            <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              SiKamling<span className={scrolled ? 'text-blue-600' : 'text-blue-200'}> Digital</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                className={`transition-colors text-sm font-medium ${scrolled ? 'text-gray-600 hover:text-blue-600' : 'text-slate-200 hover:text-white'}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          <div className="hidden md:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Link
                to="/login"
                className={`inline-block px-5 py-2 rounded-xl backdrop-blur-md transition font-medium text-sm ${
                  scrolled
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                Masuk
              </Link>
            </motion.div>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className={`w-5 h-5 ${scrolled ? 'text-gray-700' : 'text-white'}`} />
            ) : (
              <Menu className={`w-5 h-5 ${scrolled ? 'text-gray-700' : 'text-white'}`} />
            )}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="md:hidden overflow-hidden mt-3"
            >
              <div className={`${scrolled ? 'bg-white border border-gray-200 shadow-xl' : 'bg-slate-900/80 backdrop-blur-xl border border-white/10'} rounded-2xl p-4 space-y-2`}>
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                      scrolled
                        ? 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                        : 'text-slate-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className={`block mt-2 px-3 py-2.5 text-sm font-medium text-center rounded-xl transition-colors ${
                    scrolled
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }`}
                >
                  Masuk
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-24 lg:pb-32">
        <motion.div
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <div>
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 bg-white/10 text-blue-100 border border-white/20 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
            >
              KMIPN VIII 2026 &mdash; Studi Kasus Gampong Kandang
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-white text-4xl lg:text-5xl font-extrabold leading-tight"
            >
              Keamanan Lingkungan Gampong,{' '}
              <span className="text-amber-400">Kini Lebih Cepat</span>{' '}
              dan Terhubung.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-slate-300 text-base md:text-lg mt-4 max-w-xl leading-relaxed"
            >
              Menghubungkan warga, aparat gampong, dan Polsek dalam satu platform digital
              untuk ronda, pelaporan kamtibmas, dan tanggap darurat real-time.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition"
              >
                Masuk ke Aplikasi
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#fitur"
                className="inline-flex items-center gap-2 border border-white/20 hover:bg-white/10 text-white font-medium px-6 py-3.5 rounded-xl backdrop-blur-sm transition"
              >
                Pelajari Lebih Lanjut
                <ChevronRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="border border-white/10 bg-white/5 backdrop-blur-sm rounded-3xl p-2 shadow-2xl"
            >
              <motion.img
                src={heroImage}
                alt="SiKamling Hero Illustration"
                className="w-full max-w-md h-auto rounded-2xl object-cover"
                animate={{ y: [0, -12, 0], rotate: [2, -1, 2] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="w-full overflow-hidden leading-none pointer-events-none">
        <svg
          className="w-full h-[80px] md:h-[130px]"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shapeRendering="auto"
        >
          <defs>
            <path
              id="gentle-wave"
              d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>
          <g className="parallax-wave">
            <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(6,182,212,0.25)" />
            <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(59,130,246,0.35)" />
            <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.6)" />
            <use xlinkHref="#gentle-wave" x="48" y="7" fill="#ffffff" />
          </g>
        </svg>
      </div>
    </section>
  )
}
