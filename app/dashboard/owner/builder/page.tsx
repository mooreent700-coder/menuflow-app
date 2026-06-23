'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode, type SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Lang = 'en' | 'es';
type StoreTheme = 'light' | 'dark';
type StoreAccent = 'silver' | 'gold' | 'orange' | 'red' | 'blue' | 'purple' | 'lime' | 'mono' | 'pink';
type SaveState = 'Saved' | 'Saving' | 'Error';
type BuilderPanelId = 'store' | 'branding' | 'controls' | 'hours' | 'menu' | 'videos' | '';
type ControlPanelId = 'colors' | 'order' | 'delivery' | 'language' | '';
type DeleteMode = 'item' | 'category';
type HeroMediaType = 'image' | 'video';

type Restaurant = {
  id: string;
  owner_id?: string | null;
  user_id?: string | null;
  name: string | null;
  slug: string | null;
  phone?: string | null;
  address?: string | null;
  logo_image?: string | null;
  hero_image?: string | null;
  hero_video?: string | null;
  hero_video_url?: string | null;
  hero_video_file?: string | null;
  hero_media_type?: string | null;
  description?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  youtube_url?: string | null;
  tiktok_url?: string | null;
  website_url?: string | null;
  storefront_theme?: string | null;
  storefront_accent?: string | null;
  storefront_language?: string | null;
  order_language?: string | null;
  owner_language?: string | null;
  pickup_enabled?: boolean | null;
  delivery_enabled?: boolean | null;
  delivery_fee?: number | null;
  delivery_radius?: number | null;
  delivery_minimum?: number | null;
  hours?: any;
  plan?: string | null;
};

type Category = { id: string; restaurant_id?: string | null; name: string; sort_order?: number | null };

type MenuItem = {
  id: string;
  restaurant_id?: string | null;
  category_id?: string | null;
  name: string;
  description?: string | null;
  base_price?: number | null;
  price?: number | null;
  image_url?: string | null;
  image_file?: string | null;
  item_image?: string | null;
  video_url?: string | null;
  video_file?: string | null;
  item_video?: string | null;
  menu_video?: string | null;
  sort_order?: number | null;
  availability?: string | null;
  is_available?: boolean | null;
};

type HoursRow = { isOpen: boolean; open: string; close: string };
type Hours = Record<string, HoursRow>;
type ImageOption = { label: string; category: string; url: string; path: string };

const STORAGE_BUCKET = 'menu-images';
const VIDEO_MENU_AVAILABILITY = 'video_menu';
const MENU_VIDEO_MAX_SECONDS = 10;
const MAX_MENU_VIDEO_MB = 25;
const MAX_IMAGE_UPLOAD_MB = 5;
const MAX_LOGO_UPLOAD_MB = 3;
const MAX_HERO_IMAGE_MB = 5;
const MAX_HERO_VIDEO_MB = 25;
const OPTIMIZED_VIDEO_SECONDS = 15;
const OPTIMIZED_VIDEO_WIDTH = 720;
const OPTIMIZED_VIDEO_FPS = 24;
const OPTIMIZED_VIDEO_BITRATE = 1_500_000;
const FALLBACK_LOGO = '/orda-logo.png';
const BUILDER_LANG_KEY = 'orda_builder_language';
const OWNER_LANG_KEY = 'orda_owner_language';

const ACCENTS: { key: StoreAccent; label: string; sub: string }[] = [
  { key: 'silver', label: 'Premium Silver', sub: 'Clean ORDA chrome' },
  { key: 'mono', label: 'Black / White', sub: 'Minimal premium' },
  { key: 'gold', label: 'Luxury Gold', sub: 'Premium black + gold' },
  { key: 'orange', label: 'Classic Amber', sub: 'Warm food glow' },
  { key: 'red', label: 'Cherry Red', sub: 'Bold high energy' },
  { key: 'blue', label: 'Ocean Blue', sub: 'Clean modern tech' },
  { key: 'purple', label: 'Purple Night', sub: 'Luxury nightlife' },
  { key: 'pink', label: 'Neon Pink', sub: 'Dark luxury pink glow' },
  { key: 'lime', label: 'Electric Lime', sub: 'Food-tech pop' },
];

const COPY = {
  en: {
    title: 'BUILDER',
    subtitle: 'Fast owner builder. Pick a section, edit, save, close, then move to the next section.',
    saveAll: 'Save All Changes',
    saving: 'Saving...',
    dashboard: 'Dashboard',
    openStore: 'Open Storefront',
    uploadLogo: 'Upload Logo',
    uploadHero: 'Upload Hero Image',
    uploadHeroVideo: 'Upload Hero Video',
    useHeroImage: 'Use Image',
    useHeroVideo: 'Use Video',
    socialLinks: 'Social Links',
    socialHelp: 'Optional. Add your social handles. ORDA turns them into links on the storefront.',
    heroMedia: 'Hero Media',
    heroHelp: 'Upload or replace one hero video. ORDA syncs every hero video field so only one hero video shows. Large videos are trimmed and compressed automatically before upload.',
    uploadItem: 'Upload Item Photo',
    storeSetup: 'Store Setup',
    branding: 'Branding',
    styleControls: 'Storefront Style + Controls',
    hours: 'Operating Hours',
    menu: 'Photos Menu',
    preview: 'Live Phone Preview',
    storeName: 'Store Name',
    storeUrl: 'Store URL',
    phone: 'Phone',
    address: 'Address',
    instagram: 'Instagram @name',
    facebook: 'Facebook page name',
    youtube: 'YouTube channel name',
    tiktok: 'TikTok @name',
    pickup: 'Pickup',
    delivery: 'Delivery',
    light: 'Light',
    dark: 'Dark',
    deliveryFee: 'Delivery Fee',
    deliveryMin: 'Delivery Minimum',
    radius: 'Radius Miles',
    saveSection: 'Save Section',
    close: 'Close',
    saveClose: 'Save & Close',
    itemName: 'Item Name',
    basePrice: 'Item Price',
    description: 'Description',
    delete: 'Delete',
    pickImage: 'Pick Item Image',
    pickImageText: 'Photos come from the matching Supabase Storage category folder.',
    saved: 'Saved',
    error: 'Error',
    open: 'Open',
    closed: 'Closed',
    loading: 'Loading ORDA Builder...',
    noStore: 'Could not load your store.',
    uploadFailed: 'Upload failed.',
    saveFailed: 'Save failed.',
    orderNow: 'Order Now',
    promo: '20% OFF FIRST ORDER',
    fresh: 'Fresh food made just for you.',
    cart: 'View Cart',
    categories: 'Categories',
    videos: 'Videos',
    chooseMenuCategory: 'Choose a food category',
    chooseMenuCategoryText: 'Tap one category. It opens by itself. Add/edit items, choose the exact photo, save, close, then choose another category.',
    existingCategory: 'Live Category',
    presetCategory: 'Preset Category',
    orderControls: 'Pickup / Delivery',
    deliveryControls: 'Delivery Settings',
    languageControls: 'Language',
    storeColors: 'Store Colors',
    hasItems: 'items',
    manage: 'Manage',
    createManage: 'Create / Manage',
    emptyCategory: 'No items in this category yet.',
    livePreviewNote: 'Preview updates instantly from photo menu and video menu.',
    addCustomItem: '+ Add Custom Item',
    deleteItem: 'Delete Selected Item',
    deleteCategory: 'Delete Whole Category',
    deleteHelp: 'Pick an item card first to delete only that item. Choose category to delete the whole section.',
    languageSaved: 'Language saved',
  },
  es: {
    title: 'CONSTRUCTOR',
    subtitle: 'Constructor rápido. Elige una sección, edita, guarda, cierra y sigue.',
    saveAll: 'Guardar Todo',
    saving: 'Guardando...',
    dashboard: 'Panel',
    openStore: 'Abrir Tienda',
    uploadLogo: 'Subir Logo',
    uploadHero: 'Subir Imagen Principal',
    uploadHeroVideo: 'Subir Video Principal',
    useHeroImage: 'Usar Imagen',
    useHeroVideo: 'Usar Video',
    socialLinks: 'Redes Sociales',
    socialHelp: 'Opcional. Agrega tus redes. ORDA las convierte en links.',
    heroMedia: 'Hero Media',
    heroHelp: 'Sube o reemplaza un solo video principal. ORDA sincroniza el video para que solo aparezca uno.',
    uploadItem: 'Subir Foto',
    storeSetup: 'Configuración',
    branding: 'Marca',
    styleControls: 'Estilo + Controles',
    hours: 'Horario',
    menu: 'Menú de Fotos',
    preview: 'Vista en Teléfono',
    storeName: 'Nombre',
    storeUrl: 'URL',
    phone: 'Teléfono',
    address: 'Dirección',
    instagram: 'Instagram @name',
    facebook: 'Nombre de Facebook',
    youtube: 'Canal de YouTube',
    tiktok: 'TikTok @name',
    pickup: 'Recoger',
    delivery: 'Entrega',
    light: 'Claro',
    dark: 'Oscuro',
    deliveryFee: 'Costo Entrega',
    deliveryMin: 'Mínimo Entrega',
    radius: 'Millas',
    saveSection: 'Guardar Sección',
    close: 'Cerrar',
    saveClose: 'Guardar y Cerrar',
    itemName: 'Nombre',
    basePrice: 'Precio',
    description: 'Descripción',
    delete: 'Eliminar',
    pickImage: 'Elegir Imagen',
    pickImageText: 'Fotos vienen de la carpeta correcta de Supabase Storage.',
    saved: 'Guardado',
    error: 'Error',
    open: 'Abierto',
    closed: 'Cerrado',
    loading: 'Cargando ORDA Builder...',
    noStore: 'No se pudo cargar tu tienda.',
    uploadFailed: 'Falló la subida.',
    saveFailed: 'Falló el guardado.',
    orderNow: 'Ordenar',
    promo: '20% DESCUENTO',
    fresh: 'Comida fresca hecha para ti.',
    cart: 'Ver Carrito',
    categories: 'Categorías',
    videos: 'Videos',
    chooseMenuCategory: 'Elige una categoría',
    chooseMenuCategoryText: 'Toca una categoría. Se abre sola. Agrega/edita, guarda y cierra.',
    existingCategory: 'Categoría Activa',
    presetCategory: 'Categoría Lista',
    orderControls: 'Recoger / Entrega',
    deliveryControls: 'Configuración de Entrega',
    languageControls: 'Idioma',
    storeColors: 'Colores',
    hasItems: 'artículos',
    manage: 'Manejar',
    createManage: 'Crear / Manejar',
    emptyCategory: 'No hay artículos en esta categoría.',
    livePreviewNote: 'La vista se actualiza con fotos y videos.',
    addCustomItem: '+ Agregar Artículo',
    deleteItem: 'Eliminar Artículo',
    deleteCategory: 'Eliminar Categoría',
    deleteHelp: 'Elige un artículo para eliminarlo. Elige categoría para borrar todo.',
    languageSaved: 'Idioma guardado',
  },
} as const;

const DEFAULT_HOURS: Hours = {
  monday: { isOpen: true, open: '09:00', close: '21:00' },
  tuesday: { isOpen: true, open: '09:00', close: '21:00' },
  wednesday: { isOpen: true, open: '09:00', close: '21:00' },
  thursday: { isOpen: true, open: '09:00', close: '21:00' },
  friday: { isOpen: true, open: '09:00', close: '22:00' },
  saturday: { isOpen: true, open: '09:00', close: '22:00' },
  sunday: { isOpen: false, open: '10:00', close: '18:00' },
};

const DAYS = [
  ['monday', 'Monday'],
  ['tuesday', 'Tuesday'],
  ['wednesday', 'Wednesday'],
  ['thursday', 'Thursday'],
  ['friday', 'Friday'],
  ['saturday', 'Saturday'],
  ['sunday', 'Sunday'],
] as const;

const OWNER_CATEGORY_CHOICES = [
  { key: 'burgers', label: 'Burgers', emoji: '🍔', items: ['Double Cheeseburger', 'Bacon Burger', 'House Burger'] },
  { key: 'wings', label: 'Wings', emoji: '🍗', items: ['Fried Wings', 'Lemon Pepper Wings', 'Buffalo Wings'] },
  { key: 'chicken', label: 'Chicken', emoji: '🍗', items: ['Fried Chicken Combo', 'BBQ Chicken Combo', 'Chicken Sandwich'] },
  { key: 'hot_dog', label: 'Hot Dogs', emoji: '🌭', items: ['Classic Hot Dog', 'Chili Cheese Dog', 'Loaded Hot Dog'] },
  { key: 'sandwiches', label: 'Sandwiches', emoji: '🥪', items: ['Pastrami Sandwich', 'Chicken Sandwich', 'House Sandwich'] },
  { key: 'pasta', label: 'Pasta', emoji: '🍝', items: ['Shrimp Pasta', 'Chicken Alfredo', 'Creamy Pasta'] },
  { key: 'coffee', label: 'Coffee', emoji: '☕', items: ['Iced Coffee', 'Hot Coffee', 'Specialty Coffee'] },
  { key: 'smoothies', label: 'Smoothies', emoji: '🥤', items: ['Strawberry Smoothie', 'Mango Smoothie', 'Fruit Smoothie'] },
  { key: 'tacos', label: 'Tacos', emoji: '🌮', items: ['Street Tacos', 'Birria Tacos', 'Carne Asada Tacos'] },
  { key: 'mexican', label: 'Mexican', emoji: '🌯', items: ['Mexican Plate', 'Taco Plate', 'House Mexican Special'] },
  { key: 'bbq', label: 'BBQ', emoji: '🔥', items: ['BBQ Plate', 'BBQ Chicken Combo', 'Rib Plate'] },
  { key: 'seafood', label: 'Seafood', emoji: '🦐', items: ['Seafood Plate', 'Shrimp Plate', 'Seafood Combo'] },
  { key: 'fries', label: 'Fries', emoji: '🍟', items: ['French Fries', 'Seasoned Fries', 'Loaded Fries'] },
  { key: 'breakfast', label: 'Breakfast', emoji: '🥞', items: ['Breakfast Plate', 'Pancake Plate', 'Breakfast Special'] },
  { key: 'desserts', label: 'Desserts', emoji: '🍰', items: ['Dessert Cup', 'Sweet Dessert', 'House Dessert'] },
  { key: 'drinks', label: 'Drinks', emoji: '🥤', items: ['Soft Drinks', 'Cold Drinks', 'House Drinks'] },
];

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function isLang(value?: string | null): value is Lang {
  return value === 'en' || value === 'es';
}

function saveBuilderLanguageLocal(lang: Lang) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(BUILDER_LANG_KEY, lang);
  window.localStorage.setItem(OWNER_LANG_KEY, lang);
  window.localStorage.setItem('orda_language', lang);
  window.localStorage.setItem('orda_order_language', lang);
  document.cookie = `orda_builder_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  document.cookie = `orda_owner_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  document.cookie = `orda_storefront_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
}

function getSavedBuilderLanguage(): Lang {
  if (typeof window === 'undefined') return 'en';
  const saved =
    window.localStorage.getItem(BUILDER_LANG_KEY) ||
    window.localStorage.getItem('orda_storefront_language') ||
    window.localStorage.getItem(OWNER_LANG_KEY) ||
    window.localStorage.getItem('orda_language');
  return isLang(saved) ? saved : 'en';
}

function slugify(value: string) {
  return ((value || 'your-store').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')) || 'your-store';
}
function money(value?: number | null) { return `$${Number(value || 0).toFixed(2)}`; }
function normalize(value?: string | null) { return String(value || '').toLowerCase().replace(/&/g, ' and ').replace(/[_-]/g, ' ').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim(); }
function pretty(value?: string | null) { return String(value || 'universal').replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()); }

function categoryKey(value?: string | null) {
  const clean = normalize(value);
  if (!clean) return 'universal';
  if (clean.includes('burger')) return 'burgers';
  if (clean.includes('wing')) return 'wings';
  if (clean.includes('chicken')) return 'chicken';
  if (clean.includes('hot dog') || clean.includes('hotdog')) return 'hot_dog';
  if (clean.includes('sandwich') || clean.includes('pastrami')) return 'sandwiches';
  if (clean.includes('pasta') || clean.includes('alfredo')) return 'pasta';
  if (clean.includes('coffee')) return 'coffee';
  if (clean.includes('smoothie')) return 'smoothies';
  if (clean.includes('shake')) return 'milkshake';
  if (clean.includes('taco') || clean.includes('birria') || clean.includes('asada')) return 'tacos';
  if (clean.includes('mexican') || clean.includes('burrito') || clean.includes('quesadilla') || clean.includes('nacho')) return 'mexican';
  if (clean.includes('bbq') || clean.includes('barbecue') || clean.includes('rib')) return 'bbq';
  if (clean.includes('seafood') || clean.includes('shrimp') || clean.includes('fish') || clean.includes('crab')) return 'seafood';
  if (clean.includes('fries') || clean.includes('fry')) return 'fries';
  if (clean.includes('breakfast') || clean.includes('pancake')) return 'breakfast';
  if (clean.includes('dessert') || clean.includes('cake')) return 'desserts';
  if (clean.includes('drink') || clean.includes('soda') || clean.includes('juice') || clean.includes('water')) return 'drinks';
  if (clean.includes('side')) return 'sides';
  if (clean.includes('combo')) return 'combos';
  return clean.replace(/ /g, '_') || 'universal';
}

function normalizeHours(raw: any): Hours {
  if (!raw) return DEFAULT_HOURS;
  let value = raw;
  if (typeof raw === 'string') {
    try { value = JSON.parse(raw); } catch { return DEFAULT_HOURS; }
  }
  if (!value || typeof value !== 'object') return DEFAULT_HOURS;
  const next: Hours = { ...DEFAULT_HOURS };
  for (const [key] of DAYS) {
    const row = value[key];
    next[key] = {
      isOpen: typeof row?.isOpen === 'boolean' ? row.isOpen : DEFAULT_HOURS[key].isOpen,
      open: String(row?.open || row?.open_time || DEFAULT_HOURS[key].open),
      close: String(row?.close || row?.close_time || DEFAULT_HOURS[key].close),
    };
  }
  return next;
}

function fileExt(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || 'jpg';
  return ext.replace(/[^a-z0-9]/g, '') || 'jpg';
}


function fileSizeMb(file: File) {
  return file.size / (1024 * 1024);
}

function validateUploadFile(file: File, options: { kind: 'image' | 'video' | 'logo' | 'heroImage' | 'heroVideo'; label: string }) {
  const sizeMb = fileSizeMb(file);
  const name = file.name || '';

  if (options.kind === 'video' || options.kind === 'heroVideo') {
    const maxMb = options.kind === 'heroVideo' ? MAX_HERO_VIDEO_MB : MAX_MENU_VIDEO_MB;

    if (!isVideoFile(name) && !String(file.type || '').startsWith('video/')) {
      return `${options.label} must be a video file.`;
    }

    if (sizeMb > maxMb) {
      return `${options.label} is still too large after ORDA optimized it. Try a shorter video. Max video size is ${maxMb} MB.`;
    }

    return '';
  }

  const maxMb = options.kind === 'logo' ? MAX_LOGO_UPLOAD_MB : options.kind === 'heroImage' ? MAX_HERO_IMAGE_MB : MAX_IMAGE_UPLOAD_MB;

  if (!isImageFile(name) && !String(file.type || '').startsWith('image/')) {
    return `${options.label} must be an image file.`;
  }

  if (sizeMb > maxMb) {
    return `${options.label} is too large. Max image size is ${maxMb} MB.`;
  }

  return '';
}

function getVideoMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) return 'video/webm;codecs=vp9';
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) return 'video/webm;codecs=vp8';
  if (MediaRecorder.isTypeSupported('video/webm')) return 'video/webm';
  return '';
}

function waitForVideoReady(video: HTMLVideoElement) {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      video.onloadedmetadata = null;
      video.oncanplay = null;
      video.onerror = null;
    };

    const finish = () => {
      cleanup();
      resolve();
    };

    video.onloadedmetadata = finish;
    video.oncanplay = finish;
    video.onerror = () => {
      cleanup();
      reject(new Error('ORDA could not read this video. Try a different video file.'));
    };

    if (video.readyState >= 1 && Number.isFinite(video.duration)) finish();
  });
}

async function optimizeVideoFile(file: File, label: string) {
  const maxMb = label.toLowerCase().includes('hero') ? MAX_HERO_VIDEO_MB : MAX_MENU_VIDEO_MB;

  if (fileSizeMb(file) <= maxMb) return file;

  if (typeof window === 'undefined' || typeof document === 'undefined' || typeof MediaRecorder === 'undefined') {
    throw new Error(`${label} is too large. Max video size is ${maxMb} MB.`);
  }

  const mimeType = getVideoMimeType();

  if (!mimeType) {
    throw new Error(`${label} is too large and this browser cannot optimize it automatically. Try a shorter video.`);
  }

  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.src = objectUrl;
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = 'anonymous';
  video.preload = 'metadata';

  try {
    await waitForVideoReady(video);

    const sourceWidth = video.videoWidth || OPTIMIZED_VIDEO_WIDTH;
    const sourceHeight = video.videoHeight || Math.round(OPTIMIZED_VIDEO_WIDTH * 9 / 16);
    const scale = Math.min(1, OPTIMIZED_VIDEO_WIDTH / Math.max(1, sourceWidth));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(320, Math.round(sourceWidth * scale));
    canvas.height = Math.max(180, Math.round(sourceHeight * scale));
    const context = canvas.getContext('2d');

    if (!context) throw new Error('ORDA could not optimize this video.');

    const stream = canvas.captureStream(OPTIMIZED_VIDEO_FPS);
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: OPTIMIZED_VIDEO_BITRATE });
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunks.push(event.data);
    };

    const stopAt = Math.min(
      OPTIMIZED_VIDEO_SECONDS,
      Number.isFinite(video.duration) && video.duration > 0 ? video.duration : OPTIMIZED_VIDEO_SECONDS
    );

    const recorded = new Promise<Blob>((resolve, reject) => {
      recorder.onerror = () => reject(new Error('ORDA could not optimize this video.'));
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
    });

    video.currentTime = 0;
    await video.play().catch(() => null);

    let stopped = false;

    const draw = () => {
      if (stopped) return;
      try {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      } catch {
        stopped = true;
        try { recorder.stop(); } catch {}
        return;
      }

      if (video.currentTime >= stopAt || video.ended) {
        stopped = true;
        try { recorder.stop(); } catch {}
        return;
      }

      window.requestAnimationFrame(draw);
    };

    recorder.start(250);
    draw();

    window.setTimeout(() => {
      if (!stopped) {
        stopped = true;
        try { recorder.stop(); } catch {}
      }
    }, Math.ceil(stopAt * 1000) + 750);

    const optimizedBlob = await recorded;
    const optimized = new File(
      [optimizedBlob],
      `${file.name.replace(/\.[^.]+$/, '') || 'orda-video'}-orda-optimized.webm`,
      { type: 'video/webm', lastModified: Date.now() }
    );

    if (fileSizeMb(optimized) > maxMb) {
      throw new Error(`${label} is still too large after ORDA optimized it. Try a shorter video.`);
    }

    return optimized;
  } finally {
    video.pause();
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}


function bucketUrl(path: string) {
  const cleanPath = String(path || 'universal/1.jpg').replace(/^\/+/, '');
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(cleanPath);
  return data.publicUrl;
}

function isImageFile(name: string) { return /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(name); }
function isVideoFile(name: string) { return /\.(mp4|webm|mov|m4v|ogg)$/i.test(name); }
function isVideoUrl(value?: string | null) { return /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(String(value || '').trim()); }

function resolveUrl(url?: string | null) {
  const clean = String(url || '').trim();
  if (!clean) return '';
  if (/^https?:\/\//i.test(clean)) return clean;
  if (clean.startsWith('/')) return clean;
  if (clean.startsWith('menu-images/')) return bucketUrl(clean.replace(/^menu-images\//, ''));
  if (clean.startsWith(`${STORAGE_BUCKET}/`)) return bucketUrl(clean.replace(`${STORAGE_BUCKET}/`, ''));
  if (clean.includes('/')) return bucketUrl(clean);
  return '';
}

function getAccent(value?: string | null): StoreAccent {
  const clean = String(value || 'silver').toLowerCase();
  return ['silver', 'gold', 'orange', 'red', 'blue', 'purple', 'lime', 'mono', 'pink'].includes(clean) ? clean as StoreAccent : 'silver';
}
function getHeroMediaType(value?: string | null): HeroMediaType { return value === 'video' ? 'video' : 'image'; }

function cleanSocialHandle(value?: string | null) {
  let raw = String(value || '').trim();
  if (!raw) return '';
  raw = raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  raw = raw.replace(/^instagram\.com\//i, '').replace(/^facebook\.com\//i, '').replace(/^youtube\.com\//i, '').replace(/^youtu\.be\//i, '').replace(/^tiktok\.com\/@?/i, '');
  raw = raw.split(/[?#]/)[0].replace(/^@+/, '').replace(/\/+$/, '').trim();
  return raw;
}

function savedItemImage(item?: MenuItem | null) { return resolveUrl(item?.image_file || item?.item_image || item?.image_url); }
function savedItemVideo(item?: MenuItem | null) { return resolveUrl(item?.video_file || item?.item_video || item?.menu_video || item?.video_url); }
function fallbackImage(categoryName?: string | null, itemName?: string | null, index = 0) { const fileNumber = (Math.abs(index) % 6) + 1; return bucketUrl(`${categoryKey(categoryName || itemName)}/${fileNumber}.jpg`); }
function getItemImage(item?: MenuItem | null, categoryName?: string | null, index = 0) { const saved = savedItemImage(item); return saved || fallbackImage(categoryName, item?.name, index); }
function getItemVideo(item?: MenuItem | null) { return savedItemVideo(item); }
function handleBrokenImage(event: SyntheticEvent<HTMLImageElement, Event>) { event.currentTarget.onerror = null; event.currentTarget.src = bucketUrl('universal/1.jpg'); }
function handleMenuImageError(event: SyntheticEvent<HTMLImageElement, Event>, item?: MenuItem | null, categoryName?: string | null, index = 0) { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage(categoryName, item?.name, index); }
function isVideoMenuItem(item?: MenuItem | null) { return String(item?.availability || '').toLowerCase() === VIDEO_MENU_AVAILABILITY || !!savedItemVideo(item); }
function isVideoMenuCategory(category?: Category | null) { return normalize(category?.name).includes('orda video menu') || normalize(category?.name).includes('video menu'); }
function isActiveItem(item: MenuItem) {
  const availability = String(item.availability || 'available').toLowerCase();
  return item.is_available !== false && !['deleted', 'delete', 'hidden', 'inactive', 'archived', 'draft', 'removed'].includes(availability);
}
function keepVideoPlaying(event: SyntheticEvent<HTMLVideoElement, Event>) {
  const video = event.currentTarget;
  video.muted = true;
  video.playsInline = true;
  const promise = video.play();
  if (promise && typeof promise.catch === 'function') promise.catch(() => null);
}
function stopAtMenuVideoLimit(event: SyntheticEvent<HTMLVideoElement, Event>) {
  const video = event.currentTarget;
  if (video.currentTime >= MENU_VIDEO_MAX_SECONDS) {
    video.pause();
    video.currentTime = MENU_VIDEO_MAX_SECONDS;
  }
}
function replayPreviewVideo(event: SyntheticEvent<HTMLVideoElement, Event>) {
  const video = event.currentTarget;
  if (video.currentTime >= MENU_VIDEO_MAX_SECONDS) video.currentTime = 0;
  keepVideoPlaying(event);
}

async function safeUpdate(table: string, id: string, patch: any, restaurantId?: string) {
  let query = supabase.from(table).update(patch).eq('id', id);
  if (restaurantId) query = query.eq('restaurant_id', restaurantId);
  return await query.select('*').maybeSingle();
}

async function updateFirstWorkingColumn(table: string, id: string, restaurantId: string | undefined, columnPatches: any[]) {
  let lastError: any = null;
  for (const patch of columnPatches) {
    const { data, error } = await safeUpdate(table, id, patch, restaurantId);
    if (!error) return { data, error: null };
    lastError = error;
  }
  return { data: null, error: lastError };
}

async function updateEveryExistingColumn(table: string, id: string, restaurantId: string | undefined, patches: any[]) {
  let mergedData: any = null;
  let successCount = 0;
  let lastError: any = null;
  for (const patch of patches) {
    const { data, error } = await safeUpdate(table, id, patch, restaurantId);
    if (!error) {
      successCount += 1;
      mergedData = { ...(mergedData || {}), ...(data || {}), ...patch };
    } else {
      lastError = error;
    }
  }
  return { data: mergedData, error: successCount > 0 ? null : lastError };
}

async function insertFirstWorkingPayload(table: string, payloads: any[]) {
  let lastError: any = null;
  for (const payload of payloads) {
    const { data, error } = await supabase.from(table).insert(payload).select('*').single();
    if (!error) return { data, error: null };
    lastError = error;
  }
  return { data: null, error: lastError };
}

function getStoreLangFromStore(store: Restaurant | null): Lang {
  const saved = getSavedBuilderLanguage();
  if (isLang(store?.storefront_language)) return store.storefront_language;
  if (isLang(store?.order_language)) return store.order_language;
  if (isLang(store?.owner_language)) return store.owner_language;
  return saved;
}

export default function OwnerBuilderPage() {
  const router = useRouter();
  const fileHeroRef = useRef<HTMLInputElement | null>(null);
  const fileHeroVideoRef = useRef<HTMLInputElement | null>(null);
  const fileLogoRef = useRef<HTMLInputElement | null>(null);
  const fileItemRef = useRef<HTMLInputElement | null>(null);
  const fileItemVideoRef = useRef<HTMLInputElement | null>(null);
  const videoUploadTargetIdRef = useRef<string>('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('Saved');
  const [lastSaved, setLastSaved] = useState('Not saved yet');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [storeTheme, setStoreTheme] = useState<StoreTheme>('light');
  const [storeAccent, setStoreAccent] = useState<StoreAccent>('silver');
  const [storeLang, setStoreLang] = useState<Lang>('en');
  const [hours, setHours] = useState<Hours>(DEFAULT_HOURS);
  const [openPanel, setOpenPanel] = useState<BuilderPanelId>('');
  const [menuWorkspaceKey, setMenuWorkspaceKey] = useState('');
  const [activeControl, setActiveControl] = useState<ControlPanelId>('');
  const [deleteMode, setDeleteMode] = useState<DeleteMode>('item');
  const [heroMediaType, setHeroMediaType] = useState<HeroMediaType>('image');
  const [bucketImageOptions, setBucketImageOptions] = useState<ImageOption[]>([]);
  const [bucketImagesLoading, setBucketImagesLoading] = useState(false);

  const t = COPY[storeLang];
  const storeName = restaurant?.name?.trim() || 'Your Store';
  const storeSlug = slugify(restaurant?.slug || storeName);
  const storeUrl = `/store/${storeSlug}`;
  const logo = resolveUrl(restaurant?.logo_image) || FALLBACK_LOGO;
  const hero = resolveUrl(restaurant?.hero_image) || bucketUrl('hero/1.jpg');
  const heroVideo = resolveUrl(restaurant?.hero_video || restaurant?.hero_video_file || restaurant?.hero_video_url || '');

  const regularCategories = useMemo(() => categories.filter((category) => !isVideoMenuCategory(category)), [categories]);
  const regularItems = useMemo(() => items.filter((item) => !isVideoMenuItem(item)), [items]);
  const videoItems = useMemo(() => items.filter((item) => isVideoMenuItem(item)), [items]);
  const previewItems = useMemo(() => {
    if (activeCategoryId === 'VIDEO_MENU') return videoItems;
    if (activeCategoryId === 'all') return [...regularItems, ...videoItems];
    return regularItems.filter((item) => item.category_id === activeCategoryId);
  }, [activeCategoryId, regularItems, videoItems]);
  const selectedItem = useMemo(() => regularItems.find((item) => item.id === selectedItemId) || null, [regularItems, selectedItemId]);
  const selectedVideoItem = useMemo(() => videoItems.find((item) => item.id === selectedVideoId) || videoItems[0] || null, [videoItems, selectedVideoId]);
  const selectedCategory = useMemo(() => regularCategories.find((category) => category.id === selectedItem?.category_id) || null, [regularCategories, selectedItem?.category_id]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    regularItems.forEach((item) => {
      if (item.category_id) map.set(item.category_id, (map.get(item.category_id) || 0) + 1);
    });
    return map;
  }, [regularItems]);

  const workspaceCategory = useMemo(() => regularCategories.find((cat) => cat.id === menuWorkspaceKey) || null, [regularCategories, menuWorkspaceKey]);
  const workspacePreset = useMemo(() => {
    const direct = OWNER_CATEGORY_CHOICES.find((choice) => choice.key === menuWorkspaceKey);
    if (direct) return direct;
    const category = regularCategories.find((cat) => cat.id === menuWorkspaceKey);
    if (!category) return null;
    return OWNER_CATEGORY_CHOICES.find((choice) => categoryKey(choice.key) === categoryKey(category.name) || normalize(choice.key) === normalize(category.name)) || null;
  }, [regularCategories, menuWorkspaceKey]);
  const workspaceItems = useMemo(() => (workspaceCategory ? regularItems.filter((item) => item.category_id === workspaceCategory.id) : []), [regularItems, workspaceCategory]);
  const galleryOptions = useMemo(() => bucketImageOptions, [bucketImageOptions]);

  function bucketFoldersForCategory(categoryName?: string | null) {
    const key = categoryKey(categoryName || 'universal');
    const aliases: Record<string, string[]> = {
      burgers: ['burgers', 'burger'],
      wings: ['wings', 'wing', 'singles'],
      chicken: ['chicken', 'fried-chicken', 'fried_chicken'],
      hot_dog: ['hot_dog', 'hot-dog', 'hotdogs', 'hot dogs'],
      sandwiches: ['sandwiches', 'sandwich'],
      pasta: ['pasta'],
      coffee: ['coffee', 'coffee_drinks', 'coffee-drinks'],
      smoothies: ['smoothies', 'smoothie'],
      milkshake: ['milkshake', 'milkshakes', 'shakes'],
      tacos: ['tacos', 'taco'],
      mexican: ['mexican'],
      bbq: ['bbq', 'barbecue'],
      seafood: ['seafood', 'fish', 'shrimp'],
      fries: ['fries', 'french-fries', 'french_fries'],
      breakfast: ['breakfast'],
      desserts: ['desserts', 'dessert'],
      drinks: ['drinks', 'drink'],
      universal: ['universal'],
    };
    return Array.from(new Set([...(aliases[key] || [key]), key, key.replace(/_/g, '-'), key.replace(/_/g, ' ')])).filter(Boolean);
  }

  const loadBucketImagesForCategory = useCallback(async (categoryName?: string | null) => {
    const key = categoryKey(categoryName || 'universal');
    setBucketImageOptions([]);
    setBucketImagesLoading(true);
    try {
      for (const folder of bucketFoldersForCategory(categoryName)) {
        const { data, error: listError } = await supabase.storage.from(STORAGE_BUCKET).list(folder, { limit: 80, sortBy: { column: 'name', order: 'asc' } });
        if (listError || !data?.length) continue;
        const files = data.filter((file) => isImageFile(file.name)).slice(0, 30);
        if (!files.length) continue;
        setBucketImageOptions(files.map((file, index) => ({
          category: key,
          label: pretty(file.name.replace(/\.[^.]+$/, '').replace(/^\d+[-_ ]?/, '')) || `${pretty(key)} Photo ${index + 1}`,
          url: bucketUrl(`${folder}/${file.name}`),
          path: `${folder}/${file.name}`,
        })));
        return;
      }
      setBucketImageOptions([]);
    } finally {
      setBucketImagesLoading(false);
    }
  }, []);

  const markSaved = useCallback((label?: string) => {
    setSaveState('Saved');
    setLastSaved(label || new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const user = authData.user;
      if (!user) {
        router.push('/sign-in');
        return;
      }

      const { data: storeRows, error: storeError } = await supabase.from('restaurants').select('*').or(`owner_id.eq.${user.id},user_id.eq.${user.id}`).limit(1);
      if (storeError) throw storeError;

      let store = (storeRows?.[0] || null) as Restaurant | null;
      if (!store) {
        const savedLang = getSavedBuilderLanguage();
        const { data: created, error: createError } = await supabase.from('restaurants').insert({
          id: makeId(),
          owner_id: user.id,
          user_id: user.id,
          name: 'Your Store',
          slug: `store-${user.id.slice(0, 6)}`,
          storefront_theme: 'light',
          storefront_accent: 'silver',
          storefront_language: savedLang,
          order_language: savedLang,
          owner_language: savedLang,
          pickup_enabled: true,
          delivery_enabled: false,
          delivery_fee: 0,
          delivery_radius: 5,
          delivery_minimum: 0,
          hours: DEFAULT_HOURS,
          plan: 'Starter Plan',
          hero_media_type: 'image',
        }).select('*').single();
        if (createError) throw createError;
        store = created as Restaurant;
      }

      const resolvedLang = getStoreLangFromStore(store);
      saveBuilderLanguageLocal(resolvedLang);
      setRestaurant(store);
      setStoreTheme(store.storefront_theme === 'dark' ? 'dark' : 'light');
      setStoreAccent(getAccent(store.storefront_accent));
      setStoreLang(resolvedLang);
      setHeroMediaType(getHeroMediaType(store.hero_media_type));
      setHours(normalizeHours(store.hours));

      const [catRes, itemRes] = await Promise.all([
        supabase.from('menu_categories').select('id, restaurant_id, name, sort_order').eq('restaurant_id', store.id).order('sort_order', { ascending: true }),
        supabase.from('menu_items').select('*').eq('restaurant_id', store.id).order('sort_order', { ascending: true }).limit(400),
      ]);
      if (catRes.error) throw catRes.error;
      if (itemRes.error) throw itemRes.error;

      const liveItems = ((itemRes.data || []) as MenuItem[]).filter(isActiveItem);
      const firstRegular = liveItems.find((item) => !isVideoMenuItem(item));
      const firstVideo = liveItems.find((item) => isVideoMenuItem(item));
      setCategories((catRes.data || []) as Category[]);
      setItems(liveItems);
      setActiveCategoryId('all');
      setSelectedItemId(firstRegular?.id || '');
      setSelectedVideoId(firstVideo?.id || '');
      markSaved();
    } catch (err: any) {
      setSaveState('Error');
      setError(err?.message || COPY[getSavedBuilderLanguage()].noStore);
    } finally {
      setLoading(false);
    }
  }, [markSaved, router]);

  useEffect(() => {
    const saved = getSavedBuilderLanguage();
    setStoreLang(saved);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (openPanel !== 'menu' || !menuWorkspaceKey) {
      setBucketImageOptions([]);
      return;
    }
    const categoryName = workspaceCategory?.name || workspacePreset?.key || menuWorkspaceKey || selectedCategory?.name || 'universal';
    void loadBucketImagesForCategory(categoryName);
  }, [loadBucketImagesForCategory, menuWorkspaceKey, openPanel, selectedCategory?.name, workspaceCategory?.name, workspacePreset?.key]);

  async function saveRestaurantPatch(patch: Partial<Restaurant>) {
    if (!restaurant?.id) return;
    setSaving(true);
    setSaveState('Saving');
    setError('');
    try {
      const { data, error: saveError } = await supabase.from('restaurants').update(patch).eq('id', restaurant.id).select('*').single();
      if (saveError) throw saveError;
      const nextStore = data as Restaurant;
      const resolvedLang = getStoreLangFromStore(nextStore);
      setRestaurant(nextStore);
      setStoreTheme(nextStore.storefront_theme === 'dark' ? 'dark' : 'light');
      setStoreAccent(getAccent(nextStore.storefront_accent));
      setStoreLang(resolvedLang);
      setHeroMediaType(getHeroMediaType(nextStore.hero_media_type));
      saveBuilderLanguageLocal(resolvedLang);
      markSaved();
    } catch (err: any) {
      setSaveState('Error');
      setError(err?.message || COPY[storeLang].saveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function setBuilderLanguage(nextLang: Lang, shouldSave = true) {
    setError('');
    setStoreLang(nextLang);
    saveBuilderLanguageLocal(nextLang);
    setRestaurant((current) => current ? { ...current, storefront_language: nextLang, order_language: nextLang, owner_language: nextLang } : current);

    if (!shouldSave || !restaurant?.id) {
      markSaved(COPY[nextLang].languageSaved);
      return;
    }

    setSaving(true);
    setSaveState('Saving');
    try {
      const patch = { storefront_language: nextLang, order_language: nextLang, owner_language: nextLang };
      const { data, error: updateError } = await supabase.from('restaurants').update(patch).eq('id', restaurant.id).select('*').single();
      if (updateError) throw updateError;
      setRestaurant((data as Restaurant) || { ...restaurant, ...patch });
      setStoreLang(nextLang);
      saveBuilderLanguageLocal(nextLang);
      markSaved(COPY[nextLang].languageSaved);
    } catch (err: any) {
      setSaveState('Error');
      setError(err?.message || COPY[nextLang].saveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function toggleBuilderLanguage() {
    await setBuilderLanguage(storeLang === 'en' ? 'es' : 'en', true);
  }

  async function saveStoreSection(close = false) {
    await saveRestaurantPatch({
      name: restaurant?.name || 'Your Store',
      slug: slugify(restaurant?.slug || restaurant?.name || 'your-store'),
      phone: restaurant?.phone || '',
      address: restaurant?.address || '',
      instagram_url: cleanSocialHandle(restaurant?.instagram_url),
      facebook_url: cleanSocialHandle(restaurant?.facebook_url),
      youtube_url: cleanSocialHandle(restaurant?.youtube_url),
      tiktok_url: cleanSocialHandle(restaurant?.tiktok_url),
    });
    if (close) closePanelFully();
  }

  async function saveBrandingSection(close = false) {
    const currentHeroVideo = restaurant?.hero_video || restaurant?.hero_video_file || restaurant?.hero_video_url || '';
    await saveRestaurantPatch({ logo_image: restaurant?.logo_image || '', hero_image: restaurant?.hero_image || '', hero_media_type: heroMediaType, hero_video: currentHeroVideo });
    if (close) closePanelFully();
  }

  async function saveControlsSection(closeControl = false) {
    await saveRestaurantPatch({
      pickup_enabled: Boolean(restaurant?.pickup_enabled),
      delivery_enabled: Boolean(restaurant?.delivery_enabled),
      delivery_fee: Number(restaurant?.delivery_fee || 0),
      delivery_radius: Number(restaurant?.delivery_radius || 5),
      delivery_minimum: Number(restaurant?.delivery_minimum || 0),
      storefront_theme: storeTheme,
      storefront_accent: storeAccent,
      storefront_language: storeLang,
      order_language: storeLang,
      owner_language: storeLang,
    });
    if (closeControl) closePanelFully();
  }

  async function saveHoursSection(close = false) {
    await saveRestaurantPatch({ hours });
    if (close) closePanelFully();
  }

  async function saveAllChanges() {
    await saveRestaurantPatch({
      name: restaurant?.name || 'Your Store',
      slug: slugify(restaurant?.slug || restaurant?.name || 'your-store'),
      phone: restaurant?.phone || '',
      address: restaurant?.address || '',
      instagram_url: cleanSocialHandle(restaurant?.instagram_url),
      facebook_url: cleanSocialHandle(restaurant?.facebook_url),
      youtube_url: cleanSocialHandle(restaurant?.youtube_url),
      tiktok_url: cleanSocialHandle(restaurant?.tiktok_url),
      logo_image: restaurant?.logo_image || '',
      hero_image: restaurant?.hero_image || '',
      hero_video: restaurant?.hero_video || restaurant?.hero_video_file || restaurant?.hero_video_url || '',
      hero_media_type: heroMediaType,
      pickup_enabled: Boolean(restaurant?.pickup_enabled),
      delivery_enabled: Boolean(restaurant?.delivery_enabled),
      delivery_fee: Number(restaurant?.delivery_fee || 0),
      delivery_radius: Number(restaurant?.delivery_radius || 5),
      delivery_minimum: Number(restaurant?.delivery_minimum || 0),
      storefront_theme: storeTheme,
      storefront_accent: storeAccent,
      storefront_language: storeLang,
      order_language: storeLang,
      owner_language: storeLang,
      hours,
    });
  }

  async function uploadMedia(file: File, kind: 'hero' | 'logo' | 'item' | 'heroVideo' | 'itemVideo') {
    if (!restaurant?.id) return;
    setSaving(true);
    setSaveState('Saving');
    setError('');
    try {
      const uploadLabel = kind === 'heroVideo' ? 'Hero video' : kind === 'itemVideo' ? 'Menu video' : kind === 'logo' ? 'Logo image' : kind === 'hero' ? 'Hero image' : 'Menu item image';
      let uploadFile = file;

      if (kind === 'heroVideo' || kind === 'itemVideo') {
        if (!isVideoFile(file.name) && !String(file.type || '').startsWith('video/')) throw new Error('Use an MP4, MOV, M4V, WEBM, or OGG video file.');
        if (fileSizeMb(file) > (kind === 'heroVideo' ? MAX_HERO_VIDEO_MB : MAX_MENU_VIDEO_MB)) {
          setLastSaved('Compressing video...');
          uploadFile = await optimizeVideoFile(file, uploadLabel);
        }
      } else {
        const imageError = validateUploadFile(file, {
          kind: kind === 'logo' ? 'logo' : kind === 'hero' ? 'heroImage' : 'image',
          label: uploadLabel,
        });
        if (imageError) throw new Error(imageError);
      }

      const videoError = kind === 'heroVideo' || kind === 'itemVideo'
        ? validateUploadFile(uploadFile, { kind: kind === 'heroVideo' ? 'heroVideo' : 'video', label: uploadLabel })
        : '';
      if (videoError) throw new Error(videoError);

      const videoUploadTargetId = videoUploadTargetIdRef.current || selectedVideoId;
      const videoTargetItem = openPanel === 'videos' ? (items.find((item) => item.id === videoUploadTargetId) || selectedVideoItem) : selectedItem;
      const uploadFolder = kind === 'itemVideo' && openPanel === 'videos' ? 'videos' : (kind === 'item' || kind === 'itemVideo' ? categoryKey(workspaceCategory?.name || selectedCategory?.name || workspacePreset?.key || 'universal') : restaurant.id);
      const prefix = kind === 'heroVideo' ? 'hero-video' : kind === 'itemVideo' ? 'item-video' : kind;
      const path = `${uploadFolder}/${prefix}-${Date.now()}.${fileExt(uploadFile.name)}`;
      const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, uploadFile, { upsert: true, contentType: uploadFile.type || undefined });
      if (uploadError) throw uploadError;
      const publicUrl = bucketUrl(path);

      if (kind === 'hero') await saveRestaurantPatch({ hero_image: path, hero_media_type: 'image' });
      if (kind === 'logo') await saveRestaurantPatch({ logo_image: path });
      if (kind === 'heroVideo') {
        const videoPatches: any[] = [
          { hero_video: path },
          { hero_video_file: path },
          { hero_video_url: path },
          { hero_media_type: 'video' },
        ];
        const { data, error: videoError } = await updateEveryExistingColumn('restaurants', restaurant.id, undefined, videoPatches);
        if (videoError) throw videoError;
        setRestaurant({ ...restaurant, ...(data as Restaurant), hero_video: path, hero_media_type: 'video' });
        setHeroMediaType('video');
        markSaved();
      }
      if (kind === 'item' && selectedItem) {
        const { data, error: imageError } = await updateFirstWorkingColumn('menu_items', selectedItem.id, restaurant.id, [
          { image_file: path, image_url: path },
          { image_file: path },
          { image_url: path },
          { image_file: publicUrl, image_url: publicUrl },
          { image_file: publicUrl },
          { image_url: publicUrl },
        ]);
        if (imageError) throw imageError;
        const patched = (data as MenuItem) || { ...selectedItem, image_file: path, image_url: path };
        setItems((prev) => prev.map((item) => (item.id === selectedItem.id ? { ...item, ...patched, image_file: patched.image_file || path, image_url: patched.image_url || path } : item)));
        markSaved();
      }
      if (kind === 'itemVideo' && videoTargetItem) {
        const { data, error: itemVideoError } = await updateFirstWorkingColumn('menu_items', videoTargetItem.id, restaurant.id, [
          { video_file: path, video_url: path },
          { video_file: path },
          { video_url: path },
          { menu_video: path },
          { item_video: path },
          { video_file: publicUrl, video_url: publicUrl },
          { video_file: publicUrl },
          { video_url: publicUrl },
          { menu_video: publicUrl },
          { item_video: publicUrl },
        ]);
        if (itemVideoError) throw itemVideoError;
        const patched = (data as MenuItem) || { ...videoTargetItem, video_file: path, video_url: path };
        setItems((prev) => prev.map((item) => (item.id === videoTargetItem.id ? { ...item, ...patched, video_file: patched.video_file || path, video_url: patched.video_url || path, availability: VIDEO_MENU_AVAILABILITY, is_available: true } : item)));
        setSelectedVideoId(videoTargetItem.id);
        setActiveCategoryId('VIDEO_MENU');
        videoUploadTargetIdRef.current = '';
        markSaved();
      }
    } catch (err: any) {
      setSaveState('Error');
      setError(err?.message || t.uploadFailed);
    } finally {
      setSaving(false);
    }
  }

  async function addCategory(name = `Category ${categories.length + 1}`) {
    if (!restaurant?.id) return null;
    setSaving(true);
    setSaveState('Saving');
    setError('');
    try {
      const existing = regularCategories.find((cat) => normalize(cat.name) === normalize(name) || categoryKey(cat.name) === categoryKey(name));
      if (existing) {
        setActiveCategoryId(existing.id);
        setMenuWorkspaceKey(existing.id);
        markSaved();
        return existing;
      }
      const newCategory = { id: makeId(), restaurant_id: restaurant.id, name: categoryKey(name), sort_order: regularCategories.length + 1 };
      const { data, error: insertError } = await supabase.from('menu_categories').insert(newCategory).select('*').single();
      if (insertError) throw insertError;
      const savedCategory = data as Category;
      setCategories((prev) => [...prev, savedCategory]);
      setActiveCategoryId(savedCategory.id);
      setMenuWorkspaceKey(savedCategory.id);
      markSaved();
      return savedCategory;
    } catch (err: any) {
      setSaveState('Error');
      setError(err?.message || t.saveFailed);
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function openCategoryWorkspace(key: string) {
    const existing = regularCategories.find((cat) => cat.id === key || normalize(cat.name) === normalize(key) || categoryKey(cat.name) === categoryKey(key));
    if (existing) {
      setMenuWorkspaceKey(existing.id);
      setActiveCategoryId(existing.id);
      const firstItem = regularItems.find((item) => item.category_id === existing.id);
      setSelectedItemId(firstItem?.id || '');
      setDeleteMode('item');
      return;
    }
    setMenuWorkspaceKey(key);
    setActiveCategoryId('all');
    setSelectedItemId('');
    setDeleteMode('item');
  }

  async function saveCategory(id: string, patch: Partial<Category>) {
    if (!restaurant?.id) return;
    setSaving(true);
    setSaveState('Saving');
    setError('');
    try {
      const cleanPatch = patch.name ? { ...patch, name: categoryKey(patch.name) } : patch;
      const { data, error: updateError } = await supabase.from('menu_categories').update(cleanPatch).eq('id', id).eq('restaurant_id', restaurant.id).select('*').maybeSingle();
      if (updateError) throw updateError;
      setCategories((prev) => prev.map((cat) => (cat.id === id ? ({ ...cat, ...(data || cleanPatch) } as Category) : cat)));
      markSaved();
    } catch (err: any) {
      setSaveState('Error');
      setError(err?.message || t.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(id: string) {
    if (!restaurant?.id) return;
    if (!confirm('Delete this whole category and every item inside it?')) return;
    setSaving(true);
    setSaveState('Saving');
    setError('');
    const oldCategories = categories;
    const oldItems = items;
    try {
      const itemIds = items.filter((item) => item.category_id === id).map((item) => item.id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      setItems((prev) => prev.filter((item) => item.category_id !== id));
      setActiveCategoryId('all');
      setMenuWorkspaceKey('');
      setSelectedItemId('');
      if (itemIds.length) {
        const { error: hideError } = await supabase.from('menu_items').update({ is_available: false, availability: 'deleted', sort_order: 999999 }).in('id', itemIds).eq('restaurant_id', restaurant.id);
        if (hideError) throw hideError;
      }
      const { error: deleteError } = await supabase.from('menu_categories').delete().eq('id', id).eq('restaurant_id', restaurant.id);
      if (deleteError) throw deleteError;
      markSaved();
    } catch (err: any) {
      setCategories(oldCategories);
      setItems(oldItems);
      setSaveState('Error');
      setError(err?.message || t.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function addItem(itemName?: string, categoryName?: string) {
    if (!restaurant?.id) return;
    setSaving(true);
    setSaveState('Saving');
    setError('');
    try {
      let category = categoryName ? regularCategories.find((cat) => normalize(cat.name) === normalize(categoryName) || categoryKey(cat.name) === categoryKey(categoryName)) : workspaceCategory || regularCategories.find((cat) => cat.id === activeCategoryId) || null;
      if (!category) {
        const createdCategory = await addCategory(categoryName || workspacePreset?.key || menuWorkspaceKey || 'burgers');
        if (!createdCategory) return;
        category = createdCategory;
      }
      const finalName = itemName || pretty(category.name);
      const firstPhoto = bucketImageOptions[0]?.path || '';
      const newItem = {
        id: makeId(),
        restaurant_id: restaurant.id,
        category_id: category.id,
        name: finalName,
        description: 'Fresh food made just for you.',
        base_price: 0,
        price: 0,
        image_url: firstPhoto,
        image_file: firstPhoto,
        sort_order: regularItems.length + 1,
        availability: 'available',
        is_available: true,
      };
      const { data, error: insertError } = await supabase.from('menu_items').insert(newItem).select('*').single();
      if (insertError) throw insertError;
      const savedItem = data as MenuItem;
      setItems((prev) => [...prev, savedItem]);
      setActiveCategoryId(category.id);
      setSelectedItemId(savedItem.id);
      setMenuWorkspaceKey(category.id);
      setDeleteMode('item');
      markSaved();
    } catch (err: any) {
      setSaveState('Error');
      setError(err?.message || t.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function saveItem(id: string, patch: Partial<MenuItem>) {
    if (!restaurant?.id) return;
    setSaving(true);
    setSaveState('Saving');
    setError('');
    const currentItem = items.find((item) => item.id === id);
    const mergedItem = currentItem ? { ...currentItem, ...patch } : patch;
    const nextPrice = Number(mergedItem.base_price ?? mergedItem.price ?? 0);
    const dbPatch: any = { ...patch };
    if ('base_price' in dbPatch || 'price' in dbPatch) {
      dbPatch.base_price = nextPrice;
      dbPatch.price = nextPrice;
    }
    if ('image_url' in dbPatch && !dbPatch.image_file) dbPatch.image_file = dbPatch.image_url;
    delete dbPatch.item_image;
    try {
      const { data, error: updateError } = await supabase.from('menu_items').update(dbPatch).eq('id', id).eq('restaurant_id', restaurant.id).select('*').maybeSingle();
      if (updateError) throw updateError;
      if (!data) throw new Error('This item could not be updated.');
      setItems((prev) => prev.map((item) => (item.id === id ? (data as MenuItem) : item)));
      if (!isVideoMenuItem(data as MenuItem)) setSelectedItemId(id);
      else {
        setSelectedVideoId(id);
        setActiveCategoryId('VIDEO_MENU');
      }
      markSaved();
    } catch (err: any) {
      setSaveState('Error');
      setError(err?.message || t.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: string) {
    if (!restaurant?.id) return;
    if (!confirm('Delete this item from the menu and storefront?')) return;
    setSaving(true);
    setSaveState('Saving');
    setError('');
    const oldItems = items;
    const deletedItem = items.find((item) => item.id === id);
    const nextItems = items.filter((item) => item.id !== id);
    const nextItem = nextItems.find((item) => item.category_id === deletedItem?.category_id && !isVideoMenuItem(item)) || null;
    const nextVideo = nextItems.find((item) => isVideoMenuItem(item)) || null;
    setItems(nextItems);
    setSelectedItemId(nextItem?.id || '');
    setSelectedVideoId(nextVideo?.id || '');
    try {
      const { error: hideError } = await supabase.from('menu_items').update({ is_available: false, availability: 'deleted', sort_order: 999999 }).eq('id', id).eq('restaurant_id', restaurant.id);
      if (hideError) throw hideError;
      markSaved();
    } catch (err: any) {
      setItems(oldItems);
      setSelectedItemId(id);
      setSaveState('Error');
      setError(err?.message || t.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function addVideoItem() {
    if (!restaurant?.id) return;
    setSaving(true);
    setSaveState('Saving');
    setError('');
    try {
      const id = makeId();
      const basePayload = {
        id,
        restaurant_id: restaurant.id,
        category_id: null,
        name: `Video Menu Item ${videoItems.length + 1}`,
        description: 'Fresh food video item.',
        base_price: 0,
        price: 0,
        image_url: '',
        image_file: '',
        video_file: '',
        video_url: '',
        sort_order: items.length + 1,
        availability: VIDEO_MENU_AVAILABILITY,
        is_available: true,
      };
      const { data, error: insertError } = await insertFirstWorkingPayload('menu_items', [
        basePayload,
        { ...basePayload, video_file: undefined },
        { ...basePayload, video_url: undefined },
        { ...basePayload, video_file: undefined, video_url: undefined },
      ]);
      if (insertError) throw insertError;
      const savedVideo = (data || basePayload) as MenuItem;
      setItems((prev) => [...prev, savedVideo]);
      setSelectedVideoId(savedVideo.id);
      setActiveCategoryId('VIDEO_MENU');
      markSaved();
    } catch (err: any) {
      setSaveState('Error');
      setError(err?.message || t.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function deleteVideoItem(id: string) { await deleteItem(id); }

  async function runOneDeleteButton() {
    if (deleteMode === 'category' && workspaceCategory) {
      await deleteCategory(workspaceCategory.id);
      return;
    }
    const itemToDelete = workspaceItems.find((item) => item.id === selectedItemId) || workspaceItems[0];
    if (itemToDelete) await deleteItem(itemToDelete.id);
  }

  async function saveMenuWorkspaceAndClose() {
    markSaved();
    setMenuWorkspaceKey('');
    setActiveCategoryId('all');
    setSelectedItemId('');
    setDeleteMode('item');
    closePanelFully();
  }

  function switchPanel(nextPanel: BuilderPanelId) {
    setOpenPanel((current) => {
      const next = current === nextPanel ? '' : nextPanel;
      if (next !== 'menu') {
        setMenuWorkspaceKey('');
        setSelectedItemId('');
        setDeleteMode('item');
      }
      if (next !== 'videos' && activeCategoryId === 'VIDEO_MENU') setActiveCategoryId('all');
      if (next === 'videos') setActiveCategoryId('VIDEO_MENU');
      if (next !== 'controls') setActiveControl('');
      return next;
    });
  }

  function closePanelFully() {
    setOpenPanel('');
    setActiveControl('');
    setMenuWorkspaceKey('');
    if (activeCategoryId === 'VIDEO_MENU') setActiveCategoryId('all');
    setSelectedItemId('');
    setDeleteMode('item');
  }

  function onHeroUpload(e: ChangeEvent<HTMLInputElement>) { const file = e.target.files?.[0]; if (file) void uploadMedia(file, 'hero'); e.target.value = ''; }
  function onHeroVideoUpload(e: ChangeEvent<HTMLInputElement>) { const file = e.target.files?.[0]; if (file) void uploadMedia(file, 'heroVideo'); e.target.value = ''; }
  function onLogoUpload(e: ChangeEvent<HTMLInputElement>) { const file = e.target.files?.[0]; if (file) void uploadMedia(file, 'logo'); e.target.value = ''; }
  function onItemUpload(e: ChangeEvent<HTMLInputElement>) { const file = e.target.files?.[0]; if (file) void uploadMedia(file, 'item'); e.target.value = ''; }
  function onItemVideoUpload(e: ChangeEvent<HTMLInputElement>) { const file = e.target.files?.[0]; if (file) void uploadMedia(file, 'itemVideo'); e.target.value = ''; }


  function currentStoreName() {
    return storeName;
  }

  function currentStoreSlug() {
    return storeSlug;
  }

  function currentStoreHeroImage() {
    return String(restaurant?.hero_image || '').trim();
  }

  function currentStoreLogoImage() {
    return String(restaurant?.logo_image || '').trim();
  }

  function currentAccentClass() {
    return storeAccent;
  }

  function storefrontPromoLink() {
    if (typeof window === 'undefined') return storeUrl;
    return `${window.location.origin}${storeUrl}`;
  }

  function promoCaption(type: 'storefront' | 'menu' | 'rewards' | 'review') {
    const liveUrl = storefrontPromoLink();

    const captions: Record<typeof type, string> = {
      storefront: `Order direct from ${currentStoreName()} on ORDA. ${liveUrl}`,
      menu: `Check out the menu from ${currentStoreName()} on ORDA. ${liveUrl}`,
      rewards: `New rewards are live at ${currentStoreName()} on ORDA. ${liveUrl}`,
      review: `Watch real customer reviews for ${currentStoreName()} on ORDA. ${liveUrl}`,
    };

    return captions[type] || captions.storefront;
  }

  async function copyPromoCaption(type: 'storefront' | 'menu' | 'rewards' | 'review') {
    const textToCopy = promoCaption(type);
    await navigator.clipboard?.writeText(textToCopy).catch(() => null);
    markSaved('Storefront link and caption copied.');
  }

  async function shareStorefrontPromo(type: 'storefront' | 'menu' | 'rewards' | 'review') {
    const liveUrl = storefrontPromoLink();
    const shareText = promoCaption(type);

    await navigator.clipboard?.writeText(shareText).catch(() => null);

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${currentStoreName()} | ORDA`,
          text: shareText,
          url: liveUrl,
        });
        markSaved('Share opened. Storefront link copied.');
        return;
      }
    } catch {
      markSaved('Storefront link copied.');
      return;
    }

    markSaved('Storefront link copied. Paste it into Instagram, Facebook, TikTok, YouTube, or your caption.');
  }


  if (loading) {
    return <main className="ordaBuilderPage"><div className="loadingBox">{t.loading}</div><style jsx global>{styles}</style></main>;
  }

  return (
    <main className="ordaBuilderPage">
      <input ref={fileHeroRef} type="file" accept="image/*" hidden onChange={onHeroUpload} />
      <input ref={fileHeroVideoRef} type="file" accept="video/*,.mp4,.mov,.m4v,.webm,.ogg" hidden onChange={onHeroVideoUpload} />
      <input ref={fileLogoRef} type="file" accept="image/*" hidden onChange={onLogoUpload} />
      <input ref={fileItemRef} type="file" accept="image/*" hidden onChange={onItemUpload} />
      <input ref={fileItemVideoRef} type="file" accept="video/*,.mp4,.mov,.m4v,.webm,.ogg" hidden onChange={onItemVideoUpload} />

      <header className="builderHeader">
        <div className="brandRow">
          <img src="/orda-logo.png" alt="ORDA" className="ordaLogo" />
          <div>
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </div>
        </div>
        <div className="headerActions">
          <button type="button" className="ghostBtn" onClick={() => router.push('/dashboard/owner')}>{t.dashboard}</button>
          <button type="button" className="ghostBtn" onClick={() => window.open(storeUrl, '_blank', 'noopener,noreferrer')}>{t.openStore}</button>
          <div className="headerLangSwitch" aria-label="Builder language">
            <button type="button" className={storeLang === 'en' ? 'active' : ''} disabled={saving} onClick={() => setBuilderLanguage('en', true)}>EN</button>
            <button type="button" className={storeLang === 'es' ? 'active' : ''} disabled={saving} onClick={() => setBuilderLanguage('es', true)}>ES</button>
          </div>
          <button type="button" className="ghostBtn languageToggleBtn" disabled={saving} onClick={toggleBuilderLanguage}>{storeLang === 'en' ? 'ES' : 'EN'}</button>
          <button type="button" className="mainBtn" disabled={saving} onClick={saveAllChanges}>{saving ? t.saving : t.saveAll}</button>
        </div>
      </header>

      {error ? <div className="errorBanner">{error}</div> : null}

      <section className="builderLayout">
        <aside className="leftEditor">
          <section className="quickPickBar workingGlow">
            <button type="button" className={openPanel === 'store' ? 'active' : ''} onClick={() => switchPanel('store')}>Store</button>
            <button type="button" className={openPanel === 'branding' ? 'active' : ''} onClick={() => switchPanel('branding')}>Branding</button>
            <button type="button" className={openPanel === 'controls' ? 'active' : ''} onClick={() => switchPanel('controls')}>Style</button>
            <button type="button" className={openPanel === 'hours' ? 'active' : ''} onClick={() => switchPanel('hours')}>Hours</button>
            <button type="button" className={openPanel === 'menu' ? 'active' : ''} onClick={() => switchPanel('menu')}>Photos Menu</button>
            <button type="button" className={openPanel === 'videos' ? 'active' : ''} onClick={() => switchPanel('videos')}>Video Menu</button>
          </section>

          <Panel id="store" title={t.storeSetup} openPanel={openPanel} setOpenPanel={closePanelFully} state={saveState}>
            <div className="twoGrid">
              <label>{t.storeName}<input value={restaurant?.name || ''} onChange={(e) => setRestaurant((current) => current ? { ...current, name: e.target.value, slug: slugify(e.target.value) } : current)} /></label>
              <label>{t.storeUrl}<input value={restaurant?.slug || ''} onChange={(e) => setRestaurant((current) => current ? { ...current, slug: slugify(e.target.value) } : current)} /><small>/store/{storeSlug}</small></label>
            </div>
            <label>{t.phone}<input value={restaurant?.phone || ''} onChange={(e) => setRestaurant((current) => current ? { ...current, phone: e.target.value } : current)} /></label>
            <label>{t.address}<input value={restaurant?.address || ''} onChange={(e) => setRestaurant((current) => current ? { ...current, address: e.target.value } : current)} /></label>
            <section className="socialBox">
              <h3>{t.socialLinks}</h3>
              <p>{t.socialHelp}</p>
              <div className="socialInputGrid">
                <label><span>◎ {t.instagram}</span><input value={restaurant?.instagram_url || ''} onChange={(e) => setRestaurant((current) => current ? { ...current, instagram_url: cleanSocialHandle(e.target.value) } : current)} /></label>
                <label><span>f {t.facebook}</span><input value={restaurant?.facebook_url || ''} onChange={(e) => setRestaurant((current) => current ? { ...current, facebook_url: cleanSocialHandle(e.target.value) } : current)} /></label>
                <label><span>▶ {t.youtube}</span><input value={restaurant?.youtube_url || ''} onChange={(e) => setRestaurant((current) => current ? { ...current, youtube_url: cleanSocialHandle(e.target.value) } : current)} /></label>
                <label><span>♪ {t.tiktok}</span><input value={restaurant?.tiktok_url || ''} onChange={(e) => setRestaurant((current) => current ? { ...current, tiktok_url: cleanSocialHandle(e.target.value) } : current)} /></label>
              </div>
            </section>
            <div className="buttonRow">
              <button type="button" className="sectionSave" onClick={() => saveStoreSection(false)}>{t.saveSection}</button>
              <button type="button" className="ghostBtn" onClick={() => saveStoreSection(true)}>{t.saveClose}</button>
            </div>
          </Panel>

          <Panel id="branding" title={t.branding} openPanel={openPanel} setOpenPanel={closePanelFully} state={saveState}>
            <section className="heroMediaBox">
              <div><h3>{t.heroMedia}</h3><p>{t.heroHelp}</p></div>
              <div className="buttonRow">
                <button type="button" className={heroMediaType === 'image' ? 'choiceBtn active' : 'choiceBtn'} onClick={() => { setHeroMediaType('image'); setRestaurant((current) => current ? { ...current, hero_media_type: 'image' } : current); }}>{t.useHeroImage}</button>
                <button type="button" className={heroMediaType === 'video' ? 'choiceBtn active' : 'choiceBtn'} onClick={() => { setHeroMediaType('video'); setRestaurant((current) => current ? { ...current, hero_media_type: 'video' } : current); }}>{t.useHeroVideo}</button>
              </div>
            </section>
            <div className="uploadGrid">
              <div className="uploadCard"><img src={logo} alt="Logo preview" onError={handleBrokenImage} /><button type="button" className="mainBtn" onClick={() => fileLogoRef.current?.click()}>{t.uploadLogo}</button></div>
              <div className="uploadCard"><img src={hero} alt="Hero preview" onError={handleBrokenImage} /><button type="button" className="mainBtn" onClick={() => fileHeroRef.current?.click()}>{t.uploadHero}</button></div>
            </div>
            <div className="videoPreviewCard">{heroVideo ? <video key={heroVideo} src={heroVideo} controls muted playsInline preload="metadata" /> : <div className="videoEmpty">No hero video uploaded yet.</div>}<button type="button" className="mainBtn" onClick={() => fileHeroVideoRef.current?.click()}>{t.uploadHeroVideo}</button></div>
            <div className="buttonRow"><button type="button" className="sectionSave" onClick={() => saveBrandingSection(false)}>{t.saveSection}</button><button type="button" className="ghostBtn" onClick={() => saveBrandingSection(true)}>{t.saveClose}</button></div>
          </Panel>

          <Panel id="controls" title={t.styleControls} openPanel={openPanel} setOpenPanel={closePanelFully} state={saveState}>
            <div className="controlChoiceGrid">
              {[
                { id: 'colors', title: t.storeColors, sub: ACCENTS.find((a) => a.key === storeAccent)?.label || 'Color' },
                { id: 'order', title: t.orderControls, sub: `${restaurant?.pickup_enabled ? 'Pickup ON' : 'Pickup OFF'} · ${restaurant?.delivery_enabled ? 'Delivery ON' : 'Delivery OFF'}` },
                { id: 'delivery', title: t.deliveryControls, sub: `${money(restaurant?.delivery_fee)} fee · ${restaurant?.delivery_radius || 5} miles` },
                { id: 'language', title: t.languageControls, sub: `${storeLang.toUpperCase()} · ${storeTheme}` },
              ].map((card) => <button key={card.id} type="button" className={activeControl === card.id ? 'controlCard active' : 'controlCard'} onClick={() => setActiveControl(activeControl === card.id ? '' : card.id as ControlPanelId)}><strong>{card.title}</strong><span>{card.sub}</span><b>{activeControl === card.id ? t.close : t.open}</b></button>)}
            </div>

            {activeControl === 'colors' ? <section className="styleBox">
              <div className="accentGrid">{ACCENTS.map((accent) => <button type="button" key={accent.key} className={storeAccent === accent.key ? `accentCard accent-${accent.key} active` : `accentCard accent-${accent.key}`} onClick={() => { setStoreAccent(accent.key); setRestaurant((current) => current ? { ...current, storefront_accent: accent.key } : current); }}><i /><strong>{accent.label}</strong><small>{accent.sub}</small></button>)}</div>
              <div className="buttonRow"><button type="button" className="sectionSave" onClick={() => saveControlsSection(false)}>{t.saveSection}</button><button type="button" className="ghostBtn" onClick={() => saveControlsSection(true)}>{t.saveClose}</button></div>
            </section> : null}

            {activeControl === 'order' ? <section className="miniControlPanel">
              <div className="buttonRow">
                <button type="button" className={restaurant?.pickup_enabled ? 'choiceBtn active' : 'choiceBtn'} onClick={() => setRestaurant((current) => current ? { ...current, pickup_enabled: !current.pickup_enabled } : current)}>{t.pickup}: {restaurant?.pickup_enabled ? 'ON' : 'OFF'}</button>
                <button type="button" className={restaurant?.delivery_enabled ? 'choiceBtn active' : 'choiceBtn'} onClick={() => setRestaurant((current) => current ? { ...current, delivery_enabled: !current.delivery_enabled } : current)}>{t.delivery}: {restaurant?.delivery_enabled ? 'ON' : 'OFF'}</button>
              </div>
              <div className="buttonRow"><button type="button" className="sectionSave" onClick={() => saveControlsSection(false)}>{t.saveSection}</button><button type="button" className="ghostBtn" onClick={() => saveControlsSection(true)}>{t.saveClose}</button></div>
            </section> : null}

            {activeControl === 'delivery' ? <section className="miniControlPanel">
              <div className="threeGrid">
                <label>{t.deliveryFee}<input type="number" value={restaurant?.delivery_fee ?? 0} onChange={(e) => setRestaurant((current) => current ? { ...current, delivery_fee: Number(e.target.value) } : current)} /></label>
                <label>{t.deliveryMin}<input type="number" value={restaurant?.delivery_minimum ?? 0} onChange={(e) => setRestaurant((current) => current ? { ...current, delivery_minimum: Number(e.target.value) } : current)} /></label>
                <label>{t.radius}<input type="number" value={restaurant?.delivery_radius ?? 5} onChange={(e) => setRestaurant((current) => current ? { ...current, delivery_radius: Number(e.target.value) } : current)} /></label>
              </div>
              <div className="buttonRow"><button type="button" className="sectionSave" onClick={() => saveControlsSection(false)}>{t.saveSection}</button><button type="button" className="ghostBtn" onClick={() => saveControlsSection(true)}>{t.saveClose}</button></div>
            </section> : null}

            {activeControl === 'language' ? <section className="miniControlPanel languagePanelFixed">
              <div className="buttonRow">
                <button type="button" className={storeTheme === 'light' ? 'choiceBtn active' : 'choiceBtn'} onClick={() => setStoreTheme('light')}>{t.light}</button>
                <button type="button" className={storeTheme === 'dark' ? 'choiceBtn active' : 'choiceBtn'} onClick={() => setStoreTheme('dark')}>{t.dark}</button>
              </div>
              <div className="builderLangButtons">
                <button type="button" className={storeLang === 'en' ? 'active' : ''} disabled={saving} onClick={() => setBuilderLanguage('en', true)}>English</button>
                <button type="button" className={storeLang === 'es' ? 'active' : ''} disabled={saving} onClick={() => setBuilderLanguage('es', true)}>Español</button>
              </div>
              <div className="buttonRow"><button type="button" className="sectionSave" onClick={() => saveControlsSection(false)}>{t.saveSection}</button><button type="button" className="ghostBtn" onClick={() => saveControlsSection(true)}>{t.saveClose}</button></div>
            </section> : null}
          </Panel>

          <Panel id="hours" title={t.hours} openPanel={openPanel} setOpenPanel={closePanelFully} state={saveState}>
            <div className="hoursGrid">
              {DAYS.map(([key, label]) => <div key={key} className="hourRow"><strong>{label}</strong><button type="button" className={hours[key].isOpen ? 'choiceBtn active' : 'choiceBtn'} onClick={() => setHours((current) => ({ ...current, [key]: { ...current[key], isOpen: !current[key].isOpen } }))}>{hours[key].isOpen ? t.open : t.closed}</button><input type="time" value={hours[key].open} onChange={(e) => setHours((current) => ({ ...current, [key]: { ...current[key], open: e.target.value } }))} /><input type="time" value={hours[key].close} onChange={(e) => setHours((current) => ({ ...current, [key]: { ...current[key], close: e.target.value } }))} /></div>)}
            </div>
            <div className="buttonRow"><button type="button" className="sectionSave" onClick={() => saveHoursSection(false)}>{t.saveSection}</button><button type="button" className="ghostBtn" onClick={() => saveHoursSection(true)}>{t.saveClose}</button></div>
          </Panel>

          <Panel id="menu" title={t.menu} openPanel={openPanel} setOpenPanel={closePanelFully} state={saveState}>
            {!menuWorkspaceKey ? <>
              <section className="sectionIntro"><h3>{t.chooseMenuCategory}</h3><p>{t.chooseMenuCategoryText}</p></section>
              <div className="categoryChoiceGrid">{OWNER_CATEGORY_CHOICES.map((choice) => {
                const existing = regularCategories.find((cat) => categoryKey(cat.name) === categoryKey(choice.key) || normalize(cat.name) === normalize(choice.key));
                const count = existing ? categoryCounts.get(existing.id) || 0 : 0;
                return <button key={choice.key} type="button" className={existing ? 'menuPickCard live' : 'menuPickCard'} onClick={() => openCategoryWorkspace(existing?.id || choice.key)}><span>{choice.emoji}</span><strong>{choice.label}</strong><small>{existing ? t.existingCategory : t.presetCategory}</small><b>{count} {t.hasItems}</b><em>{existing ? t.manage : t.createManage}</em></button>;
              })}</div>
              {regularCategories.filter((cat) => !OWNER_CATEGORY_CHOICES.some((choice) => categoryKey(choice.key) === categoryKey(cat.name))).length ? <>
                <h3 className="customCategoryTitle">Custom Categories</h3>
                <div className="categoryChoiceGrid">{regularCategories.filter((cat) => !OWNER_CATEGORY_CHOICES.some((choice) => categoryKey(choice.key) === categoryKey(cat.name))).map((cat) => <button key={cat.id} type="button" className="menuPickCard live" onClick={() => openCategoryWorkspace(cat.id)}><span>🍽️</span><strong>{pretty(cat.name)}</strong><small>{t.existingCategory}</small><b>{categoryCounts.get(cat.id) || 0} {t.hasItems}</b><em>{t.manage}</em></button>)}</div>
              </> : null}
            </> : null}

            {menuWorkspaceKey ? <section className="menuWorkspace">
              <div className="workspaceTop"><div><small>{workspaceCategory ? t.existingCategory : t.presetCategory}</small><h3>{pretty(workspaceCategory?.name || workspacePreset?.label || menuWorkspaceKey)}</h3><p>{workspaceCategory ? `${workspaceItems.length} ${t.hasItems}` : 'Create this category and add food.'}</p></div><button type="button" className="ghostBtn" onClick={() => { setMenuWorkspaceKey(''); setActiveCategoryId('all'); setSelectedItemId(''); }}>{t.close}</button></div>
              {workspaceCategory ? <div className="miniEditCard categoryNameOnly"><label>Category Folder Name<input value={workspaceCategory.name} onChange={(e) => setCategories((prev) => prev.map((c) => c.id === workspaceCategory.id ? { ...c, name: e.target.value } : c))} onBlur={(e) => saveCategory(workspaceCategory.id, { name: e.target.value })} /></label></div> : null}
              <div className="presetQuickAdd">{(workspacePreset?.items || [pretty(menuWorkspaceKey)]).map((itemName) => <button key={itemName} type="button" onClick={() => addItem(itemName, workspaceCategory?.name || workspacePreset?.key || menuWorkspaceKey)}>+ {itemName}</button>)}<button type="button" onClick={() => addItem(pretty(workspaceCategory?.name || workspacePreset?.key || menuWorkspaceKey), workspaceCategory?.name || workspacePreset?.key || menuWorkspaceKey)}>{t.addCustomItem}</button></div>
              {workspaceCategory ? <>
                {workspaceItems.length ? <div className="itemList drawerList">{workspaceItems.map((item, index) => <button key={item.id} type="button" className={selectedItemId === item.id ? 'itemCard active' : 'itemCard'} onClick={() => { setSelectedItemId(item.id); setDeleteMode('item'); }}><div className="itemMediaPreview"><img src={getItemImage(item, workspaceCategory.name, index)} alt={item.name} onError={(event) => handleMenuImageError(event, item, workspaceCategory.name, index)} /></div><strong>{item.name}</strong><span>{money(item.base_price ?? item.price)}</span></button>)}</div> : <div className="emptyBox">{t.emptyCategory}</div>}
                {selectedItem && selectedItem.category_id === workspaceCategory.id ? <EditItemBox t={t} selectedItem={selectedItem} selectedCategory={workspaceCategory} galleryOptions={galleryOptions} bucketImagesLoading={bucketImagesLoading} fileItemRef={fileItemRef} setItems={setItems} saveItem={saveItem} /> : null}
                <div className="deleteControlBox"><div><strong>{t.delete}</strong><p>{t.deleteHelp}</p></div><div className="deleteToggle"><button type="button" className={deleteMode === 'item' ? 'on' : ''} onClick={() => setDeleteMode('item')}>{t.deleteItem}</button><button type="button" className={deleteMode === 'category' ? 'on' : ''} onClick={() => setDeleteMode('category')}>{t.deleteCategory}</button></div><button type="button" className="dangerBtn oneDeleteButton" onClick={runOneDeleteButton} disabled={saving || (deleteMode === 'item' && !workspaceItems.length)}>{t.delete}</button></div>
                <div className="buttonRow"><button type="button" className="sectionSave" onClick={saveMenuWorkspaceAndClose}>{saving ? t.saving : t.saveClose}</button></div>
              </> : null}
            </section> : null}
          </Panel>

          <Panel id="videos" title="Video Menu" openPanel={openPanel} setOpenPanel={closePanelFully} state={saveState}>
            <section className="videoManagerHero"><div><small>INDEPENDENT VIDEO MENU</small><h3>Upload, price, edit, and delete videos</h3><p>Videos show inside the Live Phone Preview under the Video Menu tab and inside All.</p></div><button type="button" className="menuVideoUploadButton" onClick={addVideoItem} disabled={saving}>+ Add Video Item</button></section>
            {videoItems.length ? <section className="videoManagerGrid">{videoItems.map((videoItem) => {
              const active = selectedVideoItem?.id === videoItem.id;
              const videoUrl = savedItemVideo(videoItem);
              const posterImage = getItemImage(videoItem, 'universal');
              return <article key={videoItem.id} className={active ? 'videoManagerCard active' : 'videoManagerCard'}><button type="button" className="videoPreviewButton" onClick={() => { setSelectedVideoId(videoItem.id); setActiveCategoryId('VIDEO_MENU'); }}>{videoUrl ? <video src={videoUrl} poster={posterImage} autoPlay muted playsInline preload="metadata" onLoadedData={replayPreviewVideo} onCanPlay={replayPreviewVideo} onTimeUpdate={stopAtMenuVideoLimit} /> : <div className="videoUploadPlaceholder">No video uploaded yet</div>}</button><div className="videoEditFields"><label>Item Name<input value={videoItem.name || ''} onChange={(e) => setItems((prev) => prev.map((item) => item.id === videoItem.id ? { ...item, name: e.target.value } : item))} onBlur={(e) => saveItem(videoItem.id, { name: e.target.value, availability: VIDEO_MENU_AVAILABILITY })} /></label><label>Item Price<input type="number" value={videoItem.base_price ?? videoItem.price ?? 0} onChange={(e) => setItems((prev) => prev.map((item) => item.id === videoItem.id ? { ...item, base_price: Number(e.target.value), price: Number(e.target.value) } : item))} onBlur={(e) => saveItem(videoItem.id, { base_price: Number(e.target.value), price: Number(e.target.value), availability: VIDEO_MENU_AVAILABILITY })} /></label><label>Description<textarea value={videoItem.description || ''} onChange={(e) => setItems((prev) => prev.map((item) => item.id === videoItem.id ? { ...item, description: e.target.value } : item))} onBlur={(e) => saveItem(videoItem.id, { description: e.target.value, availability: VIDEO_MENU_AVAILABILITY })} /></label></div><div className="videoManagerActions"><button type="button" className="mainBtn videoBtn" onClick={() => { videoUploadTargetIdRef.current = videoItem.id; setSelectedVideoId(videoItem.id); setActiveCategoryId('VIDEO_MENU'); setTimeout(() => fileItemVideoRef.current?.click(), 0); }}>🎥 Upload / Replace Video</button><button type="button" className="dangerBtn" onClick={() => deleteVideoItem(videoItem.id)}>Delete Video</button></div></article>;
            })}</section> : <section className="emptyVideoMenu"><h3>No video items yet</h3><p>Tap Add Video Item. Then name it, price it, upload the video, and it will show in the Live Phone Preview.</p><button type="button" className="menuVideoUploadButton" onClick={addVideoItem} disabled={saving}>+ Add First Video</button></section>}
          </Panel>
        </aside>

        <aside className="rightPreview">
          <StorePhonePreview
            t={t}
            storeName={storeName}
            logo={logo}
            hero={hero}
            heroVideo={heroVideo}
            heroMediaType={heroMediaType}
            restaurant={restaurant}
            categories={regularCategories}
            activeCategoryId={activeCategoryId}
            setActiveCategoryId={setActiveCategoryId}
            items={previewItems}
            selectedItem={selectedItem}
            selectedVideoItem={selectedVideoItem}
            setSelectedItemId={setSelectedItemId}
            setSelectedVideoId={setSelectedVideoId}
            storeTheme={storeTheme}
            storeAccent={storeAccent}
            videoCount={videoItems.length}
          />
        </aside>
      </section>

      <footer className="saveFooter"><span className={`saveDot ${saveState.toLowerCase()}`} /><strong>{saveState === 'Saved' ? t.saved : saveState === 'Saving' ? t.saving : t.error}</strong><em>{lastSaved}</em></footer>

      <section className={`promoStorefrontSection promoAccent-${currentAccentClass()}`}>
        <div className="promoStorefrontCard">
          <div className="promoTop">
            <div>
              <small>PROMOTE</small>
              <h2>Promote Storefront</h2>
              <p>Share your real storefront, menu, rewards, and reviews using the store data already saved in Builder.</p>
            </div>

            <a
              className="promoVisitBtn"
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
            >
              Visit Storefront
            </a>
          </div>

          <div className="promoPreview">
            {(currentStoreHeroImage() || currentStoreLogoImage()) ? (
              <img
                src={resolveUrl(currentStoreHeroImage() || currentStoreLogoImage())}
                alt="Storefront preview"
                onError={handleBrokenImage}
              />
            ) : (
              <div className="promoPlaceholder">
                <strong>{currentStoreName()}</strong>
              </div>
            )}

            <div className="promoPreviewShade" />

            <div className="promoPreviewOverlay">
              <span>Shop this store</span>
              <strong>{currentStoreName()}</strong>
              <em>{storefrontPromoLink()}</em>
            </div>
          </div>

          <div className="promoCaptionBox">
            <span>Ready-to-post caption</span>
            <p>{promoCaption('storefront')}</p>
          </div>

          <div className="promoButtonGrid">
            <button type="button" className="promoActionBtn" onClick={() => shareStorefrontPromo('storefront')}>
              Share Storefront
            </button>

            <button type="button" className="promoActionBtn" onClick={() => shareStorefrontPromo('menu')}>
              Share Menu
            </button>

            <button type="button" className="promoActionBtn" onClick={() => shareStorefrontPromo('rewards')}>
              Share Rewards
            </button>

            <button type="button" className="promoActionBtn" onClick={() => shareStorefrontPromo('review')}>
              Share Reviews
            </button>

            <button type="button" className="promoCopyBtn" onClick={() => copyPromoCaption('storefront')}>
              Copy Store Link
            </button>
          </div>

          <p className="promoShareNote">
            Social apps control what appears in the Mac/iPhone share sheet. ORDA always copies the exact storefront link and caption so it can be pasted anywhere.
          </p>
        </div>
      </section>

      <style jsx global>{styles}</style>
    </main>
  );
}

function EditItemBox({
  t,
  selectedItem,
  selectedCategory,
  galleryOptions,
  bucketImagesLoading,
  fileItemRef,
  setItems,
  saveItem,
}: {
  t: (typeof COPY)[Lang];
  selectedItem: MenuItem;
  selectedCategory: Category | null;
  galleryOptions: ImageOption[];
  bucketImagesLoading: boolean;
  fileItemRef: React.RefObject<HTMLInputElement | null>;
  setItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  saveItem: (id: string, patch: Partial<MenuItem>) => Promise<void>;
}) {
  const image = getItemImage(selectedItem, selectedCategory?.name);
  return (
    <div className="editItemBox">
      <div className="selectedPreview">
        <img src={image} alt={selectedItem.name} onError={(event) => handleMenuImageError(event, selectedItem, selectedCategory?.name)} />
        <div><small>SELECTED PHOTO ITEM</small><h3>{selectedItem.name}</h3><p>{money(selectedItem.base_price ?? selectedItem.price)}</p><div className="buttonRow"><button type="button" className="mainBtn" onClick={() => fileItemRef.current?.click()}>{t.uploadItem}</button></div></div>
      </div>
      <div className="imagePicker">
        <div><h3>{t.pickImage}</h3><p>{selectedCategory ? `${t.pickImageText} Folder: ${categoryKey(selectedCategory.name)}` : t.pickImageText}</p></div>
        {bucketImagesLoading ? <div className="emptyBox">Loading photos from Supabase...</div> : null}
        {!bucketImagesLoading && !galleryOptions.length ? <div className="emptyBox">No photos found in this category folder. Upload item photos or add files to the matching Supabase Storage folder.</div> : null}
        <div className="imageOptionGrid">{galleryOptions.map((option) => <button key={option.path} type="button" onClick={() => saveItem(selectedItem.id, { image_url: option.path, image_file: option.path })}><img src={option.url} alt={option.label} onError={(event) => handleMenuImageError(event, selectedItem, selectedCategory?.name)} /><strong>{option.label}</strong></button>)}</div>
      </div>
      <div className="twoGrid">
        <label>{t.itemName}<input value={selectedItem.name} onChange={(e) => setItems((prev) => prev.map((item) => item.id === selectedItem.id ? { ...item, name: e.target.value } : item))} onBlur={(e) => saveItem(selectedItem.id, { name: e.target.value })} /></label>
        <label>{t.basePrice}<input type="number" value={selectedItem.base_price ?? selectedItem.price ?? 0} onChange={(e) => setItems((prev) => prev.map((item) => item.id === selectedItem.id ? { ...item, base_price: Number(e.target.value), price: Number(e.target.value) } : item))} onBlur={(e) => saveItem(selectedItem.id, { base_price: Number(e.target.value), price: Number(e.target.value) })} /></label>
      </div>
      <label>{t.description}<textarea value={selectedItem.description || ''} onChange={(e) => setItems((prev) => prev.map((item) => item.id === selectedItem.id ? { ...item, description: e.target.value } : item))} onBlur={(e) => saveItem(selectedItem.id, { description: e.target.value })} /></label>
    </div>
  );
}

function Panel({
  id,
  title,
  openPanel,
  setOpenPanel,
  state,
  children,
}: {
  id: BuilderPanelId;
  title: string;
  openPanel: BuilderPanelId;
  setOpenPanel: (value?: BuilderPanelId) => void;
  state: SaveState;
  children: ReactNode;
}) {
  if (openPanel !== id) return null;
  return <section className="builderPanel openOnlyPanel"><div className="openPanelTop"><div><strong>{title}</strong><small>Pick it, edit it, save it, close it, then move to the next section.</small></div><span className={`panelState ${state.toLowerCase()}`}>{state}</span><button type="button" className="closePanelBtn" onClick={() => setOpenPanel('')}>Close</button></div><div className="panelBody">{children}</div></section>;
}

function StorePhonePreview({
  t,
  storeName,
  logo,
  hero,
  heroVideo,
  heroMediaType,
  restaurant,
  categories,
  activeCategoryId,
  setActiveCategoryId,
  items,
  selectedItem,
  selectedVideoItem,
  setSelectedItemId,
  setSelectedVideoId,
  storeTheme,
  storeAccent,
  videoCount,
}: {
  t: (typeof COPY)[Lang];
  storeName: string;
  logo: string;
  hero: string;
  heroVideo: string;
  heroMediaType: HeroMediaType;
  restaurant: Restaurant | null;
  categories: Category[];
  activeCategoryId: string;
  setActiveCategoryId: (value: string) => void;
  items: MenuItem[];
  selectedItem: MenuItem | null;
  selectedVideoItem: MenuItem | null;
  setSelectedItemId: (value: string) => void;
  setSelectedVideoId: (value: string) => void;
  storeTheme: StoreTheme;
  storeAccent: StoreAccent;
  videoCount: number;
}) {
  return <section className={`previewShell accent-${storeAccent}`}><div className="previewHeader"><div><h2>{t.preview}</h2><p>{t.livePreviewNote}</p></div></div><div className={`phoneFrame ${storeTheme}`}><div className="phoneScreen"><div className="phoneTop"><button type="button">☰</button><img src={logo} alt={storeName} onError={handleBrokenImage} /><button type="button">🛒</button></div><section className="phoneHero">{heroMediaType === 'video' && heroVideo ? <video className="phoneHeroVideo" src={heroVideo} autoPlay muted playsInline preload="auto" onCanPlay={keepVideoPlaying} /> : <img className="phoneHeroImage" src={hero} alt={storeName} onError={handleBrokenImage} />}<div className="phoneHeroShade" /><div className="phoneHeroCopy"><small>{t.promo}</small><h3>{storeName}</h3><p>{restaurant?.address || t.fresh}</p><button type="button">{t.orderNow} →</button></div></section><section className="phoneChips"><span>{t.pickup}: {restaurant?.pickup_enabled ? 'ON' : 'OFF'}</span><span>{t.delivery}: {restaurant?.delivery_enabled ? 'ON' : 'OFF'}</span><span>{money(restaurant?.delivery_fee)} Fee</span></section><h4 className="phoneSectionTitle">{t.categories}</h4><section className="phoneTabs"><button type="button" className={activeCategoryId === 'all' ? 'active' : ''} onClick={() => setActiveCategoryId('all')}>All</button>{categories.map((cat) => <button key={cat.id} type="button" className={activeCategoryId === cat.id ? 'active' : ''} onClick={() => setActiveCategoryId(cat.id)}>{pretty(cat.name)}</button>)}{videoCount > 0 ? <button type="button" className={activeCategoryId === 'VIDEO_MENU' ? 'active videoTab' : 'videoTab'} onClick={() => setActiveCategoryId('VIDEO_MENU')}>▶ {t.videos}</button> : null}</section><section className="phoneItems">{items.length ? items.map((item, index) => { const cat = categories.find((category) => category.id === item.category_id); const image = getItemImage(item, cat?.name || 'universal', index); const video = getItemVideo(item); const videoItem = isVideoMenuItem(item) && !!video; return <button key={item.id} type="button" className={(selectedItem?.id === item.id || selectedVideoItem?.id === item.id) ? 'phoneItem active' : videoItem ? 'phoneItem videoPhoneItem' : 'phoneItem'} onClick={() => videoItem ? setSelectedVideoId(item.id) : setSelectedItemId(item.id)}>{videoItem ? <div className="phoneVideoThumb"><video src={video} poster={image} autoPlay muted playsInline preload="metadata" onLoadedData={replayPreviewVideo} onCanPlay={replayPreviewVideo} onTimeUpdate={stopAtMenuVideoLimit} /><span>▶</span></div> : <img src={image} alt={item.name} onError={(event) => handleMenuImageError(event, item, cat?.name, index)} />}<div><strong>{item.name}</strong><p>{item.description || t.fresh}</p><span>{money(item.base_price ?? item.price)}</span></div></button>; }) : <div className="phoneEmptyMenu">No menu items yet. Add an item.</div>}</section><div className="phoneCart"><div><strong>0 items</strong><span>{t.cart}</span></div><button type="button">{t.cart} →</button></div></div></div></section>;
}

const styles = `
:root{--bg:#f4f6fa;--card:#ffffff;--ink:#0f172a;--muted:#64748b;--line:#dfe5ee}*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow-x:hidden}button,input,select,textarea{font:inherit}button{cursor:pointer}button:disabled{opacity:.55;cursor:not-allowed}img{max-width:100%}.ordaBuilderPage{min-height:100vh;padding:22px;background:radial-gradient(circle at top,#fff 0,#f6f8fb 38%,#edf1f7 100%)}.loadingBox,.errorBanner{max-width:1200px;margin:40px auto;padding:18px 22px;border-radius:20px;background:#fff;border:1px solid var(--line);font-weight:950}.errorBanner{margin:0 auto 18px;color:#9f1239;background:#fff1f2;border-color:#fecdd3}.builderHeader{max-width:1580px;margin:0 auto 20px;display:flex;justify-content:space-between;align-items:center;gap:18px}.brandRow{display:flex;align-items:center;gap:18px;min-width:0}.ordaLogo{width:210px;height:auto;object-fit:contain;flex-shrink:0}.builderHeader h1{margin:0;font-size:42px;line-height:1;font-weight:950;letter-spacing:-.05em;color:#64748b;text-shadow:0 1px 0 #fff,0 3px 0 #b9c1cf,0 8px 18px rgba(15,23,42,.16)}.builderHeader p{margin:7px 0 0;color:var(--muted);font-weight:800;max-width:760px}.headerActions{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end;align-items:center}.headerLangSwitch{height:50px;display:grid;grid-template-columns:1fr 1fr;gap:5px;border:1px solid var(--line);background:#fff;border-radius:16px;padding:5px;box-shadow:0 10px 20px rgba(15,23,42,.045)}.headerLangSwitch button{min-width:54px;border:0;border-radius:12px;background:#f1f5f9;color:#111827;font-weight:1000}.headerLangSwitch button.active{background:#111827;color:#fff}.languageToggleBtn{min-width:60px}.builderLangButtons{display:grid;grid-template-columns:1fr 1fr;gap:12px}.builderLangButtons button{min-height:64px;border:1px solid var(--line);border-radius:18px;background:#fff;color:#111827;font-size:20px;font-weight:1000}.builderLangButtons button.active{background:#111827;color:#fff;border-color:#111827;box-shadow:0 0 0 5px rgba(17,24,39,.14)}.mainBtn,.ghostBtn,.sectionSave,.dangerBtn,.choiceBtn{min-height:50px;border-radius:16px;border:1px solid var(--line);padding:0 18px;font-weight:950}.mainBtn,.sectionSave{background:linear-gradient(180deg,#ffffff 0%,#d9e0eb 44%,#64748b 100%);color:#fff;border-color:#aeb8c7;box-shadow:0 14px 28px rgba(15,23,42,.12)}.ghostBtn{background:#fff;color:#111827}.dangerBtn{background:linear-gradient(180deg,#fff1f2,#ffe4e6);color:#be123c;border-color:#fb7185;box-shadow:0 0 0 5px rgba(244,63,94,.12),0 18px 34px rgba(190,18,60,.22);font-weight:1000}.choiceBtn{background:#fff;color:#111827}.choiceBtn.active{background:#111827;color:#fff;border-color:#111827}.builderLayout{max-width:1580px;margin:0 auto;display:grid;grid-template-columns:minmax(0,760px) minmax(390px,1fr);gap:22px;align-items:start}.leftEditor{display:grid;gap:16px;min-width:0}.rightPreview{position:sticky;top:14px;min-width:0}.quickPickBar{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;background:rgba(255,255,255,.93);border:1px solid var(--line);border-radius:24px;padding:12px;box-shadow:0 18px 45px rgba(15,23,42,.055);position:sticky;top:10px;z-index:40}.workingGlow{box-shadow:0 0 0 3px rgba(124,58,237,.12),0 0 38px rgba(124,58,237,.20),0 18px 45px rgba(15,23,42,.08);border-color:rgba(124,58,237,.28)}.quickPickBar button{min-height:50px;border-radius:16px;border:1px solid var(--line);background:#fff;font-weight:950;box-shadow:0 8px 20px rgba(15,23,42,.04)}.quickPickBar button.active{background:linear-gradient(180deg,#111827,#050505);color:#fff;border-color:#111827;box-shadow:0 14px 30px rgba(15,23,42,.18),0 0 0 4px rgba(124,58,237,.18)}.builderPanel,.previewShell,.saveFooter{background:rgba(255,255,255,.9);border:1px solid var(--line);border-radius:24px;box-shadow:0 18px 45px rgba(15,23,42,.055);overflow:hidden}.panelState{border-radius:999px;padding:8px 13px;font-size:12px;font-weight:950;background:#ecfdf3;color:#16a34a}.panelState.saving{background:#eff6ff;color:#2563eb}.panelState.error{background:#fff1f2;color:#be123c}.openOnlyPanel{overflow:hidden}.openPanelTop{min-height:82px;padding:18px 20px;border-bottom:1px solid var(--line);background:#fff;display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:12px;align-items:center}.openPanelTop strong{display:block;font-size:24px;font-weight:1000;letter-spacing:-.03em}.openPanelTop small{display:block;margin-top:5px;color:#64748b;font-weight:850}.closePanelBtn{min-height:44px;border-radius:14px;border:1px solid var(--line);background:#111827;color:#fff;font-weight:950;padding:0 16px}.panelBody{padding:20px;display:grid;gap:16px}.twoGrid,.uploadGrid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.threeGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}label{display:grid;gap:8px;color:#111827;font-weight:950}input,select,textarea{width:100%;border:1px solid #dce3ed;border-radius:16px;background:#fff;color:#0f172a;padding:15px 16px;font-weight:800;outline:none}input:focus,select:focus,textarea:focus{border-color:#64748b;box-shadow:0 0 0 4px rgba(100,116,139,.12)}textarea{min-height:110px;resize:vertical}small{color:#64748b;font-weight:800}.uploadCard,.videoPreviewCard,.socialBox,.heroMediaBox{border:1px solid var(--line);border-radius:20px;background:#fff;padding:14px;display:grid;gap:12px}.uploadCard img{width:100%;height:170px;border-radius:16px;object-fit:cover;background:#e2e8f0}.videoPreviewCard video,.videoEmpty{width:100%;height:220px;border-radius:16px;object-fit:cover;background:#0f172a;color:#fff;display:grid;place-items:center;font-weight:1000}.socialBox h3,.heroMediaBox h3{margin:0;font-size:22px;font-weight:1000}.socialBox p,.heroMediaBox p{margin:0;color:#64748b;font-weight:850;line-height:1.4}.buttonRow{display:flex;gap:10px;flex-wrap:wrap}.videoBtn{background:linear-gradient(180deg,#fff 0%,#fbcfe8 45%,#db2777 100%)}.controlChoiceGrid{border:2px solid #f9a8d4;background:linear-gradient(135deg,#fff,#fdf2f8);border-radius:24px;padding:18px;display:grid;gap:14px;box-shadow:0 16px 42px rgba(219,39,119,.12),0 0 0 6px rgba(244,114,182,.10)}.categoryChoiceGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.controlCard,.menuPickCard{border:1px solid var(--line);border-radius:20px;background:#fff;padding:18px;text-align:left;display:grid;gap:8px;min-height:130px}.controlCard.active,.menuPickCard.live{border-color:#7c3aed;box-shadow:0 0 0 4px rgba(124,58,237,.12)}.controlCard strong,.menuPickCard strong{font-size:20px;font-weight:1000}.controlCard span,.menuPickCard small{color:#64748b;font-weight:850}.controlCard b,.menuPickCard em{justify-self:start;border-radius:999px;background:#f1f5f9;padding:8px 12px;font-style:normal;font-weight:950}.menuPickCard span{font-size:36px}.menuPickCard b{color:#7c3aed;font-weight:1000}.sectionIntro{border:1px solid var(--line);border-radius:20px;background:linear-gradient(135deg,#fff,#f8fafc);padding:18px}.sectionIntro h3,.customCategoryTitle{margin:0;font-size:24px;font-weight:1000}.sectionIntro p{margin:8px 0 0;color:#64748b;font-weight:850;line-height:1.4}.styleBox,.miniControlPanel,.menuWorkspace{border:1px solid var(--line);background:linear-gradient(135deg,#fff,#f8fafc);border-radius:22px;padding:18px;display:grid;gap:16px}.workspaceTop{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.workspaceTop h3{margin:0;font-size:38px;font-weight:950}.workspaceTop p{margin:7px 0 0;color:var(--muted);font-weight:800;line-height:1.4;font-size:20px}.workspaceTop small{font-size:16px}.accentGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.accentCard{min-height:94px;border:1px solid var(--line);border-radius:18px;background:#fff;padding:14px;text-align:left;display:grid;grid-template-columns:44px 1fr;gap:3px 12px;align-items:center}.accentCard i{grid-row:1/3;width:44px;height:44px;border-radius:15px;background:var(--accent);box-shadow:0 12px 25px var(--glow)}.accentCard strong{font-size:14px;font-weight:950}.accentCard small{font-size:12px}.accentCard.active{outline:4px solid var(--glow);border-color:var(--accent)}.accent-silver{--accent:#cbd5e1;--accentText:#111827;--glow:rgba(148,163,184,.32)}.accent-gold{--accent:#d6a54b;--accentText:#111827;--glow:rgba(214,165,75,.32)}.accent-orange{--accent:#f97316;--accentText:#fff;--glow:rgba(249,115,22,.32)}.accent-red{--accent:#dc2626;--accentText:#fff;--glow:rgba(220,38,38,.32)}.accent-blue{--accent:#2563eb;--accentText:#fff;--glow:rgba(37,99,235,.32)}.accent-purple{--accent:#7c3aed;--accentText:#fff;--glow:rgba(124,58,237,.32)}.accent-lime{--accent:#84cc16;--accentText:#111827;--glow:rgba(132,204,22,.34)}.accent-mono{--accent:#111827;--accentText:#fff;--glow:rgba(17,24,39,.25)}.accent-pink{--accent:#ff2d95;--accentText:#fff;--glow:rgba(255,45,149,.35)}.hoursGrid{display:grid;gap:10px}.hourRow{display:grid;grid-template-columns:1fr 120px 125px 125px;gap:10px;align-items:center;border:1px solid var(--line);background:#fff;border-radius:18px;padding:12px}.presetQuickAdd{display:grid;grid-template-columns:minmax(0,1fr);gap:14px}.presetQuickAdd button{min-height:64px;border:1px solid var(--line);border-radius:20px;background:#fff;font-weight:950;padding:0 24px;width:100%;text-align:left;font-size:22px}.miniEditCard,.editItemBox,.imagePicker,.selectedPreview{border:1px solid var(--line);border-radius:20px;background:#fff;padding:14px}.categoryNameOnly{padding:22px}.itemList{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.drawerList{max-height:none;overflow:visible;padding:3px}.itemCard{border:1px solid var(--line);border-radius:20px;background:#fff;overflow:hidden;text-align:left;display:grid}.itemCard.active{outline:4px solid rgba(124,58,237,.22);border-color:#7c3aed}.itemMediaPreview{height:170px;position:relative;background:#e2e8f0}.itemMediaPreview img,.itemMediaPreview video{width:100%;height:100%;object-fit:cover;display:block}.itemCard strong,.itemCard span{padding:10px 14px;font-weight:950}.itemCard span{color:#64748b;padding-top:0}.emptyBox{border:1px dashed var(--line);border-radius:18px;color:var(--muted);padding:24px;text-align:center;font-weight:900}.editItemBox{display:grid;gap:14px;padding:20px}.selectedPreview{display:grid;grid-template-columns:190px 1fr;gap:14px;align-items:center}.selectedPreview img,.selectedPreview video{width:100%;height:165px;border-radius:16px;object-fit:cover;background:#0f172a}.selectedPreview h3{margin:0;font-size:32px;font-weight:950}.selectedPreview p{font-size:28px;color:#6d28d9;font-weight:1000;margin:8px 0 14px}.selectedPreview small{display:block;color:#db2777;font-weight:1000;letter-spacing:.12em;text-transform:uppercase}.imagePicker{display:grid;gap:12px}.imagePicker h3{margin:0;font-size:22px;font-weight:950}.imagePicker p{margin:6px 0 0;color:var(--muted);font-weight:800}.imageOptionGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.imageOptionGrid button{border:1px solid var(--line);border-radius:15px;background:#fff;overflow:hidden;text-align:left;padding:0}.imageOptionGrid button:hover,.imageOptionGrid button:focus{outline:4px solid rgba(124,58,237,.18);border-color:#7c3aed}.imageOptionGrid img{width:100%;height:150px;object-fit:cover;background:#e2e8f0}.imageOptionGrid strong{display:block;padding:9px;font-size:12px}.menuVideoUploadButton{min-height:68px;border:0;border-radius:20px;background:linear-gradient(180deg,#f9a8d4,#db2777);color:#fff;padding:0 24px;font-weight:1000;font-size:18px;box-shadow:0 18px 40px rgba(219,39,119,.28)}.deleteControlBox{border:1px solid #fecdd3;background:#fff1f2;border-radius:22px;padding:18px;display:grid;gap:14px;box-shadow:0 0 0 5px rgba(244,63,94,.08)}.deleteControlBox strong{font-size:22px;font-weight:1000;color:#9f1239}.deleteControlBox p{margin:6px 0 0;color:#9f1239;font-weight:850}.deleteToggle{display:grid;grid-template-columns:1fr 1fr;gap:10px}.deleteToggle button{min-height:50px;border-radius:15px;border:1px solid #fecdd3;background:#fff;color:#9f1239;font-weight:950}.deleteToggle button.on{background:#9f1239;color:#fff;border-color:#9f1239}.oneDeleteButton{min-height:62px;font-size:20px}.menuWorkspace{padding:26px;min-height:520px}.previewShell{padding:18px;overflow:visible}.previewHeader h2{margin:0;font-size:28px;font-weight:950;letter-spacing:-.03em}.previewHeader p{margin:5px 0 14px;color:var(--muted);font-weight:850}.phoneFrame{width:100%;max-width:430px;height:760px;margin:0 auto;border:12px solid #0f172a;border-radius:50px;overflow:hidden;background:#fff;position:relative;box-shadow:0 26px 70px rgba(15,23,42,.22)}.phoneScreen{height:100%;overflow-y:auto;overflow-x:hidden;background:#f8fafc;position:relative;-webkit-overflow-scrolling:touch}.phoneFrame.dark .phoneScreen{background:#05070a;color:#fff}.phoneTop{height:74px;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 18px;position:sticky;top:0;z-index:30;border-bottom:1px solid #e2e8f0}.phoneFrame.dark .phoneTop{background:#0f172a;border-color:#1f2937}.phoneTop img{width:46px;height:46px;border-radius:999px;object-fit:cover;background:#e2e8f0}.phoneTop button{width:44px;height:44px;border:0;border-radius:999px;background:#f1f5f9;font-size:21px}.phoneHero{min-height:350px;color:#fff;display:flex;flex-direction:column;justify-content:center;padding:34px 24px;position:relative;overflow:hidden;background:#0f172a}.phoneHeroImage,.phoneHeroVideo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.phoneHeroShade{position:absolute;inset:0;background:linear-gradient(rgba(0,0,0,.42), rgba(0,0,0,.64));z-index:2}.phoneHeroCopy{position:relative;z-index:3}.phoneHero small{color:var(--accent);font-size:16px;letter-spacing:.06em;font-weight:950}.phoneHero h3{margin:14px 0 10px;font-size:46px;line-height:.95;letter-spacing:-.06em;font-weight:950}.phoneHero p{margin:0;max-width:310px;font-size:18px;line-height:1.35;font-weight:850}.phoneHero button{margin-top:24px;width:210px;min-height:62px;border:0;border-radius:22px;background:var(--accent);color:var(--accentText);font-size:22px;font-weight:950}.phoneChips{display:flex;flex-wrap:wrap;gap:10px;padding:16px;background:#fff}.phoneFrame.dark .phoneChips{background:#0f172a}.phoneChips span{border-radius:999px;background:#f1f5f9;color:#111827;padding:10px 13px;font-size:13px;font-weight:950}.phoneFrame.dark .phoneChips span{background:#1f2937;color:#fff}.phoneSectionTitle{padding:0 16px;margin:18px 0 10px;font-size:21px;font-weight:950}.phoneTabs{display:flex;gap:10px;overflow-x:auto;padding:0 16px 14px}.phoneTabs button{flex:0 0 auto;min-height:43px;border:0;border-radius:999px;background:#fff;color:#111827;padding:0 18px;font-weight:950;white-space:nowrap}.phoneTabs button.active{background:var(--accent);color:var(--accentText)}.phoneTabs .videoTab{background:#fdf2f8;color:#be185d}.phoneFrame.dark .phoneTabs button{background:#1f2937;color:#fff}.phoneFrame.dark .phoneTabs button.active{background:var(--accent);color:var(--accentText)}.phoneItems{display:grid;gap:12px;padding:0 16px 96px}.phoneItem{min-height:124px;display:grid;grid-template-columns:112px 1fr;gap:12px;text-align:left;border:1px solid #e2e8f0;border-radius:22px;padding:10px;background:#fff;color:#111827}.phoneFrame.dark .phoneItem{background:#0f172a;color:#fff;border-color:#1f2937}.phoneItem.active{outline:4px solid var(--glow);border-color:var(--accent)}.phoneItem img{width:112px;height:104px;border-radius:18px;object-fit:cover;background:#e2e8f0}.phoneVideoThumb{width:112px;height:104px;border-radius:18px;overflow:hidden;background:#111;position:relative}.phoneVideoThumb video{width:100%;height:100%;object-fit:cover;display:block}.phoneVideoThumb span{position:absolute;right:8px;bottom:8px;width:32px;height:32px;border-radius:999px;background:var(--accent);color:var(--accentText);display:grid;place-items:center;font-weight:1000;box-shadow:0 10px 22px rgba(0,0,0,.25)}.videoPhoneItem{border-color:rgba(219,39,119,.32)}.phoneItem strong{display:block;font-size:17px;font-weight:950}.phoneItem p{margin:6px 0;color:#64748b;font-size:13px;font-weight:800;line-height:1.25}.phoneItem span{display:block;color:var(--accent);font-size:19px;font-weight:950}.phoneEmptyMenu{border:1px dashed #cbd5e1;border-radius:18px;background:#fff;color:#64748b;padding:18px;text-align:center;font-weight:900}.phoneCart{position:sticky;bottom:0;z-index:20;margin:0;min-height:78px;padding:12px 16px;background:rgba(255,255,255,.94);backdrop-filter:blur(18px);border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;gap:12px}.phoneCart strong,.phoneCart span{display:block}.phoneCart button{min-height:50px;border:0;border-radius:18px;padding:0 18px;background:var(--accent);color:var(--accentText);font-weight:950}.saveFooter{max-width:1580px;margin:18px auto 0;padding:16px 18px;display:flex;align-items:center;gap:10px}.saveDot{width:12px;height:12px;border-radius:999px;background:#16a34a}.saveDot.saving{background:#2563eb}.saveDot.error{background:#be123c}.saveFooter strong{font-weight:950}.saveFooter em{color:var(--muted);font-style:normal;font-weight:800}.socialInputGrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.socialInputGrid label span{display:flex;align-items:center;gap:10px}.videoManagerHero{border:2px solid #f9a8d4;background:linear-gradient(135deg,#fff,#fdf2f8);border-radius:26px;padding:22px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;box-shadow:0 18px 44px rgba(219,39,119,.12),0 0 0 6px rgba(244,114,182,.10)}.videoManagerHero small{display:block;color:#db2777;font-weight:1000;letter-spacing:.12em;text-transform:uppercase;margin-bottom:7px}.videoManagerHero h3{margin:0;color:#9d174d;font-size:32px;font-weight:1000;letter-spacing:-.04em;line-height:1.02}.videoManagerHero p{margin:9px 0 0;color:#9d174d;font-weight:850;line-height:1.35}.videoManagerGrid{display:grid;gap:18px}.videoManagerCard{border:1px solid var(--line);background:#fff;border-radius:26px;padding:18px;display:grid;grid-template-columns:220px minmax(0,1fr);gap:16px;align-items:start;box-shadow:0 16px 34px rgba(15,23,42,.06)}.videoManagerCard.active{border-color:#db2777;box-shadow:0 0 0 5px rgba(219,39,119,.12),0 16px 34px rgba(15,23,42,.08)}.videoPreviewButton{border:0;background:transparent;padding:0;text-align:left}.videoPreviewButton video,.videoUploadPlaceholder{width:100%;height:190px;border-radius:20px;background:#111827;color:#fff;object-fit:cover;display:grid;place-items:center;font-weight:1000;text-align:center;padding:16px}.videoEditFields{display:grid;grid-template-columns:1fr 160px;gap:12px}.videoEditFields label:nth-child(3){grid-column:1/-1}.videoEditFields textarea{min-height:86px}.videoManagerActions{grid-column:1/-1;display:grid;grid-template-columns:1fr 180px;gap:12px}.emptyVideoMenu{border:1px dashed #f9a8d4;background:#fff7fb;border-radius:24px;padding:26px;display:grid;gap:12px;color:#9d174d}.emptyVideoMenu h3{margin:0;font-size:28px;font-weight:1000}.emptyVideoMenu p{margin:0;font-weight:850}@media(max-width:1180px){.builderLayout{grid-template-columns:1fr}.rightPreview{position:relative;top:auto;order:-1}.phoneFrame{max-width:430px}}@media(max-width:760px){.videoManagerHero,.videoManagerCard,.videoManagerActions{grid-template-columns:1fr}.videoEditFields{grid-template-columns:1fr}.videoPreviewButton video,.videoUploadPlaceholder{height:230px}.ordaBuilderPage{padding:12px}.builderHeader{display:grid;gap:14px}.brandRow{display:grid;gap:8px}.ordaLogo{width:230px}.builderHeader h1{font-size:34px}.headerActions{display:grid;grid-template-columns:1fr 1fr}.headerLangSwitch{grid-column:1/-1}.builderLayout{gap:14px}.quickPickBar{grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;padding:8px}.quickPickBar button{font-size:12px;min-height:46px;padding:0 4px}.previewShell{padding:12px;border-radius:22px}.previewHeader h2{font-size:24px}.phoneFrame{max-width:100%;height:690px;border-width:8px;border-radius:40px;box-shadow:0 16px 40px rgba(15,23,42,.18)}.phoneTop{height:62px}.phoneHero{min-height:330px;padding:26px 20px}.phoneHero h3{font-size:42px}.twoGrid,.threeGrid,.uploadGrid,.categoryChoiceGrid,.controlChoiceGrid,.socialInputGrid,.itemList,.accentGrid,.imageOptionGrid{grid-template-columns:1fr}.selectedPreview{grid-template-columns:1fr}.selectedPreview img,.selectedPreview video{height:210px}.hourRow{grid-template-columns:1fr}.openPanelTop{grid-template-columns:1fr auto}.openPanelTop .panelState{display:none}.deleteToggle,.builderLangButtons{grid-template-columns:1fr}}@media(max-width:420px){.phoneFrame{height:650px;border-radius:34px}.phoneItem{grid-template-columns:96px 1fr}.phoneItem img,.phoneVideoThumb{width:96px}}

/* PROMOTE STOREFRONT FINAL FIX */
.promoStorefrontSection{margin:30px 0!important}
.promoStorefrontCard{border:1px solid rgba(15,23,42,.12)!important;background:rgba(255,255,255,.78)!important;border-radius:30px!important;padding:22px!important;box-shadow:0 24px 70px rgba(15,23,42,.10)!important}
.promoTop{display:flex!important;justify-content:space-between!important;gap:16px!important;align-items:center!important;margin-bottom:18px!important}
.promoTop small{display:block!important;font-size:12px!important;font-weight:1000!important;letter-spacing:.16em!important;color:var(--storeAccent,#cbd5e1)!important;margin-bottom:6px!important}
.promoTop h2{font-size:clamp(26px,3vw,38px)!important;font-weight:1000!important;color:#111827!important;margin:0 0 6px!important;letter-spacing:-.04em!important}
.promoTop p{margin:0!important;color:rgba(17,24,39,.62)!important;font-weight:750!important}
.promoVisitBtn{min-height:46px!important;padding:0 18px!important;border-radius:999px!important;background:var(--storeAccent,#cbd5e1)!important;color:var(--storeAccentText,#111827)!important;display:flex!important;align-items:center!important;justify-content:center!important;text-decoration:none!important;font-weight:1000!important;white-space:nowrap!important}
.promoPreview{position:relative!important;height:300px!important;border-radius:26px!important;overflow:hidden!important;background:linear-gradient(135deg,#08111f,#152033)!important;margin-bottom:18px!important;border:1px solid rgba(255,255,255,.12)!important}
.promoPreview img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}
.promoPreviewShade{position:absolute!important;inset:0!important;background:linear-gradient(90deg,rgba(0,0,0,.72),rgba(0,0,0,.16),rgba(0,0,0,.62))!important;z-index:1!important}
.promoPlaceholder{width:100%!important;height:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;color:#fff!important;font-size:34px!important;font-weight:1000!important}
.promoPreviewOverlay{position:absolute!important;top:18px!important;left:18px!important;right:18px!important;z-index:3!important;padding:14px 18px!important;border-radius:24px!important;background:rgba(9,15,28,.82)!important;border:1px solid var(--storeAccent,#cbd5e1)!important;backdrop-filter:blur(14px)!important}
.promoPreviewOverlay span{display:block!important;color:var(--storeAccent,#cbd5e1)!important;font-size:11px!important;font-weight:1000!important;text-transform:uppercase!important;letter-spacing:.12em!important}
.promoPreviewOverlay strong{display:block!important;color:#fff!important;font-size:22px!important;font-weight:1000!important;margin-top:3px!important}
.promoPreviewOverlay em{display:block!important;color:rgba(255,255,255,.70)!important;font-size:12px!important;font-style:normal!important;margin-top:4px!important;word-break:break-all!important}
.promoCaptionBox{border:1px solid rgba(15,23,42,.10)!important;border-radius:20px!important;background:rgba(255,255,255,.52)!important;padding:14px 16px!important;margin-bottom:16px!important}
.promoCaptionBox span{display:block!important;font-size:11px!important;font-weight:1000!important;color:var(--storeAccent,#cbd5e1)!important;text-transform:uppercase!important;letter-spacing:.1em!important;margin-bottom:6px!important}
.promoCaptionBox p{margin:0!important;color:#111827!important;font-weight:850!important;line-height:1.45!important;word-break:break-word!important}
.promoButtonGrid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(170px,1fr))!important;gap:12px!important}
.promoActionBtn,.promoCopyBtn{min-height:52px!important;border-radius:18px!important;border:0!important;font-size:15px!important;font-weight:1000!important;cursor:pointer!important}
.promoActionBtn{background:var(--storeAccent,#cbd5e1)!important;color:var(--storeAccentText,#111827)!important}
.promoCopyBtn{background:rgba(15,23,42,.08)!important;color:#111827!important;border:1px solid rgba(15,23,42,.12)!important}
.promoShareNote{margin:14px 0 0!important;font-size:12px!important;line-height:1.4!important;color:rgba(100,116,139,.95)!important;font-weight:800!important}
.promoAccent-silver{--storeAccent:#cbd5e1;--storeAccentText:#111827}
.promoAccent-gold{--storeAccent:#d8bd7a;--storeAccentText:#111827}
.promoAccent-orange{--storeAccent:#fb923c;--storeAccentText:#111827}
.promoAccent-red{--storeAccent:#ef4444;--storeAccentText:#fff}
.promoAccent-blue{--storeAccent:#60a5fa;--storeAccentText:#07111f}
.promoAccent-purple{--storeAccent:#a78bfa;--storeAccentText:#111827}
.promoAccent-pink{--storeAccent:#f472b6;--storeAccentText:#111827}
.promoAccent-lime{--storeAccent:#8be600;--storeAccentText:#111827}
.promoAccent-mono{--storeAccent:#111827;--storeAccentText:#fff}
@media(max-width:760px){.promoTop{flex-direction:column!important;align-items:flex-start!important}.promoVisitBtn{width:100%!important}.promoPreview{height:230px!important}.promoButtonGrid{grid-template-columns:1fr!important}}

`;
