'use client';

import Link from 'next/link';
import { useState } from 'react';

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
} as const;

const lifestyleImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
];

export default function HomePage() {
  const [lang, setLang] = useState<Lang>('en');
  const t = content[lang];

  return (
    <main className="page">
      <header className="header">
        <div className="headerInner">
          <Link href="/" className="logoWrap">
            <div className="logoMark">M</div>
            <div className="logoText">MenuFlow</div>
          </Link>

          <nav className="headerNav">
            <a href="#how" className="navLink">
              {t.navHow}
            </a>
            <a href="#pricing" className="navLink">
              {t.navPricing}
            </a>

            <div className="langWrap">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={lang === 'en' ? 'langButton active' : 'langButton'}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('es')}
                className={lang === 'es' ? 'langButton active' : 'langButton'}
              >
                ES
              </button>
            </div>

            <Link href="/auth/signup" className="navButtonSecondary">
              {t.navCreate}
            </Link>
          </nav>
        </div>
      </header>

      <section className="heroSection">
        <div className="heroInner">
          <div className="heroCopy">
            <div className="pill">{t.pill}</div>

            <h1 className="heroTitle">{t.heroTitle}</h1>

            <p className="heroText">{t.heroText}</p>

            <div className="heroButtons">
              <Link href="/auth/signup?plan=starter" className="primaryButton">
                {t.startFree}
              </Link>
              <a href="#how" className="secondaryButton">
                {t.seeHow}
              </a>
            </div>

            <div className="heroMeta">
              <span className="metaItem">{t.meta1}</span>
              <span className="metaItem">{t.meta2}</span>
              <span className="metaItem">{t.meta3}</span>
            </div>
          </div>

          <div className="heroVisual">
            <img
              src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80"
              alt="Restaurant team serving food"
              className="heroImage"
            />
          </div>
        </div>
      </section>

      <section className="socialSection">
        <div className="container">
          <div className="sectionTop">
            <div className="eyebrow">{t.socialEyebrow}</div>
            <h2 className="sectionTitle">{t.socialTitle}</h2>
            <p className="sectionText">{t.socialText}</p>
          </div>

          <div className="socialGrid">
            <div className="socialCardLarge">
              <img
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80"
                alt="Chef plating food in a restaurant kitchen"
                className="cardImage"
              />
              <div className="cardBody">
                <h3 className="cardTitle">{t.serviceTitle}</h3>
                <p className="cardText">{t.serviceText}</p>
              </div>
            </div>

            <div className="socialStack">
              <div className="socialCardSmall">
                <img
                  src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80"
                  alt="Customer smiling with food"
                  className="cardImage"
                />
                <div className="cardBody">
                  <h3 className="cardTitle">{t.convertTitle}</h3>
                  <p className="cardText">{t.convertText}</p>
                </div>
              </div>

              <div className="socialCardSmall">
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80"
                  alt="Premium food table spread"
                  className="cardImage"
                />
                <div className="cardBody">
                  <h3 className="cardTitle">{t.premiumTitle}</h3>
                  <p className="cardText">{t.premiumText}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="howSection">
        <div className="container">
          <div className="sectionTop">
            <div className="eyebrow">{t.howEyebrow}</div>
            <h2 className="sectionTitle">{t.howTitle}</h2>
          </div>

          <div className="stepGrid">
            {t.sections.map((item, index) => (
              <div key={item.title} className="stepCard">
                <div className="stepNumber">{index + 1}</div>
                <h3 className="stepTitle">{item.title}</h3>
                <p className="stepText">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="productSection">
        <div className="containerWide">
          <div className="productGrid">
            <div className="productCopy">
              <div className="eyebrow">{t.productEyebrow}</div>
              <h2 className="sectionTitle">{t.productTitle}</h2>
              <p className="sectionTextLeft">{t.productText}</p>

              <div className="benefitGrid">
                {t.benefits.map((benefit) => (
                  <div key={benefit} className="benefitItem">
                    <span className="benefitDot" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="productVisualWrap">
              <div className="productVisualMain">
                <img
                  src="https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1400&q=80"
                  alt="Person ordering food on a phone"
                  className="productImage"
                />
              </div>
              <div className="productVisualCard">
                <img
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80"
                  alt="Pizza and restaurant table"
                  className="productImageSmall"
                />
                <div className="productCardText">{t.productCardText}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lifestyleSection">
        <div className="container">
          <div className="sectionTop">
            <div className="eyebrow">{t.lifestyleEyebrow}</div>
            <h2 className="sectionTitle">{t.lifestyleTitle}</h2>
          </div>

          <div className="lifeGrid">
            {t.lifestyle.map((item, index) => (
              <div key={item.title} className="lifeCard">
                <img src={lifestyleImages[index]} alt={item.title} className="lifeImage" />
                <div className="lifeBody">
                  <h3 className="cardTitle">{item.title}</h3>
                  <p className="cardText">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="pricingSection">
        <div className="container">
          <div className="sectionTop">
            <div className="eyebrow">{t.pricingEyebrow}</div>
            <h2 className="sectionTitle">{t.pricingTitle}</h2>
          </div>

          <div className="pricingGrid">
            <div className="pricingCard">
              <div>
                <div className="planName">{t.starter}</div>
                <div className="planPrice">{t.starterPrice}</div>
                <div className="planFee">{t.starterFee}</div>
              </div>
              <Link href="/auth/signup?plan=starter" className="planButton">
                {t.startFree}
              </Link>
            </div>

            <div className="pricingCardFeatured">
              <div>
                <div className="badge">{t.mostPopular}</div>
                <div className="planNameFeatured">{t.growth}</div>
                <div className="planPriceFeatured">{t.growthPrice}</div>
                <div className="planFeeFeatured">{t.growthFee}</div>
              </div>
              <Link href="/auth/checkout?plan=growth" className="planButtonFeatured">
                {t.chooseGrowth}
              </Link>
            </div>

            <div className="pricingCard">
              <div>
                <div className="planName">{t.premium}</div>
                <div className="planPrice">{t.premiumPrice}</div>
                <div className="planFee">{t.premiumFee}</div>
              </div>
              <Link href="/auth/checkout?plan=premium" className="planButton">
                {t.goPremium}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="ctaSection">
        <div className="container">
          <div className="ctaCard">
            <h2 className="ctaTitle">{t.ctaTitle}</h2>
            <p className="ctaText">{t.ctaText}</p>
            <div className="ctaButtons">
              <Link href="/auth/signup?plan=starter" className="primaryButton">
                {t.getStartedFree}
              </Link>
              <Link href="/auth/checkout?plan=premium" className="secondaryButtonLight">
                {t.goPremium}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .page {
          background: #f8fbff;
          color: #0f172a;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 40;
          backdrop-filter: blur(14px);
          background: rgba(248, 251, 255, 0.88);
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .headerInner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .logoWrap {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #0f172a;
          min-width: 0;
        }

        .logoMark {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: #2563eb;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 20px;
          box-shadow: 0 14px 30px rgba(37, 99, 235, 0.28);
          flex-shrink: 0;
        }

        .logoText {
          font-size: 22px;
          font-weight: 800;
          line-height: 1;
          white-space: nowrap;
        }

        .headerNav {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .navLink {
          color: #334155;
          text-decoration: none;
          font-weight: 600;
          white-space: nowrap;
        }

        .navButtonSecondary {
          text-decoration: none;
          color: #2563eb;
          border: 1px solid rgba(37, 99, 235, 0.22);
          background: #eff6ff;
          padding: 10px 16px;
          border-radius: 14px;
          font-weight: 700;
          white-space: nowrap;
        }

        .langWrap {
          display: flex;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          padding: 4px;
          border-radius: 14px;
        }

        .langButton {
          border: none;
          background: transparent;
          color: #64748b;
          padding: 8px 12px;
          border-radius: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .langButton.active {
          background: #2563eb;
          color: #fff;
        }

        .heroSection {
          padding: 32px 20px 24px;
        }

        .heroInner {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 20px;
          align-items: center;
        }

        .heroCopy {
          min-width: 0;
        }

        .pill {
          display: inline-flex;
          padding: 10px 16px;
          border-radius: 999px;
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid rgba(37, 99, 235, 0.18);
          font-weight: 700;
          font-size: 14px;
        }

        .heroTitle {
          font-size: clamp(40px, 11vw, 76px);
          line-height: 0.98;
          margin: 18px 0 0;
          font-weight: 900;
          letter-spacing: -0.05em;
          color: #0f172a;
          max-width: 900px;
        }

        .heroText {
          margin-top: 18px;
          max-width: 700px;
          font-size: 17px;
          line-height: 1.75;
          color: #475569;
        }

        .heroButtons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .primaryButton,
        .secondaryButton,
        .secondaryButtonLight,
        .planButton,
        .planButtonFeatured {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 18px;
          font-weight: 800;
          text-align: center;
        }

        .primaryButton {
          background: #2563eb;
          color: #fff;
          padding: 16px 22px;
          box-shadow: 0 18px 34px rgba(37, 99, 235, 0.24);
        }

        .secondaryButton {
          background: #ffffff;
          color: #0f172a;
          padding: 16px 22px;
          border: 1px solid rgba(15, 23, 42, 0.08);
        }

        .secondaryButtonLight {
          background: #eff6ff;
          color: #2563eb;
          padding: 16px 22px;
          border: 1px solid rgba(37, 99, 235, 0.15);
        }

        .heroMeta {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 22px;
        }

        .metaItem {
          background: #ffffff;
          color: #334155;
          border: 1px solid rgba(15, 23, 42, 0.07);
          padding: 10px 14px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
        }

        .heroVisual {
          min-width: 0;
        }

        .heroImage {
          width: 100%;
          height: 360px;
          object-fit: cover;
          border-radius: 28px;
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.14);
          display: block;
        }

        .container,
        .containerWide {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .containerWide {
          max-width: 1280px;
        }

        .sectionTop {
          max-width: 760px;
          margin-bottom: 24px;
        }

        .eyebrow {
          color: #2563eb;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .sectionTitle {
          font-size: clamp(32px, 8vw, 48px);
          line-height: 1.06;
          margin: 12px 0 0;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #0f172a;
        }

        .sectionText,
        .sectionTextLeft,
        .ctaText {
          margin-top: 14px;
          color: #475569;
          font-size: 17px;
          line-height: 1.8;
        }

        .sectionTextLeft {
          max-width: 650px;
        }

        .socialSection,
        .howSection,
        .productSection,
        .lifestyleSection,
        .pricingSection {
          padding: 34px 0 12px;
        }

        .ctaSection {
          padding: 34px 0 70px;
        }

        .socialGrid,
        .stepGrid,
        .productGrid,
        .lifeGrid,
        .pricingGrid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 18px;
        }

        .socialStack,
        .productVisualWrap {
          display: grid;
          gap: 18px;
        }

        .socialCardLarge,
        .socialCardSmall,
        .stepCard,
        .lifeCard,
        .pricingCard,
        .pricingCardFeatured,
        .productVisualMain,
        .productVisualCard,
        .ctaCard {
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.06);
          box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08);
        }

        .socialCardLarge,
        .socialCardSmall,
        .lifeCard {
          border-radius: 28px;
          overflow: hidden;
        }

        .stepCard {
          border-radius: 26px;
          padding: 22px;
        }

        .productVisualMain {
          padding: 12px;
          border-radius: 28px;
        }

        .productVisualCard {
          padding: 12px;
          border-radius: 24px;
          align-items: center;
          grid-template-columns: minmax(0, 1fr);
        }

        .cardImage {
          width: 100%;
          height: 240px;
          object-fit: cover;
          display: block;
        }

        .cardBody,
        .lifeBody {
          padding: 22px;
        }

        .cardTitle {
          margin: 0;
          font-size: 22px;
          line-height: 1.2;
          font-weight: 800;
          color: #0f172a;
        }

        .cardText {
          margin-top: 10px;
          color: #475569;
          line-height: 1.75;
          font-size: 15px;
        }

        .stepNumber {
          width: 48px;
          height: 48px;
          border-radius: 999px;
          background: #2563eb;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 18px;
        }

        .stepTitle {
          margin: 16px 0 0;
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
        }

        .stepText {
          margin-top: 10px;
          color: #475569;
          line-height: 1.75;
          font-size: 15px;
        }

        .benefitGrid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 12px;
          margin-top: 24px;
        }

        .benefitItem {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid rgba(15, 23, 42, 0.06);
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #334155;
          font-weight: 600;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
          min-width: 0;
        }

        .benefitDot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #2563eb;
          flex-shrink: 0;
        }

        .productImage {
          width: 100%;
          height: 320px;
          object-fit: cover;
          border-radius: 20px;
          display: block;
        }

        .productImageSmall {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 16px;
          display: block;
        }

        .productCardText {
          color: #334155;
          line-height: 1.75;
          font-weight: 600;
        }

        .lifeImage {
          width: 100%;
          height: 240px;
          object-fit: cover;
          display: block;
        }

        .pricingCard,
        .pricingCardFeatured {
          border-radius: 28px;
          padding: 28px 22px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 0;
        }

        .pricingCardFeatured {
          background: #2563eb;
          color: #ffffff;
          box-shadow: 0 28px 60px rgba(37, 99, 235, 0.3);
        }

        .badge {
          display: inline-flex;
          width: fit-content;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.24);
          color: #ffffff;
          padding: 8px 12px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .planName,
        .planNameFeatured {
          margin-top: 12px;
          font-size: 24px;
          font-weight: 800;
          line-height: 1.2;
        }

        .planName {
          color: #0f172a;
        }

        .planNameFeatured {
          color: #ffffff;
        }

        .planPrice,
        .planPriceFeatured {
          margin-top: 10px;
          font-size: clamp(40px, 11vw, 52px);
          font-weight: 900;
          line-height: 1;
        }

        .planPrice {
          color: #0f172a;
        }

        .planPriceFeatured {
          color: #ffffff;
        }

        .planFee,
        .planFeeFeatured {
          margin-top: 16px;
          font-weight: 700;
          font-size: 17px;
          line-height: 1.6;
        }

        .planFee {
          color: #334155;
        }

        .planFeeFeatured {
          color: #ffffff;
        }

        .planButton,
        .planButtonFeatured {
          padding: 14px 18px;
          margin-top: 24px;
          width: 100%;
          border-radius: 16px;
        }

        .planButton {
          background: #2563eb;
          color: #ffffff;
        }

        .planButtonFeatured {
          background: #ffffff;
          color: #2563eb;
        }

        .ctaCard {
          background: linear-gradient(180deg, #ffffff 0%, #eef5ff 100%);
          border-radius: 32px;
          border: 1px solid rgba(37, 99, 235, 0.1);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.1);
          padding: 34px 22px;
          text-align: center;
        }

        .ctaTitle {
          margin: 0;
          font-size: clamp(32px, 8vw, 48px);
          line-height: 1.08;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #0f172a;
        }

        .ctaButtons {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 26px;
        }

        @media (max-width: 1023px) {
          .headerInner {
            align-items: flex-start;
            flex-direction: column;
          }

          .headerNav {
            width: 100%;
            justify-content: flex-start;
          }
        }

        @media (max-width: 767px) {
          .header {
            position: static;
          }

          .headerInner {
            padding: 16px 16px 18px;
          }

          .logoMark {
            width: 38px;
            height: 38px;
            border-radius: 12px;
            font-size: 18px;
          }

          .logoText {
            font-size: 18px;
          }

          .headerNav {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            width: 100%;
          }

          .navLink {
            display: inline-flex;
            align-items: center;
            min-height: 44px;
          }

          .langWrap {
            width: 100%;
            grid-column: 1 / -1;
            justify-content: stretch;
          }

          .langButton {
            flex: 1;
            min-height: 44px;
          }

          .navButtonSecondary {
            grid-column: 1 / -1;
            width: 100%;
            justify-content: center;
            display: inline-flex;
            min-height: 48px;
          }

          .heroSection {
            padding: 22px 16px 18px;
          }

          .heroTitle {
            font-size: clamp(34px, 12vw, 52px);
            line-height: 0.98;
          }

          .heroText,
          .sectionText,
          .sectionTextLeft,
          .ctaText {
            font-size: 16px;
            line-height: 1.7;
          }

          .heroButtons {
            flex-direction: column;
          }

          .heroButtons a {
            width: 100%;
          }

          .heroImage {
            height: 300px;
            border-radius: 24px;
          }

          .container,
          .containerWide {
            padding: 0 16px;
          }

          .cardImage {
            height: 220px;
          }

          .productImage {
            height: 280px;
          }

          .productImageSmall {
            height: 160px;
          }

          .lifeImage {
            height: 220px;
          }

          .stepCard,
          .pricingCard,
          .pricingCardFeatured,
          .ctaCard {
            padding: 22px 18px;
          }

          .planName,
          .planNameFeatured {
            font-size: 22px;
          }

          .planPrice,
          .planPriceFeatured {
            font-size: clamp(36px, 11vw, 46px);
          }

          .ctaButtons {
            flex-direction: column;
          }

          .ctaButtons a {
            width: 100%;
          }
        }

        @media (min-width: 768px) {
          .heroSection {
            padding: 42px 20px 26px;
          }

          .heroInner {
            grid-template-columns: minmax(0, 1fr);
          }

          .productVisualCard {
            grid-template-columns: 180px minmax(0, 1fr);
          }

          .benefitGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .stepGrid,
          .lifeGrid,
          .pricingGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .socialGrid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (min-width: 1100px) {
          .heroInner {
            grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
            gap: 28px;
          }

          .heroCopy {
            padding-right: 8px;
          }

          .heroImage {
            height: 520px;
          }

          .socialGrid {
            grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
          }

          .stepGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .productGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 22px;
          }

          .lifeGrid,
          .pricingGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .productCopy {
            padding-right: 10px;
          }
        }
      `}</style>
    </main>
  );
}