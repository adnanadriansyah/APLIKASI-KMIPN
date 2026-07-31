import { AnimatePresence, motion } from 'framer-motion'
import iconApp from '../assets/images/icon.png'

export default function SplashScreen({ isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col items-center px-6">
            {/* Circle container with icon */}
            <div className="relative flex items-center justify-center">
              {/* Rotating circle border — pure CSS smooth spin */}
              <svg
                className="absolute"
                width="176"
                height="176"
                viewBox="0 0 176 176"
                style={{ animation: 'splashSpin 1.5s linear infinite' }}
              >
                <circle
                  cx="88"
                  cy="88"
                  r="82"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="82"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeDasharray="129 386"
                  strokeLinecap="round"
                />
              </svg>

              {/* Inner circle bg */}
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-slate-100 shadow-inner md:h-36 md:w-36">
                <img
                  src={iconApp}
                  alt="SiKamling Digital"
                  className="h-24 w-24 md:h-28 md:w-28"
                  style={{ animation: 'splashBreathe 2s ease-in-out infinite' }}
                />
              </div>
            </div>

            {/* Title */}
            <h1 className="mt-8 text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
              SiKamling Digital
            </h1>

            {/* Subtitle */}
            <p className="mt-2 text-sm font-medium text-slate-400">
              Memuat aplikasi...
            </p>
          </div>

          <style>{`
            @keyframes splashSpin {
              to { transform: rotate(360deg); }
            }
            @keyframes splashBreathe {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.06); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
