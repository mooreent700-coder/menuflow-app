'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { slugify } from '@/lib/utils';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-10">
      <div className="w-full rounded-[2rem] border border-white/10 bg-panel p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">Self-serve signup</p>
        <h1 className="mt-3 text-3xl font-semibold">Launch your MenuFlow website.</h1>
        <p className="mt-2 text-white/60">This starter redirects each client into their own builder.</p>
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const slug = slugify(name || 'my-restaurant');
            router.push(`/dashboard/owner/builder?client=${slug}`);
          }}
        >
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl bg-white px-4 py-3" placeholder="Restaurant name" />
          <input className="w-full rounded-xl bg-white px-4 py-3" placeholder="Email" />
          <input className="w-full rounded-xl bg-white px-4 py-3" placeholder="Phone" />
          <input className="w-full rounded-xl bg-white px-4 py-3" placeholder="Password" type="password" />
          <button className="w-full rounded-full bg-gold px-5 py-3 font-semibold text-black">Create my builder</button>
        </form>
      </div>
    </main>
  );
}
