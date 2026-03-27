'use client';

import Link from 'next/link';
import { useState, type CSSProperties } from 'react';

type Lang = 'en' | 'es';

const content = {
  en: {
    navHow: 'How it works',
    navPricing: 'Pricing',
    navCreate: 'Create Account',
    pill: 'Automatic restaurant storefronts',

    // ✅ UPDATED HERO TEXT
    heroTitle:
      'MenuFlow builds and turns your menu into a website in minutes',

    heroText:
      'Just enter your information. MenuFlow generates your storefront, menu, checkout, and ordering flow for you automatically.',

    startFree: 'Start Free',
    seeHow: 'See How It Works',

    pricingTitle: 'Smooth pricing with no hidden fees.',
    starter: 'Starter — Free',
    starterPrice: '$0/month',
    starterFee: 'Platform fee of 10%',

    growth: 'Growth — $49/month',
    growthPrice: '$49/month',
    growthFee: 'Platform fee of 5%',

    premium: 'Premium — $99/month',
    premiumPrice: '$99/month',
    premiumFee: 'Platform fee of 3%',

    mostPopular: 'Most Popular',
    chooseGrowth: 'Choose Growth',
    goPremium: 'Go Premium',

    howTitle: 'You enter the info. MenuFlow generates the rest.',

    sections: [
      {
        title: 'Enter your business information',
        text: 'Add your restaurant name, menu, photos, phone number, and address.',
      },
      {
        title: 'MenuFlow generates your storefront',
        text: 'Your menu, checkout, and direct ordering page are created for you automatically.',
      },
      {
        title: 'Start taking direct orders',
        text: 'Share your link and start accepting orders instantly.',
      },
    ],
  },
};

export default function HomePage() {
  const [lang] = useState<Lang>('en');
  const t = content[lang];

  return (
    <main style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>MenuFlow</div>

          <div style={styles.headerRight}>
            <a href="#pricing" style={styles.navLink}>
              {t.navPricing}
            </a>
            <Link href="/auth/signup" style={styles.navButton}>
              {t.navCreate}
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.container}>
          <div style={styles.pill}>{t.pill}</div>

          <h1 style={styles.heroTitle}>{t.heroTitle}</h1>

          <p style={styles.heroText}>{t.heroText}</p>

          <Link href="/auth/signup?plan=starter" style={styles.primaryBtn}>
            {t.startFree}
          </Link>
        </div>
      </section>

      {/* 🔥 PRICING MOVED UP FOR MOBILE */}
      <section id="pricing" style={styles.pricing}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>{t.pricingTitle}</h2>

          <div style={styles.pricingGrid}>
            {/* STARTER */}
            <div style={styles.card}>
              <h3>{t.starter}</h3>
              <div style={styles.price}>{t.starterPrice}</div>
              <p>{t.starterFee}</p>

              <Link href="/auth/signup?plan=starter" style={styles.primaryBtn}>
                Start Free
              </Link>
            </div>

            {/* GROWTH */}
            <div style={styles.cardHighlight}>
              <div style={styles.badge}>{t.mostPopular}</div>
              <h3>{t.growth}</h3>
              <div style={styles.price}>{t.growthPrice}</div>
              <p>{t.growthFee}</p>

              <Link href="/auth/checkout?plan=growth" style={styles.whiteBtn}>
                {t.chooseGrowth}
              </Link>
            </div>

            {/* PREMIUM */}
            <div style={styles.card}>
              <h3>{t.premium}</h3>
              <div style={styles.price}>{t.premiumPrice}</div>
              <p>{t.premiumFee}</p>

              <Link href="/auth/checkout?plan=premium" style={styles.primaryBtn}>
                {t.goPremium}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={styles.how}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>{t.howTitle}</h2>

          <div style={styles.steps}>
            {t.sections.map((item, i) => (
              <div key={i} style={styles.step}>
                <div style={styles.stepNum}>{i + 1}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    fontFamily: 'sans-serif',
    background: '#f8fbff',
  },

  header: {
    position: 'sticky',
    top: 0,
    background: '#fff',
    borderBottom: '1px solid #eee',
    zIndex: 10,
  },

  headerInner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: 16,
    display: 'flex',
    justifyContent: 'space-between',
  },

  logo: {
    fontWeight: 800,
    fontSize: 20,
  },

  headerRight: {
    display: 'flex',
    gap: 12,
  },

  navLink: {
    textDecoration: 'none',
    color: '#333',
  },

  navButton: {
    background: '#2563eb',
    color: '#fff',
    padding: '8px 14px',
    borderRadius: 10,
    textDecoration: 'none',
  },

  hero: {
    padding: '40px 20px',
    textAlign: 'center',
  },

  pill: {
    display: 'inline-block',
    padding: '8px 14px',
    background: '#eef6ff',
    borderRadius: 999,
    marginBottom: 16,
    color: '#2563eb',
    fontWeight: 700,
  },

  heroTitle: {
    fontSize: 'clamp(32px,6vw,52px)',
    fontWeight: 900,
    lineHeight: 1.1,
  },

  heroText: {
    marginTop: 12,
    color: '#555',
  },

  primaryBtn: {
    marginTop: 20,
    display: 'inline-block',
    background: '#2563eb',
    color: '#fff',
    padding: '14px 20px',
    borderRadius: 12,
    textDecoration: 'none',
  },

  pricing: {
    padding: '30px 20px',
  },

  sectionTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },

  pricingGrid: {
    display: 'grid',
    gap: 16,
  },

  card: {
    background: '#fff',
    padding: 20,
    borderRadius: 16,
    textAlign: 'center',
  },

  cardHighlight: {
    background: '#2563eb',
    color: '#fff',
    padding: 20,
    borderRadius: 16,
    textAlign: 'center',
  },

  badge: {
    fontSize: 12,
    marginBottom: 10,
  },

  price: {
    fontSize: 32,
    fontWeight: 800,
  },

  whiteBtn: {
    marginTop: 14,
    display: 'inline-block',
    background: '#fff',
    color: '#2563eb',
    padding: '12px 18px',
    borderRadius: 12,
    textDecoration: 'none',
  },

  how: {
    padding: '30px 20px',
  },

  steps: {
    display: 'grid',
    gap: 14,
  },

  step: {
    background: '#fff',
    padding: 18,
    borderRadius: 14,
  },

  stepNum: {
    width: 30,
    height: 30,
    background: '#2563eb',
    color: '#fff',
    borderRadius: '50%',
    textAlign: 'center',
    lineHeight: '30px',
    marginBottom: 10,
  },
};