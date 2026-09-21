export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="نشان اسبان: نعل اسب با خط ضربان قلب">
      <path d="M20,88 A32,32 0 1 1 80,88" fill="none" stroke="#f4f1e6" strokeWidth="9" strokeLinecap="round" />
      <line x1="20" y1="88" x2="20" y2="97" stroke="#f4f1e6" strokeWidth="9" strokeLinecap="round" />
      <line x1="80" y1="88" x2="80" y2="97" stroke="#f4f1e6" strokeWidth="9" strokeLinecap="round" />
      <path
        d="M14,60 L34,60 L41,42 L49,74 L57,46 L64,60 L86,60"
        fill="none"
        stroke="#c9a227"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
