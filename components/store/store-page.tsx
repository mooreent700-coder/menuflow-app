'use client';

import { useMemo, useState } from 'react';

type MenuItem = {
  id: string;
  name?: string | null;
  name_en?: string | null;
  name_es?: string | null;
  description?: string | null;
  description_en?: string | null;
  description_es?: string | null;
  image?: string | null;
  image_url?: string | null;
  price?: number | string | null;
};

type StoreData = {
  id: string;
  slug: string;
  name?: string | null;
  name_en?: string | null;
  name_es?: string | null;
  description?: string | null;
  description_en?: string | null;
  description_es?: string | null;
  hero?: string | null;
  hero_url?: string | null;
  image?: string | null;
  phone?: string | null;
  address?: string | null;
  google_maps_url?: string | null;
  items?: MenuItem[] | null;
};

type CartItem = MenuItem & {
  qty: number;
};

export default function StorePage({ data }: { data: StoreData }) {
  const [lang, setLang] = useState<'en' | 'es'>('en');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const heroSrc = data.hero || data.hero_url || data.image || '';
  const items = Array.isArray(data.items) ? data.items : [];

  const storeName =
    lang === 'en'
      ? data.name_en || data.name || data.name_es || 'MenuFlow Store'
      : data.name_es || data.name || data.name_en || 'MenuFlow Store';

  const storeDescription =
    lang === 'en'
      ? data.description_en || data.description || data.description_es || ''
      : data.description_es || data.description || data.description_en || '';

  const mapSrc =
    data.google_maps_url ||
    (data.address
      ? `https://www.google.com/maps?q=${encodeURIComponent(data.address)}&output=embed`
      : '');

  const addToCart = (item: MenuItem) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id);

      if (existing) {
        return current.map((entry) =>
          entry.id === item.id ? { ...entry, qty: entry.qty + 1 } : entry
        );
      }

      return [...current, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((current) =>
      current
        .map((entry) =>
          entry.id === id ? { ...entry, qty: entry.qty + delta } : entry
        )
        .filter((entry) => entry.qty > 0)
    );
  };

  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      return sum + Number(item.price || 0) * item.qty;
    }, 0);
  }, [cart]);

  const checkout = async () => {
    if (!cart.length || checkoutLoading) return;

    try {
      setCheckoutLoading(true);

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart: cart.map((item) => ({
            id: item.id,
            name: item.name || item.name_en || item.name_es || 'Item',
            name_en: item.name_en || item.name || '',
            name_es: item.name_es || item.name || '',
            price: Number(item.price || 0),
            qty: item.qty,
          })),
          restaurantId: data.id,
          slug: data.slug,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result?.url) {
        alert('Checkout failed');
        return;
      }

      window.location.href = result.url;
    } catch {
      alert('Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {heroSrc ? (
        <section className="w-full">
          <div className="h-[52vh] min-h-[340px] w-full overflow-hidden">
            <img
              src={heroSrc}
              alt={storeName}
              className="h-full w-full object-cover"
            />
          </div>
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-7xl px-4 pb-40 pt-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold sm:text-4xl">{storeName}</h1>

            {storeDescription ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70 sm:text-base">
                {storeDescription}
              </p>
            ) : null}

            {data.phone ? (
              <p className="mt-3 text-sm font-medium text-white/90">
                {lang === 'en' ? 'Order at:' : 'Ordena al:'} {data.phone}
              </p>
            ) : null}

            {data.address ? (
              <p className="mt-1 text-sm text-white/60">{data.address}</p>
            ) : null}
          </div>

          <div className="shrink-0 rounded-full border border-white/15 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                lang === 'en' ? 'bg-white text-black' : 'text-white/80'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('es')}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                lang === 'es' ? 'bg-white text-black' : 'text-white/80'
              }`}
            >
              ES
            </button>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const itemName =
              lang === 'en'
                ? item.name_en || item.name || item.name_es || 'Menu item'
                : item.name_es || item.name || item.name_en || 'Artículo';

            const itemDescription =
              lang === 'en'
                ? item.description_en || item.description || item.description_es || ''
                : item.description_es || item.description || item.description_en || '';

            const itemImage = item.image || item.image_url || '';
            const itemPrice = Number(item.price || 0);

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-white/5">
                  {itemImage ? (
                    <img
                      src={itemImage}
                      alt={itemName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-white/5" />
                  )}
                </div>

                <div className="p-4">
                  <h2 className="text-lg font-semibold leading-tight">
                    {itemName}
                  </h2>

                  {itemDescription ? (
                    <p className="mt-2 min-h-[44px] text-sm text-white/65">
                      {itemDescription}
                    </p>
                  ) : (
                    <div className="mt-2 min-h-[44px]" />
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xl font-bold">
                      ${itemPrice.toFixed(2)}
                    </span>

                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                      className="rounded-xl bg-white px-5 py-2 text-sm font-bold text-black transition hover:opacity-90"
                    >
                      {lang === 'en' ? 'Add' : 'Agregar'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {mapSrc ? (
          <section className="mt-10">
            <h3 className="mb-3 text-xl font-bold">
              {lang === 'en' ? 'Location' : 'Ubicación'}
            </h3>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <iframe
                src={mapSrc}
                width="100%"
                height="320"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Store location map"
              />
            </div>
          </section>
        ) : null}
      </section>

      {cart.length > 0 ? (
        <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/95 backdrop-blur">
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="mb-3 max-h-40 overflow-y-auto">
              {cart.map((item) => {
                const itemName =
                  lang === 'en'
                    ? item.name_en || item.name || item.name_es || 'Menu item'
                    : item.name_es || item.name || item.name_en || 'Artículo';

                return (
                  <div
                    key={item.id}
                    className="mb-2 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{itemName}</p>
                      <p className="text-xs text-white/60">
                        ${Number(item.price || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, -1)}
                        className="h-8 w-8 rounded-lg border border-white/15 text-lg"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, 1)}
                        className="h-8 w-8 rounded-lg border border-white/15 text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="text-lg font-bold">${total.toFixed(2)}</span>
            </div>

            <button
              type="button"
              onClick={checkout}
              disabled={checkoutLoading}
              className="w-full rounded-xl bg-white py-3 text-base font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkoutLoading ? 'Starting checkout...' : 'Checkout'}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}