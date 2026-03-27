'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Lang = 'en' | 'es';
type PlanKey = 'starter' | 'growth' | 'premium';

const planMeta: Record<
  PlanKey,
  {
    en: {
      name: string;
      price: string;
      detail: string;
      badge: string;
    };
    es: {
      name: string;
      price: string;
      detail: string;
      badge: string;
    };
  }
> = {
  starter: {
    en: {
      name: 'Starter',
      price: 'First month free',
      detail: 'Then $19/month + 10% platform fee',
      badge: 'Best for getting started',
    },
    es: {
      name: 'Starter',
      price: 'Primer mes gratis',
      detail: 'Después $19/mes + 10% de tarifa de plataforma',
      badge: 'Ideal para empezar',
    },
  },
  growth: {
    en: {
      name: 'Growth',
      price: '$49/month',
      detail: '5% platform fee',
      badge: 'Most Popular',
    },
    es: {
      name: 'Growth',
      price: '$49/mes',
      detail: '5% de tarifa de plataforma',
      badge: 'Más Popular',
    },
  },
  premium: {
    en: {
      name: 'Premium',
      price: '$99/month',
      detail: '3% platform fee',
      badge: 'Built to scale',
    },
    es: {
      name: 'Premium',
      price: '$99/mes',
      detail: '3% de tarifa de plataforma',
      badge: 'Hecho para crecer',
    },
  },
};

const copy = {
  en: {
    brand: 'MenuFlow',
    topPill: 'Create your account',
    heroTitle: 'Set up your MenuFlow account and keep moving.',
    heroText:
      'Finish your account setup for your restaurant, food truck, pop-up, or catering business in one clean flow.',
    paidTitle: 'Payment confirmed',
    paidText:
      'Your paid plan is already selected. Finish creating your account so you can continue into your MenuFlow setup.',
    freeTitle: 'Starter plan selected',
    freeText:
      'Create your account to continue with your free first month and start setting up your ordering system.',
    selectedPlan: 'Selected plan',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Your full name',
    businessName: 'Business Name',
    businessNamePlaceholder: 'Restaurant, food truck, pop-up, or catering name',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    passwordPlaceholder: 'Create a password',
    create: 'Create Account',
    creating: 'Creating account...',
    already: 'Already have an account?',
    signIn: 'Sign in',
    secure: 'Secure setup',
    secureText:
      'Your information is saved to your MenuFlow account so you can continue into agreement and onboarding.',
    whatHappens: 'What happens next',
    next1: 'Your account is created',
    next2: 'You continue to agreement',
    next3: 'You move into your MenuFlow dashboard',
    signupFailed: 'Signup failed',
    authExists:
      'This email already has an account. Try signing in instead, or use a different email.',
  },
  es: {
    brand: 'MenuFlow',
    topPill: 'Crea tu cuenta',
    heroTitle: 'Configura tu cuenta de MenuFlow y sigue adelante.',
    heroText:
      'Termina la configuración de tu cuenta para tu restaurante, food truck, pop-up o negocio de catering en un solo flujo limpio.',
    paidTitle: 'Pago confirmado',
    paidText:
      'Tu plan pagado ya está seleccionado. Termina de crear tu cuenta para continuar con la configuración de MenuFlow.',
    freeTitle: 'Plan Starter seleccionado',
    freeText:
      'Crea tu cuenta para continuar con tu primer mes gratis y empezar a configurar tu sistema de pedidos.',
    selectedPlan: 'Plan seleccionado',
    fullName: 'Nombre Completo',
    fullNamePlaceholder: 'Tu nombre completo',
    businessName: 'Nombre del Negocio',
    businessNamePlaceholder: 'Nombre del restaurante, food truck, pop-up o catering',
    email: 'Correo Electrónico',
    emailPlaceholder: 'tu@ejemplo.com',
    password: 'Contraseña',
    passwordPlaceholder: 'Crea una contraseña',
    create: 'Crear Cuenta',
    creating: 'Creando cuenta...',
    already: '¿Ya tienes cuenta?',
    signIn: 'Iniciar sesión',
    secure: 'Configuración segura',
    secureText:
      'Tu información se guarda en tu cuenta de MenuFlow para que puedas continuar al acuerdo y a la configuración.',
    whatHappens: 'Lo que sigue',
    next1: 'Se crea tu cuenta',
    next2: 'Continúas al acuerdo',
    next3: 'Entras a tu panel de MenuFlow',
    signupFailed: 'Error al crear cuenta',
    authExists:
      'Este correo ya tiene una cuenta. Intenta iniciar sesión o usa otro correo.',
  },
} as const;

function normalizePlan(value: string | null): PlanKey {
  if (value === 'growth' || value === 'premium') return value;
  return 'starter';
}

export default function SignupPage() {
  const router = useRouter();

  const [lang, setLang] = useState<Lang>('en');
  const t = copy[lang];

  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('starter');
  const [paid, setPaid] = useState(false);

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSelectedPlan(normalizePlan(params.get('plan')));
    setPaid(params.get('paid') === 'true');
  }, []);

  const planCopy = planMeta[selectedPlan][lang];

  const helperTitle = useMemo(() => {
    if (selectedPlan === 'starter') return t.freeTitle;
    return paid ? t.paidTitle : t.heroTitle;
  }, [paid, selectedPlan, t]);

  const helperText = useMemo(() => {
    if (selectedPlan === 'starter') return t.freeText;
    if (paid) return t.paidText;
    return t.heroText;
  }, [paid, selectedPlan, t]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            business_name: businessName,
            plan: selectedPlan,
            paid_plan_confirmed: paid,
          },
        },
      });

      if (signUpError) {
        const lower = signUpError.message.toLowerCase();

        if (
          lower.includes('already registered') ||
          lower.includes('already been registered') ||
          lower.includes('already exists') ||
          lower.includes('user already registered')
        ) {
          alert(t.authExists);
        } else {
          alert(signUpError.message);
        }
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        alert(signInError.message);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error: upsertError } = await supabase.from('restaurants').upsert(
          {
            owner_id: user.id,
            owner_email: email,
            name: businessName,
            plan: selectedPlan,
          },
          {
            onConflict: 'owner_email',
          }
        );

        if (upsertError) {
          alert(upsertError.message);
          return;
        }
      }

      router.push('/auth/agreement');
    } catch (error: any) {
      alert(error?.message || t.signupFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="shell">
        <div className="panel leftPanel">
          <div className="leftTop">
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

            <div className="brandPill">{t.topPill}</div>

            <h1 className="heroTitle">{helperTitle}</h1>
            <p className="heroText">{helperText}</p>
          </div>

          <div className="planCard">
            <div className="planCardTop">
              <div className="planBadge">{planCopy.badge}</div>
              <div className="planLabel">{t.selectedPlan}</div>
            </div>

            <div className="planName">{planCopy.name}</div>
            <div className="planPrice">{planCopy.price}</div>
            <div className="planDetail">{planCopy.detail}</div>
          </div>

          <div className="infoGrid">
            <div className="infoCard">
              <div className="infoTitle">{t.secure}</div>
              <div className="infoText">{t.secureText}</div>
            </div>

            <div className="infoCard">
              <div className="infoTitle">{t.whatHappens}</div>
              <ul className="nextList">
                <li>{t.next1}</li>
                <li>{t.next2}</li>
                <li>{t.next3}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="panel rightPanel">
          <div className="mobileBrand">{t.brand}</div>

          <div className="formCard">
            <div className="formTop">
              <div className="formBrand">{t.brand}</div>
              <div className="formPlanTag">{planCopy.name}</div>
            </div>

            <form onSubmit={handleSubmit} className="form">
              <div className="field">
                <label className="label">{t.fullName}</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.fullNamePlaceholder}
                  className="input"
                  required
                />
              </div>

              <div className="field">
                <label className="label">{t.businessName}</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={t.businessNamePlaceholder}
                  className="input"
                  required
                />
              </div>

              <div className="field">
                <label className="label">{t.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="input"
                  required
                />
              </div>

              <div className="field">
                <label className="label">{t.password}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="input"
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" disabled={loading} className="submitBtn">
                {loading ? t.creating : t.create}
              </button>
            </form>

            <div className="signinText">
              {t.already}{' '}
              <Link href="/auth/login" className="signinLink">
                {t.signIn}
              </Link>
            </div>
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

        .panel {
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

        .leftTop {
          max-width: 700px;
        }

        .langWrap {
          display: inline-flex;
          border: 1px solid rgba(20, 33, 50, 0.1);
          background: rgba(255, 255, 255, 0.88);
          padding: 4px;
          border-radius: 14px;
        }

        .langButton {
          border: none;
          background: transparent;
          color: #5c6b7d;
          padding: 8px 12px;
          border-radius: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .langButton.active {
          background: #142132;
          color: #fff;
        }

        .brandPill {
          display: inline-flex;
          margin-top: 18px;
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

        .infoGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-top: 18px;
        }

        .infoCard {
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

        .infoText {
          margin-top: 10px;
          font-size: 15px;
          line-height: 1.75;
          color: #526171;
        }

        .nextList {
          margin: 12px 0 0;
          padding-left: 20px;
          color: #526171;
        }

        .nextList li {
          margin-top: 8px;
          line-height: 1.65;
        }

        .mobileBrand {
          display: none;
        }

        .formCard {
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(20, 33, 50, 0.08);
          border-radius: 28px;
          box-shadow: 0 22px 48px rgba(15, 23, 42, 0.08);
          padding: 22px;
        }

        .formTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .formBrand {
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: #142132;
        }

        .formPlanTag {
          display: inline-flex;
          padding: 8px 12px;
          border-radius: 999px;
          background: #eef1ee;
          border: 1px solid rgba(20, 33, 50, 0.08);
          color: #142132;
          font-size: 13px;
          font-weight: 800;
        }

        .form {
          display: grid;
          gap: 16px;
        }

        .field {
          display: grid;
          gap: 8px;
        }

        .label {
          font-size: 14px;
          font-weight: 700;
          color: #142132;
        }

        .input {
          width: 100%;
          min-height: 54px;
          border-radius: 16px;
          border: 1px solid rgba(20, 33, 50, 0.12);
          background: #fff;
          padding: 0 16px;
          font-size: 16px;
          color: #142132;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
          box-sizing: border-box;
        }

        .input:focus {
          border-color: #142132;
          box-shadow: 0 0 0 4px rgba(20, 33, 50, 0.08);
        }

        .submitBtn {
          margin-top: 4px;
          min-height: 56px;
          border: none;
          border-radius: 16px;
          background: #142132;
          color: #fff;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 14px 28px rgba(15, 23, 42, 0.14);
        }

        .submitBtn:disabled {
          opacity: 0.66;
          cursor: not-allowed;
        }

        .signinText {
          margin-top: 18px;
          text-align: center;
          font-size: 15px;
          color: #526171;
        }

        .signinLink {
          color: #142132;
          font-weight: 800;
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

          .formCard {
            padding: 18px;
            border-radius: 24px;
          }

          .formBrand {
            display: none;
          }

          .formPlanTag {
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

          .formCard {
            width: 100%;
            max-width: 520px;
          }

          .infoGrid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </main>
  );
}
