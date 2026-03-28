'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Lang = 'en' | 'es';

type RestaurantRecord = {
  id?: string;
  name?: string | null;
  slug?: string | null;
  plan?: string | null;
  owner_email?: string | null;
};

const copy = {
  en: {
    title: 'MenuFlow Owner Panel',
    greetingMorning: 'Good Morning',
    greetingAfternoon: 'Good Afternoon',
    greetingEvening: 'Good Evening',
    subtitle: 'Manage your business profile, menu, and storefront from one place.',
    openBuilder: 'Open Menu Builder',
    viewStore: 'View Store',
    loading: 'Loading your dashboard...',
    businessStatus: 'Business Status',
    active: 'Active',
    activeText: 'Your store profile is live in the system.',
    stripePayments: 'Stripe Payments',
    stripeNotConnected: 'Stripe not connected',
    stripeText: 'Finish your Stripe setup to accept live customer payments.',
    selectedPlan: 'Selected Plan',
    noPlan: 'No plan found',
    planText: 'Your current restaurant plan is attached to this account.',
    storefrontSlug: 'Storefront Slug',
    noSlug: 'No slug found',
    slugText: 'This is the live storefront link connected to your account.',
    fallbackBusiness: 'Your Business',
    fallbackEmail: 'No email found',
    signOut: 'Sign Out',
    menuBuilderSoon: 'Menu builder route is not connected yet.',
    noStoreYet: 'No storefront slug found yet for this account.',
    notSignedIn: 'You are not signed in.',
  },
  es: {
    title: 'Panel de Dueño MenuFlow',
    greetingMorning: 'Buenos Días',
    greetingAfternoon: 'Buenas Tardes',
    greetingEvening: 'Buenas Noches',
    subtitle: 'Administra tu perfil comercial, menú y tienda desde un solo lugar.',
    openBuilder: 'Abrir Constructor de Menú',
    viewStore: 'Ver Tienda',
    loading: 'Cargando tu panel...',
    businessStatus: 'Estado del Negocio',
    active: 'Activo',
    activeText: 'El perfil de tu tienda está activo en el sistema.',
    stripePayments: 'Pagos con Stripe',
    stripeNotConnected: 'Stripe no conectado',
    stripeText: 'Termina tu configuración de Stripe para aceptar pagos reales de clientes.',
    selectedPlan: 'Plan Seleccionado',
    noPlan: 'No se encontró plan',
    planText: 'Tu plan actual del restaurante está conectado a esta cuenta.',
    storefrontSlug: 'Slug de la Tienda',
    noSlug: 'No se encontró slug',
    slugText: 'Este es el enlace activo de la tienda conectado a tu cuenta.',
    fallbackBusiness: 'Tu Negocio',
    fallbackEmail: 'No se encontró correo',
    signOut: 'Cerrar sesión',
    menuBuilderSoon: 'La ruta del constructor de menú aún no está conectada.',
    noStoreYet: 'Todavía no se encontró un slug de tienda para esta cuenta.',
    notSignedIn: 'No has iniciado sesión.',
  },
} as const;

function normalizePlanLabel(plan?: string | null) {
  if (!plan) return null;
  const lower = plan.toLowerCase();
  if (lower === 'starter') return 'Starter';
  if (lower === 'growth') return 'Growth';
  if (lower === 'premium') return 'Premium';
  return plan;
}

function getGreeting(lang: Lang) {
  const hour = new Date().getHours();
  const t = copy[lang];

  if (hour < 12) return t.greetingMorning;
  if (hour < 18) return t.greetingAfternoon;
  return t.greetingEvening;
}

export default function DashboardPage() {
  const router = useRouter();

  const [lang, setLang] = useState<Lang>('en');
  const t = copy[lang];

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [plan, setPlan] = useState('');
  const [slug, setSlug] = useState('');
  const [stripeConnected, setStripeConnected] = useState(false);

  const greeting = useMemo(() => getGreeting(lang), [lang]);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const sessionUser = session?.user;

        if (!sessionUser) {
          alert(t.notSignedIn);
          router.push('/auth/login');
          return;
        }

        const email = sessionUser.email ?? '';
        if (!mounted) return;

        setUserEmail(email);

        const { data: restaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id, name, slug, plan, owner_email, stripe_account_id')
          .eq('owner_id', sessionUser.id)
          .maybeSingle();

        if (restaurantError) throw restaurantError;

        const row = restaurant as
          | (RestaurantRecord & { stripe_account_id?: string | null })
          | null;

        const metaBusiness =
          typeof sessionUser.user_metadata?.business_name === 'string'
            ? sessionUser.user_metadata.business_name
            : '';

        const metaPlan =
          typeof sessionUser.user_metadata?.plan === 'string'
            ? sessionUser.user_metadata.plan
            : '';

        if (!mounted) return;

        setBusinessName(row?.name || metaBusiness || t.fallbackBusiness);
        setPlan(normalizePlanLabel(row?.plan || metaPlan) || t.noPlan);
        setSlug(row?.slug || '');
        setStripeConnected(Boolean(row?.stripe_account_id));
      } catch (error: any) {
        alert(error?.message || 'Dashboard failed to load.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [router, t.fallbackBusiness, t.noPlan, t.notSignedIn]);

  const handleViewStore = () => {
    if (!slug) {
      alert(t.noStoreYet);
      return;
    }

    window.open(`/store/${slug}`, '_blank');
  };

  const handleOpenBuilder = () => {
    router.push('/dashboard/menu-builder');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <main className="loadingPage">
        <div className="loadingBox">{t.loading}</div>

        <style jsx>{`
          .loadingPage {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5f7fb;
            padding: 24px;
          }

          .loadingBox {
            font-family:
              Inter,
              ui-sans-serif,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              'Segoe UI',
              sans-serif;
            color: #142132;
            font-size: 18px;
            font-weight: 800;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <aside className="sidebar">
        <div className="logoBox">MF</div>

        <div className="navButton active">⌂</div>
        <div className="navButton">≡</div>
        <div className="navButton">◫</div>
        <button type="button" className="navButton" onClick={handleSignOut} aria-label={t.signOut}>
          ↻
        </button>
      </aside>

      <section className="mainPanel">
        <div className="topRow">
          <div className="topLeft">
            <div className="eyebrow">{t.title}</div>
            <h1 className="headline">
              {greeting} <span className="wave">👋</span>
            </h1>
            <p className="subtext">{t.subtitle}</p>
            <div className="email">{userEmail || t.fallbackEmail}</div>
            <div className="business">{businessName}</div>
          </div>

          <div className="langWrap">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={lang === 'en' ? 'langButton activeLang' : 'langButton'}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('es')}
              className={lang === 'es' ? 'langButton activeLang' : 'langButton'}
            >
              ES
            </button>
          </div>
        </div>

        <div className="heroCard">
          <button type="button" onClick={handleOpenBuilder} className="heroButton">
            {t.openBuilder}
          </button>

          <button type="button" onClick={handleViewStore} className="heroButton secondary">
            {t.viewStore}
          </button>
        </div>

        <div className="cardGrid">
          <div className="statCard">
            <div className="statLabel">{t.businessStatus}</div>
            <div className="statValue">{t.active}</div>
            <div className="statText">{t.activeText}</div>
          </div>

          <div className="statCard">
            <div className="statLabel">{t.stripePayments}</div>
            <div className="statValue">
              {stripeConnected ? 'Stripe connected' : t.stripeNotConnected}
            </div>
            <div className="statText">{t.stripeText}</div>
          </div>

          <div className="statCard">
            <div className="statLabel">{t.selectedPlan}</div>
            <div className="statValue">{plan || t.noPlan}</div>
            <div className="statText">{t.planText}</div>
          </div>

          <div className="statCard">
            <div className="statLabel">{t.storefrontSlug}</div>
            <div className="statValue slugValue">{slug || t.noSlug}</div>
            <div className="statText">
              {slug ? (
                <Link href={`/store/${slug}`} className="storeLink">
                  /store/{slug}
                </Link>
              ) : (
                t.slugText
              )}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f5f7fb;
          display: grid;
          grid-template-columns: 108px minmax(0, 1fr);
          gap: 22px;
          padding: 18px;
          overflow-x: hidden;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            'Segoe UI',
            sans-serif;
        }

        .sidebar {
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid rgba(20, 33, 50, 0.08);
          border-radius: 34px;
          padding: 18px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
        }

        .logoBox {
          width: 72px;
          height: 72px;
          border-radius: 24px;
          background: linear-gradient(180deg, #6ea0ff 0%, #4d7de8 100%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .navButton {
          width: 72px;
          height: 72px;
          border-radius: 24px;
          border: 1px solid rgba(20, 33, 50, 0.1);
          background: #fff;
          color: #5a6473;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          cursor: pointer;
          box-shadow: none;
        }

        .navButton.active {
          background: #eef4ff;
          color: #4d7de8;
          border-color: rgba(77, 125, 232, 0.22);
        }

        .mainPanel {
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(20, 33, 50, 0.06);
          border-radius: 40px;
          padding: 28px;
          box-shadow: 0 20px 48px rgba(15, 23, 42, 0.06);
        }

        .topRow {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
        }

        .eyebrow {
          color: #4d7de8;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .headline {
          margin: 18px 0 0;
          color: #142132;
          font-size: clamp(46px, 7vw, 82px);
          line-height: 0.98;
          font-weight: 900;
          letter-spacing: -0.055em;
        }

        .wave {
          font-size: 0.76em;
        }

        .subtext {
          margin-top: 18px;
          max-width: 760px;
          color: #5a6473;
          font-size: clamp(22px, 2.2vw, 32px);
          line-height: 1.45;
          font-weight: 600;
        }

        .email {
          margin-top: 26px;
          color: #142132;
          font-size: clamp(20px, 2vw, 30px);
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .business {
          margin-top: 8px;
          color: #5a6473;
          font-size: 20px;
          font-weight: 700;
        }

        .langWrap {
          display: inline-flex;
          border: 1px solid rgba(20, 33, 50, 0.1);
          background: rgba(255, 255, 255, 0.96);
          padding: 5px;
          border-radius: 16px;
        }

        .langButton {
          border: none;
          background: transparent;
          color: #5c6b7d;
          padding: 10px 14px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
        }

        .activeLang {
          background: #142132;
          color: #fff;
        }

        .heroCard {
          margin-top: 28px;
          background: linear-gradient(180deg, #ffffff 0%, #f6f8ff 100%);
          border: 1px solid rgba(20, 33, 50, 0.08);
          border-radius: 34px;
          padding: 30px;
          box-shadow: 0 18px 42px rgba(15, 23, 42, 0.06);
          display: grid;
          gap: 20px;
        }

        .heroButton {
          width: 100%;
          min-height: 110px;
          border-radius: 30px;
          border: none;
          background: #5b88ea;
          color: #fff;
          font-size: clamp(24px, 2.4vw, 38px);
          font-weight: 900;
          letter-spacing: -0.03em;
          cursor: pointer;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .heroButton.secondary {
          background: #5b88ea;
        }

        .cardGrid {
          margin-top: 28px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
        }

        .statCard {
          background: #fff;
          border: 1px solid rgba(20, 33, 50, 0.08);
          border-radius: 34px;
          padding: 28px;
          min-height: 320px;
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.05);
        }

        .statLabel {
          color: #5a6473;
          font-size: clamp(20px, 1.6vw, 30px);
          line-height: 1.35;
          font-weight: 800;
        }

        .statValue {
          margin-top: 24px;
          color: #142132;
          font-size: clamp(46px, 4.8vw, 84px);
          line-height: 0.96;
          font-weight: 900;
          letter-spacing: -0.05em;
          word-break: break-word;
        }

        .slugValue {
          font-size: clamp(28px, 3.2vw, 54px);
        }

        .statText {
          margin-top: 24px;
          color: #5a6473;
          font-size: clamp(18px, 1.7vw, 28px);
          line-height: 1.45;
          font-weight: 600;
        }

        .storeLink {
          color: #4d7de8;
          text-decoration: none;
          font-weight: 800;
          word-break: break-word;
        }

        @media (max-width: 980px) {
          .page {
            grid-template-columns: 1fr;
            padding: 12px;
          }

          .sidebar {
            flex-direction: row;
            justify-content: center;
            width: 100%;
            border-radius: 26px;
            padding: 12px;
            overflow-x: auto;
          }

          .logoBox,
          .navButton {
            width: 64px;
            height: 64px;
            min-width: 64px;
            border-radius: 20px;
          }

          .navButton {
            font-size: 28px;
          }

          .mainPanel {
            padding: 20px;
            border-radius: 28px;
          }

          .headline {
            font-size: clamp(34px, 12vw, 58px);
          }

          .subtext {
            font-size: 18px;
          }

          .email {
            font-size: 18px;
          }

          .business {
            font-size: 16px;
          }

          .heroCard {
            padding: 18px;
            border-radius: 24px;
          }

          .heroButton {
            min-height: 84px;
            border-radius: 22px;
            font-size: 18px;
          }

          .cardGrid {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .statCard {
            min-height: auto;
            padding: 22px;
            border-radius: 26px;
          }

          .statValue {
            font-size: clamp(36px, 12vw, 58px);
          }

          .slugValue {
            font-size: clamp(24px, 8vw, 38px);
          }

          .statText,
          .statLabel {
            font-size: 16px;
          }
        }
      `}</style>
    </main>
  );
}