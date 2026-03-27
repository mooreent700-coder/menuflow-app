'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type PlanKey = 'starter' | 'growth' | 'premium';

const STRIPE_LINKS: Record<'growth' | 'premium', string> = {
  growth: 'https://buy.stripe.com/5kQ8wO51H7EHdDr8XE2wU09',
  premium: 'https://buy.stripe.com/00w7sKcu95wzarf7TA2wU0a',
};

function normalizePlan(value: string | null): PlanKey {
  if (value === 'growth' || value === 'premium') return value;
  return 'starter';
}

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('starter');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = normalizePlan(params.get('plan'));
    setSelectedPlan(plan);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (selectedPlan === 'starter') {
      router.replace('/auth/signup?plan=starter');
    }
  }, [ready, selectedPlan, router]);

  const handleContinue = () => {
    if (selectedPlan === 'growth' || selectedPlan === 'premium') {
      window.location.href = STRIPE_LINKS[selectedPlan];
    }
  };

  if (!ready) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f8f5',
          color: '#142132',
          padding: '24px',
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '520px',
            background: '#ffffff',
            border: '1px solid rgba(20,33,50,0.08)',
            borderRadius: '24px',
            padding: '28px',
            textAlign: 'center',
            fontWeight: 800,
            fontSize: '18px',
          }}
        >
          Loading plan...
        </div>
      </main>
    );
  }

  if (selectedPlan === 'starter') {
    return null;
  }

  const title = selectedPlan === 'growth' ? 'Growth Plan' : 'Premium Plan';
  const price = selectedPlan === 'growth' ? '$49/month' : '$99/month';
  const fee = selectedPlan === 'growth' ? '5% platform fee' : '3% platform fee';

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f8f8f5',
        color: '#142132',
        padding: '24px',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          margin: '0 auto',
          background: '#ffffff',
          border: '1px solid rgba(20,33,50,0.08)',
          borderRadius: '24px',
          padding: '24px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '8px 12px',
            borderRadius: '999px',
            background: '#eef1ee',
            border: '1px solid rgba(20,33,50,0.08)',
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Selected plan
        </div>

        <h1
          style={{
            margin: '18px 0 0',
            fontSize: 'clamp(34px, 7vw, 48px)',
            lineHeight: 1.05,
            fontWeight: 900,
            letterSpacing: '-0.04em',
          }}
        >
          {title}
        </h1>

        <p
          style={{
            marginTop: '12px',
            fontSize: '18px',
            lineHeight: 1.7,
            color: '#526171',
          }}
        >
          Review your plan and continue to secure payment.
        </p>

        <div
          style={{
            marginTop: '24px',
            border: '1px solid rgba(20,33,50,0.08)',
            borderRadius: '20px',
            padding: '20px',
            background: '#f8f8f5',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
            }}
          >
            {price}
          </div>

          <div
            style={{
              marginTop: '10px',
              fontSize: '16px',
              fontWeight: 700,
              color: '#526171',
            }}
          >
            {fee}
          </div>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          style={{
            width: '100%',
            minHeight: '56px',
            marginTop: '24px',
            border: 'none',
            borderRadius: '16px',
            background: '#142132',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Continue to Payment
        </button>

        <div style={{ marginTop: '18px' }}>
          <Link
            href="/"
            style={{
              color: '#526171',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '15px',
            }}
          >
            Back
          </Link>
        </div>
      </div>
    </main>
  );
}
