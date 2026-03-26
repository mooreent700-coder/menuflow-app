"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type Lang = "en" | "es";

const COPY = {
  en: {
    title: "Complete Your Setup",
    subtitle: "Connect your Stripe account to unlock your MenuFlow storefront.",
    selected: "Selected plan",
    monthly: "/month",
    button: "Continue to Stripe Setup",
    loading: "Opening Stripe…",
    secure: "Secure Stripe onboarding for your MenuFlow account",
    includes: "What’s included",
    errorNoEmail: "We could not find your account email. Please sign up again.",
    planNames: {
      growth: "Growth Plan",
      premium: "Premium Plan",
    },
    features: [
      "Full MenuFlow storefront",
      "Direct ordering system",
      "Owner dashboard access",
      "Customer order management",
      "Premium onboarding flow",
      "Mobile-first restaurant experience",
    ],
  },
  es: {
    title: "Completa Tu Configuración",
    subtitle: "Conecta tu cuenta de Stripe para activar tu tienda de MenuFlow.",
    selected: "Plan seleccionado",
    monthly: "/mes",
    button: "Continuar con Stripe",
    loading: "Abriendo Stripe…",
    secure: "Onboarding seguro de Stripe para tu cuenta de MenuFlow",
    includes: "Qué incluye",
    errorNoEmail: "No pudimos encontrar tu correo. Regístrate otra vez.",
    planNames: {
      growth: "Plan Growth",
      premium: "Plan Premium",
    },
    features: [
      "Tienda completa de MenuFlow",
      "Sistema de pedidos directos",
      "Acceso al panel del dueño",
      "Gestión de pedidos de clientes",
      "Flujo premium de activación",
      "Experiencia mobile-first para restaurantes",
    ],
  },
} as const;

const PLAN_PRICES: Record<string, string> = {
  growth: "$49",
  premium: "$99",
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const rawPlan = searchParams.get("plan") || "growth";
  const plan = rawPlan === "premium" ? "premium" : "growth";

  const [lang, setLang] = useState<Lang>("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const t = COPY[lang];

  const planName = useMemo(() => {
    return t.planNames[plan];
  }, [plan, t]);

  async function handleStripeSetup() {
    try {
      setLoading(true);
      setError("");

      const storedEmail =
        typeof window !== "undefined"
          ? window.localStorage.getItem("menuflow_signup_email") || "menuflow@yahoo.com"
          : "menuflow@yahoo.com";

      if (!storedEmail) {
        setError(t.errorNoEmail);
        setLoading(false);
        return;
      }

      const createAccountRes = await fetch("/api/connect/create-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: storedEmail,
          businessName: "MenuFlow Restaurant",
          country: "US",
        }),
      });

      const createAccountData = await createAccountRes.json();

      if (!createAccountRes.ok) {
        throw new Error(createAccountData?.error || "Could not create Stripe account");
      }

      const accountId = createAccountData?.accountId;

      if (!accountId) {
        throw new Error("Stripe account ID was not returned");
      }

      const onboardingRes = await fetch("/api/connect/create-onboarding-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId,
          plan,
        }),
      });

      const onboardingData = await onboardingRes.json();

      if (!onboardingRes.ok) {
        throw new Error(onboardingData?.error || "Could not create onboarding link");
      }

      if (!onboardingData?.url) {
        throw new Error("Stripe onboarding URL was not returned");
      }

      window.location.href = onboardingData.url;
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main style={page}>
      <div style={topBar}>
        <div style={brandWrap}>
          <div style={brandMark}>M</div>
          <div style={brandText}>MenuFlow</div>
        </div>

        <div style={langWrap}>
          <button
            type="button"
            onClick={() => setLang("en")}
            style={lang === "en" ? langButtonActive : langButton}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang("es")}
            style={lang === "es" ? langButtonActive : langButton}
          >
            ES
          </button>
        </div>
      </div>

      <div style={shell}>
        <section style={heroCard}>
          <div style={heroPill}>{planName}</div>

          <h1 style={title}>{t.title}</h1>
          <p style={subtitle}>{t.subtitle}</p>

          <div style={planCard}>
            <div style={planLabel}>{t.selected}</div>
            <div style={planNameText}>{planName}</div>
            <div style={priceRow}>
              <span style={price}>{PLAN_PRICES[plan]}</span>
              <span style={priceSub}>{t.monthly}</span>
            </div>
          </div>

          <div style={featuresCard}>
            <div style={featuresTitle}>{t.includes}</div>

            <div style={featuresList}>
              {t.features.map((feature) => (
                <div key={feature} style={featureItem}>
                  <span style={featureCheck}>✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            style={loading ? primaryButtonDisabled : primaryButton}
            onClick={handleStripeSetup}
            disabled={loading}
          >
            {loading ? t.loading : t.button}
          </button>

          {error ? <div style={errorText}>{error}</div> : null}

          <div style={secureText}>🔒 {t.secure}</div>
        </section>
      </div>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%)",
  padding: "20px",
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const topBar: React.CSSProperties = {
  maxWidth: "1180px",
  margin: "0 auto 24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  flexWrap: "wrap",
};

const brandWrap: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const brandMark: React.CSSProperties = {
  width: "42px",
  height: "42px",
  borderRadius: "14px",
  background: "#2563eb",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: "20px",
  boxShadow: "0 14px 30px rgba(37,99,235,0.28)",
};

const brandText: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 800,
  color: "#0f172a",
};

const langWrap: React.CSSProperties = {
  display: "flex",
  gap: "8px",
};

const langButton: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#dbeafe",
  color: "#1d4ed8",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: "12px",
};

const langButtonActive: React.CSSProperties = {
  ...langButton,
  background: "#2563eb",
  color: "#ffffff",
  boxShadow: "0 10px 24px rgba(37,99,235,0.22)",
};

const shell: React.CSSProperties = {
  maxWidth: "1180px",
  margin: "0 auto",
  minHeight: "calc(100vh - 110px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const heroCard: React.CSSProperties = {
  width: "100%",
  maxWidth: "560px",
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(37,99,235,0.10)",
  borderRadius: "30px",
  padding: "34px 28px",
  boxShadow: "0 28px 70px rgba(15,23,42,0.10)",
  textAlign: "center",
};

const heroPill: React.CSSProperties = {
  display: "inline-flex",
  padding: "8px 14px",
  borderRadius: "999px",
  background: "#eff6ff",
  color: "#2563eb",
  fontWeight: 800,
  fontSize: "13px",
  border: "1px solid rgba(37,99,235,0.14)",
};

const title: React.CSSProperties = {
  margin: "18px 0 0",
  fontSize: "36px",
  lineHeight: 1.05,
  fontWeight: 900,
  letterSpacing: "-0.04em",
  background: "linear-gradient(90deg, #2563eb, #60a5fa)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const subtitle: React.CSSProperties = {
  margin: "14px auto 0",
  maxWidth: "480px",
  color: "#475569",
  fontSize: "16px",
  lineHeight: 1.8,
};

const planCard: React.CSSProperties = {
  marginTop: "22px",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
  borderRadius: "22px",
  padding: "22px",
  border: "1px solid rgba(15,23,42,0.06)",
  boxShadow: "0 14px 34px rgba(15,23,42,0.05)",
};

const planLabel: React.CSSProperties = {
  color: "#64748b",
  fontSize: "13px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const planNameText: React.CSSProperties = {
  marginTop: "8px",
  fontSize: "28px",
  fontWeight: 800,
  color: "#0f172a",
};

const priceRow: React.CSSProperties = {
  marginTop: "10px",
  display: "flex",
  alignItems: "baseline",
  justifyContent: "center",
  gap: "8px",
};

const price: React.CSSProperties = {
  fontSize: "44px",
  fontWeight: 900,
  color: "#2563eb",
  lineHeight: 1,
};

const priceSub: React.CSSProperties = {
  color: "#64748b",
  fontWeight: 700,
};

const featuresCard: React.CSSProperties = {
  marginTop: "18px",
  textAlign: "left",
  background: "#ffffff",
  borderRadius: "22px",
  padding: "22px",
  border: "1px solid rgba(15,23,42,0.06)",
  boxShadow: "0 14px 34px rgba(15,23,42,0.05)",
};

const featuresTitle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 800,
  color: "#0f172a",
};

const featuresList: React.CSSProperties = {
  marginTop: "14px",
  display: "grid",
  gap: "12px",
};

const featureItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  color: "#334155",
  fontSize: "14px",
  fontWeight: 600,
};

const featureCheck: React.CSSProperties = {
  width: "22px",
  height: "22px",
  borderRadius: "999px",
  background: "#dbeafe",
  color: "#1d4ed8",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "13px",
  fontWeight: 900,
  flexShrink: 0,
};

const primaryButton: React.CSSProperties = {
  marginTop: "22px",
  width: "100%",
  padding: "16px 20px",
  borderRadius: "18px",
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  fontWeight: 800,
  fontSize: "16px",
  cursor: "pointer",
  boxShadow: "0 18px 34px rgba(37,99,235,0.24)",
};

const primaryButtonDisabled: React.CSSProperties = {
  ...primaryButton,
  opacity: 0.7,
  cursor: "not-allowed",
};

const errorText: React.CSSProperties = {
  marginTop: "14px",
  color: "#b91c1c",
  fontSize: "14px",
  fontWeight: 700,
};

const secureText: React.CSSProperties = {
  marginTop: "14px",
  color: "#64748b",
  fontSize: "12px",
  fontWeight: 700,
};