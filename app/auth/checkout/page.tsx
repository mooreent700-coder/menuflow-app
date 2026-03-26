'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type PlanKey = 'starter' | 'growth' | 'premium';

type PlanConfig = {
  name: string;
  price: string;
  features: string[];
};

const plans: Record<PlanKey, PlanConfig> = {
  starter: {
    name: 'Starter Plan',
    price: '$19/month',
    features: [
      'Full MenuFlow storefront',
      'Direct ordering system',
      'Owner dashboard access',
      'Customer order management',
      'Starter onboarding flow',
      'Mobile-first restaurant experience',
    ],
  },
  growth: {
    name: 'Growth Plan',
    price: '$49/month',
    features: [
      'Full MenuFlow storefront',
      'Direct ordering system',
      'Owner dashboard access',
      'Customer order management',
      'Growth onboarding flow',
      'Mobile-first restaurant experience',
    ],
  },
  premium: {
    name: 'Premium Plan',
    price: '$99/month',
    features: [
      'Full MenuFlow storefront',
      'Direct ordering system',
      'Owner dashboard access',
      'Customer order management',
      'Premium onboarding flow',
      'Mobile-first restaurant experience',
    ],
  },
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plan = useMemo<PlanKey>(() => {
    const raw = searchParams.get('plan');
    if (raw === 'starter' || raw === 'growth' || raw === 'premium') return raw;
    return 'growth';
  }, [searchParams]);

  const selectedPlan = plans[plan];

  const handleContinue = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/connect/create-account', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      const onboarding = await fetch('/api/connect/create-onboarding-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: data.accountId, plan }),
      });

      const onboardingData = await onboarding.json();

      if (!onboarding.ok) throw new Error(onboardingData.error);

      window.location.href = onboardingData.url;
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>{selectedPlan.name}</h1>
      <h2>{selectedPlan.price}</h2>

      {selectedPlan.features.map((f) => (
        <p key={f}>{f}</p>
      ))}

      <button
        onClick={handleContinue}
        disabled={loading}
        style={{
          width: '100%',
          border: 'none',
          borderRadius: '999px',
          background: '#2563eb',
          color: '#ffffff',
          height: '56px',
          fontSize: '18px',
          fontWeight: 800,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Loading...' : 'Continue'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <Link href="/signup">Back</Link>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}