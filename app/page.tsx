'use client';

import Link from 'next/link';
import { CSSProperties } from 'react';

const content = {
  navCreate: 'Create Account',

  heroTitle: 'MenuFlow builds and turns your menu into a website in minutes',
  heroText:
    'Just enter your information. MenuFlow generates your storefront, menu, checkout, and ordering flow for you automatically.',

  builtTitle: 'Built for real food businesses',
  builtText: 'A direct-ordering platform that feels premium and alive.',

  systemTitle: 'Your system, fully built for you.',
  systemText:
    'Everything you need to take orders, present your brand, and run your business — already built, clean, and ready to go.',

  pricingTitle: 'Simple pricing that grows with you',

  starter: 'Starter',
  starterPrice: 'Free first month',
  starterSub: '$19/month after',
  starterFee: '10% platform fee',

  growth: 'Growth',
  growthPrice: '$49/month',
  growthFee: '5% platform fee',

  premium: 'Premium',
  premiumPrice: '$99/month',
  premiumFee: '3% platform fee',

  mostPopular: 'Most Popular',

  getStarted: 'Get Started',

  finalTitle: 'Launch your ordering system without building it yourself.',
  finalText:
    'MenuFlow turns your menu into a clean, premium ordering experience in minutes.',
};

export default function HomePage() {
  const t = content;

  return (
    <main style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>MenuFlow</div>
          <Link href="/auth/signup" style={styles.navButton}>
            {t.navCreate}
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.heroTitle}>{t.heroTitle}</h1>
          <p style={styles.heroText}>{t.heroText}</p>

          <img
            src="https://images.unsplash.com/photo-1514933651103-005eec06c04b"
            style={styles.heroImg}
          />

          <Link href="/auth/signup" style={styles.primaryBtn}>
            Start Free
          </Link>
        </div>
      </section>

      {/* BUILT */}
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>{t.builtTitle}</h2>
          <p style={styles.sectionText}>{t.builtText}</p>
        </div>
      </section>

      {/* SYSTEM */}
      <section style={styles.sectionSoft}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>{t.systemTitle}</h2>
          <p style={styles.sectionText}>{t.systemText}</p>

          <img
            src="https://images.unsplash.com/photo-1552566626-52f8b828add9"
            style={styles.sectionImg}
          />
        </div>
      </section>

      {/* PRICING (CENTER — LOCKED) */}
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>{t.pricingTitle}</h2>

          <div style={styles.pricingStack}>
            {/* STARTER */}
            <div style={styles.card}>
              <h3>{t.starter}</h3>
              <p style={styles.priceMain}>{t.starterPrice}</p>
              <p style={styles.priceSub}>{t.starterSub}</p>
              <p>{t.starterFee}</p>

              <Link href="/auth/signup" style={styles.cardBtn}>
                {t.getStarted}
              </Link>
            </div>

            {/* GROWTH */}
            <div style={styles.cardFeatured}>
              <div style={styles.badge}>{t.mostPopular}</div>
              <h3>{t.growth}</h3>
              <p style={styles.priceMain}>{t.growthPrice}</p>
              <p>{t.growthFee}</p>

              <Link href="/auth/signup" style={styles.cardBtnLight}>
                {t.getStarted}
              </Link>
            </div>

            {/* PREMIUM */}
            <div style={styles.card}>
              <h3>{t.premium}</h3>
              <p style={styles.priceMain}>{t.premiumPrice}</p>
              <p>{t.premiumFee}</p>

              <Link href="/auth/signup" style={styles.cardBtn}>
                {t.getStarted}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL */}
      <section style={styles.sectionSoft}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>{t.finalTitle}</h2>
          <p style={styles.sectionText}>{t.finalText}</p>

          <Link href="/auth/signup" style={styles.primaryBtn}>
            Start Free
          </Link>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    background: '#f9fafb',
    color: '#0f172a',
    overflowX: 'hidden',
  },

  header: {
    background: '#ffffff',
    borderBottom: '1px solid #eee',
  },
  headerInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
  },

  logo: {
    fontWeight: 800,
    fontSize: '20px',
  },

  navButton: {
    background: '#0f172a',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '10px',
    textDecoration: 'none',
  },

  hero: {
    padding: '40px 20px',
  },

  heroTitle: {
    fontSize: '34px',
    fontWeight: 900,
    lineHeight: 1.2,
  },

  heroText: {
    marginTop: '12px',
    color: '#475569',
  },

  heroImg: {
    width: '100%',
    marginTop: '20px',
    borderRadius: '16px',
  },

  primaryBtn: {
    display: 'block',
    marginTop: '20px',
    background: '#0f172a',
    color: '#fff',
    padding: '14px',
    borderRadius: '12px',
    textAlign: 'center',
    textDecoration: 'none',
  },

  section: {
    padding: '50px 20px',
    background: '#ffffff',
  },

  sectionSoft: {
    padding: '50px 20px',
    background: '#f1f5f9',
  },

  container: {
    maxWidth: '700px',
    margin: '0 auto',
    textAlign: 'center',
  },

  sectionTitle: {
    fontSize: '26px',
    fontWeight: 900,
  },

  sectionText: {
    marginTop: '10px',
    color: '#475569',
  },

  sectionImg: {
    width: '100%',
    marginTop: '20px',
    borderRadius: '16px',
  },

  pricingStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '30px',
  },

  card: {
    background: '#fff',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid #eee',
  },

  cardFeatured: {
    background: '#0f172a',
    color: '#fff',
    padding: '20px',
    borderRadius: '16px',
  },

  badge: {
    fontSize: '12px',
    marginBottom: '6px',
  },

  priceMain: {
    fontSize: '24px',
    fontWeight: 900,
  },

  priceSub: {
    fontSize: '14px',
    color: '#64748b',
  },

  cardBtn: {
    display: 'block',
    marginTop: '16px',
    background: '#0f172a',
    color: '#fff',
    padding: '12px',
    borderRadius: '10px',
    textDecoration: 'none',
  },

  cardBtnLight: {
    display: 'block',
    marginTop: '16px',
    background: '#fff',
    color: '#0f172a',
    padding: '12px',
    borderRadius: '10px',
    textDecoration: 'none',
  },
};