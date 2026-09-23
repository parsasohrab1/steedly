import Image from 'next/image';

interface LogoProps {
  /** Height of the mark in pixels */
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

/** Steedly brand mark (horse head on a heartbeat line) with optional wordmark. */
export default function Logo({ size = 36, showWordmark = true, className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image src="/logo-mark.svg" alt="استیدلی" width={size} height={size} priority />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-xl font-extrabold text-ink">استیدلی</span>
          <span className="text-[11px] font-semibold tracking-wide text-primary-600" dir="ltr">
            Steedly
          </span>
        </span>
      )}
    </span>
  );
}
