'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { supabase } from '@/lib/supabase';

type RestaurantRow = {
  id: string;
  name: string | null;
  slug: string | null;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  category?: string | null;
  business_type?: string | null;
  store_type?: string | null;
  hero_image?: string | null;
  logo_image?: string | null;
  cover_image?: string | null;
  cover_video?: string | null;
  public_visible?: boolean | null;
  featured?: boolean | null;
  views?: number | null;
  created_at?: string | null;
};

type RestaurantMediaRow = {
  id: string;
  restaurant_id: string | null;
  media_type: string | null;
  media_url: string | null;
  caption: string | null;
  likes?: number | null;
  views?: number | null;
  created_at?: string | null;
};

type MenuItemRow = {
  id: string;
  restaurant_id: string | null;
  name: string | null;
  description?: string | null;
  image_url?: string | null;
  image_file?: string | null;
  item_image?: string | null;
  video_url?: string | null;
  video_file?: string | null;
  item_video?: string | null;
  menu_video?: string | null;
  media_type?: string | null;
  availability?: string | null;
  is_available?: boolean | null;
  sort_order?: number | null;
};

type CustomerPostRow = {
  id: string;
  customer_id?: string | null;
  customer_name?: string | null;
  caption?: string | null;
  media_url?: string | null;
  media_type?: string | null;
  likes?: number | null;
  views?: number | null;
  comments_count?: number | null;
  created_at?: string | null;
};

type DiscoverLikeRow = {
  source_table: string;
  source_id: string;
  device_id?: string | null;
};

type FeedTile = {
  id: string;
  sourceTable: 'restaurant_media' | 'menu_items' | 'restaurants' | 'customer_posts';
  rawId: string;
  restaurantId: string;
  slug: string;
  storeName: string;
  logoUrl: string;
  category: string;
  city: string;
  state: string;
  address: string;
  businessType: string;
  type: 'image' | 'video';
  mediaUrl: string;
  posterUrl: string;
  caption: string;
  subcaption: string;
  views: number;
  likes: number;
  featured: boolean;
  createdAt: string;
  isCustomerPost: boolean;
};

const MENU_BUCKET = 'menu-images';
const CUSTOMER_POST_BUCKET = 'customer-posts';

const CUSTOMER_SIGNUP_PATH = '/customer/signup';
const OWNER_SIGNUP_PATH = '/auth/signup';

const INITIAL_VISIBLE_COUNT = 24;
const LOAD_MORE_COUNT = 18;

const TABS = [
  'All',
  'Customer Posts',
  'Videos',
  'Trending',
  'Featured',
  'Food Trucks',
  'Pop-Ups',
  'Tacos',
  'BBQ',
  'Seafood',
  'Burgers',
  'Wings',
  'Desserts',
  'Drinks',
  'Breakfast',
];

const SEEDED_BOOST_LOCK_DATE = new Date('2026-05-17T23:59:59.999Z').getTime();

function stableNumberSeed(value: string, min: number, max: number) {
  const clean = String(value || 'orda').trim() || 'orda';
  let hash = 0;

  for (let index = 0; index < clean.length; index += 1) {
    hash = (hash * 31 + clean.charCodeAt(index)) >>> 0;
  }

  return min + (hash % Math.max(1, max - min + 1));
}

function qualifiesForSeededBoost(tile: FeedTile) {
  if (tile.sourceTable === 'customer_posts' || tile.isCustomerPost) return false;

  const created = tile.createdAt ? new Date(tile.createdAt).getTime() : 0;

  if (!created) return true;

  return created <= SEEDED_BOOST_LOCK_DATE;
}

function seededLikes(tile: FeedTile) {
  if (!qualifiesForSeededBoost(tile)) return tile.likes;

  const boost = stableNumberSeed(`${tile.id}:likes:${tile.storeName}`, 63, 236);
  return Number(tile.likes || 0) + boost;
}

function seededViews(tile: FeedTile) {
  if (!qualifiesForSeededBoost(tile)) return tile.views;

  const boost = stableNumberSeed(`${tile.id}:views:${tile.caption}`, 211, 739);
  return Number(tile.views || 0) + boost;
}

function displayCount(value: number) {
  if (value >= 1000) {
    const compact = value / 1000;
    return `${compact.toFixed(compact >= 10 ? 0 : 1)}k`;
  }

  return String(value);
}

function storageUrl(bucket: string, path: string) {
  const clean = String(path || '').replace(/^\/+/, '');
  const { data } = supabase.storage.from(bucket).getPublicUrl(clean);
  return data.publicUrl;
}

function resolveMenuUrl(value?: string | null) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return raw;
  if (raw.startsWith('menu-images/')) return storageUrl(MENU_BUCKET, raw.replace(/^menu-images\//, ''));
  if (raw.startsWith(`${MENU_BUCKET}/`)) return storageUrl(MENU_BUCKET, raw.replace(`${MENU_BUCKET}/`, ''));
  return storageUrl(MENU_BUCKET, raw);
}

function resolveCustomerPostUrl(value?: string | null) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return raw;
  if (raw.startsWith(`${CUSTOMER_POST_BUCKET}/`)) return storageUrl(CUSTOMER_POST_BUCKET, raw.replace(`${CUSTOMER_POST_BUCKET}/`, ''));
  return storageUrl(CUSTOMER_POST_BUCKET, raw);
}

function isVideoUrl(value?: string | null) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(String(value || '').trim());
}

function cleanText(value?: string | null, fallback = '') {
  const text = String(value || '').trim();
  return text || fallback;
}

function normalizeSearchText(value?: string | null) {
  return String(value || '')
    .toLowerCase()
    .replace(/[.,#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function categoryFromText(value?: string | null) {
  const text = String(value || '').toLowerCase();
  if (text.includes('wing')) return 'Wings';
  if (text.includes('burger')) return 'Burgers';
  if (text.includes('taco') || text.includes('birria')) return 'Tacos';
  if (text.includes('bbq') || text.includes('barbecue') || text.includes('rib')) return 'BBQ';
  if (text.includes('seafood') || text.includes('shrimp') || text.includes('fish') || text.includes('crab')) return 'Seafood';
  if (text.includes('dessert') || text.includes('cake')) return 'Desserts';
  if (text.includes('drink') || text.includes('juice') || text.includes('smoothie') || text.includes('coffee')) return 'Drinks';
  if (text.includes('breakfast') || text.includes('pancake')) return 'Breakfast';
  return 'Food';
}

function fallbackImage(category?: string | null, name?: string | null) {
  const text = `${category || ''} ${name || ''}`.toLowerCase();
  if (text.includes('wing')) return storageUrl(MENU_BUCKET, 'wings/1.jpg');
  if (text.includes('burger')) return storageUrl(MENU_BUCKET, 'burgers/1.jpg');
  if (text.includes('taco') || text.includes('birria')) return storageUrl(MENU_BUCKET, 'tacos/1.jpg');
  if (text.includes('mexican') || text.includes('burrito')) return storageUrl(MENU_BUCKET, 'mexican/1.jpg');
  if (text.includes('bbq') || text.includes('barbecue')) return storageUrl(MENU_BUCKET, 'bbq/1.jpg');
  if (text.includes('seafood') || text.includes('shrimp') || text.includes('fish')) return storageUrl(MENU_BUCKET, 'seafood/1.jpg');
  if (text.includes('dessert') || text.includes('cake')) return storageUrl(MENU_BUCKET, 'desserts/1.jpg');
  if (text.includes('drink') || text.includes('juice') || text.includes('smoothie') || text.includes('coffee')) return storageUrl(MENU_BUCKET, 'drinks/1.jpg');
  if (text.includes('breakfast') || text.includes('pancake')) return storageUrl(MENU_BUCKET, 'breakfast/1.jpg');
  if (text.includes('chicken')) return storageUrl(MENU_BUCKET, 'chicken/1.jpg');
  return storageUrl(MENU_BUCKET, 'universal/1.jpg');
}

function safeTileFallback(tile: Pick<FeedTile, 'category' | 'caption' | 'storeName' | 'posterUrl'>) {
  return tile.posterUrl || fallbackImage(tile.category, `${tile.caption} ${tile.storeName}`);
}

function isLiveMenuItem(row: MenuItemRow) {
  const availability = String(row.availability || '').toLowerCase().trim();
  if (row.is_available === false) return false;
  if (!String(row.name || '').trim()) return false;
  if (['deleted', 'delete', 'removed', 'hidden', 'inactive', 'archived', 'draft', 'sold_out'].includes(availability)) return false;
  return true;
}

function getDisplayCity(restaurant: RestaurantRow) {
  const city = cleanText(restaurant.city);
  if (city) return city;

  const address = cleanText(restaurant.address);
  if (!address) return 'Local';

  const parts = address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) return parts[parts.length - 2].replace(/\d+/g, '').trim() || 'Local';
  return address;
}

function getBusinessType(restaurant: RestaurantRow) {
  const typeText = `${restaurant.business_type || ''} ${restaurant.store_type || ''} ${restaurant.category || ''} ${restaurant.name || ''}`.toLowerCase();

  if (typeText.includes('truck')) return 'Food Truck';
  if (typeText.includes('pop')) return 'Pop-Up';
  if (typeText.includes('cater')) return 'Catering';
  if (typeText.includes('dessert') || typeText.includes('cake') || typeText.includes('bakery')) return 'Dessert';
  if (typeText.includes('drink') || typeText.includes('juice') || typeText.includes('smoothie') || typeText.includes('coffee')) return 'Drinks';
  return 'Restaurant';
}

function tileMatchesCity(tile: FeedTile, cityQuery: string) {
  const query = normalizeSearchText(cityQuery);
  if (!query) return true;

  const city = normalizeSearchText(tile.city);
  const state = normalizeSearchText(tile.state);
  const address = normalizeSearchText(tile.address);
  const storeName = normalizeSearchText(tile.storeName);
  const category = normalizeSearchText(tile.category);
  const caption = normalizeSearchText(tile.caption);
  const combined = normalizeSearchText(`${tile.city} ${tile.state} ${tile.address} ${tile.storeName} ${tile.category} ${tile.caption} ${tile.businessType}`);

  return (
    city.includes(query) ||
    state.includes(query) ||
    address.includes(query) ||
    storeName.includes(query) ||
    category.includes(query) ||
    caption.includes(query) ||
    combined.includes(query)
  );
}

function timeAgo(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function AutoVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [failed, setFailed] = useState(false);

  const safePoster = poster || storageUrl(MENU_BUCKET, 'universal/1.jpg');

  const prepareVideo = useCallback(() => {
    const video = ref.current;
    if (!video || !src || failed) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.preload = 'auto';
  }, [failed, src]);

  const forcePlay = useCallback(() => {
    const video = ref.current;
    if (!video || !src || failed) return;

    prepareVideo();

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => null);
    }
  }, [failed, prepareVideo, src]);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  useEffect(() => {
    const video = ref.current;
    if (!video || !src || failed) return;

    let stopped = false;
    let playTimer: number | null = null;
    let warmTimer: number | null = null;

    prepareVideo();

    const playSoon = () => {
      if (stopped) return;
      if (playTimer) window.clearTimeout(playTimer);
      playTimer = window.setTimeout(() => {
        if (!stopped) forcePlay();
      }, 80);
    };

    const unlockOnUserTouch = () => playSoon();
    window.addEventListener('touchstart', unlockOnUserTouch, { passive: true });
    window.addEventListener('pointerdown', unlockOnUserTouch, { passive: true });
    window.addEventListener('scroll', unlockOnUserTouch, { passive: true });

    if (typeof IntersectionObserver === 'undefined') {
      playSoon();
      return () => {
        stopped = true;
        if (playTimer) window.clearTimeout(playTimer);
        if (warmTimer) window.clearTimeout(warmTimer);
        window.removeEventListener('touchstart', unlockOnUserTouch);
        window.removeEventListener('pointerdown', unlockOnUserTouch);
        window.removeEventListener('scroll', unlockOnUserTouch);
        video.pause();
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        if (entry.isIntersecting) {
          video.preload = 'auto';
          prepareVideo();
          if (warmTimer) window.clearTimeout(warmTimer);
          warmTimer = window.setTimeout(playSoon, entry.intersectionRatio > 0.35 ? 40 : 140);
        } else {
          if (playTimer) window.clearTimeout(playTimer);
          if (warmTimer) window.clearTimeout(warmTimer);
          video.pause();
        }
      },
      { rootMargin: '900px 0px', threshold: [0, 0.12, 0.35, 0.65] }
    );

    observer.observe(video);

    return () => {
      stopped = true;
      if (playTimer) window.clearTimeout(playTimer);
      if (warmTimer) window.clearTimeout(warmTimer);
      observer.disconnect();
      window.removeEventListener('touchstart', unlockOnUserTouch);
      window.removeEventListener('pointerdown', unlockOnUserTouch);
      window.removeEventListener('scroll', unlockOnUserTouch);
      video.pause();
    };
  }, [failed, forcePlay, prepareVideo, src]);

  if (failed || !src) {
    return <img src={safePoster} alt="Food preview" className="tileMedia" loading="lazy" decoding="async" />;
  }

  return (
    <video
      ref={ref}
      data-orda-feed-video="true"
      src={src}
      poster={safePoster || undefined}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      className="tileMedia"
      controls={false}
      disablePictureInPicture
      onLoadedMetadata={prepareVideo}
      onLoadedData={forcePlay}
      onCanPlay={forcePlay}
      onPlaying={prepareVideo}
      onStalled={forcePlay}
      onWaiting={forcePlay}
      onError={() => setFailed(true)}
    />
  );
}

function SafeImage({ src, fallback, alt }: { src: string; fallback: string; alt: string }) {
  const [currentSrc, setCurrentSrc] = useState(src || fallback);

  useEffect(() => {
    setCurrentSrc(src || fallback);
  }, [fallback, src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className="tileMedia"
      loading="lazy"
      decoding="async"
      onError={() => {
        if (currentSrc !== fallback) setCurrentSrc(fallback);
      }}
    />
  );
}

export default function DiscoverPage() {
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
  const [restaurantMedia, setRestaurantMedia] = useState<RestaurantMediaRow[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemRow[]>([]);
  const [customerPosts, setCustomerPosts] = useState<CustomerPostRow[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedLikeCounts, setSavedLikeCounts] = useState<Record<string, number>>({});
  const [deviceId, setDeviceId] = useState('');
  const [search] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      let currentDeviceId = window.localStorage.getItem('orda_discover_device_id');

      if (!currentDeviceId) {
        currentDeviceId =
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `orda-device-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        window.localStorage.setItem('orda_discover_device_id', currentDeviceId);
      }

      setDeviceId(currentDeviceId);
    } catch {
      setDeviceId(`orda-device-${Date.now()}`);
    }
  }, []);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [activeTab, citySearch]);

  useEffect(() => {
    const marker = loadMoreRef.current;
    if (!marker) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((current) => current + LOAD_MORE_COUNT);
        }
      },
      { rootMargin: '700px 0px' }
    );

    observer.observe(marker);

    return () => observer.disconnect();
  }, [filteredFeedLengthKey(activeTab, citySearch, restaurants.length, restaurantMedia.length, menuItems.length, customerPosts.length)]);

  useEffect(() => {
    async function load() {
      if (!deviceId) return;

      setLoading(true);

      const [
        { data: storeRows, error: storeError },
        { data: mediaRows, error: mediaError },
        { data: itemRows, error: itemError },
        { data: customerPostRows, error: customerPostError },
        { data: likeRows, error: likeRowsError },
      ] = await Promise.all([
        supabase.from('restaurants').select('*').or('public_visible.is.null,public_visible.eq.true').not('slug', 'is', null).limit(250),
        supabase.from('restaurant_media').select('*').order('created_at', { ascending: false }).limit(250),
        supabase.from('menu_items').select('*').order('sort_order', { ascending: true }).limit(250),
        supabase
          .from('customer_posts')
          .select('id,customer_id,customer_name,caption,media_url,media_type,likes,views,comments_count,created_at')
          .order('created_at', { ascending: false })
          .limit(250),
        supabase.from('discover_likes').select('source_table,source_id,device_id').limit(5000),
      ]);

      if (storeError) console.error('Discover restaurants error:', storeError);
      if (mediaError) console.error('Discover media error:', mediaError);
      if (itemError) console.error('Discover menu items error:', itemError);
      if (customerPostError) console.error('Discover customer posts error:', customerPostError);
      if (likeRowsError) console.error('Discover likes load error:', likeRowsError);

      const nextSavedLikeCounts: Record<string, number> = {};
      const nextLikedPosts: Record<string, boolean> = {};

      ((likeRows || []) as DiscoverLikeRow[]).forEach((row) => {
        const sourceTable = String(row.source_table || '').trim();
        const sourceId = String(row.source_id || '').trim();

        if (!sourceTable || !sourceId) return;

        const metricKey = `${sourceTable}:${sourceId}`;
        const deviceKey = `like:${metricKey}`;

        nextSavedLikeCounts[metricKey] = Number(nextSavedLikeCounts[metricKey] || 0) + 1;

        if (row.device_id && row.device_id === deviceId) {
          nextLikedPosts[deviceKey] = true;
        }
      });

      setSavedLikeCounts(nextSavedLikeCounts);
      setLikedPosts(nextLikedPosts);
      setRestaurants((storeRows || []) as RestaurantRow[]);
      setRestaurantMedia((mediaRows || []) as RestaurantMediaRow[]);
      setMenuItems((itemRows || []) as MenuItemRow[]);
      setCustomerPosts((customerPostRows || []) as CustomerPostRow[]);
      setLoading(false);
    }

    void load();

    if (!deviceId) return;

    const channel = supabase
      .channel('orda-discover-live-likes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'discover_likes' }, (payload) => {
        const inserted = payload.new as DiscoverLikeRow;
        const sourceTable = String(inserted.source_table || '').trim();
        const sourceId = String(inserted.source_id || '').trim();

        if (!sourceTable || !sourceId) return;

        const metricKey = `${sourceTable}:${sourceId}`;

        setSavedLikeCounts((current) => ({
          ...current,
          [metricKey]: Number(current[metricKey] || 0) + 1,
        }));

        if (inserted.device_id && inserted.device_id === deviceId) {
          setLikedPosts((current) => ({
            ...current,
            [`like:${metricKey}`]: true,
          }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deviceId]);

  const feed = useMemo<FeedTile[]>(() => {
    const storeById = new Map<string, RestaurantRow>();
    restaurants.forEach((restaurant) => {
      storeById.set(restaurant.id, restaurant);
    });

    const tiles: FeedTile[] = [];

    customerPosts.forEach((post) => {
      const mediaUrl = resolveCustomerPostUrl(post.media_url);
      if (!mediaUrl) return;

      const type: 'image' | 'video' = String(post.media_type || '').toLowerCase().includes('video') || isVideoUrl(mediaUrl) ? 'video' : 'image';
      const caption = cleanText(post.caption, 'Customer food post');
      const customerName = cleanText(post.customer_name, 'Customer');
      const category = categoryFromText(caption);

      tiles.push({
        id: `customer_${post.id}`,
        sourceTable: 'customer_posts',
        rawId: post.id,
        restaurantId: '',
        slug: '',
        storeName: customerName,
        logoUrl: '',
        category,
        city: 'Local',
        state: '',
        address: '',
        businessType: 'Customer Post',
        type,
        mediaUrl,
        posterUrl: fallbackImage(category, caption),
        caption,
        subcaption: `${customerName} • ORDA Community`,
        views: Number(post.views || 0),
        likes: Number(post.likes || 0),
        featured: false,
        createdAt: post.created_at || '',
        isCustomerPost: true,
      });
    });

    restaurantMedia.forEach((media) => {
      if (!media.restaurant_id || !media.media_url) return;
      const restaurant = storeById.get(media.restaurant_id);
      if (!restaurant?.slug) return;

      const mediaUrl = resolveMenuUrl(media.media_url);
      const category = cleanText(restaurant.category, categoryFromText(`${restaurant.name} ${media.caption}`));
      const type: 'image' | 'video' = media.media_type === 'video' || isVideoUrl(mediaUrl) ? 'video' : 'image';

      tiles.push({
        id: `media_${media.id}`,
        sourceTable: 'restaurant_media',
        rawId: media.id,
        restaurantId: restaurant.id,
        slug: restaurant.slug,
        storeName: cleanText(restaurant.name, 'ORDA Restaurant'),
        logoUrl: resolveMenuUrl(restaurant.logo_image),
        category,
        city: getDisplayCity(restaurant),
        state: cleanText(restaurant.state),
        address: cleanText(restaurant.address),
        businessType: getBusinessType(restaurant),
        type,
        mediaUrl,
        posterUrl: resolveMenuUrl(restaurant.hero_image) || resolveMenuUrl(restaurant.cover_image) || fallbackImage(category, restaurant.name),
        caption: cleanText(media.caption, cleanText(restaurant.name, 'ORDA')),
        subcaption: cleanText(restaurant.name, 'ORDA Store'),
        views: Number(media.views || restaurant.views || 0),
        likes: Number(media.likes || 0),
        featured: Boolean(restaurant.featured),
        createdAt: media.created_at || '',
        isCustomerPost: false,
      });
    });

    menuItems.filter(isLiveMenuItem).forEach((item) => {
      if (!item.restaurant_id) return;
      const restaurant = storeById.get(item.restaurant_id);
      if (!restaurant?.slug) return;

      const rawVideo = item.video_file || item.item_video || item.menu_video || item.video_url || '';
      const rawImage = item.image_file || item.item_image || item.image_url || '';
      const videoUrl = resolveMenuUrl(rawVideo);
      const imageUrl = resolveMenuUrl(rawImage);
      const hasVideo = isVideoUrl(videoUrl);
      const category = cleanText(restaurant.category, categoryFromText(`${item.name} ${item.description}`));
      const poster = imageUrl || resolveMenuUrl(restaurant.hero_image) || resolveMenuUrl(restaurant.cover_image) || fallbackImage(category, item.name);

      if (!hasVideo && !imageUrl) return;

      tiles.push({
        id: `item_${item.id}`,
        sourceTable: 'menu_items',
        rawId: item.id,
        restaurantId: restaurant.id,
        slug: restaurant.slug,
        storeName: cleanText(restaurant.name, 'ORDA Restaurant'),
        logoUrl: resolveMenuUrl(restaurant.logo_image),
        category,
        city: getDisplayCity(restaurant),
        state: cleanText(restaurant.state),
        address: cleanText(restaurant.address),
        businessType: getBusinessType(restaurant),
        type: hasVideo ? 'video' : 'image',
        mediaUrl: hasVideo ? videoUrl : imageUrl,
        posterUrl: poster,
        caption: cleanText(item.name, cleanText(restaurant.name, 'ORDA')),
        subcaption: cleanText(item.description, cleanText(restaurant.name, 'ORDA Store')),
        views: Number(restaurant.views || 0),
        likes: 0,
        featured: Boolean(restaurant.featured),
        createdAt: restaurant.created_at || '',
        isCustomerPost: false,
      });
    });

    return tiles;
  }, [customerPosts, menuItems, restaurantMedia, restaurants]);

  const matchingCityStores = useMemo(() => {
    const query = normalizeSearchText(citySearch);

    if (!query) return [];

    const stores = new Map<string, { slug: string; name: string; location: string }>();

    feed.forEach((tile) => {
      if (!tileMatchesCity(tile, citySearch)) return;
      if (!tile.slug) return;

      const location = cleanText(tile.address) || [tile.city, tile.state].filter(Boolean).join(', ') || tile.city;
      const label = cleanText(tile.storeName, 'Open Store');

      stores.set(tile.slug, {
        slug: tile.slug,
        name: label,
        location,
      });
    });

    return Array.from(stores.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 16);
  }, [citySearch, feed]);

  const filteredFeed = useMemo(() => {
    const query = search.toLowerCase().trim();

    return feed.filter((tile) => {
      const searchHit =
        !query ||
        tile.storeName.toLowerCase().includes(query) ||
        tile.category.toLowerCase().includes(query) ||
        tile.businessType.toLowerCase().includes(query) ||
        tile.city.toLowerCase().includes(query) ||
        tile.address.toLowerCase().includes(query) ||
        tile.caption.toLowerCase().includes(query) ||
        tile.subcaption.toLowerCase().includes(query);

      const cityHit = tileMatchesCity(tile, citySearch);

      const tabHit =
        activeTab === 'All' ||
        (activeTab === 'Customer Posts' && tile.isCustomerPost) ||
        (activeTab === 'Videos' && tile.type === 'video') ||
        (activeTab === 'Trending' && (seededViews(tile) > 100 || tile.featured || seededLikes(tile) > 10)) ||
        (activeTab === 'Featured' && tile.featured) ||
        (activeTab === 'Food Trucks' && tile.businessType.toLowerCase().includes('truck')) ||
        (activeTab === 'Pop-Ups' && tile.businessType.toLowerCase().includes('pop')) ||
        tile.category.toLowerCase().includes(activeTab.toLowerCase());

      return searchHit && cityHit && tabHit;
    });
  }, [activeTab, citySearch, feed, search]);

  const visibleFeed = useMemo(() => filteredFeed.slice(0, visibleCount), [filteredFeed, visibleCount]);
  const cityActive = citySearch.trim().length > 0;

  function tileHref(tile: FeedTile) {
    if (tile.slug) return `/store/${tile.slug}`;
    return '/customer/signup';
  }

  function engagementKey(tile: FeedTile) {
    return `${tile.sourceTable}:${tile.rawId}`;
  }

  function likeKey(tile: FeedTile) {
    return `like:${engagementKey(tile)}`;
  }

  function liveDisplayLikes(tile: FeedTile) {
    if (tile.sourceTable === 'customer_posts' || tile.isCustomerPost) {
      return Number(tile.likes || 0);
    }

    return seededLikes(tile) + Number(savedLikeCounts[engagementKey(tile)] || 0);
  }

  function liveDisplayViews(tile: FeedTile) {
    if (tile.sourceTable === 'customer_posts' || tile.isCustomerPost) {
      return Number(tile.views || 0);
    }

    return seededViews(tile);
  }

  async function handleTileLike(tile: FeedTile, event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!deviceId) return;

    const metricKey = engagementKey(tile);
    const key = likeKey(tile);

    if (likedPosts[key]) return;

    const previousCustomerLikes = Number(tile.likes || 0);
    const nextCustomerLikes = previousCustomerLikes + 1;

    setLikedPosts((current) => ({
      ...current,
      [key]: true,
    }));

    if (tile.sourceTable === 'customer_posts' || tile.isCustomerPost) {
      setCustomerPosts((current) =>
        current.map((post) =>
          post.id === tile.rawId
            ? {
                ...post,
                likes: nextCustomerLikes,
              }
            : post
        )
      );
    } else {
      setSavedLikeCounts((current) => ({
        ...current,
        [metricKey]: Number(current[metricKey] || 0) + 1,
      }));
    }

    const { error } = await supabase.from('discover_likes').insert({
      source_table: tile.sourceTable,
      source_id: tile.rawId,
      device_id: deviceId,
    });

    if (error) {
      const alreadyLiked = error.code === '23505';

      if (alreadyLiked) return;

      console.error('Discover like save error:', error);

      setLikedPosts((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });

      if (tile.sourceTable === 'customer_posts' || tile.isCustomerPost) {
        setCustomerPosts((current) =>
          current.map((post) =>
            post.id === tile.rawId
              ? {
                  ...post,
                  likes: previousCustomerLikes,
                }
              : post
          )
        );
      } else {
        setSavedLikeCounts((current) => ({
          ...current,
          [metricKey]: Math.max(0, Number(current[metricKey] || 0) - 1),
        }));
      }

      return;
    }

    if (tile.sourceTable === 'customer_posts' || tile.isCustomerPost) {
      const { error: updateError } = await supabase.from('customer_posts').update({ likes: nextCustomerLikes }).eq('id', tile.rawId);
      if (updateError) console.error('Customer post like sync error:', updateError);
    }
  }

  async function handleTileView(tile: FeedTile) {
    if (tile.sourceTable !== 'customer_posts' && !tile.isCustomerPost) return;

    const viewKey = `view:${tile.sourceTable}:${tile.rawId}`;

    try {
      if (window.sessionStorage.getItem(viewKey)) return;
      window.sessionStorage.setItem(viewKey, 'yes');
    } catch {}

    const previousViews = Number(tile.views || 0);
    const nextViews = previousViews + 1;

    setCustomerPosts((current) => current.map((post) => (post.id === tile.rawId ? { ...post, views: nextViews } : post)));

    const { error } = await supabase.from('customer_posts').update({ views: nextViews }).eq('id', tile.rawId);
    if (error) console.error('Customer post view sync error:', error);
  }

  return (
    <main className="discoverPage">
      <header className="topBar">
        <Link href="/" className="profileDot" aria-label="ORDA Home">
          ORDA
        </Link>

        <div className="topActions">
          <Link href={CUSTOMER_SIGNUP_PATH} prefetch className="customerSignupButton">
            Customer Create Free Account
          </Link>

          <Link href={OWNER_SIGNUP_PATH} prefetch className="ownerSignupButton">
            Food Owner Sign Up Today For Free!
          </Link>
        </div>
      </header>

      <section className="cityFinder">
        <div className="cityFinderText">
          <strong>Search any city to see ORDA owners in that area.</strong>
        </div>

        <div className="citySearchBox">
          <input
            value={citySearch}
            onChange={(event) => setCitySearch(event.target.value)}
            placeholder="Search for drinks, restaurants, food owners near me..."
            aria-label="Search for drinks, restaurants, food owners near me"
          />

          {cityActive ? (
            <button type="button" onClick={() => setCitySearch('')} aria-label="Clear city search">
              Clear
            </button>
          ) : null}
        </div>

        {cityActive && matchingCityStores.length > 0 ? (
          <div className="cityChips" aria-label="Matching owner stores">
            {matchingCityStores.map((store) => (
              <Link key={store.slug} href={`/store/${store.slug}`} className="cityStoreChip">
                <span>{store.name}</span>
                <small>{store.location}</small>
                <b>Open Store →</b>
              </Link>
            ))}
          </div>
        ) : null}

        {cityActive && matchingCityStores.length === 0 && !loading ? <div className="cityNoChips">No owner stores found for that search yet.</div> : null}

        <div className="cityResultLine">
          {cityActive ? (
            <>
              Showing <b>{filteredFeed.length}</b> matching food posts and stores for <b>{citySearch}</b>
            </>
          ) : (
            <>
              Showing <b>{filteredFeed.length}</b> public food posts from ORDA owners and customers
            </>
          )}
        </div>
      </section>

      <nav className="tabs">
        {TABS.map((tab) => (
          <button key={tab} type="button" className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </nav>

      {loading ? (
        <section className="status">Loading ORDA Discover...</section>
      ) : filteredFeed.length === 0 ? (
        <section className="status">
          <h1>No ORDA posts found here yet.</h1>
          <p>
            {cityActive
              ? `No restaurants, food trucks, pop-ups, catering stores, or customer posts are showing for "${citySearch}" yet. Try another search or clear the box.`
              : 'Owner menu videos, uploaded food media, and customer posts will appear here.'}
          </p>

          {cityActive ? (
            <button type="button" className="emptyButton" onClick={() => setCitySearch('')}>
              Show all posts
            </button>
          ) : null}
        </section>
      ) : (
        <>
          <section className="exploreGrid">
            {visibleFeed.map((tile, index) => (
              <Link
                href={tileHref(tile)}
                key={tile.id}
                className={`tile ${tile.type === 'video' ? 'videoTile' : ''} ${index % 9 === 0 ? 'bigTile' : ''} ${tile.isCustomerPost ? 'customerTile' : ''}`}
                onClick={() => {
                  void handleTileView(tile);
                }}
              >
                {tile.type === 'video' ? (
                  <AutoVideo src={tile.mediaUrl} poster={safeTileFallback(tile)} />
                ) : (
                  <SafeImage src={tile.mediaUrl} fallback={safeTileFallback(tile)} alt={tile.caption || tile.storeName} />
                )}

                <div className="tileShade" />

                <div className="topMeta">
                  {tile.isCustomerPost ? (
                    <>
                      <b>{tile.storeName.slice(0, 1)}</b>
                      <span>Customer Post</span>
                    </>
                  ) : tile.logoUrl ? (
                    <img src={tile.logoUrl} alt={tile.storeName} loading="lazy" decoding="async" />
                  ) : (
                    <b>{tile.storeName.slice(0, 1)}</b>
                  )}
                  {tile.featured ? <span>Featured</span> : null}
                </div>

                <div className="bottomMeta">
                  <strong>{tile.caption}</strong>
                  <small>
                    {tile.subcaption || tile.storeName} {timeAgo(tile.createdAt) ? `• ${timeAgo(tile.createdAt)}` : ''}
                  </small>

                  <div className="tileStats" aria-label="Post engagement">
                    <button
                      type="button"
                      className={`likeStat likeButton ${likedPosts[likeKey(tile)] ? 'liked' : ''}`}
                      aria-label={likedPosts[likeKey(tile)] ? 'Already liked this post on this device' : 'Like this post'}
                      onClick={(event) => handleTileLike(tile, event)}
                    >
                      ♥ {displayCount(liveDisplayLikes(tile))}
                    </button>
                    <span className="viewStat">👁 {displayCount(liveDisplayViews(tile))}</span>
                  </div>
                </div>
              </Link>
            ))}
          </section>

          <div ref={loadMoreRef} className="loadMoreMarker">
            {visibleFeed.length < filteredFeed.length ? 'Loading more ORDA posts...' : 'You are caught up.'}
          </div>
        </>
      )}

      <style jsx global>{`
        *{box-sizing:border-box}
        html,body{margin:0;padding:0;background:#05070b;color:#fff;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        a{text-decoration:none;color:inherit}
        button,input{font:inherit}
        .discoverPage{min-height:100vh;background:#05070b;overflow-x:hidden;padding-bottom:44px}
        .topBar{position:sticky;top:0;z-index:100;min-height:92px;padding:18px clamp(14px,3vw,34px);background:rgba(5,7,11,.92);backdrop-filter:blur(18px);border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:16px}
        .topActions{flex:1;min-width:0;display:grid;grid-template-columns:minmax(245px,380px) minmax(300px,480px);gap:12px;align-items:center}
        .profileDot{width:64px;height:64px;flex:0 0 auto;border-radius:999px;display:grid;place-items:center;background:radial-gradient(circle at 30% 22%,rgba(255,255,255,.95) 0%,rgba(255,255,255,.68) 9%,rgba(255,80,190,.98) 28%,rgba(255,23,139,1) 55%,rgba(84,7,58,1) 100%);border:2px solid rgba(255,255,255,.24);font-size:12px;font-weight:1000;letter-spacing:.02em;color:#fff;box-shadow:0 0 0 5px rgba(255,45,149,.12),0 0 24px rgba(255,45,149,.68),inset 0 2px 3px rgba(255,255,255,.38),inset 0 -10px 24px rgba(0,0,0,.24);text-shadow:0 2px 9px rgba(0,0,0,.45)}
        .customerSignupButton,.ownerSignupButton{min-height:64px;width:100%;padding:0 28px;border-radius:999px;display:flex;align-items:center;justify-content:center;text-align:center;background:linear-gradient(135deg,#ff1491 0%,#ff2d95 38%,#ff43c8 62%,#ff1491 100%);color:#fff;font-size:22px;line-height:1;font-weight:1000;letter-spacing:-.04em;border:2px solid rgba(255,255,255,.18);box-shadow:0 0 18px rgba(255,45,149,.88),0 0 42px rgba(255,45,149,.55),0 14px 34px rgba(255,45,149,.22),inset 0 2px 0 rgba(255,255,255,.28),inset 0 -8px 22px rgba(128,0,76,.3);transition:transform .2s ease,box-shadow .2s ease,background .2s ease;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .customerSignupButton:hover,.ownerSignupButton:hover{transform:translateY(-2px) scale(1.02);background:linear-gradient(135deg,#ff0084 0%,#ff2d95 42%,#ff63e2 65%,#ff0084 100%);box-shadow:0 0 24px rgba(255,45,149,1),0 0 62px rgba(255,45,149,.66),0 16px 38px rgba(255,45,149,.28),inset 0 2px 0 rgba(255,255,255,.34),inset 0 -8px 22px rgba(128,0,76,.3)}
        .cityFinder{position:sticky;top:92px;z-index:95;background:linear-gradient(180deg,rgba(5,7,11,.96),rgba(5,7,11,.9));backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.08);padding:14px clamp(14px,3vw,34px) 14px}
        .cityFinderText{display:flex;align-items:center;justify-content:flex-end;gap:16px;margin-bottom:14px}
        .cityFinderText strong{color:#fff;font-size:22px;line-height:1.1;font-weight:1000;letter-spacing:-.04em;text-align:right;text-shadow:0 2px 12px rgba(0,0,0,.6)}
        .citySearchBox{min-height:72px;border-radius:26px;background:rgba(255,255,255,.11);border:1px solid rgba(255,255,255,.15);display:flex;align-items:center;gap:12px;padding:0 14px 0 18px;box-shadow:0 18px 45px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.08)}
        .citySearchBox input{flex:1;min-width:0;height:72px;border:0;outline:0;background:transparent;color:#fff;font-size:20px;font-weight:900}
        .citySearchBox input::placeholder{color:rgba(255,255,255,.78);opacity:1}
        .citySearchBox:focus-within{border-color:rgba(255,45,149,.72);box-shadow:0 0 0 4px rgba(255,45,149,.12),0 18px 45px rgba(0,0,0,.22)}
        .citySearchBox button,.emptyButton{border:0;border-radius:999px;background:#ff2d95;color:#fff;font-size:13px;font-weight:1000;padding:10px 14px;cursor:pointer;box-shadow:0 12px 30px rgba(255,45,149,.25)}
        .cityChips{display:flex;gap:9px;overflow-x:auto;scrollbar-width:none;padding-top:12px}
        .cityChips::-webkit-scrollbar{display:none}
        .cityStoreChip{min-width:220px;max-width:320px;min-height:58px;flex:0 0 auto;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.09);color:#fff;border-radius:20px;padding:10px 14px;display:grid;gap:2px;box-shadow:0 14px 32px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.08)}
        .cityStoreChip span{font-size:14px;font-weight:1000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .cityStoreChip small{font-size:11px;font-weight:800;color:rgba(255,255,255,.66);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .cityStoreChip b{width:fit-content;margin-top:2px;border-radius:999px;background:#ff2d95;color:#fff;padding:5px 9px;font-size:10px;font-weight:1000;box-shadow:0 10px 25px rgba(255,45,149,.24)}
        .cityNoChips{margin-top:10px;color:rgba(255,255,255,.56);font-size:13px;font-weight:850}
        .cityResultLine{margin-top:10px;color:rgba(255,255,255,.68);font-size:13px;font-weight:800}
        .cityResultLine b{color:#fff}
        .tabs{position:sticky;top:238px;z-index:90;background:rgba(5,7,11,.9);backdrop-filter:blur(18px);padding:16px clamp(10px,3vw,34px);display:flex;gap:10px;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid rgba(255,255,255,.07)}
        .tabs::-webkit-scrollbar{display:none}
        .tabs button{height:54px;flex:0 0 auto;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.12);color:#fff;padding:0 24px;font-size:20px;font-weight:1000;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 12px 26px rgba(0,0,0,.18)}
        .tabs button.active{background:#ff2d95;border-color:#ff2d95;box-shadow:0 14px 34px rgba(255,45,149,.28),inset 0 1px 0 rgba(255,255,255,.16)}
        .exploreGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:310px;gap:5px;padding:5px;max-width:1480px;margin:0 auto}
        .tile{position:relative;display:block;overflow:hidden;background:#111;border-radius:0;min-width:0;isolation:isolate}
        .tile.bigTile{grid-column:span 2;grid-row:span 2}
        .tileMedia{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:transform .28s ease;filter:saturate(1.08) contrast(1.04)}
        .tile:hover .tileMedia{transform:scale(1.04)}
        .tileShade{position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.76),transparent 42%,rgba(0,0,0,.18));opacity:.85;z-index:1;pointer-events:none}
        .topMeta{position:absolute;top:10px;left:10px;right:54px;z-index:4;display:flex;align-items:center;gap:8px;pointer-events:none}
        .topMeta img,.topMeta b{width:32px;height:32px;border-radius:999px;object-fit:cover;background:#ff2d95;display:grid;place-items:center;font-weight:1000;text-transform:uppercase;border:1px solid rgba(255,255,255,.24)}
        .topMeta span{background:rgba(255,45,149,.9);border-radius:999px;padding:7px 10px;font-size:11px;font-weight:1000;text-transform:uppercase;letter-spacing:.08em}
        .customerTile .topMeta b{box-shadow:0 0 18px rgba(255,45,149,.65)}
        .bottomMeta{position:absolute;left:12px;right:12px;bottom:12px;z-index:4;text-shadow:0 6px 20px rgba(0,0,0,.8)}
        .bottomMeta strong{display:block;font-size:19px;line-height:1.05;font-weight:1000;letter-spacing:-.04em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .bigTile .bottomMeta strong{font-size:32px}
        .bottomMeta small{display:block;margin-top:6px;color:rgba(255,255,255,.88);font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .tileStats{display:flex;align-items:center;gap:8px;margin-top:8px}
        .tileStats span,.tileStats button{border-radius:999px;background:rgba(0,0,0,.62);border:1px solid rgba(255,255,255,.12);padding:5px 10px;font-size:12px;font-weight:1000;line-height:1;box-shadow:0 8px 20px rgba(0,0,0,.24);backdrop-filter:blur(10px);color:inherit}
        .tileStats .likeStat{color:#ff4fb8}
        .tileStats .viewStat{color:#fff}
        .likeButton{cursor:pointer;appearance:none;-webkit-appearance:none;transition:.18s ease}
        .likeButton:hover{transform:scale(1.05);background:rgba(255,79,184,.18);border-color:rgba(255,79,184,.45)}
        .likeButton.liked{background:rgba(255,79,184,.22);border-color:rgba(255,79,184,.58);box-shadow:0 0 16px rgba(255,79,184,.24)}
        .status{min-height:60vh;display:grid;place-items:center;text-align:center;padding:40px;color:rgba(255,255,255,.72);font-weight:900}
        .status h1{margin:0;color:#fff;font-size:36px}
        .status p{margin:10px auto 0;max-width:680px;line-height:1.5}
        .emptyButton{margin-top:18px}
        .loadMoreMarker{max-width:1480px;margin:20px auto 0;padding:20px;text-align:center;color:rgba(255,255,255,.55);font-weight:900}
        @media(max-width:1180px){.topActions{grid-template-columns:minmax(230px,1fr) minmax(260px,1fr)}.customerSignupButton,.ownerSignupButton{font-size:19px;padding:0 20px}.exploreGrid{grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-rows:280px}}
        @media(max-width:760px){.topBar{min-height:auto;padding:10px;gap:10px;align-items:center}.profileDot{width:54px;height:54px;font-size:10px}.topActions{display:grid;grid-template-columns:1fr 1fr;gap:10px}.customerSignupButton,.ownerSignupButton{min-height:58px;padding:0 12px;border-radius:999px;font-size:15px;line-height:1.04;white-space:normal;letter-spacing:-.045em;box-shadow:0 0 18px rgba(255,45,149,.82),0 0 46px rgba(255,45,149,.48),inset 0 1px 0 rgba(255,255,255,.3)}.cityFinder{top:78px;padding:12px 10px}.cityFinderText{justify-content:flex-end;margin-bottom:10px}.cityFinderText strong{text-align:right;font-size:18px}.citySearchBox{min-height:58px;border-radius:20px}.citySearchBox input{height:58px;font-size:15px}.citySearchBox button{font-size:12px;padding:8px 11px}.cityStoreChip{min-width:190px;min-height:54px}.cityStoreChip span{font-size:13px}.tabs{top:220px;padding:10px;gap:8px}.tabs button{height:46px;padding:0 18px;font-size:17px}.exploreGrid{grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-rows:170px;gap:3px;padding:3px}.tile.bigTile{grid-column:span 2;grid-row:span 2}.bottomMeta{display:block;left:7px;right:7px;bottom:7px}.bottomMeta strong,.bottomMeta small{display:none}.tileStats{margin-top:0;gap:5px}.tileStats span,.tileStats button{font-size:11px;padding:5px 8px;background:rgba(0,0,0,.68);border-color:rgba(255,255,255,.14)}.topMeta span{display:none}.topMeta img,.topMeta b{width:25px;height:25px;font-size:11px}}
        @media(max-width:480px){.profileDot{width:46px;height:46px;font-size:9px}.topBar{gap:8px}.topActions{gap:8px}.customerSignupButton,.ownerSignupButton{min-height:52px;font-size:13px;padding:0 9px}.cityFinder{top:66px}.cityFinderText strong{font-size:15px}.citySearchBox{min-height:52px;border-radius:18px}.citySearchBox input{height:52px}.tabs{top:196px}.tabs button{height:42px;font-size:15px;padding:0 15px}}
        @media(max-width:420px){.exploreGrid{grid-auto-rows:145px}.tileStats span,.tileStats button{font-size:10px;padding:4px 7px}.tabs{top:202px}}
      `}</style>
    </main>
  );
}

function filteredFeedLengthKey(...parts: Array<string | number>) {
  return parts.join(':');
}
