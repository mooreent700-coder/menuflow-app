import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-wide text-gold">MenuFlow</Link>
        <nav className="flex items-center gap-5 text-sm text-white/80">
          <Link href="/auth/signup" className="rounded-full bg-gold px-4 py-2 font-semibold text-black">Get started</Link>
          <Link href="/auth/login">Log in</Link>
        </nav>
      </div>
    </header>
  );
}
