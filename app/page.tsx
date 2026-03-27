
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
    heroTitle: 'MenuFlow builds and turns your menu into a website in minutes',
    heroText:
      'Just enter your information. MenuFlow generates your storefront, menu, checkout, and ordering flow for you automatically.',
    startFree: 'Start Free',
    seeHow: 'See How It Works',
    meta1: 'Direct checkout',
    meta2: 'Built for food businesses',
    meta3: 'Premium SaaS feel',

    socialEyebrow: 'Built for real food businesses',
    socialTitle: 'A direct-ordering platform that feels premium and alive.',
    socialText:
      'MenuFlow is built for restaurants, food trucks, caterers, and pop-ups that want direct orders through their own branded system instead of relying on third-party apps.',
    serviceTitle: 'Branded storefront experience',
    serviceText:
      'Your business gets a cleaner, stronger online presence that feels custom, polished, and built to sell.',
    convertTitle: 'Built to convert',
    convertText:
      'A better presentation helps customers trust faster, order faster, and come back more often.',
    premiumTitle: 'System-level presentation',
    premiumText:
      'Your menu, checkout, branding, and photos work together like one real platform.',

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
      'Premium customer storefront',
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
    pricingTitle: 'Simple pricing. Premium presentation.',
    starter: 'Starter',
    starterTop: 'First Month Free',
    starterPrice: 'Then $19/month',
    starterFee: 'Platform fee of 10%',
    growth: 'Growth',
    growthTop: '$49/month',
    growthPrice: 'Platform fee of 5%',
    premium: 'Premium',
    premiumTop: '$99/month',
    premiumPrice: 'Platform fee of 3%',
    mostPopular: 'Most Popular',
    chooseStarter: 'Start Free',
    chooseGrowth: 'Choose Growth',
    choosePremium: 'Go Premium',

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
    heroTitle: 'MenuFlow crea y convierte tu menú en un sitio web en minutos',
    heroText:
      'Solo ingresa tu información. MenuFlow genera automáticamente tu tienda, menú, checkout y flujo de pedidos.',
    startFree: 'Empieza Gratis',
    seeHow: 'Ver Cómo Funciona',
    meta1: 'Checkout directo',
    meta2: 'Hecho para negocios de comida',
    meta3: 'Estilo premium SaaS',

    socialEyebrow: 'Hecho para negocios reales de comida',
    socialTitle: 'Una plataforma de pedidos directos que se siente premium y viva.',
    socialText:
      'MenuFlow está hecho para restaurantes, food trucks, caterers y pop-ups que quieren pedidos directos desde su propio sistema de marca en lugar de depender de apps de terceros.',
    serviceTitle: 'Experiencia de tienda de marca',
    serviceText:
      'Tu negocio obtiene una presencia online más limpia, fuerte y profesional, hecha para vender.',
    convertTitle: 'Hecho para convertir',
    convertText:
      'Una mejor presentación ayuda a que los clientes confíen más rápido, ordenen más rápido y regresen más seguido.',
    premiumTitle: 'Presentación de nivel plataforma',
    premiumText:
      'Tu menú, checkout, marca y fotos trabajan juntos como una plataforma real.',

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
      'Tienda premium para clientes',
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
    pricingTitle: 'Precios simples. Presentación premium.',
    starter: 'Starter',
    starterTop: 'Primer Mes Gratis',
    starterPrice: 'Luego $19/mes',
    starterFee: 'Tarifa de plataforma de 10%',
    growth: 'Growth',
    growthTop: '$49/mes',
    growthPrice: 'Tarifa de plataforma de 5%',
    premium: 'Premium',
    premiumTop: '$99/mes',
    premiumPrice: 'Tarifa de plataforma de 3%',
    mostPopular: 'Más Popular',
    chooseStarter: 'Empieza Gratis',
    chooseGrowth: 'Elegir Growth',
    choosePremium: 'Ir Premium',

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
  const t = content[lang as keyof typeof content];

  return (
    <main className="page">
      <header className="header">
        <div className="headerGlow" />
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

            <Link href="/auth/signup" className="navButton">
              {t.navCreate}
            </Link>
          </nav>
        </div>
      </header>

      <section className="heroSection">
        <div className="heroAura auraOne" />
        <div className="heroAura auraTwo" />
        <div className="gridGlow" />

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
            <div className="heroVisualFrame">
              <img
                src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80"
                alt="Restaurant team serving food"
                className="heroImage"
              />
            </div>

            <div className="floatingCard cardOne">
              <img
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80"
                alt="Chef plating food"
                className="floatingImage"
              />
              <div className="floatingBody">
                <div className="floatingLabel">Direct Ordering</div>
                <div className="floatingText">
                  Live storefronts that feel custom and premium.
                </div>
              </div>
            </div>

            <div className="floatingCard cardTwo">
              <img
                src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80"
                alt="Happy customer with food"
                className="floatingImage"
              />
              <div className="floatingBody">
                <div className="floatingLabel">Built for conversion</div>
                <div className="floatingText">
                  Better visuals. Better trust. Faster orders.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="pricingSection pricingTopMobile">
        <div className="container">
          <div className="sectionTop compact">
            <div className="eyebrow">{t.pricingEyebrow}</div>
            <h2 className="sectionTitle">{t.pricingTitle}</h2>
          </div>

          <div className="pricingGrid mobileOnlyGrid">
            <div className="pricingCard">
              <div className="pricingHeader">
                <div className="planName">{t.starter}</div>
                <div className="planTop">{t.starterTop}</div>
                <div className="planSub">{t.starterPrice}</div>
                <div className="planFee">{t.starterFee}</div>
              </div>
              <Link href="/auth/signup?plan=starter" className="planButton">
                {t.chooseStarter}
              </Link>
            </div>

            <div className="pricingCard featured">
              <div className="pricingHeader">
                <div className="badge">{t.mostPopular}</div>
                <div className="planName featuredText">{t.growth}</div>
                <div className="planTop featuredText">{t.growthTop}</div>
                <div className="planFee featuredText">{t.growthPrice}</div>
              </div>
              <Link href="/auth/checkout?plan=growth" className="planButton featuredButton">
                {t.chooseGrowth}
              </Link>
            </div>

            <div className="pricingCard">
              <div className="pricingHeader">
                <div className="planName">{t.premium}</div>
                <div className="planTop">{t.premiumTop}</div>
                <div className="planFee">{t.premiumPrice}</div>
              </div>
              <Link href="/auth/checkout?plan=premium" className="planButton">
                {t.choosePremium}
              </Link>
            </div>
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
            <div className="socialCard large">
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
              <div className="socialCard">
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

              <div className="socialCard">
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
          <div className="sectionTop compact">
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
          <div className="sectionTop compact">
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

      <section className="pricingSection desktopPricing">
        <div className="container">
          <div className="sectionTop">
            <div className="eyebrow">{t.pricingEyebrow}</div>
            <h2 className="sectionTitle">{t.pricingTitle}</h2>
          </div>

          <div className="pricingGrid desktopOnlyGrid">
            <div className="pricingCard">
              <div className="pricingHeader">
                <div className="planName">{t.starter}</div>
                <div className="planTop">{t.starterTop}</div>
                <div className="planSub">{t.starterPrice}</div>
                <div className="planFee">{t.starterFee}</div>
              </div>
              <Link href="/auth/signup?plan=starter" className="planButton">
                {t.chooseStarter}
              </Link>
            </div>

            <div className="pricingCard featured">
              <div className="pricingHeader">
                <div className="badge">{t.mostPopular}</div>
                <div className="planName featuredText">{t.growth}</div>
                <div className="planTop featuredText">{t.growthTop}</div>
                <div className="planFee featuredText">{t.growthPrice}</div>
              </div>
              <Link href="/auth/checkout?plan=growth" className="planButton featuredButton">
                {t.chooseGrowth}
              </Link>
            </div>

            <div className="pricingCard">
              <div className="pricingHeader">
                <div className="planName">{t.premium}</div>
                <div className="planTop">{t.premiumTop}</div>
                <div className="planFee">{t.premiumPrice}</div>
              </div>
              <Link href="/auth/checkout?plan=premium" className="planButton">
                {t.choosePremium}
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
              <Link href="/auth/checkout?plan=premium" className="secondaryButton">
                {t.choosePremium}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          color: #f8fafc;
          background:
            radial-gradient(circle at 20% 0%, rgba(111, 77, 255, 0.34), transparent 32%),
            radial-gradient(circle at 85% 18%, rgba(173, 92, 255, 0.24), transparent 26%),
            radial-gradient(circle at 50% 100%, rgba(37, 99, 235, 0.18), transparent 32%),
            linear-gradient(180deg, #050816 0%, #0b1020 46%, #0f172a 100%);
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          overflow-x: hidden;
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(18px);
          background: rgba(7, 11, 24, 0.72);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .headerGlow {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(111, 77, 255, 0.08),
            rgba(173, 92, 255, 0.04),
            rgba(37, 99, 235, 0.05)
          );
          pointer-events: none;
        }

        .headerInner {
          position: relative;
          max-width: 1280px;
          margin: 0 auto;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .logoWrap {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #ffffff;
          flex-shrink: 0;
        }

        .logoMark {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 20px;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.12),
            0 18px 34px rgba(103, 74, 255, 0.35);
        }

        .logoText {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #ffffff;
        }

        .headerNav {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .navLink {
          color: rgba(255, 255, 255, 0.84);
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
        }

        .navButton {
          text-decoration: none;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.07);
          padding: 10px 16px;
          border-radius: 14px;
          font-weight: 700;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18);
        }

        .langWrap {
          display: flex;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 4px;
          border-radius: 14px;
        }

        .langButton {
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.72);
          padding: 8px 12px;
          border-radius: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .langButton.active {
          background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
          color: #fff;
          box-shadow: 0 10px 24px rgba(92, 74, 255, 0.35);
        }

        .heroSection {
          position: relative;
          padding: 32px 20px 12px;
          overflow: hidden;
        }

        .heroAura {
          position: absolute;
          border-radius: 999px;
          filter: blur(110px);
          pointer-events: none;
          opacity: 0.55;
        }

        .auraOne {
          width: 320px;
          height: 320px;
          top: 40px;
          left: -60px;
          background: rgba(111, 77, 255, 0.34);
        }

        .auraTwo {
          width: 280px;
          height: 280px;
          top: 0;
          right: -40px;
          background: rgba(173, 92, 255, 0.22);
        }

        .gridGlow {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: linear-gradient(180deg, rgba(0,0,0,0.6), transparent 85%);
          pointer-events: none;
          opacity: 0.22;
        }

        .heroInner {
          position: relative;
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 26px;
          align-items: center;
        }

        .heroCopy {
          position: relative;
          z-index: 2;
          max-width: 760px;
        }

        .pill {
          display: inline-flex;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          color: #dbeafe;
          border: 1px solid rgba(255, 255, 255, 0.14);
          font-weight: 700;
          font-size: 14px;
          backdrop-filter: blur(8px);
        }

        .heroTitle {
          font-size: clamp(38px, 9vw, 76px);
          line-height: 0.98;
          margin: 18px 0 0;
          font-weight: 900;
          letter-spacing: -0.06em;
          color: #ffffff;
          max-width: 900px;
          text-wrap: balance;
        }

        .heroText {
          margin-top: 18px;
          max-width: 700px;
          font-size: 18px;
          line-height: 1.7;
          color: rgba(226, 232, 240, 0.86);
        }

        .heroButtons {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 26px;
        }

        .primaryButton,
        .secondaryButton,
        .planButton,
        .featuredButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          padding: 16px 22px;
          border-radius: 18px;
          font-weight: 800;
          transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
        }

        .primaryButton {
          background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
          color: #ffffff;
          box-shadow:
            0 18px 34px rgba(73, 58, 214, 0.32),
            0 0 0 1px rgba(255, 255, 255, 0.08);
        }

        .secondaryButton {
          background: rgba(255, 255, 255, 0.07);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(10px);
        }

        .heroMeta {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .metaItem {
          background: rgba(255, 255, 255, 0.06);
          color: rgba(226, 232, 240, 0.86);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 10px 14px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          backdrop-filter: blur(10px);
        }

        .heroVisual {
          position: relative;
          min-height: 0;
          display: none;
        }

        .heroVisualFrame {
          position: relative;
          padding: 14px;
          border-radius: 34px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.12) 0%,
            rgba(255, 255, 255, 0.04) 100%
          );
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow:
            0 30px 80px rgba(2, 6, 23, 0.55),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(16px);
        }

        .heroImage {
          width: 100%;
          height: 100%;
          min-height: 540px;
          object-fit: cover;
          border-radius: 24px;
          display: block;
        }

        .floatingCard {
          position: absolute;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 20px 48px rgba(2, 6, 23, 0.45);
          backdrop-filter: blur(16px);
        }

        .cardOne {
          width: 240px;
          right: -10px;
          top: 36px;
        }

        .cardTwo {
          width: 230px;
          left: -20px;
          bottom: 26px;
        }

        .floatingImage {
          width: 100%;
          height: 120px;
          object-fit: cover;
          display: block;
        }

        .floatingBody {
          padding: 14px;
        }

        .floatingLabel {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #c4b5fd;
          font-weight: 800;
        }

        .floatingText {
          margin-top: 8px;
          color: rgba(255, 255, 255, 0.88);
          font-size: 14px;
          line-height: 1.55;
          font-weight: 600;
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
          margin-bottom: 28px;
        }

        .sectionTop.compact {
          margin-bottom: 20px;
        }

        .eyebrow {
          color: #c4b5fd;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .sectionTitle {
          font-size: clamp(30px, 5vw, 48px);
          line-height: 1.08;
          margin: 12px 0 0;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #ffffff;
          text-wrap: balance;
        }

        .sectionText,
        .sectionTextLeft,
        .ctaText {
          margin-top: 14px;
          color: rgba(226, 232, 240, 0.82);
          font-size: 17px;
          line-height: 1.8;
        }

        .sectionTextLeft {
          max-width: 650px;
        }

        .pricingSection,
        .socialSection,
        .howSection,
        .productSection,
        .lifestyleSection,
        .ctaSection {
          padding: 30px 0 12px;
        }

        .ctaSection {
          padding-bottom: 70px;
        }

        .pricingTopMobile {
          padding-top: 8px;
        }

        .pricingGrid,
        .socialGrid,
        .stepGrid,
        .productGrid,
        .lifeGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }

        .socialStack,
        .productVisualWrap {
          display: grid;
          gap: 18px;
        }

        .pricingCard,
        .socialCard,
        .stepCard,
        .productVisualMain,
        .productVisualCard,
        .lifeCard,
        .ctaCard {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.08) 0%,
            rgba(255, 255, 255, 0.04) 100%
          );
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow:
            0 22px 60px rgba(2, 6, 23, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(14px);
        }

        .pricingCard,
        .stepCard,
        .ctaCard {
          border-radius: 28px;
        }

        .socialCard,
        .lifeCard {
          border-radius: 30px;
          overflow: hidden;
        }

        .socialCard.large {
          min-height: 100%;
        }

        .cardImage {
          width: 100%;
          height: 250px;
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
          color: #ffffff;
        }

        .cardText {
          margin-top: 10px;
          color: rgba(226, 232, 240, 0.8);
          line-height: 1.75;
          font-size: 15px;
        }

        .stepCard {
          padding: 22px;
        }

        .stepNumber {
          width: 46px;
          height: 46px;
          border-radius: 999px;
          background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 18px;
          box-shadow: 0 14px 30px rgba(73, 58, 214, 0.3);
        }

        .stepTitle {
          margin: 16px 0 0;
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
        }

        .stepText {
          margin-top: 10px;
          color: rgba(226, 232, 240, 0.8);
          line-height: 1.75;
          font-size: 15px;
        }

        .productCopy {
          max-width: 700px;
        }

        .benefitGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-top: 20px;
        }

        .benefitItem {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(255, 255, 255, 0.88);
          font-weight: 600;
          box-shadow: 0 14px 36px rgba(2, 6, 23, 0.25);
          backdrop-filter: blur(10px);
        }

        .benefitDot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
          flex-shrink: 0;
        }

        .productVisualMain {
          padding: 12px;
          border-radius: 28px;
        }

        .productImage {
          width: 100%;
          height: 320px;
          object-fit: cover;
          border-radius: 20px;
          display: block;
        }

        .productVisualCard {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          padding: 12px;
          border-radius: 24px;
          align-items: center;
        }

        .productImageSmall {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 16px;
          display: block;
        }

        .productCardText {
          color: rgba(255, 255, 255, 0.86);
          line-height: 1.75;
          font-weight: 600;
        }

        .lifeImage {
          width: 100%;
          height: 240px;
          object-fit: cover;
          display: block;
        }

        .desktopPricing {
          display: none;
        }

        .pricingCard {
          padding: 28px 22px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 0;
        }

        .pricingCard.featured {
          background:
            radial-gradient(circle at top, rgba(124, 58, 237, 0.34), transparent 48%),
            linear-gradient(180deg, rgba(69, 51, 163, 0.95) 0%, rgba(37, 99, 235, 0.88) 100%);
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow:
            0 28px 60px rgba(72, 55, 190, 0.38),
            0 0 0 1px rgba(255, 255, 255, 0.04);
        }

        .pricingHeader {
          display: grid;
          gap: 10px;
        }

        .badge {
          display: inline-flex;
          width: fit-content;
          background: rgba(255, 255, 255, 0.16);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 8px 12px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .planName {
          margin-top: 2px;
          font-size: 24px;
          font-weight: 800;
          color: #ffffff;
        }

        .featuredText {
          color: #ffffff;
        }

        .planTop {
          font-size: clamp(36px, 10vw, 46px);
          line-height: 1;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.04em;
        }

        .planSub {
          color: rgba(226, 232, 240, 0.92);
          font-size: 18px;
          font-weight: 700;
          line-height: 1.45;
        }

        .planFee {
          color: rgba(226, 232, 240, 0.84);
          font-weight: 700;
          font-size: 17px;
          line-height: 1.6;
        }

        .planButton {
          width: 100%;
          margin-top: 24px;
          background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
          color: #ffffff;
          box-shadow:
            0 18px 34px rgba(73, 58, 214, 0.28),
            0 0 0 1px rgba(255, 255, 255, 0.06);
        }

        .featuredButton {
          background: #ffffff;
          color: #2d4ddb;
          box-shadow:
            0 18px 34px rgba(2, 6, 23, 0.22),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .ctaCard {
          border-radius: 36px;
          padding: 38px 24px;
          text-align: center;
          background:
            radial-gradient(circle at top, rgba(124, 58, 237, 0.22), transparent 42%),
            linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%);
        }

        .ctaTitle {
          margin: 0;
          font-size: clamp(30px, 5vw, 48px);
          line-height: 1.08;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #ffffff;
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
            padding: 16px;
          }

          .logoText {
            font-size: 19px;
          }

          .headerNav {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            width: 100%;
          }

          .navLink {
            min-height: 44px;
            display: inline-flex;
            align-items: center;
          }

          .langWrap {
            grid-column: 1 / -1;
            width: 100%;
            justify-content: stretch;
          }

          .langButton {
            flex: 1;
            min-height: 44px;
          }

          .navButton {
            grid-column: 1 / -1;
            width: 100%;
            justify-content: center;
            display: inline-flex;
            min-height: 48px;
          }

          .heroSection {
            padding: 22px 16px 8px;
          }

          .container,
          .containerWide {
            padding: 0 16px;
          }

          .heroTitle {
            font-size: clamp(34px, 12vw, 52px);
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

          .heroButtons a,
          .ctaButtons a {
            width: 100%;
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

          .pricingCard,
          .stepCard,
          .ctaCard {
            padding: 22px 18px;
          }

          .planName {
            font-size: 22px;
          }

          .planTop {
            font-size: clamp(34px, 11vw, 42px);
          }

          .ctaButtons {
            flex-direction: column;
          }
        }

        @media (min-width: 768px) {
          .heroInner {
            grid-template-columns: 1fr;
          }

          .benefitGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .stepGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .lifeGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .productVisualCard {
            grid-template-columns: 180px 1fr;
          }
        }

        @media (min-width: 1100px) {
          .heroSection {
            padding: 42px 20px 18px;
          }

          .heroInner {
            grid-template-columns: minmax(0, 1.02fr) minmax(0, 1fr);
            gap: 32px;
          }

          .heroVisual {
            display: block;
            min-height: 540px;
          }

          .heroCopy {
            padding-right: 8px;
          }

          .pricingTopMobile {
            display: none;
          }

          .desktopPricing {
            display: block;
          }

          .socialGrid {
            grid-template-columns: minmax(0, 1.18fr) minmax(0, 0.82fr);
          }

          .stepGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .productGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 24px;
          }

          .lifeGrid,
          .desktopOnlyGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .productImage {
            height: 420px;
          }

          .productImageSmall {
            height: 130px;
          }
        }
      `}</style>
    </main>
  );
}