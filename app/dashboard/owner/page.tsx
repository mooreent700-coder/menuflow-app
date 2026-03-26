"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Lang = "en" | "es";

type Restaurant = {
  id: string;
  name: string | null;
  owner_email?: string | null;
  slug: string | null;
  phone: string | null;
  address: string | null;
  hours?: string | null;
  hero_image?: string | null;
  logo_image?: string | null;
  plan?: string | null;
  stripe_account_id?: string | null;
  stripe_onboarding_complete?: boolean | null;
  stripe_charges_enabled?: boolean | null;
  stripe_payouts_enabled?: boolean | null;
};

type StripeStatus = {
  connected: boolean;
  accountId?: string;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  feePercent: number;
};

type MenuItem = {
  id: string;
  restaurant_id: string;
  name: string | null;
  price: number | null;
  description: string | null;
  image_url: string | null;
  created_at?: string | null;
};

type OrderItem = {
  id?: string;
  name?: string;
  qty?: number;
  price?: number;
};

type OrderRow = {
  id: string;
  restaurant_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  special_instructions?: string | null;
  items: OrderItem[] | null;
  total: number | null;
  created_at?: string | null;
};

const COLORS = {
  page: "#f6f8fc",
  text: "#1f2937",
  sub: "#6b7280",
  blue: "#3b82f6",
  blueDark: "#2563eb",
  card: "#ffffff",
  border: "#e5e7eb",
  soft: "#f3f4f6",
  success: "#16a34a",
  danger: "#ef4444",
  shadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
};

const COPY = {
  en: {
    loading: "Loading owner dashboard...",
    pleaseSignIn: "Please sign in first.",
    noRestaurant:
      "No restaurant found yet. Enter your business information and save to create your store.",
    businessNameRequired: "Business name is required.",
    storeSlugRequired: "Store slug is required.",
    businessCreated: "Business created successfully.",
    businessUpdated: "Business information updated successfully.",
    saveBusinessFailed: "Could not save business information.",
    orderRemoved: "Order removed successfully.",
    removeOrderFailed: "Could not remove order.",
    ownerPanel: "MenuFlow Owner Panel",
    greetingMorning: "Good Morning",
    greetingAfternoon: "Good Afternoon",
    greetingEvening: "Good Evening",
    owner: "Owner",
    heroText:
      "Manage your business profile, menu, orders, and live storefront from one place.",
    openMenuBuilder: "Open Menu Builder",
    viewStore: "View Store",
    businessStatus: "Business Status",
    active: "Active",
    businessStatusSub: "Your store profile is live in the system",
    menuItems: "Menu Items",
    menuItemsSub: "Everything from builder shows here",
    todaysOrders: "Today's Orders",
    todaysOrdersSub: "Orders created today",
    todaysSales: "Today's Sales",
    todaysSalesSub: "Based on order totals",
    businessInformation: "Business Information",
    businessName: "Business Name",
    storeSlug: "Store Slug",
    phoneNumber: "Phone Number",
    address: "Address",
    hours: "Hours",
    hoursPlaceholder: "Mon-Sat 10am - 8pm",
    saving: "Saving...",
    createBusiness: "Create Business",
    saveBusinessInformation: "Save Business Information",
    allMenuItems: "All Menu Items",
    total: "total",
    noMenuItems: "No menu items saved yet.",
    noPhoto: "No Photo",
    menuItem: "Menu Item",
    storePreview: "Store Preview",
    menuFlowStore: "MenuFlow Store",
    store: "Store",
    restaurant: "Restaurant",
    freshFood: "Fresh food made to order.",
    heroFallback: "Hero image will show here after upload.",
    liveOrders: "Live Orders",
    loaded: "loaded",
    noOrders: "No orders yet.",
    customer: "Customer",
    timeUnavailable: "Time unavailable",
    instructions: "Instructions",
    noOrderItems: "No order items listed.",
    item: "Item",
    textCustomer: "Text Customer",
    callCustomer: "Call Customer",
    removing: "Removing...",
    removeOrder: "Remove Order",
    stripePayments: "Stripe Payments",
    stripePaymentsSub: "Connect your Stripe account to receive payouts and let MenuFlow take the correct platform fee automatically.",
    stripeNotConnected: "Stripe not connected",
    stripeConnected: "Stripe connected",
    onboardingComplete: "Onboarding complete",
    onboardingIncomplete: "Onboarding incomplete",
    chargesEnabled: "Charges enabled",
    payoutsEnabled: "Payouts enabled",
    platformFee: "Platform fee",
    connectStripe: "Connect Stripe",
    resumeOnboarding: "Resume Stripe Onboarding",
    refreshStripe: "Refresh Stripe Status",
    stripeLoading: "Loading Stripe status...",
    stripeReady: "Ready to take direct payouts",
    stripeNeedsAttention: "Finish Stripe setup to accept live payments",
    stripeCreateFailed: "Could not create Stripe account.",
    stripeLinkFailed: "Could not open Stripe onboarding.",
  },
  es: {
    loading: "Cargando panel del dueño...",
    pleaseSignIn: "Inicia sesión primero.",
    noRestaurant:
      "Todavía no se encontró ningún restaurante. Ingresa la información de tu negocio y guarda para crear tu tienda.",
    businessNameRequired: "El nombre del negocio es obligatorio.",
    storeSlugRequired: "El slug de la tienda es obligatorio.",
    businessCreated: "Negocio creado correctamente.",
    businessUpdated: "Información del negocio actualizada correctamente.",
    saveBusinessFailed: "No se pudo guardar la información del negocio.",
    orderRemoved: "Pedido eliminado correctamente.",
    removeOrderFailed: "No se pudo eliminar el pedido.",
    ownerPanel: "Panel del Dueño de MenuFlow",
    greetingMorning: "Buenos días",
    greetingAfternoon: "Buenas tardes",
    greetingEvening: "Buenas noches",
    owner: "Dueño",
    heroText:
      "Administra el perfil de tu negocio, menú, pedidos y tienda en vivo desde un solo lugar.",
    openMenuBuilder: "Abrir Constructor de Menú",
    viewStore: "Ver Tienda",
    businessStatus: "Estado del Negocio",
    active: "Activo",
    businessStatusSub: "El perfil de tu tienda está activo en el sistema",
    menuItems: "Artículos del Menú",
    menuItemsSub: "Todo lo del constructor aparece aquí",
    todaysOrders: "Pedidos de Hoy",
    todaysOrdersSub: "Pedidos creados hoy",
    todaysSales: "Ventas de Hoy",
    todaysSalesSub: "Basado en los totales de pedidos",
    businessInformation: "Información del Negocio",
    businessName: "Nombre del Negocio",
    storeSlug: "Slug de la Tienda",
    phoneNumber: "Número de Teléfono",
    address: "Dirección",
    hours: "Horario",
    hoursPlaceholder: "Lun-Sáb 10am - 8pm",
    saving: "Guardando...",
    createBusiness: "Crear Negocio",
    saveBusinessInformation: "Guardar Información del Negocio",
    allMenuItems: "Todos los Artículos del Menú",
    total: "total",
    noMenuItems: "Todavía no hay artículos guardados.",
    noPhoto: "Sin Foto",
    menuItem: "Artículo del Menú",
    storePreview: "Vista Previa de la Tienda",
    menuFlowStore: "Tienda MenuFlow",
    store: "Tienda",
    restaurant: "Restaurante",
    freshFood: "Comida fresca hecha al momento.",
    heroFallback: "La imagen principal aparecerá aquí después de subirla.",
    liveOrders: "Pedidos en Vivo",
    loaded: "cargados",
    noOrders: "Todavía no hay pedidos.",
    customer: "Cliente",
    timeUnavailable: "Hora no disponible",
    instructions: "Instrucciones",
    noOrderItems: "No hay artículos listados en el pedido.",
    item: "Artículo",
    textCustomer: "Enviar Texto",
    callCustomer: "Llamar al Cliente",
    removing: "Eliminando...",
    removeOrder: "Eliminar Pedido",
    stripePayments: "Pagos con Stripe",
    stripePaymentsSub: "Conecta tu cuenta de Stripe para recibir pagos y permitir que MenuFlow aplique la tarifa correcta automáticamente.",
    stripeNotConnected: "Stripe no conectado",
    stripeConnected: "Stripe conectado",
    onboardingComplete: "Onboarding completa",
    onboardingIncomplete: "Onboarding incompleta",
    chargesEnabled: "Cobros activados",
    payoutsEnabled: "Pagos activados",
    platformFee: "Tarifa de plataforma",
    connectStripe: "Conectar Stripe",
    resumeOnboarding: "Continuar onboarding de Stripe",
    refreshStripe: "Actualizar estado de Stripe",
    stripeLoading: "Cargando estado de Stripe...",
    stripeReady: "Listo para recibir pagos directos",
    stripeNeedsAttention: "Completa Stripe para aceptar pagos en vivo",
    stripeCreateFailed: "No se pudo crear la cuenta de Stripe.",
    stripeLinkFailed: "No se pudo abrir el onboarding de Stripe.",
  },
} as const;

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const t = COPY[lang];

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [removingOrderId, setRemovingOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeActionLoading, setStripeActionLoading] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");

  const loadingRef = useRef(false);
  const pollerRef = useRef<number | null>(null);

  useEffect(() => {
    void loadDashboard(true);

    return () => {
      if (pollerRef.current) window.clearInterval(pollerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!restaurant?.id) return;

    if (pollerRef.current) window.clearInterval(pollerRef.current);

    pollerRef.current = window.setInterval(() => {
      void loadOrdersOnly();
    }, 5000);

    return () => {
      if (pollerRef.current) window.clearInterval(pollerRef.current);
    };
  }, [restaurant?.id]);

  async function loadDashboard(showLoader = false) {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      if (showLoader) setLoading(true);
      setMessage("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        setMessage(authError.message);
        setLoading(false);
        return;
      }

      if (!user?.email) {
        setMessage(t.pleaseSignIn);
        setLoading(false);
        return;
      }

      setUserEmail(user.email);

      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_email", user.email)
        .maybeSingle();

      if (restaurantError) {
        setMessage(restaurantError.message);
        setLoading(false);
        return;
      }

      if (!restaurantData) {
        setRestaurant(null);
        setMenuItems([]);
        setOrders([]);
        setBusinessName("");
        setStoreSlug("");
        setPhone("");
        setAddress("");
        setHours("");
        setStripeStatus(null);
        setLoading(false);
        setMessage(t.noRestaurant);
        return;
      }

      const typedRestaurant = restaurantData as Restaurant;

      setRestaurant(typedRestaurant);
      setBusinessName(typedRestaurant.name || "");
      setStoreSlug(typedRestaurant.slug || "");
      setPhone(typedRestaurant.phone || "");
      setAddress(typedRestaurant.address || "");
      setHours(typedRestaurant.hours || "");

      const { data: menuData, error: menuError } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", typedRestaurant.id)
        .order("created_at", { ascending: false });

      if (menuError) {
        setMessage(menuError.message);
        setLoading(false);
        return;
      }

      setMenuItems((menuData || []) as MenuItem[]);

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", typedRestaurant.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (ordersError) {
        setMessage(ordersError.message);
        setLoading(false);
        return;
      }

      setOrders((ordersData || []) as OrderRow[]);
      await refreshStripeStatus(typedRestaurant.id);
      setLoading(false);
    } finally {
      loadingRef.current = false;
    }
  }

  async function loadOrdersOnly() {
    if (!restaurant?.id) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error) {
      setOrders((data || []) as OrderRow[]);
    }
  }

  async function handleSidebarRefresh() {
    await loadDashboard(false);
  }

  async function handleSaveProfile() {
    const cleanName = businessName.trim();
    const cleanSlug = storeSlug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!userEmail) {
      setMessage(t.pleaseSignIn);
      return;
    }

    if (!cleanName) {
      setMessage(t.businessNameRequired);
      return;
    }

    if (!cleanSlug) {
      setMessage(t.storeSlugRequired);
      return;
    }

    try {
      setSavingProfile(true);
      setMessage("");

      const updatePayload: Record<string, string | null> = {
        owner_email: userEmail,
        name: cleanName,
        slug: cleanSlug,
        phone: phone.trim() || null,
        address: address.trim() || null,
        hours: hours.trim() || null,
      };

      if (!restaurant?.id) {
        const { data, error } = await supabase
          .from("restaurants")
          .insert(updatePayload)
          .select("*")
          .single();

        if (error) {
          throw error;
        }

        const freshRestaurant = (data || null) as Restaurant | null;

        if (freshRestaurant) {
          setRestaurant(freshRestaurant);
          setBusinessName(freshRestaurant.name || "");
          setStoreSlug(freshRestaurant.slug || "");
          setPhone(freshRestaurant.phone || "");
          setAddress(freshRestaurant.address || "");
          setHours(freshRestaurant.hours || "");
          setMenuItems([]);
          setOrders([]);
        }

        setMessage(t.businessCreated);
        return;
      }

      const { data, error } = await supabase
        .from("restaurants")
        .update(updatePayload)
        .eq("id", restaurant.id)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      const freshRestaurant = (data || null) as Restaurant | null;

      if (freshRestaurant) {
        setRestaurant(freshRestaurant);
        setBusinessName(freshRestaurant.name || "");
        setStoreSlug(freshRestaurant.slug || "");
        setPhone(freshRestaurant.phone || "");
        setAddress(freshRestaurant.address || "");
        setHours(freshRestaurant.hours || "");
      } else {
        await loadDashboard(false);
      }

      setMessage(t.businessUpdated);
    } catch (err: any) {
      setMessage(err?.message || t.saveBusinessFailed);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleRemoveOrder(orderId: string) {
    try {
      setRemovingOrderId(orderId);
      setMessage("");

      const { error } = await supabase.from("orders").delete().eq("id", orderId);

      if (error) throw error;

      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      setMessage(t.orderRemoved);
    } catch (err: any) {
      setMessage(err?.message || t.removeOrderFailed);
    } finally {
      setRemovingOrderId("");
    }
  }


  async function refreshStripeStatus(targetRestaurantId?: string) {
    const id = targetRestaurantId || restaurant?.id;
    if (!id) return;

    try {
      setStripeLoading(true);
      const response = await fetch(`/api/connect/status?restaurantId=${id}`, {
        method: "GET",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Could not load Stripe status");
      }

      setStripeStatus(payload as StripeStatus);
    } catch (err: any) {
      setMessage(err?.message || "Could not load Stripe status");
    } finally {
      setStripeLoading(false);
    }
  }

  async function handleConnectStripe() {
    if (!restaurant?.id) {
      setMessage(t.noRestaurant);
      return;
    }

    try {
      setStripeActionLoading(true);
      setMessage("");

      const createResponse = await fetch("/api/connect/create-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          email: userEmail,
          businessName: businessName || restaurant.name,
        }),
      });

      const createPayload = await createResponse.json();
      if (!createResponse.ok) {
        throw new Error(createPayload?.error || t.stripeCreateFailed);
      }

      const linkResponse = await fetch("/api/connect/account-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ restaurantId: restaurant.id }),
      });

      const linkPayload = await linkResponse.json();
      if (!linkResponse.ok || !linkPayload?.url) {
        throw new Error(linkPayload?.error || t.stripeLinkFailed);
      }

      window.location.href = linkPayload.url;
    } catch (err: any) {
      setMessage(err?.message || t.stripeLinkFailed);
    } finally {
      setStripeActionLoading(false);
    }
  }

  const storeLink = useMemo(() => {
    if (!restaurant?.slug) return "#";
    return `/store/${restaurant.slug}`;
  }, [restaurant?.slug]);

  const todaysOrderCount = useMemo(() => {
    const today = makeLocalDateKey(new Date());
    return orders.filter((order) => order.created_at && makeLocalDateKey(new Date(order.created_at)) === today).length;
  }, [orders]);

  const todaysSales = useMemo(() => {
    const today = makeLocalDateKey(new Date());
    return orders.reduce((sum, order) => {
      if (!order.created_at) return sum;
      if (makeLocalDateKey(new Date(order.created_at)) !== today) return sum;
      return sum + Number(order.total || 0);
    }, 0);
  }, [orders]);

  if (loading) {
    return (
      <div style={page}>
        <div style={loadingWrap}>{t.loading}</div>
      </div>
    );
  }

  return (
    <div style={page}>
      <div style={shell}>
        <div style={layout}>
          <aside style={sidebar}>
            <div style={brand}>MF</div>

            <button style={navButtonActive} onClick={() => router.push("/dashboard/owner")}>
              ⌂
            </button>

            <button style={navButton} onClick={() => router.push("/dashboard/owner/builder")}>
              ☰
            </button>

            <button
              style={navButton}
              onClick={() => {
                if (storeLink !== "#") window.location.href = storeLink;
              }}
            >
              ◱
            </button>

            <button style={navButton} onClick={() => void handleSidebarRefresh()}>
              ↻
            </button>
          </aside>

          <main style={main}>
            <section style={heroCard}>
              <div>
                <div style={heroTopRow}>
                  <div style={eyebrow}>{t.ownerPanel}</div>

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

                <h1 style={heroTitle}>
                  {getGreeting(lang)}, {restaurant?.name || t.owner} 👋
                </h1>
                <p style={heroText}>
                  {t.heroText}
                </p>
                <div style={emailText}>{userEmail}</div>
              </div>

              <div style={actionPanel}>
                <button style={blueButton} onClick={() => router.push("/dashboard/owner/builder")}>
                  {t.openMenuBuilder}
                </button>

                <a href={storeLink} style={storeLink !== "#" ? blueLink : blueLinkDisabled}>
                  {t.viewStore}
                </a>
              </div>
            </section>

            {message ? <div style={messageBox}>{message}</div> : null}

            <section style={statsGrid}>
              <div style={statCard}>
                <div style={statLabel}>{t.businessStatus}</div>
                <div style={statValue}>{t.active}</div>
                <div style={statSub}>{t.businessStatusSub}</div>
              </div>

              <div style={statCard}>
                <div style={statLabel}>{t.stripePayments}</div>
                <div style={statValue}>{stripeStatus?.connected ? t.stripeConnected : t.stripeNotConnected}</div>
                <div style={statSub}>{stripeStatus?.onboardingComplete ? t.stripeReady : t.stripeNeedsAttention}</div>
              </div>

              <div style={statCard}>
                <div style={statLabel}>{t.menuItems}</div>
                <div style={statValue}>{menuItems.length}</div>
                <div style={statSub}>{t.menuItemsSub}</div>
              </div>

              <div style={statCard}>
                <div style={statLabel}>{t.todaysOrders}</div>
                <div style={statValue}>{todaysOrderCount}</div>
                <div style={statSub}>{t.todaysOrdersSub}</div>
              </div>

              <div style={statCard}>
                <div style={statLabel}>{t.todaysSales}</div>
                <div style={statValue}>${todaysSales.toFixed(2)}</div>
                <div style={statSub}>{t.todaysSalesSub}</div>
              </div>
            </section>

            <section style={contentGrid}>
              <div style={leftColumn}>
                <div style={panel}>
                  <div style={panelHeaderRow}>
                    <h2 style={panelTitle}>{t.businessInformation}</h2>
                  </div>

                  <label style={label}>{t.businessName}</label>
                  <input style={input} value={businessName} onChange={(e) => setBusinessName(e.target.value)} />

                  <label style={label}>{t.storeSlug}</label>
                  <input style={input} value={storeSlug} onChange={(e) => setStoreSlug(e.target.value)} />

                  <label style={label}>{t.phoneNumber}</label>
                  <input style={input} value={phone} onChange={(e) => setPhone(e.target.value)} />

                  <label style={label}>{t.address}</label>
                  <input style={input} value={address} onChange={(e) => setAddress(e.target.value)} />

                  <label style={label}>{t.hours}</label>
                  <input
                    style={input}
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder={t.hoursPlaceholder}
                  />

                  <button style={saveButton} onClick={() => void handleSaveProfile()} disabled={savingProfile}>
                    {savingProfile ? t.saving : !restaurant ? t.createBusiness : t.saveBusinessInformation}
                  </button>
                </div>

                <div style={panel}>
                  <div style={panelHeaderRow}>
                    <h2 style={panelTitle}>{t.stripePayments}</h2>
                  </div>

                  <div style={stripeInfoText}>{t.stripePaymentsSub}</div>

                  <div style={stripeStatusGrid}>
                    <div style={stripeStatusItem}>
                      <div style={stripeStatusLabel}>{t.platformFee}</div>
                      <div style={stripeStatusValue}>{stripeStatus ? `${stripeStatus.feePercent}%` : "--"}</div>
                    </div>
                    <div style={stripeStatusItem}>
                      <div style={stripeStatusLabel}>{t.onboardingComplete}</div>
                      <div style={stripeStatusValue}>{stripeStatus?.onboardingComplete ? t.active : t.onboardingIncomplete}</div>
                    </div>
                    <div style={stripeStatusItem}>
                      <div style={stripeStatusLabel}>{t.chargesEnabled}</div>
                      <div style={stripeStatusValue}>{stripeStatus?.chargesEnabled ? t.active : "--"}</div>
                    </div>
                    <div style={stripeStatusItem}>
                      <div style={stripeStatusLabel}>{t.payoutsEnabled}</div>
                      <div style={stripeStatusValue}>{stripeStatus?.payoutsEnabled ? t.active : "--"}</div>
                    </div>
                  </div>

                  <div style={stripeActionsRow}>
                    <button style={saveButton} onClick={() => void handleConnectStripe()} disabled={stripeActionLoading || !restaurant?.id}>
                      {stripeActionLoading
                        ? t.saving
                        : stripeStatus?.connected
                        ? t.resumeOnboarding
                        : t.connectStripe}
                    </button>
                    <button style={secondaryActionButton} onClick={() => void refreshStripeStatus()} disabled={stripeLoading || !restaurant?.id}>
                      {stripeLoading ? t.stripeLoading : t.refreshStripe}
                    </button>
                  </div>
                </div>

                <div style={panel}>
                  <div style={panelHeaderRow}>
                    <h2 style={panelTitle}>{t.allMenuItems}</h2>
                    <div style={panelHeaderMeta}>{menuItems.length} {t.total}</div>
                  </div>

                  {menuItems.length === 0 ? (
                    <div style={emptyBox}>{t.noMenuItems}</div>
                  ) : (
                    <div style={menuList}>
                      {menuItems.map((item) => (
                        <div key={item.id} style={menuRow}>
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name || t.menuItem} style={menuImage} />
                          ) : (
                            <div style={menuImagePlaceholder}>{t.noPhoto}</div>
                          )}

                          <div style={{ flex: 1 }}>
                            <div style={menuName}>{item.name || t.menuItem}</div>
                            <div style={menuPrice}>${Number(item.price || 0).toFixed(2)}</div>
                            {item.description ? <div style={menuDesc}>{item.description}</div> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={rightColumn}>
                <div style={panel}>
                  <div style={panelHeaderRow}>
                    <h2 style={panelTitle}>{t.storePreview}</h2>
                    <div style={panelHeaderMeta}>{storeLink}</div>
                  </div>

                  <div style={previewCard}>
                    <div style={previewLabel}>{t.menuFlowStore}</div>
                    <div style={previewStoreName}>{restaurant?.name || t.store}</div>

                    {restaurant?.hero_image ? (
                      <div
                        style={{
                          ...previewHero,
                          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.25), rgba(15, 23, 42, 0.45)), url("${restaurant.hero_image}")`,
                        }}
                      >
                        <div style={previewHeroContent}>
                          <div style={previewSlug}>{restaurant?.slug ? `/store/${restaurant.slug}` : ""}</div>
                          <div style={previewHeroTitle}>{restaurant?.name || t.restaurant}</div>
                          <div style={previewHeroText}>{t.freshFood}</div>
                          <div style={previewHeroMeta}>{restaurant?.phone || "-"}</div>
                          <div style={previewHeroMeta}>{restaurant?.address || "-"}</div>
                          <div style={previewHeroMeta}>{hours || restaurant?.hours || "-"}</div>
                        </div>
                      </div>
                    ) : (
                      <div style={heroFallback}>{t.heroFallback}</div>
                    )}
                  </div>
                </div>

                <div style={panel}>
                  <div style={panelHeaderRow}>
                    <h2 style={panelTitle}>{t.liveOrders}</h2>
                    <div style={panelHeaderMeta}>{orders.length} {t.loaded}</div>
                  </div>

                  {orders.length === 0 ? (
                    <div style={emptyBox}>{t.noOrders}</div>
                  ) : (
                    <div style={ordersList}>
                      {orders.map((order) => (
                        <div key={order.id} style={orderCard}>
                          <div style={orderTopRow}>
                            <div>
                              <div style={orderCustomer}>{order.customer_name || t.customer}</div>
                              <div style={orderPhone}>{order.customer_phone || "-"}</div>
                            </div>
                            <div style={orderTotal}>${Number(order.total || 0).toFixed(2)}</div>
                          </div>

                          <div style={orderTime}>{formatOrderDateTime(order.created_at, lang)}</div>

                          {order.special_instructions ? (
                            <div style={specialInstructions}>
                              {t.instructions}: {order.special_instructions}
                            </div>
                          ) : null}

                          <div style={orderItemsWrap}>
                            {(order.items || []).length === 0 ? (
                              <div style={orderItemText}>{t.noOrderItems}</div>
                            ) : (
                              (order.items || []).map((item, index) => (
                                <div key={`${order.id}-${index}`} style={orderItemText}>
                                  {item.qty || 1} × {item.name || t.item}
                                </div>
                              ))
                            )}
                          </div>

                          <div style={orderActions}>
                            {order.customer_phone ? (
                              <>
                                <a href={`sms:${order.customer_phone}`} style={smsButton}>
                                  {t.textCustomer}
                                </a>
                                <a href={`tel:${order.customer_phone}`} style={callButton}>
                                  {t.callCustomer}
                                </a>
                              </>
                            ) : null}
                          </div>

                          <button
                            style={removeOrderButton}
                            onClick={() => void handleRemoveOrder(order.id)}
                            disabled={removingOrderId === order.id}
                          >
                            {removingOrderId === order.id ? t.removing : t.removeOrder}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function getGreeting(lang: Lang) {
  const hour = new Date().getHours();
  if (hour < 12) return lang === "es" ? COPY.es.greetingMorning : COPY.en.greetingMorning;
  if (hour < 18) return lang === "es" ? COPY.es.greetingAfternoon : COPY.en.greetingAfternoon;
  return lang === "es" ? COPY.es.greetingEvening : COPY.en.greetingEvening;
}

function makeLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatOrderDateTime(value?: string | null, lang: Lang = "en") {
  if (!value) return lang === "es" ? COPY.es.timeUnavailable : COPY.en.timeUnavailable;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return lang === "es" ? COPY.es.timeUnavailable : COPY.en.timeUnavailable;

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${month}/${day}/${year}, ${hours}:${minutes} ${ampm}`;
}

const page: CSSProperties = {
  minHeight: "100vh",
  background: COLORS.page,
  padding: "24px",
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  color: COLORS.text,
};

const shell: CSSProperties = {
  maxWidth: "1480px",
  margin: "0 auto",
};

const layout: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "88px 1fr",
  gap: "24px",
  alignItems: "start",
};

const sidebar: CSSProperties = {
  background: COLORS.card,
  borderRadius: "28px",
  padding: "18px 14px",
  boxShadow: COLORS.shadow,
  border: `1px solid ${COLORS.border}`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "14px",
  minHeight: "840px",
};

const brand: CSSProperties = {
  width: "48px",
  height: "48px",
  borderRadius: "16px",
  background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: "16px",
  marginBottom: "8px",
};

const navButtonBase: CSSProperties = {
  width: "48px",
  height: "48px",
  borderRadius: "16px",
  border: `1px solid ${COLORS.border}`,
  background: "#ffffff",
  color: "#475569",
  cursor: "pointer",
  fontSize: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const navButton: CSSProperties = { ...navButtonBase };

const navButtonActive: CSSProperties = {
  ...navButtonBase,
  background: "#eff6ff",
  color: COLORS.blueDark,
  border: "1px solid #bfdbfe",
  boxShadow: "0 8px 22px rgba(37, 99, 235, 0.15)",
};

const main: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "24px",
};

const heroCard: CSSProperties = {
  background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
  borderRadius: "32px",
  padding: "30px",
  border: `1px solid ${COLORS.border}`,
  boxShadow: COLORS.shadow,
  minHeight: "210px",
  display: "flex",
  justifyContent: "space-between",
  gap: "24px",
  flexWrap: "wrap",
};

const heroTopRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap",
};

const langWrap: CSSProperties = {
  display: "flex",
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  padding: "4px",
  borderRadius: "14px",
};

const langButton: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#64748b",
  padding: "8px 12px",
  borderRadius: "10px",
  fontWeight: 800,
  cursor: "pointer",
};

const langButtonActive: CSSProperties = {
  border: "none",
  background: "#2563eb",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: "10px",
  fontWeight: 800,
  cursor: "pointer",
};

const eyebrow: CSSProperties = {
  color: COLORS.blue,
  fontSize: "14px",
  fontWeight: 700,
  marginBottom: "10px",
};

const heroTitle: CSSProperties = {
  margin: 0,
  fontSize: "38px",
  lineHeight: 1.05,
  fontWeight: 800,
};

const heroText: CSSProperties = {
  marginTop: "10px",
  color: COLORS.sub,
  fontSize: "17px",
  maxWidth: "760px",
};

const emailText: CSSProperties = {
  marginTop: "14px",
  color: "#0f172a",
  fontWeight: 600,
  fontSize: "15px",
};

const actionPanel: CSSProperties = {
  width: "280px",
  background: COLORS.card,
  borderRadius: "24px",
  padding: "14px",
  boxShadow: "0 22px 50px rgba(37, 99, 235, 0.18)",
  border: `1px solid ${COLORS.border}`,
  display: "grid",
  gap: "10px",
  alignSelf: "center",
};

const blueButton: CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "16px",
  background: COLORS.blue,
  border: "none",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
};

const blueLink: CSSProperties = {
  display: "block",
  padding: "14px 16px",
  borderRadius: "16px",
  background: COLORS.blue,
  border: "none",
  color: "#ffffff",
  fontWeight: 700,
  textDecoration: "none",
  textAlign: "center",
};

const blueLinkDisabled: CSSProperties = {
  display: "block",
  padding: "14px 16px",
  borderRadius: "16px",
  background: "#cbd5e1",
  border: "none",
  color: "#ffffff",
  fontWeight: 700,
  textDecoration: "none",
  textAlign: "center",
};

const messageBox: CSSProperties = {
  padding: "14px 16px",
  borderRadius: "14px",
  background: "#eff6ff",
  color: COLORS.blueDark,
  fontWeight: 700,
};

const statsGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "18px",
};

const statCard: CSSProperties = {
  background: COLORS.card,
  borderRadius: "24px",
  border: `1px solid ${COLORS.border}`,
  boxShadow: COLORS.shadow,
  padding: "24px",
};

const statLabel: CSSProperties = {
  color: COLORS.sub,
  fontWeight: 700,
  fontSize: "14px",
};

const statValue: CSSProperties = {
  marginTop: "10px",
  fontSize: "34px",
  fontWeight: 800,
  color: COLORS.text,
};

const statSub: CSSProperties = {
  marginTop: "8px",
  color: COLORS.sub,
  fontSize: "14px",
  lineHeight: 1.5,
};

const contentGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "0.95fr 1.05fr",
  gap: "20px",
};

const leftColumn: CSSProperties = {
  display: "grid",
  gap: "20px",
};

const rightColumn: CSSProperties = {
  display: "grid",
  gap: "20px",
};

const panel: CSSProperties = {
  background: COLORS.card,
  borderRadius: "28px",
  padding: "26px",
  border: `1px solid ${COLORS.border}`,
  boxShadow: "0 16px 45px rgba(15, 23, 42, 0.06)",
};

const panelHeaderRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  marginBottom: "16px",
};

const panelTitle: CSSProperties = {
  margin: 0,
  fontSize: "30px",
  fontWeight: 800,
};

const panelHeaderMeta: CSSProperties = {
  color: COLORS.sub,
  fontWeight: 700,
};

const label: CSSProperties = {
  display: "block",
  marginTop: "14px",
  marginBottom: "8px",
  fontWeight: 700,
  color: "#334155",
};

const input: CSSProperties = {
  width: "100%",
  padding: "16px 18px",
  borderRadius: "16px",
  border: `1px solid ${COLORS.border}`,
  background: "#fbfdff",
  fontSize: "16px",
  color: COLORS.text,
  boxSizing: "border-box",
  outline: "none",
};

const saveButton: CSSProperties = {
  marginTop: "18px",
  width: "100%",
  padding: "16px 18px",
  borderRadius: "16px",
  border: "none",
  background: COLORS.success,
  color: "#ffffff",
  fontWeight: 800,
  fontSize: "16px",
  cursor: "pointer",
};

const emptyBox: CSSProperties = {
  padding: "20px",
  borderRadius: "18px",
  background: COLORS.soft,
  border: `1px solid ${COLORS.border}`,
  color: COLORS.sub,
  fontWeight: 600,
};

const menuList: CSSProperties = {
  display: "grid",
  gap: "14px",
};

const menuRow: CSSProperties = {
  display: "flex",
  gap: "14px",
  alignItems: "center",
  background: COLORS.card,
  border: `1px solid ${COLORS.border}`,
  borderRadius: "18px",
  padding: "12px",
};

const menuImage: CSSProperties = {
  width: "76px",
  height: "76px",
  objectFit: "cover",
  borderRadius: "18px",
  border: `1px solid ${COLORS.border}`,
};

const menuImagePlaceholder: CSSProperties = {
  width: "76px",
  height: "76px",
  borderRadius: "18px",
  border: `1px solid ${COLORS.border}`,
  background: COLORS.soft,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: 700,
};

const menuName: CSSProperties = {
  fontWeight: 800,
  fontSize: "18px",
  color: COLORS.text,
};

const menuPrice: CSSProperties = {
  marginTop: "6px",
  color: COLORS.sub,
  fontWeight: 700,
};

const menuDesc: CSSProperties = {
  marginTop: "6px",
  color: "#94a3b8",
  fontSize: "13px",
};

const previewCard: CSSProperties = {
  background: "#f8fbff",
  borderRadius: "24px",
  border: "1px solid #dbeafe",
  padding: "18px",
};

const previewLabel: CSSProperties = {
  color: COLORS.blue,
  fontWeight: 700,
  fontSize: "13px",
};

const previewStoreName: CSSProperties = {
  marginTop: "6px",
  fontSize: "28px",
  fontWeight: 800,
  color: COLORS.text,
};

const previewHero: CSSProperties = {
  marginTop: "18px",
  height: "310px",
  borderRadius: "26px",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
  overflow: "hidden",
};

const previewHeroContent: CSSProperties = {
  position: "absolute",
  left: "22px",
  right: "22px",
  bottom: "22px",
  color: "#ffffff",
};

const previewSlug: CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  opacity: 0.95,
};

const previewHeroTitle: CSSProperties = {
  marginTop: "8px",
  fontSize: "38px",
  fontWeight: 800,
  lineHeight: 1.05,
};

const previewHeroText: CSSProperties = {
  marginTop: "8px",
  fontSize: "16px",
  opacity: 0.95,
};

const previewHeroMeta: CSSProperties = {
  marginTop: "6px",
  fontSize: "14px",
  opacity: 0.95,
};

const heroFallback: CSSProperties = {
  marginTop: "18px",
  height: "240px",
  borderRadius: "26px",
  border: `1px dashed ${COLORS.border}`,
  background: COLORS.card,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#94a3b8",
  fontWeight: 700,
};

const ordersList: CSSProperties = {
  display: "grid",
  gap: "14px",
};

const orderCard: CSSProperties = {
  borderRadius: "20px",
  border: `1px solid ${COLORS.border}`,
  background: COLORS.card,
  padding: "16px",
};

const orderTopRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "center",
};

const orderCustomer: CSSProperties = {
  fontWeight: 800,
  fontSize: "18px",
  color: COLORS.text,
};

const orderPhone: CSSProperties = {
  marginTop: "4px",
  color: COLORS.sub,
  fontSize: "14px",
};

const orderTotal: CSSProperties = {
  fontWeight: 800,
  fontSize: "22px",
  color: COLORS.text,
};

const orderTime: CSSProperties = {
  marginTop: "10px",
  color: COLORS.sub,
  fontSize: "13px",
};

const specialInstructions: CSSProperties = {
  marginTop: "10px",
  padding: "10px 12px",
  borderRadius: "12px",
  background: "#eff6ff",
  color: "#1e40af",
  fontSize: "14px",
  fontWeight: 600,
};

const orderItemsWrap: CSSProperties = {
  marginTop: "12px",
  display: "grid",
  gap: "6px",
};

const orderItemText: CSSProperties = {
  color: "#334155",
  fontSize: "14px",
};

const orderActions: CSSProperties = {
  marginTop: "14px",
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const smsButton: CSSProperties = {
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 14px",
  borderRadius: "14px",
  background: "#dbeafe",
  color: "#1d4ed8",
  fontWeight: 800,
  flex: 1,
};

const callButton: CSSProperties = {
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 14px",
  borderRadius: "14px",
  background: "#dcfce7",
  color: "#15803d",
  fontWeight: 800,
  flex: 1,
};

const removeOrderButton: CSSProperties = {
  marginTop: "14px",
  width: "100%",
  padding: "12px 14px",
  borderRadius: "14px",
  border: "none",
  background: COLORS.danger,
  color: "#ffffff",
  fontWeight: 800,
  cursor: "pointer",
};

const loadingWrap: CSSProperties = {
  minHeight: "80vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "22px",
  fontWeight: 700,
  color: "#334155",
};


const stripeInfoText: CSSProperties = {
  color: COLORS.sub,
  fontSize: "14px",
  lineHeight: 1.7,
  marginBottom: "18px",
};

const stripeStatusGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "12px",
  marginBottom: "16px",
};

const stripeStatusItem: CSSProperties = {
  background: "#f8fafc",
  border: `1px solid ${COLORS.border}`,
  borderRadius: "18px",
  padding: "14px",
};

const stripeStatusLabel: CSSProperties = {
  color: COLORS.sub,
  fontSize: "13px",
  fontWeight: 700,
  marginBottom: "6px",
};

const stripeStatusValue: CSSProperties = {
  color: COLORS.text,
  fontSize: "16px",
  fontWeight: 800,
};

const stripeActionsRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
};

const secondaryActionButton: CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "16px",
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  color: COLORS.blueDark,
  fontWeight: 700,
  cursor: "pointer",
};
