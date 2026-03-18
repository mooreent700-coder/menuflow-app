'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { demoRestaurant, type MenuItem, type RestaurantData } from '@/lib/demo-data';
import { formatCurrency } from '@/lib/utils';

export function StorePage({ slug }: { slug: string }) {
  const [data, setData] = useState<RestaurantData>(demoRestaurant);
  const [active, setActive] = useState<'Plates' | 'Desserts' | 'Beverages'>('Plates');
  const [cart, setCart] = useState<MenuItem[]>([]);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`menuflow_live_${slug}`) : null;
    if (saved) setData(JSON.parse(saved));
    else setData({ ...demoRestaurant, slug });
  }, [slug]);

  const filtered = useMemo(() => data.items.filter((item) => item.category === active), [active, data.items]);
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <main className="min-h-screen bg-ink text-white">
      <div className="relative h-[42vh] min-h-[320px] w-full">
        <Image src={data.hero} alt={data.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-black/25 to-black/20" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-6xl p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/10">
              <Image src={data.logo} alt={data.name} fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">{data.name}</h1>
              <p className="text-white/75">Order direct. Keep it simple. Text to order at {data.phone}.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_340px] sm:px-6 lg:px-8">
        <section className="space-y-6">
          <div className="flex gap-2 overflow-auto pb-2">
            {(['Plates', 'Desserts', 'Beverages'] as const).map((category) => (
              <button key={category} onClick={() => setActive(category)} className={`rounded-full px-4 py-2 text-sm font-semibold ${active === category ? 'bg-gold text-black' : 'border border-white/10 text-white/70'}`}>
                {category}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-panel shadow-soft">
                <div className="relative h-48 w-full">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    <span className="font-semibold text-gold">{formatCurrency(item.price)}</span>
                  </div>
                  <p className="text-sm text-white/65">{item.description}</p>
                  <button onClick={() => setCart((current) => [...current, item])} className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-black">Add to cart</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="h-fit rounded-[2rem] border border-white/10 bg-panel p-5 shadow-soft lg:sticky lg:top-24">
          <p className="text-lg font-semibold">Your order</p>
          <div className="mt-4 space-y-3">
            {cart.length === 0 ? <p className="text-sm text-white/60">Your cart is empty.</p> : cart.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex items-center justify-between gap-3 text-sm">
                <span>{item.name}</span>
                <span className="text-gold">{formatCurrency(item.price)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Total</span>
              <span className="font-semibold text-gold">{formatCurrency(total)}</span>
            </div>
            <a href={`sms:${data.phone}?body=${encodeURIComponent(`New order from ${data.name} - Total ${formatCurrency(total)}`)}`} className="mt-4 block rounded-full bg-gold px-4 py-3 text-center font-semibold text-black">Text order</a>
          </div>
        </aside>
      </div>
    </main>
  );
}
