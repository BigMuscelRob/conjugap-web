import Link from 'next/link';
import Image from 'next/image';

interface ComingSoonPageProps {
  title:    string;
  subtitle: string;
}

export default function ComingSoonPage({ title, subtitle }: ComingSoonPageProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-20 text-center">
      <Image
        src="/assets/mascot-mini.svg"
        width={56}
        height={56}
        alt=""
        className="animate-breathe mb-6 opacity-60"
      />
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill
        bg-saffron-50 border border-saffron-200 text-[11px] font-bold uppercase
        tracking-[0.08em] text-saffron-700 mb-5">
        Coming Soon
      </span>
      <h1 className="font-display font-bold text-[32px] tracking-tightest text-ink-900 mb-3">
        {title}
      </h1>
      <p className="text-small text-ink-500 max-w-[380px] leading-5 mb-8">
        {subtitle}
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-bold text-small text-ink-700
          no-underline hover:text-terracotta-500 transition-colors duration-micro"
      >
        <i className="ph-bold ph-arrow-left text-[14px]" />
        Zurück zur Startseite
      </Link>
    </div>
  );
}
