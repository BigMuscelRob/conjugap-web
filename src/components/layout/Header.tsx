import Link from 'next/link';
import Image from 'next/image';
import { auth, signOut } from '@/../auth';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import NavLinks    from './NavLinks';
import DesktopAuth from './DesktopAuth';
import MobileNav   from './MobileNav';

export default async function Header() {
  const session = await auth();

  async function handleSignOut() {
    'use server';
    await signOut({ redirectTo: '/' });
  }

  return (
    <header className="sticky top-0 z-50 bg-cream/85 backdrop-blur-md border-b border-ink-900/[0.08]">
      <div className="max-w-content mx-auto px-4 sm:px-6 py-3.5 flex items-center">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline text-ink-900 shrink-0">
          <Image src="/assets/mascot-mini.svg" width={32} height={32} alt="ConjuGap Logo" />
          <span className="font-display font-bold text-[22px] tracking-tightest">
            Conju<span className="text-terracotta-500">Gap</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 ml-auto" aria-label="Hauptnavigation">
          <LanguageSwitcher />
          <NavLinks />
        </nav>

        {/* Desktop auth */}
        <DesktopAuth
          loggedIn={!!session?.user}
          userName={session?.user?.name ?? null}
          userImage={session?.user?.image ?? null}
          signOutAction={handleSignOut}
        />

        {/* Mobile hamburger + drawer */}
        <MobileNav
          loggedIn={!!session?.user}
          userName={session?.user?.name ?? null}
          signOutAction={handleSignOut}
        />
      </div>
    </header>
  );
}
