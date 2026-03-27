'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type PlanKey = 'starter' | 'growth' | 'premium';

const PLAN_LINKS: Record<'growth' | 'premium', string> = {
  growth: 'https://buy.stripe.com/14A5kC6j5f8d6GYfYZ',
  premium: 'https://buy.stripe.com/fZu7sKcbt4JH7L23cc',
};

const planContent: Record<
  PlanKey,
  {
    badge: string;
    title: string;
    price: string;
    detail: string;
    features: string[];
    button: string;
  }
> = {
  starter: {
    badge: 'Best for getting started',
    title: 'Starter',
    price: 'First month free',
    detail: 'Then $19/month + 10% platform fee',
    features: [
      'Clean MenuFlow account setup',
      'Direct ordering starter flow',
      'Mobile-first onboarding',
      'Agreement and dashboard access',
    ],
    button: 'Continue',
  },
  growth: {
    badge: 'Most Popular',
    title: 'Growth',
    price: '$49/month',
    detail: '5% platform fee',
    features: [
      'Full MenuFlow storefront',
      'Direct ordering system',
      'Owner dashboard access',
      'Customer order management',
      'Growth onboarding flow',
      'Mobile-first restaurant experience',
    ],
    button: 'Continue to Payment',
  },
  premium: {
    badge: 'Built to scale',
    title: 'Premium',
    price: '$99/month',
    detail: '3% platform fee',
    features: [
      'Full MenuFlow storefront',
      'Direct ordering system',
      'Owner dashboard access',
      'Customer order management',
      'Premium onboarding flow',
      'Mobile-first restaurant experience',
    ],
    button: 'Continue to Payment',
  },
};

function normalizePlan(value: string | null): PlanKey {
  if (value === 'growth' || value === 'premium') return value;
  return 'starter';
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = normalizePlan(searchParams.get('plan'));
  const plan = planContent[selectedPlan];

  useEffect(() => {
    if (selectedPlan === 'starter') {
      router.replace('/auth/signup?plan=starter');
    }
  }, [router, selectedPlan]);

  const handleContinue = () => {
    if (selectedPlan === 'growth' || selectedPlan === 'premium') {
      window.location.href = PLAN_LINKS[selectedPlan];
    }
  };

  if (selectedPlan === 'starter') {
    return null;
  }

  return (
    <main className="page">
      <section className="shell">
        <div className="leftPanel">
          <div className="topPill">Select your plan</div>

          <h1 className="heroTitle">{plan.title} plan selected</h1>
          <p className="heroText">
            Review your plan details and continue to secure payment. After payment, you will return
            to MenuFlow to finish your account setup.
          </p>

          <div className="planCard">
            <div className="planCardTop">
              <div className="planBadge">{plan.badge}</div>
              <div className="planLabel">Selected plan</div>
            </div>

            <div className="planName">{plan.title}</div>
            <div className="planPrice">{plan.price}</div>
            <div className="planDetail">{plan.detail}</div>
          </div>

          <div className="infoCard">
            <div className="infoTitle">What you get</div>
            <ul className="featureList">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rightPanel">
          <div className="mobileBrand">MenuFlow</div>

          <div className="actionCard">
            <div className="actionTop">
              <div className="brand">MenuFlow</div>
              <div className="planTag">{plan.title}</div>
            </div>

            <div className="summaryBox">
              <div className="summaryLabel">Plan price</div>
              <div className="summaryPrice">{plan.price}</div>
              <div className="summaryDetail">{plan.detail}</div>
            </div>

            <button type="button" onClick={handleContinue} className="continueBtn">
              {plan.button}
            </button>

            <Link href="/" className="backLink">
              Back
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f8f8f5;
          color: #142132;
          overflow-x: hidden;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            'Segoe UI',
            sans-serif;
          padding: 20px;
        }

        .shell {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }

        .leftPanel,
        .rightPanel {
          border-radius: 30px;
          border: 1px solid rgba(20, 33, 50, 0.08);
          box-shadow: 0 22px 50px rgba(15, 23, 42, 0.08);
        }

        .leftPanel {
          background:
            radial-gradient(circle at top left, rgba(214, 204, 184, 0.28), transparent 35%),
            linear-gradient(180deg, #ffffff 0%, #f3f1eb 100%);
          padding: 28px 22px;
        }

        .rightPanel {
          background: #eef1ee;
          padding: 20px;
        }

        .topPill {
          display: inline-flex;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(20, 33, 50, 0.06);
          color: #142132;
          border: 1px solid rgba(20, 33, 50, 0.08);
          font-size: 14px;
          font-weight: 700;
        }

        .heroTitle {
          margin: 18px 0 0;
          font-size: clamp(34px, 6vw, 58px);
          line-height: 1.04;
          font-weight: 900;
          letter-spacing: -0.045em;
          text-wrap: balance;
          color: #142132;
        }

        .heroText {
          margin-top: 16px;
          max-width: 650px;
          font-size: 17px;
          line-height: 1.8;
          color: #526171;
        }

        .planCard {
          margin-top: 28px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(20, 33, 50, 0.08);
          border-radius: 24px;
          padding: 22px;
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.06);
        }

        .planCardTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .planBadge {
          display: inline-flex;
          padding: 8px 12px;
          border-radius: 999px;
          background: #142132;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .planLabel {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8a744f;
        }

        .planName {
          margin-top: 14px;
          font-size: 28px;
          font-weight: 900;
          color: #142132;
        }

        .planPrice {
          margin-top: 10px;
          font-size: clamp(28px, 5vw, 42px);
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #142132;
        }

        .planDetail {
          margin-top: 12px;
          font-size: 16px;
          line-height: 1.65;
          color: #526171;
          font-weight: 700;
        }

        .infoCard {
          margin-top: 18px;
          background: rgba(255, 255, 255, 0.82);
          border: 1px solid rgba(20, 33, 50, 0.08);
          border-radius: 22px;
          padding: 20px;
        }

        .infoTitle {
          font-size: 18px;
          font-weight: 800;
          color: #142132;
        }

        .featureList {
          margin: 14px 0 0;
          padding-left: 20px;
          color: #526171;
        }

        .featureList li {
          margin-top: 8px;
          line-height: 1.7;
          font-size: 15px;
        }

        .mobileBrand {
          display: none;
        }

        .actionCard {
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(20, 33, 50, 0.08);
          border-radius: 28px;
          box-shadow: 0 22px 48px rgba(15, 23, 42, 0.08);
          padding: 22px;
        }

        .actionTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .brand {
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: #142132;
        }

        .planTag {
          display: inline-flex;
          padding: 8px 12px;
          border-radius: 999px;
          background: #eef1ee;
          border: 1px solid rgba(20, 33, 50, 0.08);
          color: #142132;
          font-size: 13px;
          font-weight: 800;
        }

        .summaryBox {
          background: #f8f8f5;
          border: 1px solid rgba(20, 33, 50, 0.08);
          border-radius: 20px;
          padding: 18px;
        }

        .summaryLabel {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8a744f;
        }

        .summaryPrice {
          margin-top: 10px;
          font-size: 34px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #142132;
        }

        .summaryDetail {
          margin-top: 10px;
          font-size: 16px;
          line-height: 1.6;
          color: #526171;
          font-weight: 700;
        }

        .continueBtn {
          width: 100%;
          min-height: 56px;
          margin-top: 18px;
          border: none;
          border-radius: 16px;
          background: #142132;
          color: #fff;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 14px 28px rgba(15, 23, 42, 0.14);
        }

        .backLink {
          display: inline-flex;
          margin-top: 18px;
          color: #526171;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
        }

        @media (max-width: 767px) {
          .page {
            padding: 14px;
          }

          .leftPanel {
            padding: 22px 18px;
          }

          .rightPanel {
            padding: 0;
            background: transparent;
            border: none;
            box-shadow: none;
          }

          .heroTitle {
            font-size: clamp(30px, 9vw, 42px);
            line-height: 1.06;
          }

          .heroText {
            font-size: 16px;
            line-height: 1.72;
          }

          .planCard {
            padding: 18px;
          }

          .planName {
            font-size: 24px;
          }

          .planPrice {
            font-size: clamp(26px, 8vw, 34px);
          }

          .mobileBrand {
            display: block;
            text-align: center;
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -0.03em;
            color: #142132;
            margin-bottom: 14px;
          }

          .actionCard {
            padding: 18px;
            border-radius: 24px;
          }

          .brand {
            display: none;
          }

          .planTag {
            width: 100%;
            justify-content: center;
            min-height: 40px;
          }
        }

        @media (min-width: 980px) {
          .shell {
            grid-template-columns: minmax(0, 1.06fr) minmax(420px, 0.94fr);
            align-items: stretch;
          }

          .leftPanel,
          .rightPanel {
            min-height: calc(100vh - 40px);
          }

          .leftPanel {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .rightPanel {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .actionCard {
            width: 100%;
            max-width: 520px;
          }
        }
      `}</style>
    </main>
  );
}
