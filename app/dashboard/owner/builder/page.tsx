import { OwnerBuilder } from '@/components/builder/owner-builder';

export default async function BuilderPage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  const params = await searchParams;
  const client = params.client ?? 'cultured-soul-kitchen';

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <OwnerBuilder client={client} />
    </main>
  );
}
