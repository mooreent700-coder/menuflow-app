import { supabase } from '@/lib/supabase';
import StorePage from '@/components/store/store-page';

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!restaurant) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-2xl font-bold">Store not found</h1>
      </main>
    );
  }

  const { data: items } = await supabase
  .from('menu_items')
  .select('*')
  .eq('restaurant_id', restaurant.id)
  .order('created_at', { ascending: false });

  const safeRestaurant = {
    id: restaurant.id,
    slug: restaurant.slug,
    name: restaurant.name || '',
    name_en: restaurant.name_en || restaurant.name || '',
    name_es: restaurant.name_es || restaurant.name || '',
    description: restaurant.description || '',
    description_en: restaurant.description_en || restaurant.description || '',
    description_es: restaurant.description_es || restaurant.description || '',
    phone: restaurant.phone || '',
    address: restaurant.address || '',
    google_maps_url: restaurant.google_maps_url || '',
    hero: restaurant.hero || restaurant.hero_url || restaurant.hero_image || restaurant.image || '',
    hero_url: restaurant.hero_url || restaurant.hero_image || restaurant.hero || '',
    image: restaurant.image || restaurant.hero_image || '',
    items:
      (items || []).map((item: any) => ({
        id: item.id,
        restaurant_id: item.restaurant_id,
        name: item.name || '',
        name_en: item.name_en || item.name || '',
        name_es: item.name_es || item.name || '',
        description: item.description || '',
        description_en: item.description_en || item.description || '',
        description_es: item.description_es || item.description || '',
        image: item.image || item.image_url || '',
        image_url: item.image_url || item.image || '',
        price: Number(item.price || 0),
      })) || [],
  };

  return <StorePage data={safeRestaurant} />;
}
