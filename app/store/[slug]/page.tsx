import { StorePage } from '@/components/store/store-page';

export default async function RestaurantStore({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <StorePage slug={slug} />;
}
