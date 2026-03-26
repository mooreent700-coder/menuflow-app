"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Restaurant = {
  id: string;
  owner_email?: string | null;
  name: string | null;
  slug: string | null;
  phone?: string | null;
  address?: string | null;
  hours?: string | null;
  hero_image?: string | null;
  logo_image?: string | null;
  hide_hero?: boolean | null;
  hide_logo?: boolean | null;
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

type Lang = "en" | "es";

const COPY = {
  en: {
    eyebrow: "MenuFlow Builder",
    title: "Add and manage menu items",
    subtitle: "Update your menu, store images, and storefront preview.",
    signedInAs: "Signed in as",
    back: "Back to Dashboard",
    yourStore: "Your Store",
    viewStore: "View Store",
    currentMenu: "Current Menu",
    currentMenuSub: "Everything you add here appears in your store system.",
    addMenuItem: "Add Menu Item",
    itemName: "Item Name",
    price: "Price",
    description: "Description",
    descriptionPlaceholder: "Fresh food made to order",
    menuImage: "Menu Item Image",
    heroImage: "Hero Image",
    logoImage: "Logo Image",
    uploadHint: "Click to upload",
    uploadSub: "PNG, JPG, or WEBP",
    addButton: "Add Menu Item",
    adding: "Adding...",
    remove: "Remove",
    removing: "Removing...",
    preview: "Store Preview",
    previewSub: "Live MenuFlow storefront look",
    noRestaurant:
      "Save your business information in the owner dashboard first, then come back here to build your menu.",
    noItems: "No menu items yet.",
    itemRequired: "Item name is required.",
    priceRequired: "Enter a valid price.",
    addSuccess: "Menu item added successfully.",
    removeSuccess: "Menu item removed successfully.",
    heroSuccess: "Hero image updated.",
    logoSuccess: "Logo image updated.",
    uploadError: "Could not upload image.",
    loadError: "Could not load builder.",
    addError: "Could not add menu item.",
    removeError: "Could not remove menu item.",
    uploadLabelHero: "Upload Hero",
    uploadLabelLogo: "Upload Logo",
    uploadLabelItem: "Upload Menu Image",
    storeImages: "Store Images",
    storeImagesSub: "Change hero and logo whenever you need.",
    menuCount: "items",
    hideHero: "Hide Hero",
    hideLogo: "Hide Logo",
    saving: "Saving...",
    imageOptional: "Image optional",
  },
  es: {
    eyebrow: "Constructor de MenuFlow",
    title: "Agrega y administra artículos del menú",
    subtitle: "Actualiza tu menú, imágenes de la tienda y vista previa.",
    signedInAs: "Sesión iniciada como",
    back: "Volver al Panel",
    yourStore: "Tu Tienda",
    viewStore: "Ver Tienda",
    currentMenu: "Menú Actual",
    currentMenuSub: "Todo lo que agregues aquí aparece en tu tienda.",
    addMenuItem: "Agregar Artículo",
    itemName: "Nombre del Artículo",
    price: "Precio",
    description: "Descripción",
    descriptionPlaceholder: "Comida fresca hecha al momento",
    menuImage: "Imagen del Artículo",
    heroImage: "Imagen Principal",
    logoImage: "Imagen del Logo",
    uploadHint: "Haz clic para subir",
    uploadSub: "PNG, JPG o WEBP",
    addButton: "Agregar Artículo",
    adding: "Agregando...",
    remove: "Eliminar",
    removing: "Eliminando...",
    preview: "Vista Previa de la Tienda",
    previewSub: "Vista en vivo del estilo MenuFlow",
    noRestaurant:
      "Guarda primero la información de tu negocio en el panel del dueño y luego regresa aquí para construir tu menú.",
    noItems: "Todavía no hay artículos.",
    itemRequired: "El nombre del artículo es obligatorio.",
    priceRequired: "Ingresa un precio válido.",
    addSuccess: "Artículo agregado correctamente.",
    removeSuccess: "Artículo eliminado correctamente.",
    heroSuccess: "Imagen principal actualizada.",
    logoSuccess: "Logo actualizado.",
    uploadError: "No se pudo subir la imagen.",
    loadError: "No se pudo cargar el constructor.",
    addError: "No se pudo agregar el artículo.",
    removeError: "No se pudo eliminar el artículo.",
    uploadLabelHero: "Subir Principal",
    uploadLabelLogo: "Subir Logo",
    uploadLabelItem: "Subir Imagen",
    storeImages: "Imágenes de la Tienda",
    storeImagesSub: "Cambia la principal y el logo cuando quieras.",
    menuCount: "artículos",
    hideHero: "Ocultar Principal",
    hideLogo: "Ocultar Logo",
    saving: "Guardando...",
    imageOptional: "Imagen opcional",
  },
} as const;

const COLORS = {
  page: "#f6f8fc",
  card: "#ffffff",
  border: "#e5e7eb",
  text: "#1f2937",
  sub: "#6b7280",
  blue: "#3b82f6",
  blueDark: "#2563eb",
  blueSoft: "#eff6ff",
  blueBorder: "#bfdbfe",
  redSoft: "#fee2e2",
  redText: "#b91c1c",
  shadow: "0 16px 42px rgba(15, 23, 42, 0.08)",
};

export default function OwnerBuilderPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const t = COPY[lang];

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState("");
  const [uploadingMenuImage, setUploadingMenuImage] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingHeroToggle, setSavingHeroToggle] = useState(false);
  const [savingLogoToggle, setSavingLogoToggle] = useState(false);

  const [userEmail, setUserEmail] = useState("");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [menuImageFile, setMenuImageFile] = useState<File | null>(null);
  const [menuImagePreview, setMenuImagePreview] = useState("");

  const loadingRef = useRef(false);

  useEffect(() => {
    void loadBuilder();
  }, []);

  async function loadBuilder() {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      setLoading(true);
      setMessage("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user?.email) {
        setMessage(t.loadError);
        setLoading(false);
        return;
      }

      setUserEmail(user.email);

      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_email", user.email)
        .maybeSingle();

      if (restaurantError) throw restaurantError;

      if (!restaurantData) {
        setRestaurant(null);
        setMenuItems([]);
        setMessage(t.noRestaurant);
        setLoading(false);
        return;
      }

      const typedRestaurant = restaurantData as Restaurant;
      setRestaurant(typedRestaurant);
      await loadMenuItems(typedRestaurant.id);
      setLoading(false);
    } catch (err: any) {
      setMessage(err?.message || t.loadError);
      setLoading(false);
    } finally {
      loadingRef.current = false;
    }
  }

  async function loadMenuItems(restaurantId: string) {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    setMenuItems((data || []) as MenuItem[]);
  }

  async function uploadImage(file: File, folder: "menu" | "hero" | "logo") {
    const ext = file.name.split(".").pop() || "png";
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from("menu-images").upload(fileName, file, {
      upsert: false,
    });

    if (error) return null;

    const { data } = supabase.storage.from("menu-images").getPublicUrl(fileName);
    return data.publicUrl;
  }

  function onMenuFileSelected(file: File | null) {
    setMenuImageFile(file || null);

    if (!file) {
      setMenuImagePreview("");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMenuImagePreview(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  }

  async function handleAddMenuItem() {
    if (!restaurant?.id) {
      setMessage(t.noRestaurant);
      return;
    }

    const cleanName = itemName.trim();
    const cleanDescription = itemDescription.trim();
    const parsedPrice = Number(itemPrice);

    if (!cleanName) {
      setMessage(t.itemRequired);
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setMessage(t.priceRequired);
      return;
    }

    try {
      setAdding(true);
      setMessage("");

      let imageUrl: string | null = null;

      if (menuImageFile) {
        setUploadingMenuImage(true);
        imageUrl = await uploadImage(menuImageFile, "menu");
        setUploadingMenuImage(false);

        if (!imageUrl) {
          setMessage(t.uploadError);
          setAdding(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from("menu_items")
        .insert({
          restaurant_id: restaurant.id,
          name: cleanName,
          price: parsedPrice,
          description: cleanDescription || null,
          image_url: imageUrl,
        })
        .select("*")
        .single();

      if (error) throw error;

      setMenuItems((prev) => [data as MenuItem, ...prev]);
      setItemName("");
      setItemPrice("");
      setItemDescription("");
      setMenuImageFile(null);
      setMenuImagePreview("");
      setMessage(t.addSuccess);
    } catch (err: any) {
      setMessage(err?.message || t.addError);
    } finally {
      setUploadingMenuImage(false);
      setAdding(false);
    }
  }

  async function handleRemoveMenuItem(id: string) {
    try {
      setRemovingId(id);
      setMessage("");

      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;

      setMenuItems((prev) => prev.filter((item) => item.id !== id));
      setMessage(t.removeSuccess);
    } catch (err: any) {
      setMessage(err?.message || t.removeError);
    } finally {
      setRemovingId("");
    }
  }

  async function updateStoreImage(type: "hero" | "logo", file: File | null) {
    if (!restaurant?.id || !file) return;

    try {
      setMessage("");
      if (type === "hero") setUploadingHero(true);
      if (type === "logo") setUploadingLogo(true);

      const url = await uploadImage(file, type);
      if (!url) {
        setMessage(t.uploadError);
        return;
      }

      const payload = type === "hero" ? { hero_image: url } : { logo_image: url };

      const { data, error } = await supabase
        .from("restaurants")
        .update(payload)
        .eq("id", restaurant.id)
        .select("*")
        .single();

      if (error) throw error;

      setRestaurant(data as Restaurant);
      setMessage(type === "hero" ? t.heroSuccess : t.logoSuccess);
    } catch (err: any) {
      setMessage(err?.message || t.uploadError);
    } finally {
      setUploadingHero(false);
      setUploadingLogo(false);
    }
  }

  async function updateHideToggle(type: "hero" | "logo", value: boolean) {
    if (!restaurant?.id) return;

    try {
      setMessage("");
      if (type === "hero") setSavingHeroToggle(true);
      if (type === "logo") setSavingLogoToggle(true);

      const payload = type === "hero" ? { hide_hero: value } : { hide_logo: value };

      const { data, error } = await supabase
        .from("restaurants")
        .update(payload)
        .eq("id", restaurant.id)
        .select("*")
        .single();

      if (error) throw error;

      setRestaurant(data as Restaurant);
    } catch (err: any) {
      setMessage(err?.message || t.uploadError);
    } finally {
      setSavingHeroToggle(false);
      setSavingLogoToggle(false);
    }
  }

  const storeLink = useMemo(() => {
    if (!restaurant?.slug) return "#";
    return `/store/${restaurant.slug}`;
  }, [restaurant?.slug]);

  const showHeroInPreview = !restaurant?.hide_hero && !!restaurant?.hero_image;
  const showLogoInPreview = !restaurant?.hide_logo && !!restaurant?.logo_image;

  if (loading) {
    return (
      <div style={page}>
        <div style={loadingWrap}>Loading builder...</div>
      </div>
    );
  }

  return (
    <div style={page}>
      <div style={shell}>
        <section style={heroCard}>
          <div>
            <div style={eyebrow}>{t.eyebrow}</div>
            <h1 style={heroTitle}>{t.title}</h1>
            <p style={heroText}>{t.subtitle}</p>
            <div style={signedInText}>
              {t.signedInAs}: {userEmail}
            </div>
          </div>

          <div style={heroActions}>
            <button style={backButton} onClick={() => router.push("/dashboard/owner")}>
              {t.back}
            </button>

            <div style={langWrap}>
              <button type="button" onClick={() => setLang("en")} style={lang === "en" ? langActive : langButton}>
                EN
              </button>
              <button type="button" onClick={() => setLang("es")} style={lang === "es" ? langActive : langButton}>
                ES
              </button>
            </div>
          </div>
        </section>

        {message ? <div style={messageBox}>{message}</div> : null}

        <section style={grid}>
          <div style={leftCol}>
            <div style={panel}>
              <div style={panelTitle}>{t.addMenuItem}</div>

              <label style={label}>{t.itemName}</label>
              <input style={input} value={itemName} onChange={(e) => setItemName(e.target.value)} />

              <label style={label}>{t.price}</label>
              <input
                style={input}
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                placeholder="12.99"
                inputMode="decimal"
              />

              <label style={label}>{t.description}</label>
              <textarea
                style={textarea}
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder={t.descriptionPlaceholder}
              />

              <label style={label}>{t.menuImage}</label>
              <label style={uploadCard}>
                {menuImagePreview ? (
                  <img src={menuImagePreview} alt="Menu preview" style={uploadPreview} />
                ) : (
                  <div style={uploadInner}>
                    <div style={uploadTitle}>{t.uploadLabelItem}</div>
                    <div style={uploadSub}>{t.uploadHint} • {t.uploadSub}</div>
                    <div style={uploadOptional}>{t.imageOptional}</div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  style={hiddenFileInput}
                  onChange={(e) => onMenuFileSelected(e.target.files?.[0] || null)}
                />
              </label>

              <button style={primaryButton} onClick={() => void handleAddMenuItem()} disabled={adding}>
                {adding || uploadingMenuImage ? t.adding : t.addButton}
              </button>
            </div>

            <div style={panel}>
              <div style={panelTitle}>{t.storeImages}</div>
              <div style={panelSub}>{t.storeImagesSub}</div>

              <div style={imageGrid}>
                <div>
                  <div style={uploadLabel}>{t.heroImage}</div>
                  <label style={storeUploadCard}>
                    {restaurant?.hero_image ? (
                      <img src={restaurant.hero_image} alt="Hero" style={storeUploadPreviewWide} />
                    ) : (
                      <div style={uploadInner}>
                        <div style={uploadTitle}>{t.uploadLabelHero}</div>
                        <div style={uploadSub}>{t.uploadHint} • {t.uploadSub}</div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      style={hiddenFileInput}
                      onChange={(e) => void updateStoreImage("hero", e.target.files?.[0] || null)}
                    />
                  </label>

                  <label style={toggleRow}>
                    <input
                      type="checkbox"
                      checked={!!restaurant?.hide_hero}
                      onChange={(e) => void updateHideToggle("hero", e.target.checked)}
                    />
                    <span>{savingHeroToggle ? t.saving : t.hideHero}</span>
                  </label>

                  {uploadingHero ? (
                    <div style={uploadState}>{lang === "en" ? "Uploading hero..." : "Subiendo principal..."}</div>
                  ) : null}
                </div>

                <div>
                  <div style={uploadLabel}>{t.logoImage}</div>
                  <label style={storeUploadCardSmall}>
                    {restaurant?.logo_image ? (
                      <img src={restaurant.logo_image} alt="Logo" style={storeUploadPreviewSmall} />
                    ) : (
                      <div style={uploadInner}>
                        <div style={uploadTitle}>{t.uploadLabelLogo}</div>
                        <div style={uploadSub}>{t.uploadHint}</div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      style={hiddenFileInput}
                      onChange={(e) => void updateStoreImage("logo", e.target.files?.[0] || null)}
                    />
                  </label>

                  <label style={toggleRow}>
                    <input
                      type="checkbox"
                      checked={!!restaurant?.hide_logo}
                      onChange={(e) => void updateHideToggle("logo", e.target.checked)}
                    />
                    <span>{savingLogoToggle ? t.saving : t.hideLogo}</span>
                  </label>

                  {uploadingLogo ? (
                    <div style={uploadState}>{lang === "en" ? "Uploading logo..." : "Subiendo logo..."}</div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div style={rightCol}>
            <div style={panel}>
              <div style={panelRow}>
                <div>
                  <div style={panelTitle}>{t.currentMenu}</div>
                  <div style={panelSub}>
                    {menuItems.length} {t.menuCount}
                  </div>
                </div>

                <div style={storeActionWrap}>
                  <div style={storeActionLabel}>{t.yourStore}</div>
                  <a href={storeLink} style={storeLink !== "#" ? storeButton : storeButtonDisabled}>
                    {t.viewStore}
                  </a>
                </div>
              </div>

              {menuItems.length === 0 ? (
                <div style={emptyBox}>{t.noItems}</div>
              ) : (
                <div style={menuList}>
                  {menuItems.map((item) => (
                    <div key={item.id} style={menuCard}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name || "Item"} style={menuImage} />
                      ) : (
                        <div style={menuImagePlaceholder}>IMG</div>
                      )}

                      <div style={menuInfo}>
                        <div style={menuName}>{item.name || "-"}</div>
                        <div style={menuPrice}>${Number(item.price || 0).toFixed(2)}</div>
                        {item.description ? <div style={menuDesc}>{item.description}</div> : null}
                      </div>

                      <button
                        style={removeButton}
                        onClick={() => void handleRemoveMenuItem(item.id)}
                        disabled={removingId === item.id}
                      >
                        {removingId === item.id ? t.removing : t.remove}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={panel}>
              <div style={panelTitle}>{t.preview}</div>
              <div style={panelSub}>{t.previewSub}</div>

              <div style={previewCard}>
                {showHeroInPreview ? (
                  <div style={{ ...previewHero, backgroundImage: `url("${restaurant?.hero_image}")` }}>
                    <div style={previewOverlay}>
                      {showLogoInPreview ? (
                        <img src={restaurant?.logo_image || ""} alt="Logo" style={previewLogo} />
                      ) : null}
                      <div style={previewName}>{restaurant?.name || "Your Store"}</div>
                      <div style={previewMeta}>{restaurant?.slug ? `/store/${restaurant.slug}` : ""}</div>
                    </div>
                  </div>
                ) : (
                  <div style={previewHeroFallback}>
                    {lang === "en" ? "Hero image preview will show here." : "La vista previa de la imagen principal aparecerá aquí."}
                  </div>
                )}

                <div style={previewBody}>
                  {menuItems.slice(0, 3).map((item) => (
                    <div key={item.id} style={previewMenuRow}>
                      <div style={previewMenuLeft}>
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name || "Item"} style={previewThumb} />
                        ) : (
                          <div style={previewThumbPlaceholder}>IMG</div>
                        )}
                        <div>
                          <div style={previewItemName}>{item.name || "-"}</div>
                          {item.description ? <div style={previewItemDesc}>{item.description}</div> : null}
                        </div>
                      </div>
                      <div style={previewItemPrice}>${Number(item.price || 0).toFixed(2)}</div>
                    </div>
                  ))}

                  {menuItems.length === 0 ? <div style={previewEmpty}>{t.noItems}</div> : null}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
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
  maxWidth: "1460px",
  margin: "0 auto",
  display: "grid",
  gap: "22px",
};

const heroCard: CSSProperties = {
  background: COLORS.card,
  border: `1px solid ${COLORS.border}`,
  borderRadius: "28px",
  boxShadow: COLORS.shadow,
  padding: "28px",
  display: "flex",
  justifyContent: "space-between",
  gap: "18px",
  flexWrap: "wrap",
};

const eyebrow: CSSProperties = {
  color: COLORS.blue,
  fontSize: "14px",
  fontWeight: 700,
};

const heroTitle: CSSProperties = {
  margin: "10px 0 0",
  fontSize: "56px",
  lineHeight: 1.02,
  fontWeight: 900,
  letterSpacing: "-0.04em",
};

const heroText: CSSProperties = {
  marginTop: "10px",
  color: COLORS.sub,
  fontSize: "18px",
};

const signedInText: CSSProperties = {
  marginTop: "10px",
  color: COLORS.sub,
  fontWeight: 600,
  fontSize: "16px",
};

const heroActions: CSSProperties = {
  display: "flex",
  gap: "12px",
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const backButton: CSSProperties = {
  border: `1px solid ${COLORS.border}`,
  background: "#fff",
  color: COLORS.text,
  borderRadius: "16px",
  padding: "14px 18px",
  fontWeight: 700,
  cursor: "pointer",
};

const langWrap: CSSProperties = {
  display: "flex",
  background: COLORS.blueSoft,
  border: `1px solid ${COLORS.blueBorder}`,
  padding: "4px",
  borderRadius: "16px",
};

const langButton: CSSProperties = {
  border: "none",
  background: "transparent",
  color: COLORS.sub,
  padding: "10px 14px",
  borderRadius: "10px",
  fontWeight: 800,
  cursor: "pointer",
};

const langActive: CSSProperties = {
  border: "none",
  background: COLORS.blue,
  color: "#fff",
  padding: "10px 14px",
  borderRadius: "10px",
  fontWeight: 800,
  cursor: "pointer",
};

const messageBox: CSSProperties = {
  background: COLORS.blueSoft,
  border: `1px solid ${COLORS.blueBorder}`,
  color: COLORS.blueDark,
  borderRadius: "16px",
  padding: "14px 16px",
  fontWeight: 700,
};

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "22px",
  alignItems: "start",
};

const leftCol: CSSProperties = {
  display: "grid",
  gap: "22px",
};

const rightCol: CSSProperties = {
  display: "grid",
  gap: "22px",
};

const panel: CSSProperties = {
  background: COLORS.card,
  border: `1px solid ${COLORS.border}`,
  borderRadius: "28px",
  boxShadow: COLORS.shadow,
  padding: "24px",
};

const panelTitle: CSSProperties = {
  margin: 0,
  fontSize: "30px",
  fontWeight: 800,
  color: COLORS.text,
};

const panelSub: CSSProperties = {
  marginTop: "8px",
  color: COLORS.sub,
  fontSize: "15px",
  lineHeight: 1.55,
};

const panelRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const label: CSSProperties = {
  display: "block",
  marginTop: "18px",
  marginBottom: "8px",
  fontWeight: 800,
  fontSize: "16px",
  color: "#334155",
};

const input: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "16px 18px",
  borderRadius: "16px",
  border: `1px solid ${COLORS.border}`,
  background: "#ffffff",
  color: COLORS.text,
  fontSize: "16px",
  outline: "none",
};

const textarea: CSSProperties = {
  width: "100%",
  minHeight: "128px",
  resize: "vertical",
  boxSizing: "border-box",
  padding: "16px 18px",
  borderRadius: "16px",
  border: `1px solid ${COLORS.border}`,
  background: "#ffffff",
  color: COLORS.text,
  fontSize: "16px",
  outline: "none",
};

const uploadCard: CSSProperties = {
  marginTop: "8px",
  width: "100%",
  minHeight: "170px",
  borderRadius: "20px",
  border: `1px dashed ${COLORS.blueBorder}`,
  background: COLORS.blueSoft,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  cursor: "pointer",
  position: "relative",
};

const uploadInner: CSSProperties = {
  textAlign: "center",
  padding: "18px",
};

const uploadTitle: CSSProperties = {
  color: COLORS.blueDark,
  fontWeight: 800,
  fontSize: "16px",
};

const uploadSub: CSSProperties = {
  marginTop: "6px",
  color: COLORS.sub,
  fontSize: "14px",
};

const uploadOptional: CSSProperties = {
  marginTop: "8px",
  color: COLORS.sub,
  fontSize: "12px",
  fontWeight: 700,
};

const uploadPreview: CSSProperties = {
  width: "100%",
  height: "170px",
  objectFit: "cover",
};

const hiddenFileInput: CSSProperties = {
  display: "none",
};

const primaryButton: CSSProperties = {
  marginTop: "18px",
  width: "100%",
  padding: "16px 18px",
  borderRadius: "18px",
  border: "none",
  background: COLORS.blue,
  color: "#fff",
  fontWeight: 800,
  fontSize: "17px",
  cursor: "pointer",
  boxShadow: "0 12px 28px rgba(37,99,235,0.22)",
};

const imageGrid: CSSProperties = {
  marginTop: "18px",
  display: "grid",
  gridTemplateColumns: "1.1fr 0.9fr",
  gap: "16px",
};

const uploadLabel: CSSProperties = {
  fontWeight: 800,
  color: "#334155",
  marginBottom: "8px",
};

const storeUploadCard: CSSProperties = {
  width: "100%",
  minHeight: "180px",
  borderRadius: "22px",
  border: `1px dashed ${COLORS.blueBorder}`,
  background: COLORS.blueSoft,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  cursor: "pointer",
};

const storeUploadCardSmall: CSSProperties = {
  width: "100%",
  minHeight: "180px",
  borderRadius: "22px",
  border: `1px dashed ${COLORS.blueBorder}`,
  background: COLORS.blueSoft,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  cursor: "pointer",
};

const storeUploadPreviewWide: CSSProperties = {
  width: "100%",
  minHeight: "180px",
  objectFit: "cover",
};

const storeUploadPreviewSmall: CSSProperties = {
  width: "100%",
  minHeight: "180px",
  objectFit: "contain",
  background: "#fff",
};

const uploadState: CSSProperties = {
  marginTop: "8px",
  color: COLORS.sub,
  fontWeight: 600,
  fontSize: "14px",
};

const toggleRow: CSSProperties = {
  marginTop: "10px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: COLORS.sub,
  fontWeight: 700,
};

const storeActionWrap: CSSProperties = {
  display: "grid",
  gap: "8px",
  justifyItems: "end",
};

const storeActionLabel: CSSProperties = {
  color: COLORS.sub,
  fontWeight: 700,
};

const storeButton: CSSProperties = {
  textDecoration: "none",
  background: COLORS.blue,
  color: "#fff",
  borderRadius: "14px",
  padding: "12px 16px",
  fontWeight: 800,
};

const storeButtonDisabled: CSSProperties = {
  textDecoration: "none",
  background: "#cbd5e1",
  color: "#fff",
  borderRadius: "14px",
  padding: "12px 16px",
  fontWeight: 800,
  pointerEvents: "none",
};

const emptyBox: CSSProperties = {
  marginTop: "18px",
  padding: "18px",
  borderRadius: "18px",
  background: "#f8fafc",
  border: `1px solid ${COLORS.border}`,
  color: COLORS.sub,
  fontWeight: 600,
};

const menuList: CSSProperties = {
  marginTop: "18px",
  display: "grid",
  gap: "14px",
};

const menuCard: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "92px 1fr auto",
  gap: "14px",
  alignItems: "center",
  padding: "14px",
  borderRadius: "20px",
  border: `1px solid ${COLORS.border}`,
  background: "#fff",
};

const menuImage: CSSProperties = {
  width: "92px",
  height: "92px",
  objectFit: "cover",
  borderRadius: "18px",
  border: `1px solid ${COLORS.border}`,
};

const menuImagePlaceholder: CSSProperties = {
  width: "92px",
  height: "92px",
  borderRadius: "18px",
  border: `1px solid ${COLORS.border}`,
  background: "#f8fafc",
  color: "#94a3b8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: "12px",
};

const menuInfo: CSSProperties = {
  minWidth: 0,
};

const menuName: CSSProperties = {
  fontWeight: 800,
  fontSize: "24px",
  lineHeight: 1.15,
  color: COLORS.text,
};

const menuPrice: CSSProperties = {
  marginTop: "8px",
  color: COLORS.sub,
  fontSize: "18px",
  fontWeight: 800,
};

const menuDesc: CSSProperties = {
  marginTop: "8px",
  color: COLORS.sub,
  fontSize: "15px",
  lineHeight: 1.55,
};

const removeButton: CSSProperties = {
  border: "none",
  background: COLORS.redSoft,
  color: COLORS.redText,
  borderRadius: "14px",
  padding: "12px 14px",
  fontWeight: 800,
  cursor: "pointer",
};

const previewCard: CSSProperties = {
  marginTop: "18px",
  borderRadius: "24px",
  overflow: "hidden",
  border: `1px solid ${COLORS.border}`,
  background: "#fff",
};

const previewHero: CSSProperties = {
  height: "280px",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
};

const previewOverlay: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg, rgba(15,23,42,0.10), rgba(15,23,42,0.58))",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  padding: "20px",
};

const previewLogo: CSSProperties = {
  width: "72px",
  height: "72px",
  objectFit: "cover",
  borderRadius: "18px",
  background: "#fff",
  marginBottom: "12px",
};

const previewName: CSSProperties = {
  color: "#fff",
  fontSize: "34px",
  fontWeight: 900,
  lineHeight: 1.05,
};

const previewMeta: CSSProperties = {
  color: "rgba(255,255,255,0.9)",
  fontSize: "14px",
  fontWeight: 700,
  marginTop: "8px",
};

const previewHeroFallback: CSSProperties = {
  height: "220px",
  background: COLORS.blueSoft,
  color: COLORS.blueDark,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  textAlign: "center",
  fontWeight: 700,
};

const previewBody: CSSProperties = {
  padding: "18px",
  display: "grid",
  gap: "12px",
};

const previewMenuRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
};

const previewMenuLeft: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  minWidth: 0,
};

const previewThumb: CSSProperties = {
  width: "58px",
  height: "58px",
  objectFit: "cover",
  borderRadius: "14px",
};

const previewThumbPlaceholder: CSSProperties = {
  width: "58px",
  height: "58px",
  borderRadius: "14px",
  background: "#f3f4f6",
  color: "#94a3b8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: "11px",
};

const previewItemName: CSSProperties = {
  fontWeight: 800,
  color: COLORS.text,
};

const previewItemDesc: CSSProperties = {
  marginTop: "4px",
  color: COLORS.sub,
  fontSize: "13px",
};

const previewItemPrice: CSSProperties = {
  fontWeight: 800,
  color: COLORS.text,
};

const previewEmpty: CSSProperties = {
  color: COLORS.sub,
  fontWeight: 600,
};

const loadingWrap: CSSProperties = {
  minHeight: "80vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
  fontWeight: 800,
  color: COLORS.text,
};
