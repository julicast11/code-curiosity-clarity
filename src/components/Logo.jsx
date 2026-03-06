export function LogoMark({ size = 28, animate = false }) {
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={animate ? 'splash-arcs' : undefined}
      >
        <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(200,151,74,0.12)" strokeWidth="0.8" />
        {/* Arc 1 - top */}
        <path d="M30 38 Q50 10 70 38" fill="none" stroke="#C8974A" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="30" cy="38" r="2.5" fill="#C8974A" />
        <circle cx="70" cy="38" r="2.5" fill="#C8974A" />
        {/* Arc 2 - bottom-left */}
        <path d="M26 42 Q30 75 50 70" fill="none" stroke="#E8B86A" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="26" cy="42" r="2.5" fill="#E8B86A" />
        <circle cx="50" cy="70" r="2.5" fill="#E8B86A" />
        {/* Arc 3 - bottom-right */}
        <path d="M50 70 Q70 75 74 42" fill="none" stroke="#F0D090" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="74" cy="42" r="2.5" fill="#F0D090" />
      </svg>
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: 'var(--font-headline)',
          fontSize: size * 0.38,
          fontWeight: 700,
          color: '#C8974A',
          lineHeight: 1,
        }}
      >
        J
      </span>
    </div>
  );
}

export function LogoFull() {
  return (
    <div className="nav-logo">
      <LogoMark size={28} />
      <span className="nav-logo-text">
        <span className="gold">Code</span>, <span className="italic">Curiosity</span> & Clarity
      </span>
    </div>
  );
}
