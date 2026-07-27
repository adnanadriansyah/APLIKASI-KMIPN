export default function DecorativeBackground({ variant = 'dark' }) {
  const isDark = variant === 'dark'

  return (
    <>
      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px',
          color: isDark ? 'white' : '#94a3b8',
        }}
      />

      {/* Blur circles */}
      <div
        className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(59,130,246,0.15)' }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(59,130,246,0.12)' }}
      />
    </>
  )
}
