'use client';

import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import type { RestaurantData } from '@/lib/demo-data';

export function StorefrontPreview({ data }: { data: RestaurantData }) {
  const categories = ['Plates', 'Desserts', 'Beverages'] as const;

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-panel shadow-soft">
      <div className="relative h-56 w-full">
        <Image src={data.hero} alt={data.name} fill className="object-cover" />
      </div>
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/10">
            <Image src={data.logo} alt={data.name} fill className="object-cover" />
          </div>
          <div>
            <p className="text-lg font-semibold">{data.name}</p>
            <p className="text-sm text-white/60">Text to order · {data.phone}</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-auto pb-1 text-sm">
          {categories.map((category) => (
            <span key={category} className="whitespace-nowrap rounded-full border border-white/10 px-3 py-1.5 text-white/70">{category}</span>
          ))}
        </div>

        <div className="space-y-3">
          {data.items.slice(0, 4).map((item) => (
            <div key={item.id} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm font-semibold text-gold">{formatCurrency(item.price)}</p>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-white/60">{item.description}</p>
                <button className="mt-2 rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-black">Add to cart</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
