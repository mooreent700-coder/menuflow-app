'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type PlanKey = 'starter' | 'growth' | 'premium';

const STRIPE_LINKS: Record<'growth' | 'premium', string> = {
  growth: 'https://buy.stripe.com/5kQ8wO51H7EHdDr8XE2wU09',
  premium: 'https://buy.stripe.com/00w7sKcu95wzarf7TA2wU0a',
};

const PLAN_DATA: Record<PlanKey, { title: string; price: string; fee: string }> = {
  starter: {
    title: 'Starter Plan',
    price: 'First month free',
    fee: 'Then $19/month + 10% platform fee',
  },
  growth: {
    title: 'Growth Plan',
    price: '$49/month',
    fee: '5% platform fee',
  },
  premium: {
    title: 'Premium Plan',
    price: '$99/month',
    fee: '3% platform fee',
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const params = useSearchParams();

  const plan = (params.get('plan') as PlanKey) || 'starter';
  const data = PLAN_DATA[plan];

  const handleContinue = () => {
    // Starter = NO STRIPE (go to signup)
    if (plan === 'starter') {
      router.push(`/auth/signup?plan=starter`);
      return;
    }

    // Paid plans = STRIPE
    const link = STRIPE_LINKS[plan as 'growth' | 'premium'];
    if (link) {
      window.location.href = link;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm">

        <div className="mb-4 text-xs font-semibold text-gray-500 uppercase">
          Selected Plan
        </div>

        <h1 className="text-2xl font-bold mb-2">
          {data.title}
        </h1>

        <p className="text-gray-500 mb-6">
          Review your plan and continue to secure payment.
        </p>

        <div className="bg-gray-100 rounded-xl p-4 mb-6">
          <div className="text-xl font-bold">{data.price}</div>
          <div className="text-sm text-gray-500">{data.fee}</div>
        </div>

        <button
          onClick={handleContinue}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold"
        >
          {plan === 'starter' ? 'Continue Setup' : 'Continue to Payment'}
        </button>

        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-gray-500"
        >
          Back
        </button>
      </div>
    </div>
  );
}
