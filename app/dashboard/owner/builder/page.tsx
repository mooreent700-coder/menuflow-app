'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Lang = 'en' | 'es';

type RestaurantRow = {
  id: string;
  owner_id: string;
  name: string | null;
  slug: string | null;
  phone: string | null;
  address: string | null;
  hours: string | null;
  hero_url: string | null;
  logo_url: string | null;
  hide_hero: boolean | null;
  hide_logo: boolean | null;
};

type MenuItemRow = {
  id: string;
  restaurant_id: string;
  name: string | null;
  price: number | string | null;
  description: string | null;
  image_url: string | null;
  created_at?: string | null;
};

const STORAGE_BUCKET = 'menuflow-media';

const copy = {
  en: {
    eyebrow: 'MenuFlow Builder',
    title: 'Add and manage menu items',
    subtitle: 'Update your menu, store images, and storefront preview.',
    signedIn: 'Signed in as:',
    back: 'Back to Dashboard',
    businessInfo: 'Business Information',
    businessName: 'Business Name',
    storeSlug: 'Store Slug',
    phone: 'Phone Number',
    address: 'Address',
    hours: 'Hours',
    saveBusiness: 'Save Business Information',
    savingBusiness: 'Saving...',
    stripe: 'Stripe Payments',
    stripeText:
      'Connect your Stripe account to receive payouts and let MenuFlow take the correct platform fee automatically.',
    platformFee: 'Platform fee',
    onboardingComplete: 'Onboarding complete',
    onboardingIncomplete: 'Onboarding incomplete',
    chargesEnabled: 'Charges enabled',
    payoutsEnabled: 'Payouts enabled',
    connectStripe: 'Connect Stripe',
    refreshStripe: 'Refresh Stripe',
    addItem: 'Add Menu Item',
    itemName: 'Item Name',
    price: 'Price',
    description: 'Description',
    itemImage: 'Menu Item Image',
    uploadItemImage: 'Upload Menu Image',
    uploadItemImageSub: 'Click to upload • PNG, JPG, or WEBP',
    imageOptional: 'Image optional',
    addMenuItem: 'Add Menu Item',
    addingItem: 'Adding...',
    currentMenu: 'Current Menu',
    itemsCount: 'items',
    viewStore: 'View Store',
    noItems: 'No menu items yet.',
    storePreview: 'Store Preview',
    previewText: 'Live MenuFlow storefront look',
    heroPreview: 'Hero image preview will show here.',
    storeImages: 'Store Images',
    storeImagesText: 'Change hero and logo whenever you need.',
    heroImage: 'Hero Image',
    logoImage: 'Logo Image',
    uploadHero: 'Upload Hero',
    uploadLogo: 'Upload Logo',
    uploadBoxText: 'Click to upload • PNG, JPG, or WEBP',
    hideHero: 'Hide Hero',
    hideLogo: 'Hide Logo',
    loading: 'Loading builder...',
    notSignedIn: 'You are not signed in.',
    loadFailed: 'Failed to load builder.',
    businessSaved: 'Business information saved.',
    itemAdded: 'Menu item added.',
    uploadFailed: 'Upload failed.',
    saveFailed: 'Save failed.',
    builderFailed: 'Builder action failed.',
    heroAlt: 'Hero preview',
    logoAlt: 'Logo preview',
    menuImageAlt: 'Menu item preview',
    yourStore: 'Your Store',
    phonePlaceholder: '(323) 555-1234',
    addressPlaceholder: '123 Main St, City, State',
    hoursPlaceholder: 'Mon-Sat 10am - 8pm',
    itemNamePlaceholder: 'Taco Plate',
    pricePlaceholder: '12.99',
    descriptionPlaceholder: 'Fresh food made to order',
    noSlug: 'No slug yet',
    noBusiness: 'Business name missing',
  },
  es: {
    eyebrow: 'Constructor MenuFlow',
    title: 'Agrega y administra productos del menú',
    subtitle: 'Actualiza tu menú, imágenes de tienda y vista previa del storefront.',
    signedIn: 'Sesión iniciada como:',
    back: 'Volver al Panel',
    businessInfo: 'Información del Negocio',
    businessName: 'Nombre del Negocio',
    storeSlug: 'Slug de la Tienda',
    phone: 'Número de Teléfono',
    address: 'Dirección',
    hours: 'Horario',
    saveBusiness: 'Guardar Información del Negocio',
    savingBusiness: 'Guardando...',
    stripe: 'Pagos con Stripe',
    stripeText:
      'Conecta tu cuenta de Stripe para recibir pagos y permitir que MenuFlow cobre la tarifa correcta automáticamente.',
    platformFee: 'Tarifa de plataforma',
    onboardingComplete: 'Onboarding completo',
    onboardingIncomplete: 'Onboarding incompleto',
    chargesEnabled: 'Cobros habilitados',
    payoutsEnabled: 'Pagos habilitados',
    connectStripe: 'Conectar Stripe',
    refreshStripe: 'Actualizar Stripe',
    addItem: 'Agregar Producto',
    itemName: 'Nombre del Producto',
    price: 'Precio',
    description: 'Descripción',
    itemImage: 'Imagen del Producto',
    uploadItemImage: 'Subir Imagen del Menú',
    uploadItemImageSub: 'Haz clic para subir • PNG, JPG o WEBP',
    imageOptional: 'Imagen opcional',
    addMenuItem: 'Agregar Producto',
    addingItem: 'Agregando...',
    currentMenu: 'Menú Actual',
    itemsCount: 'productos',
    viewStore: 'Ver Tienda',
    noItems: 'Todavía no hay productos.',
    storePreview: 'Vista Previa de la Tienda',
    previewText: 'Vista real del storefront de MenuFlow',
    heroPreview: 'La vista previa del hero aparecerá aquí.',
    storeImages: 'Imágenes de la Tienda',
    storeImagesText: 'Cambia el hero y el logo cuando quieras.',
    heroImage: 'Imagen Hero',
    logoImage: 'Imagen Logo',
    uploadHero: 'Subir Hero',
    uploadLogo: 'Subir Logo',
    uploadBoxText: 'Haz clic para subir • PNG, JPG o WEBP',
    hideHero: 'Ocultar Hero',
    hideLogo: 'Ocultar Logo',
    loading: 'Cargando constructor...',
    notSignedIn: 'No has iniciado sesión.',
    loadFailed: 'No se pudo cargar el constructor.',
    businessSaved: 'Información del negocio guardada.',
    itemAdded: 'Producto agregado.',
    uploadFailed: 'La subida falló.',
    saveFailed: 'No se pudo guardar.',
    builderFailed: 'La acción del constructor falló.',
    heroAlt: 'Vista previa del hero',
    logoAlt: 'Vista previa del logo',
    menuImageAlt: 'Vista previa del producto',
    yourStore: 'Tu Tienda',
    phonePlaceholder: '(323) 555-1234',
    addressPlaceholder: '123 Main St, City, State',
    hoursPlaceholder: 'Lun-Sáb 10am - 8pm',
    itemNamePlaceholder: 'Plato de tacos',
    pricePlaceholder: '12.99',
    descriptionPlaceholder: 'Comida fresca hecha al momento',
    noSlug: 'Todavía no hay slug',
    noBusiness: 'Falta nombre del negocio',
  },
} as const;

function formatPrice(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);
  if (Number.isNaN(numeric)) return '$0.00';
  return `$${numeric.toFixed(2)}`;
}

function getSignedImagePath(folder: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '-');
  return `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
}

export default function MenuBuilderPage() {
  const router = useRouter();

  const [lang, setLang] = useState<Lang>('en');
  const t = copy[lang];

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState('');
  const [heroUrl, setHeroUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [hideHero, setHideHero] = useState(false);
  const [hideLogo, setHideLogo] = useState(false);

  const [menuName, setMenuName] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [menuDescription, setMenuDescription] = useState('');
  const [menuImageFile, setMenuImageFile] = useState<File | null>(null);
  const [menuImagePreview, setMenuImagePreview] = useState('');

  const [heroUploading, setHeroUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [addingItem, setAddingItem] = useState(false);

  const [menuItems, setMenuItems] = useState<MenuItemRow[]>([]);

  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const menuImageInputRef = useRef<HTMLInputElement | null>(null);

  const itemCountLabel = useMemo(() => {
    return `${menuItems.length} ${t.itemsCount}`;
  }, [menuItems.length, t.itemsCount]);

  useEffect(() => {
    let mounted = true;

    const loadBuilder = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const user = session?.user;
        if (!user) {
          alert(t.notSignedIn);
          router.push('/auth/login');
          return;
        }

        const email = user.email ?? '';
        if (mounted) setUserEmail(email);

        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select(
            'id, owner_id, name, slug, phone, address, hours, hero_url, logo_url, hide_hero, hide_logo'
          )
          .eq('owner_id', user.id)
          .maybeSingle();

        if (restaurantError) throw restaurantError;

        const restaurant = restaurantData as RestaurantRow | null;

        if (mounted && restaurant) {
          setRestaurantId(restaurant.id);
          setBusinessName(restaurant.name ?? '');
          setSlug(restaurant.slug ?? '');
          setPhone(restaurant.phone ?? '');
          setAddress(restaurant.address ?? '');
          setHours(restaurant.hours ?? '');
          setHeroUrl(restaurant.hero_url ?? '');
          setLogoUrl(restaurant.logo_url ?? '');
          setHideHero(Boolean(restaurant.hide_hero));
          setHideLogo(Boolean(restaurant.hide_logo));
        }

        if (restaurant?.id) {
          const { data: itemData, error: itemError } = await supabase
            .from('menu_items')
            .select('id, restaurant_id, name, price, description, image_url, created_at')
            .eq('restaurant_id', restaurant.id)
            .order('created_at', { ascending: false });

          if (itemError) throw itemError;

          if (mounted) {
            setMenuItems((itemData ?? []) as MenuItemRow[]);
          }
        }
      } catch (error: any) {
        alert(error?.message || t.loadFailed);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadBuilder();

    return () => {
      mounted = false;
    };
  }, [router, t.loadFailed, t.notSignedIn]);

  const uploadToStorage = async (folder: string, file: File) => {
    const filePath = getSignedImagePath(folder, file.name);

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const refreshMenuItems = async (targetRestaurantId: string) => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, restaurant_id, name, price, description, image_url, created_at')
      .eq('restaurant_id', targetRestaurantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setMenuItems((data ?? []) as MenuItemRow[]);
  };

  const handleHeroUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !restaurantId) return;

      setHeroUploading(true);
      const publicUrl = await uploadToStorage('hero-images', file);

      const { error } = await supabase
        .from('restaurants')
        .update({ hero_url: publicUrl })
        .eq('id', restaurantId);

      if (error) throw error;

      setHeroUrl(publicUrl);
    } catch (error: any) {
      alert(error?.message || t.uploadFailed);
    } finally {
      setHeroUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !restaurantId) return;

      setLogoUploading(true);
      const publicUrl = await uploadToStorage('logo-images', file);

      const { error } = await supabase
        .from('restaurants')
        .update({ logo_url: publicUrl })
        .eq('id', restaurantId);

      if (error) throw error;

      setLogoUrl(publicUrl);
    } catch (error: any) {
      alert(error?.message || t.uploadFailed);
    } finally {
      setLogoUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleMenuImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setMenuImageFile(file);

    if (file) {
      setMenuImagePreview(URL.createObjectURL(file));
    } else {
      setMenuImagePreview('');
    }
  };

  const handleSaveBusiness = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!restaurantId) return;

    try {
      setSavingBusiness(true);

      const { error } = await supabase
        .from('restaurants')
        .update({
          name: businessName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          hours: hours.trim(),
          hide_hero: hideHero,
          hide_logo: hideLogo,
        })
        .eq('id', restaurantId);

      if (error) throw error;

      alert(t.businessSaved);
    } catch (error: any) {
      alert(error?.message || t.saveFailed);
    } finally {
      setSavingBusiness(false);
    }
  };

  const handleAddMenuItem = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!restaurantId) return;

    try {
      setAddingItem(true);

      let imageUrl = '';
      if (menuImageFile) {
        imageUrl = await uploadToStorage('menu-items', menuImageFile);
      }

      const numericPrice = Number(menuPrice);
      if (Number.isNaN(numericPrice)) {
        alert('Price must be a valid number.');
        return;
      }

      const { error } = await supabase.from('menu_items').insert({
        restaurant_id: restaurantId,
        name: menuName.trim(),
        price: numericPrice,
        description: menuDescription.trim(),
        image_url: imageUrl || null,
      });

      if (error) throw error;

      setMenuName('');
      setMenuPrice('');
      setMenuDescription('');
      setMenuImageFile(null);
      setMenuImagePreview('');

      await refreshMenuItems(restaurantId);
      alert(t.itemAdded);
    } catch (error: any) {
      alert(error?.message || t.builderFailed);
    } finally {
      setAddingItem(false);
    }
  };

  const handleViewStore = () => {
    if (!slug) {
      alert(t.noSlug);
      return;
    }

    router.push(`/store/${slug}`);
  };

  const heroVisible = Boolean(heroUrl) && !hideHero;
  const logoVisible = Boolean(logoUrl) && !hideLogo;

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
            color: #142132;
            font-size: 18px;
            font-weight: 800;
            font-family:
              Inter,
              ui-sans-serif,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              'Segoe UI',
              sans-serif;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="hero">
        <div className="heroTop">
          <div>
            <div className="eyebrow">{t.eyebrow}</div>
            <h1 className="title">{t.title}</h1>
            <p className="subtitle">{t.subtitle}</p>
            <div className="signedIn">
              {t.signedIn} <strong>{userEmail}</strong>
            </div>
          </div>

          <div className="topActions">
            <Link href="/dashboard" className="backButton">
              {t.back}
            </Link>

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
        </div>
      </section>

      <section className="contentGrid">
        <div className="leftCol">
          <form onSubmit={handleAddMenuItem} className="card">
            <h2 className="cardTitle">{t.addItem}</h2>

            <label className="label">{t.itemName}</label>
            <input
              className="input"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              placeholder={t.itemNamePlaceholder}
              required
            />

            <label className="label">{t.price}</label>
            <input
              className="input"
              value={menuPrice}
              onChange={(e) => setMenuPrice(e.target.value)}
              placeholder={t.pricePlaceholder}
              inputMode="decimal"
              required
            />

            <label className="label">{t.description}</label>
            <textarea
              className="textarea"
              value={menuDescription}
              onChange={(e) => setMenuDescription(e.target.value)}
              placeholder={t.descriptionPlaceholder}
              required
            />

            <label className="label">{t.itemImage}</label>
            <input
              ref={menuImageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleMenuImageSelect}
              className="hiddenInput"
            />

            <button
              type="button"
              className="uploadBox"
              onClick={() => menuImageInputRef.current?.click()}
            >
              {menuImagePreview ? (
                <div className="uploadPreviewWrap">
                  <img src={menuImagePreview} alt={t.menuImageAlt} className="uploadPreviewImage" />
                </div>
              ) : (
                <>
                  <span className="uploadTitle">{t.uploadItemImage}</span>
                  <span className="uploadText">{t.uploadItemImageSub}</span>
                  <span className="uploadText small">{t.imageOptional}</span>
                </>
              )}
            </button>

            <button type="submit" className="primaryButton" disabled={addingItem}>
              {addingItem ? t.addingItem : t.addMenuItem}
            </button>
          </form>

          <div className="card">
            <div className="twoColHeader">
              <div>
                <h2 className="cardTitle">{t.currentMenu}</h2>
                <div className="muted">{itemCountLabel}</div>
              </div>

              <button type="button" className="secondaryButton" onClick={handleViewStore}>
                {t.viewStore}
              </button>
            </div>

            <div className="menuList">
              {menuItems.length === 0 ? (
                <div className="emptyBox">{t.noItems}</div>
              ) : (
                menuItems.map((item) => (
                  <div key={item.id} className="menuItemCard">
                    <div className="menuItemTop">
                      <div>
                        <div className="menuItemName">{item.name || 'Untitled item'}</div>
                        <div className="menuItemPrice">{formatPrice(item.price)}</div>
                      </div>

                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name || t.menuImageAlt}
                          className="menuThumb"
                        />
                      ) : null}
                    </div>

                    {item.description ? <div className="menuItemDescription">{item.description}</div> : null}
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleSaveBusiness} className="card">
            <h2 className="cardTitle">{t.businessInfo}</h2>

            <label className="label">{t.businessName}</label>
            <input
              className="input"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={t.noBusiness}
              required
            />

            <label className="label">{t.storeSlug}</label>
            <input className="input" value={slug} disabled />

            <label className="label">{t.phone}</label>
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t.phonePlaceholder}
            />

            <label className="label">{t.address}</label>
            <input
              className="input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t.addressPlaceholder}
            />

            <label className="label">{t.hours}</label>
            <input
              className="input"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder={t.hoursPlaceholder}
            />

            <button type="submit" className="saveButton" disabled={savingBusiness}>
              {savingBusiness ? t.savingBusiness : t.saveBusiness}
            </button>
          </form>
        </div>

        <div className="rightCol">
          <div className="card previewCard">
            <div className="twoColHeader">
              <div>
                <h2 className="cardTitle">{t.storePreview}</h2>
                <div className="muted">{t.previewText}</div>
              </div>

              <div className="slugTag">/store/{slug || t.noSlug}</div>
            </div>

            <div className="previewPhone">
              {logoVisible ? (
                <div className="previewLogoWrap">
                  <img src={logoUrl} alt={t.logoAlt} className="previewLogo" />
                </div>
              ) : null}

              <div className="previewBusiness">{businessName || t.noBusiness}</div>

              {heroVisible ? (
                <div className="previewHeroWrap">
                  <img src={heroUrl} alt={t.heroAlt} className="previewHeroImage" />
                </div>
              ) : (
                <div className="previewHeroPlaceholder">{t.heroPreview}</div>
              )}

              <div className="previewMenuSection">
                {menuItems.length === 0 ? (
                  <div className="previewEmpty">{t.noItems}</div>
                ) : (
                  menuItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="previewMenuItem">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name || t.menuImageAlt}
                          className="previewMenuImage"
                        />
                      ) : null}
                      <div className="previewMenuText">
                        <div className="previewMenuName">{item.name}</div>
                        <div className="previewMenuPrice">{formatPrice(item.price)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="cardTitle">{t.storeImages}</h2>
            <p className="muted imageText">{t.storeImagesText}</p>

            <div className="imageGrid">
              <div>
                <div className="label">{t.heroImage}</div>
                <input
                  ref={heroInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleHeroUpload}
                  className="hiddenInput"
                />
                <button
                  type="button"
                  className="imageUploadBox"
                  onClick={() => heroInputRef.current?.click()}
                >
                  {heroUrl ? (
                    <div className="imagePreviewWrap">
                      <img src={heroUrl} alt={t.heroAlt} className="imagePreview" />
                    </div>
                  ) : (
                    <>
                      <span className="uploadTitle">
                        {heroUploading ? 'Uploading...' : t.uploadHero}
                      </span>
                      <span className="uploadText">{t.uploadBoxText}</span>
                    </>
                  )}
                </button>

                <label className="checkboxRow">
                  <input
                    type="checkbox"
                    checked={hideHero}
                    onChange={(e) => setHideHero(e.target.checked)}
                  />
                  <span>{t.hideHero}</span>
                </label>
              </div>

              <div>
                <div className="label">{t.logoImage}</div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoUpload}
                  className="hiddenInput"
                />
                <button
                  type="button"
                  className="imageUploadBox"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {logoUrl ? (
                    <div className="imagePreviewWrap">
                      <img src={logoUrl} alt={t.logoAlt} className="imagePreview" />
                    </div>
                  ) : (
                    <>
                      <span className="uploadTitle">
                        {logoUploading ? 'Uploading...' : t.uploadLogo}
                      </span>
                      <span className="uploadText">{t.uploadBoxText}</span>
                    </>
                  )}
                </button>

                <label className="checkboxRow">
                  <input
                    type="checkbox"
                    checked={hideLogo}
                    onChange={(e) => setHideLogo(e.target.checked)}
                  />
                  <span>{t.hideLogo}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="cardTitle">{t.stripe}</h2>
            <p className="muted">{t.stripeText}</p>

            <div className="stripeGrid">
              <div className="stripeStat">
                <div className="stripeLabel">{t.platformFee}</div>
                <div className="stripeValue">--</div>
              </div>
              <div className="stripeStat">
                <div className="stripeLabel">{t.onboardingComplete}</div>
                <div className="stripeValue">{t.onboardingIncomplete}</div>
              </div>
              <div className="stripeStat">
                <div className="stripeLabel">{t.chargesEnabled}</div>
                <div className="stripeValue">--</div>
              </div>
              <div className="stripeStat">
                <div className="stripeLabel">{t.payoutsEnabled}</div>
                <div className="stripeValue">--</div>
              </div>
            </div>

            <div className="stripeButtons">
              <button type="button" className="saveButton mutedButton">
                {t.connectStripe}
              </button>
              <button type="button" className="secondaryButton">
                {t.refreshStripe}
              </button>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: linear-gradient(180deg, #f6f8fd 0%, #eef3fb 100%);
          color: #142132;
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

        .hero {
          max-width: 1400px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(20, 33, 50, 0.08);
          border-radius: 34px;
          padding: 28px;
          box-shadow: 0 20px 46px rgba(15, 23, 42, 0.06);
        }

        .heroTop {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .eyebrow {
          color: #5b88ea;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .title {
          margin: 14px 0 0;
          font-size: clamp(42px, 7vw, 84px);
          line-height: 0.96;
          letter-spacing: -0.06em;
          font-weight: 900;
          color: #142132;
          max-width: 680px;
        }

        .subtitle {
          margin-top: 18px;
          color: #5a6473;
          font-size: clamp(18px, 2vw, 28px);
          line-height: 1.5;
          font-weight: 600;
          max-width: 760px;
        }

        .signedIn {
          margin-top: 20px;
          color: #5a6473;
          font-size: 16px;
          font-weight: 700;
        }

        .signedIn strong {
          color: #142132;
        }

        .topActions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .backButton,
        .secondaryButton,
        .saveButton,
        .primaryButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          text-decoration: none;
          cursor: pointer;
          font-weight: 900;
          transition: transform 0.15s ease, opacity 0.15s ease;
        }

        .backButton {
          min-height: 62px;
          padding: 0 28px;
          border-radius: 20px;
          background: #fff;
          border: 1px solid rgba(20, 33, 50, 0.1);
          color: #142132;
          font-size: 18px;
        }

        .langWrap {
          display: inline-flex;
          border: 1px solid rgba(91, 136, 234, 0.22);
          background: #eef4ff;
          padding: 5px;
          border-radius: 18px;
        }

        .langButton {
          border: none;
          background: transparent;
          color: #6b7686;
          min-width: 70px;
          min-height: 58px;
          border-radius: 14px;
          font-size: 18px;
          font-weight: 900;
          cursor: pointer;
        }

        .activeLang {
          background: #5b88ea;
          color: #fff;
        }

        .contentGrid {
          max-width: 1400px;
          margin: 18px auto 0;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
          gap: 20px;
          align-items: start;
        }

        .leftCol,
        .rightCol {
          display: grid;
          gap: 20px;
        }

        .card {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(20, 33, 50, 0.08);
          border-radius: 30px;
          padding: 26px;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.05);
        }

        .cardTitle {
          margin: 0;
          color: #142132;
          font-size: clamp(28px, 3vw, 52px);
          line-height: 1.02;
          letter-spacing: -0.05em;
          font-weight: 900;
        }

        .label {
          display: block;
          margin-top: 18px;
          color: #142132;
          font-size: 16px;
          font-weight: 800;
        }

        .input,
        .textarea {
          width: 100%;
          margin-top: 10px;
          border-radius: 18px;
          border: 1px solid rgba(20, 33, 50, 0.1);
          background: #fff;
          color: #142132;
          font-size: 18px;
          font-weight: 600;
          padding: 16px 18px;
          outline: none;
          box-sizing: border-box;
        }

        .input {
          min-height: 64px;
        }

        .textarea {
          min-height: 150px;
          resize: vertical;
        }

        .hiddenInput {
          display: none;
        }

        .uploadBox,
        .imageUploadBox {
          width: 100%;
          margin-top: 10px;
          min-height: 220px;
          border-radius: 24px;
          border: 2px dashed rgba(91, 136, 234, 0.2);
          background: #f4f7ff;
          color: #5b88ea;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
          padding: 18px;
          cursor: pointer;
        }

        .uploadTitle {
          font-size: 20px;
          font-weight: 900;
          text-align: center;
        }

        .uploadText {
          color: #5a6473;
          font-size: 16px;
          line-height: 1.45;
          text-align: center;
          font-weight: 700;
        }

        .uploadText.small {
          font-size: 14px;
        }

        .uploadPreviewWrap,
        .imagePreviewWrap {
          width: 100%;
          height: 100%;
          border-radius: 20px;
          overflow: hidden;
        }

        .uploadPreviewImage,
        .imagePreview {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 20px;
        }

        .primaryButton,
        .saveButton,
        .secondaryButton {
          min-height: 70px;
          border-radius: 20px;
          font-size: 20px;
          margin-top: 18px;
        }

        .primaryButton,
        .secondaryButton {
          padding: 0 24px;
        }

        .primaryButton {
          width: 100%;
          background: #5b88ea;
          color: #fff;
        }

        .saveButton {
          width: 100%;
          background: #4da751;
          color: #fff;
        }

        .secondaryButton {
          background: #eef4ff;
          color: #4d7de8;
        }

        .mutedButton {
          background: #4da751;
          color: #fff;
        }

        .twoColHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .muted {
          margin-top: 10px;
          color: #5a6473;
          font-size: 18px;
          line-height: 1.5;
          font-weight: 700;
        }

        .menuList {
          margin-top: 18px;
          display: grid;
          gap: 14px;
        }

        .emptyBox {
          margin-top: 8px;
          border-radius: 18px;
          background: #f7f8fb;
          border: 1px solid rgba(20, 33, 50, 0.08);
          padding: 22px;
          color: #6c7685;
          font-size: 18px;
          font-weight: 700;
        }

        .menuItemCard {
          border-radius: 20px;
          background: #f9fbff;
          border: 1px solid rgba(20, 33, 50, 0.08);
          padding: 16px;
        }

        .menuItemTop {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .menuItemName {
          color: #142132;
          font-size: 22px;
          font-weight: 900;
          line-height: 1.1;
        }

        .menuItemPrice {
          margin-top: 8px;
          color: #5b88ea;
          font-size: 18px;
          font-weight: 900;
        }

        .menuItemDescription {
          margin-top: 12px;
          color: #5a6473;
          font-size: 15px;
          line-height: 1.55;
          font-weight: 700;
        }

        .menuThumb {
          width: 84px;
          height: 84px;
          object-fit: cover;
          border-radius: 16px;
          flex-shrink: 0;
        }

        .previewCard {
          position: sticky;
          top: 18px;
        }

        .slugTag {
          color: #6c7685;
          font-size: 16px;
          font-weight: 800;
        }

        .previewPhone {
          margin-top: 18px;
          border-radius: 30px;
          border: 1px solid rgba(91, 136, 234, 0.16);
          background: #fbfdff;
          padding: 20px;
          overflow: hidden;
        }

        .previewLogoWrap {
          width: 72px;
          height: 72px;
          border-radius: 18px;
          overflow: hidden;
          margin-bottom: 14px;
        }

        .previewLogo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .previewBusiness {
          font-size: clamp(28px, 3vw, 42px);
          font-weight: 900;
          color: #142132;
          letter-spacing: -0.04em;
          line-height: 1.05;
        }

        .previewHeroWrap {
          margin-top: 18px;
          width: 100%;
          height: 220px;
          border-radius: 24px;
          overflow: hidden;
          background: #eef4ff;
        }

        .previewHeroImage {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .previewHeroPlaceholder {
          margin-top: 18px;
          border-radius: 24px;
          min-height: 220px;
          background: #eef4ff;
          border: 1px dashed rgba(91, 136, 234, 0.2);
          color: #5b88ea;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 18px;
          font-size: 18px;
          line-height: 1.5;
          font-weight: 900;
        }

        .previewMenuSection {
          margin-top: 18px;
          display: grid;
          gap: 12px;
        }

        .previewEmpty {
          border-radius: 20px;
          background: #fff;
          border: 1px solid rgba(20, 33, 50, 0.08);
          padding: 18px;
          color: #6c7685;
          font-size: 16px;
          font-weight: 800;
        }

        .previewMenuItem {
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 18px;
          background: #fff;
          border: 1px solid rgba(20, 33, 50, 0.08);
          padding: 12px;
        }

        .previewMenuImage {
          width: 68px;
          height: 68px;
          border-radius: 14px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .previewMenuText {
          min-width: 0;
        }

        .previewMenuName {
          font-size: 18px;
          color: #142132;
          font-weight: 900;
          line-height: 1.15;
        }

        .previewMenuPrice {
          margin-top: 6px;
          color: #5b88ea;
          font-size: 15px;
          font-weight: 900;
        }

        .imageGrid {
          margin-top: 12px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .imageText {
          max-width: 580px;
        }

        .checkboxRow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 14px;
          color: #142132;
          font-size: 16px;
          font-weight: 800;
        }

        .checkboxRow input {
          width: 18px;
          height: 18px;
        }

        .stripeGrid {
          margin-top: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .stripeStat {
          border-radius: 20px;
          background: #f8f9fc;
          border: 1px solid rgba(20, 33, 50, 0.08);
          padding: 18px;
        }

        .stripeLabel {
          color: #6c7685;
          font-size: 15px;
          line-height: 1.35;
          font-weight: 800;
        }

        .stripeValue {
          margin-top: 10px;
          color: #142132;
          font-size: 18px;
          line-height: 1.4;
          font-weight: 900;
          word-break: break-word;
        }

        .stripeButtons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 18px;
        }

        .stripeButtons :global(button) {
          flex: 1 1 220px;
          margin-top: 0;
        }

        @media (max-width: 980px) {
          .page {
            padding: 12px;
          }

          .hero {
            padding: 20px;
            border-radius: 26px;
          }

          .title {
            font-size: clamp(34px, 12vw, 58px);
          }

          .subtitle {
            font-size: 18px;
          }

          .backButton {
            width: 100%;
          }

          .contentGrid {
            grid-template-columns: 1fr;
          }

          .previewCard {
            position: static;
          }

          .card {
            padding: 20px;
            border-radius: 24px;
          }

          .cardTitle {
            font-size: clamp(26px, 9vw, 40px);
          }

          .input,
          .textarea {
            font-size: 16px;
          }

          .imageGrid,
          .stripeGrid {
            grid-template-columns: 1fr;
          }

          .uploadBox,
          .imageUploadBox {
            min-height: 180px;
          }

          .previewHeroWrap,
          .previewHeroPlaceholder {
            min-height: 180px;
            height: 180px;
          }
        }
      `}</style>
    </main>
  );
}