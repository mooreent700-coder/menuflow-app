'use client';

import { useMemo, useState } from 'react';
import { demoRestaurant, type MenuItem, type RestaurantData } from '@/lib/demo-data';
import { slugify } from '@/lib/utils';
import { StorefrontPreview } from '@/components/store/storefront-preview';

function toDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function OwnerBuilder({ client }: { client: string }) {
  const [data, setData] = useState<RestaurantData>({ ...demoRestaurant, slug: client });
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState<MenuItem['category']>('Plates');
  const [itemImage, setItemImage] = useState('https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80');
  const storefrontLink = useMemo(() => {
  if (typeof window === 'undefined') return `/store/${data.slug}`;
  return `${window.location.origin}/store/${data.slug}`;
}, [data.slug]);
  const updateField = (field: keyof RestaurantData, value: string) => {
    setData((current) => ({ ...current, [field]: value }));
  };

  const addItem = () => {
    if (!itemName || !itemPrice) return;
    const next: MenuItem = {
      id: crypto.randomUUID(),
      name: itemName,
      description: itemDescription,
      price: Number(itemPrice),
      category: itemCategory,
      image: itemImage
    };
    setData((current) => ({ ...current, items: [next, ...current.items] }));
    setItemName('');
    setItemDescription('');
    setItemPrice('');
  };

  const saveDraft = () => {
    localStorage.setItem(`menuflow_draft_${data.slug}`, JSON.stringify(data));
    alert('Draft saved.');
  };

  const goLive = () => {
    localStorage.setItem(`menuflow_live_${data.slug}`, JSON.stringify(data));
    alert('Website is live.');
  };

  return (
    <div className="builder-grid">
      <section className="space-y-6 rounded-[2rem] border border-white/10 bg-panel p-6 shadow-soft">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-gold">Owner builder</p>
          <h1 className="mt-2 text-3xl font-semibold">Build the whole restaurant website in one place.</h1>
          <p className="mt-2 text-white/65">Hero, logo, menu, preview, and publish all in one spot.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span>Restaurant name</span>
            <input value={data.name} onChange={(e) => updateField('name', e.target.value)} className="w-full rounded-xl border border-white/10 bg-white px-4 py-3" />
          </label>
          <label className="space-y-2 text-sm">
            <span>Slug</span>
            <input value={data.slug} onChange={(e) => updateField('slug', slugify(e.target.value))} className="w-full rounded-xl border border-white/10 bg-white px-4 py-3" />
          </label>
          <label className="space-y-2 text-sm">
            <span>Text-to-order number</span>
            <input value={data.phone} onChange={(e) => updateField('phone', e.target.value)} className="w-full rounded-xl border border-white/10 bg-white px-4 py-3" />
          </label>
          <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-white/70">
            <p className="font-semibold text-white">Customer website</p>
            <p className="mt-2 rounded-xl bg-black/30 p-3">{storefrontLink}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span>Logo upload</span>
            <input type="file" accept="image/*" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              updateField('logo', await toDataUrl(file));
            }} className="block w-full rounded-xl border border-white/10 bg-white px-4 py-3 text-black" />
          </label>
          <label className="space-y-2 text-sm">
            <span>Hero upload</span>
            <input type="file" accept="image/*" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              updateField('hero', await toDataUrl(file));
            }} className="block w-full rounded-xl border border-white/10 bg-white px-4 py-3 text-black" />
          </label>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-5">
          <div>
            <p className="text-lg font-semibold">Add menu item</p>
            <p className="text-sm text-white/60">Upload photo, name, price, and category.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input placeholder="Item name" value={itemName} onChange={(e) => setItemName(e.target.value)} className="rounded-xl border border-white/10 bg-white px-4 py-3" />
            <input placeholder="Price" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} className="rounded-xl border border-white/10 bg-white px-4 py-3" />
            <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value as MenuItem['category'])} className="rounded-xl border border-white/10 bg-white px-4 py-3">
              <option>Plates</option>
              <option>Desserts</option>
              <option>Beverages</option>
            </select>
            <input placeholder="Description" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} className="rounded-xl border border-white/10 bg-white px-4 py-3" />
            <label className="space-y-2 text-sm md:col-span-2">
              <span>Item photo</span>
              <input type="file" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setItemImage(await toDataUrl(file));
              }} className="block w-full rounded-xl border border-white/10 bg-white px-4 py-3 text-black" />
            </label>
          </div>
          <button onClick={addItem} className="rounded-full bg-gold px-5 py-3 font-semibold text-black">Add item</button>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={saveDraft} className="rounded-full border border-white/15 px-5 py-3 font-semibold">Save draft</button>
          <button onClick={goLive} className="rounded-full bg-gold px-5 py-3 font-semibold text-black">Go live</button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-[2rem] border border-white/10 bg-panel p-4 text-sm text-white/70 shadow-soft">
          <p className="font-semibold text-white">Live mobile preview</p>
          <p className="mt-1">This is what the customer sees after you go live.</p>
        </div>
        <StorefrontPreview data={data} />
      </section>
    </div>
  );
}
