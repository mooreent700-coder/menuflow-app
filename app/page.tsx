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
    heroTitle:
      'MenuFlow builds and turns your menu into a website automatically for you so you can share the link and take orders right away.',
    heroText:
      'Just enter your information. MenuFlow generates your storefront, menu, checkout, and ordering flow for you automatically.',
    startFree: 'Start Free',
    seeHow: 'See How It Works',
    meta1: 'Direct checkout',
    meta2: 'Built for food businesses',
    meta3: 'Light + premium feel',
    socialEyebrow: 'Built for real food businesses',
    socialTitle: 'Real restaurants. Real food. Real direct ordering.',
    socialText:
      'MenuFlow is made for people who want customers ordering directly from their own storefront, not through a third-party app.',
    serviceTitle: 'Built for real service',
    serviceText:
      'From kitchen to checkout, MenuFlow helps restaurants present a direct, premium ordering experience.',
    convertTitle: 'Made to convert',
    convertText:
      'A clean storefront helps customers order faster and trust the brand more.',
    premiumTitle: 'Premium presentation',
    premiumText:
      'Food photos, menu cards, checkout, and branding all work together in one flow.',
    howEyebrow: 'How it works',
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
        text: 'Share your link and start accepting orders through your own branded system.',
      },
    ],
    productEyebrow: 'Everything is generated for you',
    productTitle: 'MenuFlow turns your information into a live ordering system.',
    productText:
      'Your menu becomes a storefront. Your photos become the presentation. Your checkout becomes the order flow. Your business gets a cleaner, more premium direct-order experience.',
    benefits: [
      'Direct checkout experience',
      'Light, clean customer storefront',
      'Google map and location section',
      'Mobile-first design',
      'English / Spanish ready',
      'Built for real food businesses',
    ],
    productCardText:
      'Clean storefronts, direct ordering, and a better presentation for the customer.',
    lifestyleEyebrow: 'Made for your business',
    lifestyleTitle: 'Restaurants, food trucks, caterers, and pop-ups.',
    lifestyle: [
      {
        title: 'Restaurants',
        text: 'Turn your menu and brand into a direct ordering system.',
      },
      {
        title: 'Food Trucks',
        text: 'Give customers one clean link to order from anywhere.',
      },
      {
        title: 'Catering & Pop-Ups',
        text: 'Take orders through a branded storefront that feels professional.',
      },
    ],
    pricingEyebrow: 'Pricing',
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
    ctaTitle: 'Launch your ordering system without building it yourself.',
    ctaText:
      'Just enter your information and let MenuFlow generate the storefront for you.',
    getStartedFree: 'Get Started Free',
  },
  es: {
    navHow: 'Cómo funciona',
    navPricing: 'Precios',
    navCreate: 'Crear Cuenta',
    pill: 'Tiendas automáticas para restaurantes',
    heroTitle:
      'MenuFlow crea y convierte tu menú en un sitio web automáticamente para que puedas compartir el enlace y empezar a recibir pedidos de inmediato.',
    heroText:
      'Solo ingresa tu información. MenuFlow genera automáticamente tu tienda, menú, checkout y flujo de pedidos.',
    startFree: 'Empieza Gratis',
    seeHow: 'Ver Cómo Funciona',
    meta1: 'Checkout directo',
    meta2: 'Hecho para negocios de comida',
    meta3: 'Estilo limpio y premium',
    socialEyebrow: 'Hecho para negocios reales de comida',
    socialTitle: 'Restaurantes reales. Comida real. Pedidos directos reales.',
    socialText:
      'MenuFlow está hecho para personas que quieren que sus clientes ordenen directamente desde su propia tienda, no desde una app de terceros.',
    serviceTitle: 'Hecho para servicio real',
    serviceText:
      'De la cocina al checkout, MenuFlow ayuda a los restaurantes a presentar una experiencia directa y premium.',
    convertTitle: 'Hecho para convertir',
    convertText:
      'Una tienda limpia ayuda a que los clientes ordenen más rápido y confíen más en la marca.',
    premiumTitle: 'Presentación premium',
    premiumText:
      'Las fotos de comida, las tarjetas del menú, el checkout y la marca trabajan juntos en un solo flujo.',
    howEyebrow: 'Cómo funciona',
    howTitle: 'Tú ingresas la información. MenuFlow genera lo demás.',
    sections: [
      {
        title: 'Ingresa la información de tu negocio',
        text: 'Agrega el nombre de tu restaurante, menú, fotos, número de teléfono y dirección.',
      },
      {
        title: 'MenuFlow genera tu tienda',
        text: 'Tu menú, checkout y página de pedidos directos se crean automáticamente.',
      },
      {
        title: 'Empieza a recibir pedidos directos',
        text: 'Comparte tu enlace y empieza a aceptar pedidos a través de tu propio sistema de marca.',
      },
    ],
    productEyebrow: 'Todo se genera para ti',
    productTitle: 'MenuFlow convierte tu información en un sistema de pedidos en vivo.',
    productText:
      'Tu menú se convierte en una tienda. Tus fotos se convierten en la presentación. Tu checkout se convierte en el flujo de pedidos. Tu negocio obtiene una experiencia directa más limpia y premium.',
    benefits: [
      'Experiencia de checkout directo',
      'Tienda limpia y ligera para clientes',
      'Sección de Google Maps y ubicación',
      'Diseño mobile-first',
      'Listo para inglés / español',
      'Hecho para negocios reales de comida',
    ],
    productCardText:
      'Tiendas limpias, pedidos directos y una mejor presentación para el cliente.',
    lifestyleEyebrow: 'Hecho para tu negocio',
    lifestyleTitle: 'Restaurantes, food trucks, catering y pop-ups.',
    lifestyle: [
      {
        title: 'Restaurantes',
        text: 'Convierte tu menú y tu marca en un sistema de pedidos directos.',
      },
      {
        title: 'Food Trucks',
        text: 'Dales a los clientes un solo enlace limpio para ordenar desde cualquier lugar.',
      },
      {
        title: 'Catering y Pop-Ups',
        text: 'Recibe pedidos a través de una tienda de marca que se siente profesional.',
      },
    ],
    pricingEyebrow: 'Precios',
    pricingTitle: 'Precios claros y sin cargos ocultos.',
    starter: 'Starter — Gratis',
    starterPrice: '$0/mes',
    starterFee: 'Tarifa de plataforma de 10%',
    growth: 'Growth — $49/mes',
    growthPrice: '$49/mes',
    growthFee: 'Tarifa de plataforma de 5%',
    premium: 'Premium — $99/mes',
    premiumPrice: '$99/mes',
    premiumFee: 'Tarifa de plataforma de 3%',
    mostPopular: 'Más Popular',
    chooseGrowth: 'Elegir Growth',
    goPremium: 'Ir Premium',
    ctaTitle: 'Lanza tu sistema de pedidos sin tener que construirlo tú mismo.',
    ctaText:
      'Solo ingresa tu información y deja que MenuFlow genere la tienda por ti.',
    getStartedFree: 'Empieza Gratis',
  },
};

const lifestyleImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
];

export default function HomePage() {
  const [lang, setLang] = useState<Lang>('en');
  const t = content[lang];

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <Link href="/" style={styles.logoWrap}>
            <div style={styles.logoMark}>M</div>
            <div style={styles.logoText}>MenuFlow</div>
          </Link>

          <nav style={styles.headerNav}>
            <a href="#how" style={styles.navLink}>
              {t.navHow}
            </a>
            <a href="#pricing" style={styles.navLink}>
              {t.navPricing}
            </a>

            <div style={styles.langWrap}>
              <button
                type="button"
                onClick={() => setLang('en')}
                style={lang === 'en' ? styles.langButtonActive : styles.langButton}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('es')}
                style={lang === 'es' ? styles.langButtonActive : styles.langButton}
              >
                ES
              </button>
            </div>

            <Link href="/auth/signup" style={styles.navButtonSecondary}>
              {t.navCreate}
            </Link>
          </nav>
        </div>
      </header>

      <section style={styles.heroSection}>
        <div style={styles.heroInner}>
          <div style={styles.heroCopy}>
            <div style={styles.pill}>{t.pill}</div>

            <h1 style={styles.heroTitle}>{t.heroTitle}</h1>

            <p style={styles.heroText}>{t.heroText}</p>

            <div style={styles.heroButtons}>
              <Link href="/auth/signup?plan=starter" style={styles.primaryButton}>
                {t.startFree}
              </Link>
              <a href="#how" style={styles.secondaryButton}>
                {t.seeHow}
              </a>
            </div>

            <div style={styles.heroMeta}>
              <span style={styles.metaItem}>{t.meta1}</span>
              <span style={styles.metaItem}>{t.meta2}</span>
              <span style={styles.metaItem}>{t.meta3}</span>
            </div>
          </div>

          <div style={styles.heroVisual}>
            <img
              src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80"
              alt="Restaurant team serving food"
              style={styles.heroImage}
            />
          </div>
        </div>
      </section>

      <section style={styles.socialSection}>
        <div style={styles.container}>
          <div style={styles.sectionTop}>
            <div style={styles.eyebrow}>{t.socialEyebrow}</div>
            <h2 style={styles.sectionTitle}>{t.socialTitle}</h2>
            <p style={styles.sectionText}>{t.socialText}</p>
          </div>

          <div style={styles.socialGrid}>
            <div style={styles.socialCardLarge}>
              <img
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80"
                alt="Chef plating food in a restaurant kitchen"
                style={styles.cardImage}
              />
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{t.serviceTitle}</h3>
                <p style={styles.cardText}>{t.serviceText}</p>
              </div>
            </div>

            <div style={styles.socialStack}>
              <div style={styles.socialCardSmall}>
                <img
                  src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80"
                  alt="Customer smiling with food"
                  style={styles.cardImage}
                />
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{t.convertTitle}</h3>
                  <p style={styles.cardText}>{t.convertText}</p>
                </div>
              </div>

              <div style={styles.socialCardSmall}>
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80"
                  alt="Premium food table spread"
                  style={styles.cardImage}
                />
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{t.premiumTitle}</h3>
                  <p style={styles.cardText}>{t.premiumText}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" style={styles.howSection}>
        <div style={styles.container}>
          <div style={styles.sectionTop}>
            <div style={styles.eyebrow}>{t.howEyebrow}</div>
            <h2 style={styles.sectionTitle}>{t.howTitle}</h2>
          </div>

          <div style={styles.stepGrid}>
            {t.sections.map((item, index) => (
              <div key={item.title} style={styles.stepCard}>
                <div style={styles.stepNumber}>{index + 1}</div>
                <h3 style={styles.stepTitle}>{item.title}</h3>
                <p style={styles.stepText}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={styles.productSection}>
        <div style={styles.containerWide}>
          <div style={styles.productGrid}>
            <div style={styles.productCopy}>
              <div style={styles.eyebrow}>{t.productEyebrow}</div>
              <h2 style={styles.sectionTitle}>{t.productTitle}</h2>
              <p style={styles.sectionTextLeft}>{t.productText}</p>

              <div style={styles.benefitGrid}>
                {t.benefits.map((benefit) => (
                  <div key={benefit} style={styles.benefitItem}>
                    <span style={styles.benefitDot} />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.productVisualWrap}>
              <div style={styles.productVisualMain}>
                <img
                  src="https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1400&q=80"
                  alt="Person ordering food on a phone"
                  style={styles.productImage}
                />
              </div>
              <div style={styles.productVisualCard}>
                <img
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80"
                  alt="Pizza and restaurant table"
                  style={styles.productImageSmall}
                />
                <div style={styles.productCardText}>{t.productCardText}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.lifestyleSection}>
        <div style={styles.container}>
          <div style={styles.sectionTop}>
            <div style={styles.eyebrow}>{t.lifestyleEyebrow}</div>
            <h2 style={styles.sectionTitle}>{t.lifestyleTitle}</h2>
          </div>

          <div style={styles.lifeGrid}>
            {t.lifestyle.map((item, index) => (
              <div key={item.title} style={styles.lifeCard}>
                <img src={lifestyleImages[index]} alt={item.title} style={styles.lifeImage} />
                <div style={styles.lifeBody}>
                  <h3 style={styles.cardTitle}>{item.title}</h3>
                  <p style={styles.cardText}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" style={styles.pricingSection}>
        <div style={styles.container}>
          <div style={styles.sectionTop}>
            <div style={styles.eyebrow}>{t.pricingEyebrow}</div>
            <h2 style={styles.sectionTitle}>{t.pricingTitle}</h2>
          </div>

          <div style={styles.pricingGrid}>
            <div style={styles.pricingCard}>
              <div>
                <div style={styles.planName}>{t.starter}</div>
                <div style={styles.planPrice}>{t.starterPrice}</div>
                <div style={styles.planFee}>{t.starterFee}</div>
              </div>
              <Link href="/auth/signup?plan=starter" style={styles.planButton}>
                {t.startFree}
              </Link>
            </div>

            <div style={styles.pricingCardFeatured}>
              <div>
                <div style={styles.badge}>{t.mostPopular}</div>
                <div style={styles.planNameFeatured}>{t.growth}</div>
                <div style={styles.planPriceFeatured}>{t.growthPrice}</div>
                <div style={styles.planFeeFeatured}>{t.growthFee}</div>
              </div>
              <Link href="/auth/checkout?plan=growth" style={styles.planButtonFeatured}>
                {t.chooseGrowth}
              </Link>
            </div>

            <div style={styles.pricingCard}>
              <div>
                <div style={styles.planName}>{t.premium}</div>
                <div style={styles.planPrice}>{t.premiumPrice}</div>
                <div style={styles.planFee}>{t.premiumFee}</div>
              </div>
              <Link href="/auth/checkout?plan=premium" style={styles.planButton}>
                {t.goPremium}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.ctaSection}>
        <div style={styles.container}>
          <div style={styles.ctaCard}>
            <h2 style={styles.ctaTitle}>{t.ctaTitle}</h2>
            <p style={styles.ctaText}>{t.ctaText}</p>
            <div style={styles.ctaButtons}>
              <Link href="/auth/signup?plan=starter" style={styles.primaryButton}>
                {t.getStartedFree}
              </Link>
              <Link href="/auth/checkout?plan=premium" style={styles.secondaryButtonLight}>
                {t.goPremium}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    background: '#f8fbff',
    color: '#0f172a',
    minHeight: '100vh',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 40,
    backdropFilter: 'blur(14px)',
    background: 'rgba(248,251,255,0.88)',
    borderBottom: '1px solid rgba(15,23,42,0.08)',
  },
  headerInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: '#0f172a',
  },
  logoMark: {
    width: '42px',
    height: '42px',
    borderRadius: '14px',
    background: '#2563eb',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '20px',
    boxShadow: '0 14px 30px rgba(37,99,235,0.28)',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: 800,
  },
  headerNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap',
  },
  navLink: {
    color: '#334155',
    textDecoration: 'none',
    fontWeight: 600,
  },
  navButtonSecondary: {
    textDecoration: 'none',
    color: '#2563eb',
    border: '1px solid rgba(37,99,235,0.22)',
    background: '#eff6ff',
    padding: '10px 16px',
    borderRadius: '14px',
    fontWeight: 700,
  },
  langWrap: {
    display: 'flex',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    padding: '4px',
    borderRadius: '14px',
  },
  langButton: {
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    padding: '8px 12px',
    borderRadius: '10px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  langButtonActive: {
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '10px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  heroSection: {
    padding: '48px 20px 28px',
  },
  heroInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1.05fr 1fr',
    gap: '28px',
    alignItems: 'center',
  },
  heroCopy: {
    paddingRight: '8px',
  },
  pill: {
    display: 'inline-flex',
    padding: '10px 16px',
    borderRadius: '999px',
    background: '#eff6ff',
    color: '#2563eb',
    border: '1px solid rgba(37,99,235,0.18)',
    fontWeight: 700,
    fontSize: '14px',
  },
  heroTitle: {
    fontSize: 'clamp(44px, 7vw, 76px)',
    lineHeight: 1.02,
    margin: '18px 0 0',
    fontWeight: 900,
    letterSpacing: '-0.05em',
    color: '#0f172a',
  },
  heroText: {
    marginTop: '18px',
    maxWidth: '700px',
    fontSize: '18px',
    lineHeight: 1.8,
    color: '#475569',
  },
  heroButtons: {
    display: 'flex',
    gap: '14px',
    flexWrap: 'wrap',
    marginTop: '28px',
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    background: '#2563eb',
    color: '#fff',
    padding: '16px 22px',
    borderRadius: '18px',
    fontWeight: 800,
    boxShadow: '0 18px 34px rgba(37,99,235,0.24)',
  },
  secondaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    background: '#ffffff',
    color: '#0f172a',
    padding: '16px 22px',
    borderRadius: '18px',
    fontWeight: 800,
    border: '1px solid rgba(15,23,42,0.08)',
  },
  secondaryButtonLight: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    background: '#eff6ff',
    color: '#2563eb',
    padding: '16px 22px',
    borderRadius: '18px',
    fontWeight: 800,
    border: '1px solid rgba(37,99,235,0.15)',
  },
  heroMeta: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '24px',
  },
  metaItem: {
    background: '#ffffff',
    color: '#334155',
    border: '1px solid rgba(15,23,42,0.07)',
    padding: '10px 14px',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: 600,
  },
  heroVisual: {
    minHeight: '520px',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    minHeight: '520px',
    objectFit: 'cover',
    borderRadius: '32px',
    boxShadow: '0 24px 60px rgba(15,23,42,0.14)',
  },
  container: {
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '0 20px',
  },
  containerWide: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 20px',
  },
  sectionTop: {
    maxWidth: '760px',
    marginBottom: '28px',
  },
  eyebrow: {
    color: '#2563eb',
    fontSize: '13px',
    fontWeight: 800,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 'clamp(30px, 5vw, 48px)',
    lineHeight: 1.08,
    margin: '12px 0 0',
    fontWeight: 900,
    letterSpacing: '-0.04em',
    color: '#0f172a',
  },
  sectionText: {
    marginTop: '14px',
    color: '#475569',
    fontSize: '17px',
    lineHeight: 1.8,
  },
  sectionTextLeft: {
    marginTop: '16px',
    color: '#475569',
    fontSize: '17px',
    lineHeight: 1.8,
    maxWidth: '650px',
  },
  socialSection: {
    padding: '34px 0 20px',
  },
  socialGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '18px',
  },
  socialCardLarge: {
    background: '#ffffff',
    borderRadius: '30px',
    overflow: 'hidden',
    boxShadow: '0 18px 44px rgba(15,23,42,0.08)',
    border: '1px solid rgba(15,23,42,0.06)',
  },
  socialStack: {
    display: 'grid',
    gap: '18px',
  },
  socialCardSmall: {
    background: '#ffffff',
    borderRadius: '30px',
    overflow: 'hidden',
    boxShadow: '0 18px 44px rgba(15,23,42,0.08)',
    border: '1px solid rgba(15,23,42,0.06)',
  },
  cardImage: {
    width: '100%',
    height: '280px',
    objectFit: 'cover',
    display: 'block',
  },
  cardBody: {
    padding: '22px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '22px',
    lineHeight: 1.2,
    fontWeight: 800,
    color: '#0f172a',
  },
  cardText: {
    marginTop: '10px',
    color: '#475569',
    lineHeight: 1.75,
    fontSize: '15px',
  },
  howSection: {
    padding: '46px 0 10px',
  },
  stepGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '18px',
  },
  stepCard: {
    background: '#ffffff',
    border: '1px solid rgba(15,23,42,0.06)',
    borderRadius: '28px',
    padding: '24px',
    boxShadow: '0 18px 44px rgba(15,23,42,0.08)',
  },
  stepNumber: {
    width: '44px',
    height: '44px',
    borderRadius: '999px',
    background: '#2563eb',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: '18px',
  },
  stepTitle: {
    margin: '16px 0 0',
    fontSize: '22px',
    fontWeight: 800,
    color: '#0f172a',
  },
  stepText: {
    marginTop: '10px',
    color: '#475569',
    lineHeight: 1.75,
    fontSize: '15px',
  },
  productSection: {
    padding: '44px 0 16px',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '22px',
    alignItems: 'center',
  },
  productCopy: {
    paddingRight: '10px',
  },
  benefitGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '24px',
  },
  benefitItem: {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid rgba(15,23,42,0.06)',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#334155',
    fontWeight: 600,
    boxShadow: '0 12px 30px rgba(15,23,42,0.06)',
  },
  benefitDot: {
    width: '10px',
    height: '10px',
    borderRadius: '999px',
    background: '#2563eb',
    flexShrink: 0,
  },
  productVisualWrap: {
    display: 'grid',
    gap: '16px',
  },
  productVisualMain: {
    background: '#ffffff',
    padding: '12px',
    borderRadius: '28px',
    boxShadow: '0 18px 44px rgba(15,23,42,0.08)',
    border: '1px solid rgba(15,23,42,0.06)',
  },
  productImage: {
    width: '100%',
    height: '420px',
    objectFit: 'cover',
    borderRadius: '20px',
    display: 'block',
  },
  productVisualCard: {
    display: 'grid',
    gridTemplateColumns: '180px 1fr',
    gap: '14px',
    background: '#ffffff',
    padding: '12px',
    borderRadius: '24px',
    boxShadow: '0 18px 44px rgba(15,23,42,0.08)',
    border: '1px solid rgba(15,23,42,0.06)',
    alignItems: 'center',
  },
  productImageSmall: {
    width: '100%',
    height: '130px',
    objectFit: 'cover',
    borderRadius: '16px',
    display: 'block',
  },
  productCardText: {
    color: '#334155',
    lineHeight: 1.75,
    fontWeight: 600,
  },
  lifestyleSection: {
    padding: '34px 0 14px',
  },
  lifeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '18px',
  },
  lifeCard: {
    background: '#ffffff',
    borderRadius: '30px',
    overflow: 'hidden',
    boxShadow: '0 18px 44px rgba(15,23,42,0.08)',
    border: '1px solid rgba(15,23,42,0.06)',
  },
  lifeImage: {
    width: '100%',
    height: '240px',
    objectFit: 'cover',
    display: 'block',
  },
  lifeBody: {
    padding: '22px',
  },
  pricingSection: {
    padding: '42px 0 18px',
  },
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '18px',
    alignItems: 'stretch',
  },
  pricingCard: {
    background: '#ffffff',
    borderRadius: '30px',
    padding: '30px 24px',
    border: '1px solid rgba(15,23,42,0.06)',
    boxShadow: '0 18px 44px rgba(15,23,42,0.08)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '330px',
  },
  pricingCardFeatured: {
    background: '#2563eb',
    color: '#ffffff',
    borderRadius: '30px',
    padding: '30px 24px',
    boxShadow: '0 28px 60px rgba(37,99,235,0.30)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '330px',
  },
  badge: {
    display: 'inline-flex',
    width: 'fit-content',
    background: 'rgba(255,255,255,0.18)',
    border: '1px solid rgba(255,255,255,0.24)',
    color: '#ffffff',
    padding: '8px 12px',
    borderRadius: '999px',
    fontWeight: 800,
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  planName: {
    marginTop: '12px',
    fontSize: '24px',
    fontWeight: 800,
    color: '#0f172a',
  },
  planNameFeatured: {
    marginTop: '12px',
    fontSize: '24px',
    fontWeight: 800,
    color: '#ffffff',
  },
  planPrice: {
    marginTop: '10px',
    fontSize: '42px',
    fontWeight: 900,
    color: '#0f172a',
  },
  planPriceFeatured: {
    marginTop: '10px',
    fontSize: '42px',
    fontWeight: 900,
    color: '#ffffff',
  },
  planFee: {
    marginTop: '18px',
    color: '#334155',
    fontWeight: 700,
    fontSize: '17px',
    lineHeight: 1.6,
  },
  planFeeFeatured: {
    marginTop: '18px',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '17px',
    lineHeight: 1.6,
  },
  planButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    background: '#2563eb',
    color: '#ffffff',
    padding: '14px 18px',
    borderRadius: '16px',
    fontWeight: 800,
    marginTop: '26px',
    width: '100%',
  },
  planButtonFeatured: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    background: '#ffffff',
    color: '#2563eb',
    padding: '14px 18px',
    borderRadius: '16px',
    fontWeight: 800,
    marginTop: '26px',
    width: '100%',
  },
  ctaSection: {
    padding: '34px 0 70px',
  },
  ctaCard: {
    background: 'linear-gradient(180deg, #ffffff 0%, #eef5ff 100%)',
    borderRadius: '36px',
    border: '1px solid rgba(37,99,235,0.10)',
    boxShadow: '0 24px 60px rgba(15,23,42,0.10)',
    padding: '42px 28px',
    textAlign: 'center',
  },
  ctaTitle: {
    margin: 0,
    fontSize: 'clamp(30px, 5vw, 48px)',
    lineHeight: 1.08,
    fontWeight: 900,
    letterSpacing: '-0.04em',
    color: '#0f172a',
  },
  ctaText: {
    maxWidth: '700px',
    margin: '14px auto 0',
    color: '#475569',
    fontSize: '17px',
    lineHeight: 1.8,
  },
  ctaButtons: {
    display: 'flex',
    gap: '14px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: '26px',
  },
};