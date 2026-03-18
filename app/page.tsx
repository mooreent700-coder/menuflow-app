import Link from 'next/link';
import { SiteHeader } from '@/components/layout/site-header';
import { StorefrontPreview } from '@/components/store/storefront-preview';
import { demoRestaurant } from '@/lib/demo-data';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <SiteHeader />
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gold">MenuFlow 2.0</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight">Build your restaurant website, menu, and ordering flow in one place.</h1>
          <p className="mt-5 max-w-xl text-lg text-white/65">Clients sign up, build their own site, preview it, and go live. Customers open the menu link and order direct.</p>
          <div className="mt-8 flex gap-4">
            <Link href="/auth/signup" className="rounded-full bg-gold px-6 py-3 font-semibold text-black">Build my website</Link>
            <Link href="/dashboard/owner/builder?client=cultured-soul-kitchen" className="rounded-full border border-white/15 px-6 py-3 font-semibold">View builder</Link>
          </div>
        </div>
        <StorefrontPreview data={demoRestaurant} />
      </section>
    </main>
  );
}
