'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type CustomerProfile = { id: string; name: string | null; email: string | null; phone: string | null; avatar_url?: string | null };

type OrderRow = {
  id: string;
  restaurant_id?: string | null;
  customer_id?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  status?: string | null;
  total?: number | null;
  created_at?: string | null;
  restaurants?: { name?: string | null; slug?: string | null; logo_image?: string | null; hero_image?: string | null } | null;
};

type FavoriteRow = {
  id: string;
  restaurant_id: string | null;
  restaurants?: {
    id?: string | null;
    name?: string | null;
    slug?: string | null;
    logo_image?: string | null;
    hero_image?: string | null;
    category?: string | null;
    city?: string | null;
    state?: string | null;
    address?: string | null;
  } | null;
};

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
  likes?: number | null;
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
  likes?: number | null;
  views?: number | null;
};

type CustomerPostRow = {
  id: string;
  customer_id?: string | null;
  customer_name?: string | null;
  caption?: string | null;
  media_url?: string | null;
  media_type?: string | null;
  likes?: number | null;
  likes_count?: number | null;
  comments_count?: number | null;
  views?: number | null;
  created_at?: string | null;
};

type FeedPost = {
  id: string;
  rawId: string;
  sourceTable: 'customer_posts' | 'restaurant_media' | 'menu_items' | 'restaurants';
  source: 'customer' | 'owner';
  customerId?: string | null;
  restaurantId?: string | null;
  restaurantSlug?: string | null;
  name: string;
  avatar: string;
  caption: string;
  subText: string;
  mediaUrl: string;
  posterUrl: string;
  mediaType: 'image' | 'video';
  category: string;
  city: string;
  state: string;
  address: string;
  likes: number;
  views: number;
  commentsCount: number;
  createdAt: string;
  featured: boolean;
};

type UploadState = 'idle' | 'uploading' | 'error' | 'success';

const POST_BUCKET = 'customer-posts';
const MENU_BUCKET = 'menu-images';
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function cleanName(value?: string | null) {
  const name = String(value || '').trim();
  if (!name || name.length < 2) return 'Customer';
  if (name.toLowerCase() === 'aa') return 'Customer';
  return name;
}

function initials(value?: string | null) {
  return cleanName(value).slice(0, 1).toUpperCase();
}

function statusText(value?: string | null) {
  const status = String(value || 'new').toLowerCase();
  if (status === 'in_progress') return 'In progress';
  if (status === 'completed') return 'Completed';
  if (status === 'cancelled') return 'Cancelled';
  if (status === 'ready') return 'Ready';
  return 'New';
}

function timeAgo(value?: string | null) {
  if (!value) return 'now';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function compactNumber(value: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value || 0));
}

function hasViolation(text: string) {
  const clean = text.toLowerCase();
  return [
    /\$\s*\d+/,
    /\b\d+\s*(dollars|bucks|usd)\b/,
    /\b(price|prices|selling|sell|for sale|cashapp|cash app|venmo|zelle|paypal|apple pay)\b/,
    /\b(dm me|message me|text me|call me|contact me|inbox me)\b/,
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
    /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/,
    /\b(address|pull up|meet me|my number|phone number)\b/,
  ].some((pattern) => pattern.test(clean));
}

function storageUrl(bucket: string, path: string) {
  const clean = String(path || '').replace(/^\/+/, '');
  const { data } = supabase.storage.from(bucket).getPublicUrl(clean);
  return data.publicUrl;
}

function resolvePostMediaUrl(value?: string | null) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return raw;
  if (raw.startsWith(`${POST_BUCKET}/`)) return storageUrl(POST_BUCKET, raw.replace(`${POST_BUCKET}/`, ''));
  return storageUrl(POST_BUCKET, raw);
}

function resolveAvatarUrl(value?: string | null) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return raw;
  if (raw.startsWith(`${POST_BUCKET}/`)) return storageUrl(POST_BUCKET, raw.replace(`${POST_BUCKET}/`, ''));
  return storageUrl(POST_BUCKET, raw);
}

function orderStepStatus(order?: OrderRow | null) {
  const status = String(order?.status || 'new').toLowerCase();
  const placed = true;
  const preparing = ['accepted', 'in_progress', 'preparing', 'ready', 'completed', 'done', 'delivered'].includes(status);
  const ready = ['ready', 'completed', 'done', 'delivered'].includes(status);
  const pickup = ['ready', 'completed', 'done', 'delivered'].includes(status);
  const delivered = ['completed', 'done', 'delivered'].includes(status);
  return { placed, preparing, ready, pickup, delivered };
}

function isMissingTableError(error: any) {
  const message = String(error?.message || '').toLowerCase();
  const code = String(error?.code || '').toLowerCase();
  return code === 'pgrst205' || code === '42p01' || message.includes('schema cache') || message.includes('could not find the table');
}

async function readCustomerProfile(userId: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('id,name,email,phone,avatar_url')
    .eq('id', userId)
    .maybeSingle();

  if (error && !isMissingTableError(error)) console.error('Customer profile read error:', error);
  return error ? null : data;
}

async function saveCustomerProfile(row: CustomerProfile & { created_at?: string }) {
  const { error } = await supabase.from('customers').upsert(row, { onConflict: 'id' });
  if (error && !isMissingTableError(error)) console.error('Customer profile save error:', error);
  return !error;
}

function resolveMenuMediaUrl(value?: string | null) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return raw;
  if (raw.startsWith(`${MENU_BUCKET}/`)) return storageUrl(MENU_BUCKET, raw.replace(`${MENU_BUCKET}/`, ''));
  if (raw.startsWith('menu-images/')) return storageUrl(MENU_BUCKET, raw.replace(/^menu-images\//, ''));
  return storageUrl(MENU_BUCKET, raw);
}

function isVideoUrl(value?: string | null) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(String(value || '').trim());
}

function cleanText(value?: string | null, fallback = '') {
  const text = String(value || '').trim();
  return text || fallback;
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
  if (text.includes('drink') || text.includes('juice')) return storageUrl(MENU_BUCKET, 'drinks/1.jpg');
  if (text.includes('breakfast') || text.includes('pancake')) return storageUrl(MENU_BUCKET, 'breakfast/1.jpg');
  if (text.includes('chicken')) return storageUrl(MENU_BUCKET, 'chicken/1.jpg');
  return storageUrl(MENU_BUCKET, 'universal/1.jpg');
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
  const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 2].replace(/\d+/g, '').trim() || 'Local';
  return address;
}

function normalizeSearchText(value?: string | null) {
  return String(value || '')
    .toLowerCase()
    .replace(/[.,#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesNearby(post: FeedPost, profile?: CustomerProfile | null) {
  const profileText = normalizeSearchText(`${profile?.phone || ''} ${profile?.email || ''}`);
  const locationText = normalizeSearchText(`${post.city} ${post.state} ${post.address}`);
  if (!locationText || locationText === 'community') return false;
  if (!profileText) return post.city !== 'Community';
  return locationText.includes(profileText) || post.city !== 'Community';
}

function AutoMedia({ post }: { post: FeedPost }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [post.mediaUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || post.mediaType !== 'video' || failed) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const play = () => {
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => null);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play();
        else video.pause();
      },
      { threshold: 0.35 }
    );

    observer.observe(video);
    const timer = window.setTimeout(play, 150);

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [failed, post.mediaType, post.mediaUrl]);

  if (!post.mediaUrl || failed) {
    return <img src={post.posterUrl || fallbackImage(post.category, post.caption)} alt={post.caption} className="postMedia" loading="lazy" decoding="async" />;
  }

  if (post.mediaType === 'video') {
    return (
      <video
        ref={videoRef}
        src={post.mediaUrl}
        poster={post.posterUrl || undefined}
        className="postMedia"
        muted
        loop
        playsInline
        preload="metadata"
        controls={false}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <img
      src={post.mediaUrl}
      alt={post.caption || 'Food post'}
      className="postMedia"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

function FeedCard({
  post,
  liked,
  canDelete,
  deleting,
  onLike,
  onView,
  onDelete,
}: {
  post: FeedPost;
  liked: boolean;
  canDelete: boolean;
  deleting: boolean;
  onLike: (post: FeedPost) => void;
  onView: (post: FeedPost) => void;
  onDelete: (post: FeedPost) => void;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [viewed, setViewed] = useState(false);

  useEffect(() => setViewed(false), [post.id]);

  useEffect(() => {
    const node = ref.current;
    if (!node || viewed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || viewed) return;
        if (entry.intersectionRatio < 0.55) return;
        setViewed(true);
        onView(post);
      },
      { threshold: [0.55] }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onView, post, viewed]);

  const content = (
    <>
      <div className="mediaShell">
        <AutoMedia post={post} />
        {post.mediaType === 'video' ? <div className="playBadge">▶</div> : null}
        <div className="timeChip">{timeAgo(post.createdAt)}</div>
      </div>

      <div className="postBody">
        <strong>{post.caption || post.name || 'Food post'}</strong>
        <p>{post.subText}</p>
      </div>

      <div className="postActions">
        <button
          type="button"
          className={liked ? 'liked' : ''}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onLike(post);
          }}
        >
          {liked ? '♥' : '♡'} {compactNumber(post.likes)}
        </button>
        <button type="button">◌ {compactNumber(post.commentsCount)}</button>
        <button type="button">👁 {compactNumber(post.views)}</button>
        <span className="shareAction">↗</span>
        {canDelete ? (
          <button
            type="button"
            className="deletePostTextButton"
            disabled={deleting}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onDelete(post);
            }}
          >
            {deleting ? 'Deleting...' : 'Delete Post'}
          </button>
        ) : null}
      </div>
    </>
  );

  if (post.restaurantSlug) {
    return (
      <Link ref={ref as any} href={`/store/${post.restaurantSlug}`} className="postCard linkedPost">
        {content}
      </Link>
    );
  }

  return (
    <article ref={ref} className="postCard">
      {content}
    </article>
  );
}

export default function CustomerPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const avatarFileRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [customerPosts, setCustomerPosts] = useState<CustomerPostRow[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
  const [restaurantMedia, setRestaurantMedia] = useState<RestaurantMediaRow[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemRow[]>([]);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [postMessage, setPostMessage] = useState('');
  const [activeFeed, setActiveFeed] = useState('Your Posts');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [deletingPostId, setDeletingPostId] = useState('');

  const displayName = useMemo(() => cleanName(profile?.name || profile?.email?.split('@')[0]), [profile]);
  const activeOrder = orders.find((order) => ['new', 'accepted', 'in_progress', 'preparing', 'ready'].includes(String(order.status || '').toLowerCase())) || orders[0] || null;
  const activeOrderSteps = orderStepStatus(activeOrder);

  const loadCustomer = useCallback(async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setAuthed(false);
      setProfile(null);
      setOrders([]);
      setFavorites([]);
      setCustomerPosts([]);
      setRestaurants([]);
      setRestaurantMedia([]);
      setMenuItems([]);
      setLoading(false);
      return;
    }

    setAuthed(true);
    const email = user.email || null;
    const metadataName = user.user_metadata?.username || user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.customer_name || null;

    const customerRow = await readCustomerProfile(user.id);

    const nextProfile: CustomerProfile = {
      id: user.id,
      name: cleanName(customerRow?.name || metadataName),
      email: customerRow?.email || email,
      phone: customerRow?.phone || user.user_metadata?.phone || null,
      avatar_url: customerRow?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    };

    setProfile(nextProfile);

    await saveCustomerProfile({
      id: user.id,
      name: nextProfile.name,
      email: nextProfile.email,
      phone: nextProfile.phone,
      avatar_url: nextProfile.avatar_url,
      created_at: new Date().toISOString(),
    });

    const [
      { data: orderRows },
      { data: favoriteRows },
      { data: postRows },
      { data: storeRows },
      { data: mediaRows },
      { data: itemRows },
    ] = await Promise.all([
      supabase
        .from('orders')
        .select('id,restaurant_id,customer_id,customer_email,customer_phone,status,total,created_at,restaurants(name,slug,logo_image,hero_image)')
        .or(`customer_id.eq.${user.id},customer_email.eq.${email || '__none__'}`)
        .order('created_at', { ascending: false })
        .limit(8),
      supabase
        .from('customer_favorites')
        .select('id,restaurant_id,restaurants(id,name,slug,logo_image,hero_image,category,city,state,address)')
        .eq('customer_id', user.id)
        .limit(24),
      supabase
        .from('customer_posts')
        .select('id,customer_id,customer_name,caption,media_url,media_type,likes,likes_count,comments_count,views,created_at')
        .order('created_at', { ascending: false })
        .limit(80),
      supabase
        .from('restaurants')
        .select('*')
        .or('public_visible.is.null,public_visible.eq.true')
        .not('slug', 'is', null)
        .limit(250),
      supabase
        .from('restaurant_media')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(250),
      supabase
        .from('menu_items')
        .select('*')
        .order('sort_order', { ascending: true })
        .limit(250),
    ]);

    setOrders((orderRows || []) as OrderRow[]);
    setFavorites((favoriteRows || []) as FavoriteRow[]);
    setCustomerPosts((postRows || []) as CustomerPostRow[]);
    setRestaurants((storeRows || []) as RestaurantRow[]);
    setRestaurantMedia((mediaRows || []) as RestaurantMediaRow[]);
    setMenuItems((itemRows || []) as MenuItemRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadCustomer();

    const auth = supabase.auth.onAuthStateChange(() => void loadCustomer());

    const channel = supabase
      .channel('customer-dashboard-live-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_posts' }, () => void loadCustomer())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_media' }, () => void loadCustomer())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => void loadCustomer())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants' }, () => void loadCustomer())
      .subscribe();

    return () => {
      auth.data.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [loadCustomer]);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem('orda_customer_liked_posts') || '[]') as string[];
      setLikedIds(new Set(saved));
    } catch {
      setLikedIds(new Set());
    }
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  function saveLiked(next: Set<string>) {
    setLikedIds(new Set(next));
    try {
      window.localStorage.setItem('orda_customer_liked_posts', JSON.stringify(Array.from(next)));
    } catch {}
  }



  const updateLocalFeedCount = useCallback((post: FeedPost, field: 'likes' | 'views', nextValue: number) => {
    if (post.sourceTable === 'customer_posts') {
      setCustomerPosts((current) =>
        current.map((row) =>
          row.id === post.rawId
            ? {
                ...row,
                [field]: nextValue,
                likes_count: field === 'likes' ? nextValue : row.likes_count,
              }
            : row
        )
      );
    }

    if (post.sourceTable === 'restaurant_media') {
      setRestaurantMedia((current) => current.map((row) => (row.id === post.rawId ? { ...row, [field]: nextValue } : row)));
    }

    if (post.sourceTable === 'menu_items') {
      setMenuItems((current) => current.map((row) => (row.id === post.rawId ? { ...row, [field]: nextValue } : row)));
    }

    if (post.sourceTable === 'restaurants') {
      setRestaurants((current) => current.map((row) => (row.id === post.rawId ? { ...row, [field]: nextValue } : row)));
    }
  }, []);

  const incrementFeedCount = useCallback(
    async (post: FeedPost, field: 'likes' | 'views') => {
      const nextValue = Number(post[field] || 0) + 1;
      updateLocalFeedCount(post, field, nextValue);

      const payload =
        post.sourceTable === 'customer_posts' && field === 'likes'
          ? { likes: nextValue, likes_count: nextValue }
          : { [field]: nextValue };

      const { error } = await supabase.from(post.sourceTable).update(payload).eq('id', post.rawId);
      if (error) console.error(`Failed to update ${field} on ${post.sourceTable}:`, error);
    },
    [updateLocalFeedCount]
  );

  const handleLike = useCallback(
    (post: FeedPost) => {
      const key = `${post.sourceTable}:${post.rawId}`;
      if (likedIds.has(key)) return;

      const next = new Set(likedIds);
      next.add(key);
      saveLiked(next);
      void incrementFeedCount(post, 'likes');
    },
    [incrementFeedCount, likedIds]
  );

  const handleView = useCallback(
    (post: FeedPost) => {
      const key = `viewed:${post.sourceTable}:${post.rawId}`;
      try {
        if (window.sessionStorage.getItem(key)) return;
        window.sessionStorage.setItem(key, 'yes');
      } catch {}
      void incrementFeedCount(post, 'views');
    },
    [incrementFeedCount]
  );

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    if (!file || !profile?.id) return;

    if (!file.type.startsWith('image/')) {
      setPostMessage('Profile photo must be an image.');
      setUploadState('error');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setPostMessage('Profile photo must be under 8MB.');
      setUploadState('error');
      return;
    }

    setAvatarUploading(true);
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `avatars/${profile.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(POST_BUCKET).upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (uploadError) {
      setAvatarUploading(false);
      setPostMessage(uploadError.message || 'Profile photo upload failed.');
      setUploadState('error');
      return;
    }

    const { error: metadataError } = await supabase.auth.updateUser({
      data: { avatar_url: filePath },
    });

    if (metadataError) console.error('Auth avatar metadata save error:', metadataError);

    const { error: updateError } = await supabase.from('customers').update({ avatar_url: filePath }).eq('id', profile.id);

    if (updateError && !isMissingTableError(updateError)) {
      setAvatarUploading(false);
      setPostMessage(updateError.message || 'Profile photo save failed.');
      setUploadState('error');
      return;
    }

    setProfile((current) => (current ? { ...current, avatar_url: filePath } : current));
    setAvatarUploading(false);
    if (avatarFileRef.current) avatarFileRef.current.value = '';
  }

  async function deleteCustomerPost(post: FeedPost) {
    if (!profile?.id || post.sourceTable !== 'customer_posts') return;

    const confirmed = window.confirm('Delete this post permanently from ORDA Direct?');
    if (!confirmed) return;

    const mediaPath = customerPosts.find((row) => row.id === post.rawId)?.media_url || '';

    setDeletingPostId(post.rawId);
    setPostMessage('');

    const { error } = await supabase
      .from('customer_posts')
      .delete()
      .eq('id', post.rawId);

    if (error) {
      setDeletingPostId('');
      setUploadState('error');
      setPostMessage('Delete is blocked by Supabase policy. Run the customer_posts delete policy SQL, then try again.');
      console.error('Customer post delete error:', error);
      return;
    }

    if (mediaPath && !/^https?:\/\//i.test(mediaPath)) {
      const cleanPath = mediaPath.replace(`${POST_BUCKET}/`, '').replace(/^\/+/, '');
      await supabase.storage.from(POST_BUCKET).remove([cleanPath]);
    }

    setCustomerPosts((current) => current.filter((row) => row.id !== post.rawId));
    setDeletingPostId('');
    setUploadState('success');
    setPostMessage('Post deleted from Customer Dashboard and Discovery.');
    await loadCustomer();
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/customer/login');
    router.refresh();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setPostMessage('');
    setUploadState('idle');

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setUploadState('error');
      setPostMessage('Only food photos and videos are allowed.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 60 * 1024 * 1024) {
      setUploadState('error');
      setPostMessage('Upload a photo or video under 60MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  }

  async function submitPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile?.id) {
      setUploadState('error');
      setPostMessage('Log in to post.');
      return;
    }

    const cleanCaption = caption.trim();

    if (!cleanCaption && !selectedFile) {
      setUploadState('error');
      setPostMessage('Add a caption or upload food media.');
      return;
    }

    if (hasViolation(cleanCaption)) {
      setUploadState('error');
      setPostMessage('Post blocked: no prices, selling, contact info, DMs, phone numbers, emails, or addresses.');
      return;
    }

    setUploadState('uploading');
    setPostMessage('');

    let mediaUrl = '';
    let mediaType = '';

    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop() || (selectedFile.type.startsWith('video/') ? 'mp4' : 'jpg');
      const folder = selectedFile.type.startsWith('video/') ? 'videos' : 'images';
      const filePath = `${folder}/${profile.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from(POST_BUCKET).upload(filePath, selectedFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        setUploadState('error');
        setPostMessage(uploadError.message || 'Upload failed.');
        return;
      }

      mediaUrl = filePath;
      mediaType = selectedFile.type.startsWith('video/') ? 'video' : 'image';
    }

    const { data, error } = await supabase
      .from('customer_posts')
      .insert({
        customer_id: profile.id,
        customer_name: displayName,
        caption: cleanCaption,
        media_url: mediaUrl || null,
        media_type: mediaType || null,
        likes: 0,
        likes_count: 0,
        comments_count: 0,
        views: 0,
        created_at: new Date().toISOString(),
      })
      .select('id,customer_id,customer_name,caption,media_url,media_type,likes,likes_count,comments_count,views,created_at')
      .single();

    if (error) {
      setUploadState('error');
      setPostMessage(error.message || 'Could not post.');
      return;
    }

    setCustomerPosts((current) => [data as CustomerPostRow, ...current]);
    setCaption('');
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = '';
    setUploadState('success');
    setPostMessage('Posted to the ORDA Direct community.');
  }

  const liveFeed = useMemo<FeedPost[]>(() => {
    const storeById = new Map<string, RestaurantRow>();
    restaurants.forEach((restaurant) => storeById.set(restaurant.id, restaurant));

    const posts: FeedPost[] = [];

    customerPosts.forEach((post) => {
      const mediaUrl = resolvePostMediaUrl(post.media_url);
      if (!mediaUrl && !post.caption) return;

      const captionText = cleanText(post.caption, 'Food post');
      const category = categoryFromText(captionText);
      const isVideo = String(post.media_type || '').toLowerCase().includes('video') || isVideoUrl(mediaUrl);

      posts.push({
        id: `customer_${post.id}`,
        rawId: post.id,
        sourceTable: 'customer_posts',
        source: 'customer',
        customerId: post.customer_id,
        name: cleanName(post.customer_name),
        avatar: '',
        caption: captionText,
        subText: post.customer_id === profile?.id ? 'Your ORDA community post' : 'ORDA community post',
        mediaUrl,
        posterUrl: fallbackImage(category, captionText),
        mediaType: isVideo ? 'video' : 'image',
        category,
        city: 'Community',
        state: '',
        address: 'ORDA Community',
        likes: Number(post.likes ?? post.likes_count ?? 0),
        views: Number(post.views || 0),
        commentsCount: Number(post.comments_count || 0),
        createdAt: post.created_at || new Date().toISOString(),
        featured: true,
      });
    });

    restaurantMedia.forEach((media) => {
      if (!media.restaurant_id || !media.media_url) return;
      const restaurant = storeById.get(media.restaurant_id);
      if (!restaurant?.slug) return;

      const mediaUrl = resolveMenuMediaUrl(media.media_url);
      const category = cleanText(restaurant.category, categoryFromText(`${restaurant.name} ${media.caption}`));
      const captionText = cleanText(media.caption, cleanText(restaurant.name, 'ORDA Store'));
      const isVideo = media.media_type === 'video' || isVideoUrl(mediaUrl);

      posts.push({
        id: `media_${media.id}`,
        rawId: media.id,
        sourceTable: 'restaurant_media',
        source: 'owner',
        restaurantId: restaurant.id,
        restaurantSlug: restaurant.slug,
        name: cleanText(restaurant.name, 'ORDA Store'),
        avatar: resolveMenuMediaUrl(restaurant.logo_image),
        caption: captionText,
        subText: `${cleanText(restaurant.category, 'Local food')} • ${cleanText(restaurant.address, getDisplayCity(restaurant))}`,
        mediaUrl,
        posterUrl: resolveMenuMediaUrl(restaurant.hero_image) || resolveMenuMediaUrl(restaurant.cover_image) || fallbackImage(category, restaurant.name),
        mediaType: isVideo ? 'video' : 'image',
        category,
        city: getDisplayCity(restaurant),
        state: cleanText(restaurant.state),
        address: cleanText(restaurant.address),
        likes: Number(media.likes || 0),
        views: Number(media.views || restaurant.views || 0),
        commentsCount: 0,
        createdAt: media.created_at || new Date().toISOString(),
        featured: Boolean(restaurant.featured),
      });
    });

    menuItems.filter(isLiveMenuItem).forEach((item) => {
      if (!item.restaurant_id) return;
      const restaurant = storeById.get(item.restaurant_id);
      if (!restaurant?.slug) return;

      const rawVideo = item.video_file || item.item_video || item.menu_video || item.video_url || '';
      const rawImage = item.image_file || item.item_image || item.image_url || '';
      const videoUrl = resolveMenuMediaUrl(rawVideo);
      const imageUrl = resolveMenuMediaUrl(rawImage);
      const hasVideo = isVideoUrl(videoUrl);
      const category = cleanText(restaurant.category, categoryFromText(`${item.name} ${item.description}`));
      const poster = imageUrl || resolveMenuMediaUrl(restaurant.hero_image) || resolveMenuMediaUrl(restaurant.cover_image) || fallbackImage(category, item.name);

      if (!hasVideo && !imageUrl) return;

      posts.push({
        id: `item_${item.id}`,
        rawId: item.id,
        sourceTable: 'menu_items',
        source: 'owner',
        restaurantId: restaurant.id,
        restaurantSlug: restaurant.slug,
        name: cleanText(restaurant.name, 'ORDA Store'),
        avatar: resolveMenuMediaUrl(restaurant.logo_image),
        caption: cleanText(item.name, cleanText(restaurant.name, 'ORDA Store')),
        subText: cleanText(item.description, `${cleanText(restaurant.category, 'Menu item')} • ${cleanText(restaurant.address, getDisplayCity(restaurant))}`),
        mediaUrl: hasVideo ? videoUrl : imageUrl,
        posterUrl: poster,
        mediaType: hasVideo ? 'video' : 'image',
        category,
        city: getDisplayCity(restaurant),
        state: cleanText(restaurant.state),
        address: cleanText(restaurant.address),
        likes: Number(item.likes || 0),
        views: Number(item.views || restaurant.views || 0),
        commentsCount: 0,
        createdAt: new Date().toISOString(),
        featured: Boolean(restaurant.featured),
      });
    });

    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [customerPosts, menuItems, profile?.id, restaurantMedia, restaurants]);

  const favoriteRestaurantIds = useMemo(() => new Set(favorites.map((favorite) => favorite.restaurant_id).filter(Boolean) as string[]), [favorites]);

  const filteredFeed = useMemo(() => {
    if (activeFeed === 'Following') {
      const following = liveFeed.filter((post) => {
        if (post.source === 'customer') return post.customerId === profile?.id;
        return Boolean(post.restaurantId && favoriteRestaurantIds.has(post.restaurantId));
      });
      return following.length ? following : liveFeed.filter((post) => post.customerId === profile?.id);
    }

    if (activeFeed === 'Popular') {
      return [...liveFeed].sort((a, b) => b.likes + b.views - (a.likes + a.views));
    }

    if (activeFeed === 'Nearby') {
      const nearby = liveFeed.filter((post) => matchesNearby(post, profile));
      return nearby.length ? nearby : liveFeed.filter((post) => post.source === 'owner');
    }

    if (activeFeed === 'Your Posts') {
      return liveFeed.filter((post) => post.source === 'customer' && post.customerId === profile?.id);
    }

    return liveFeed;
  }, [activeFeed, favoriteRestaurantIds, liveFeed, profile]);

  const trendingPosts = useMemo(() => [...liveFeed].sort((a, b) => b.likes + b.views - (a.likes + a.views)).slice(0, 3), [liveFeed]);
  const myPostCount = customerPosts.filter((post) => post.customer_id === profile?.id).length;

  if (loading) {
    return (
      <main className="loadingPage">
        <section className="loadingCard">
          <span>ORDA DIRECT</span>
          <h1>Loading your food world...</h1>
        </section>
        <style jsx>{`
          .loadingPage{min-height:100vh;background:#050507;color:#fff;display:grid;place-items:center;padding:18px}
          .loadingCard{width:min(520px,100%);border:1px solid rgba(255,45,149,.25);background:rgba(10,10,12,.82);border-radius:30px;padding:34px;text-align:center;box-shadow:0 0 50px rgba(255,45,149,.16)}
          span{color:#ff58c9;font-weight:1000;letter-spacing:.2em;font-size:12px}
          h1{font-size:30px}
        `}</style>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="guestPage">
        <section className="guestCard">
          <Link href="/" className="guestBrand">ORDA DIRECT</Link>
          <div className="guestCopy">
            <span>FREE CUSTOMER ACCOUNT</span>
            <h1>Log in to your customer account.</h1>
            <p>Save orders, reorder faster, post food reviews, upload homemade food content, keep your favorite stores, and track rewards.</p>
          </div>
          <div className="guestActions">
            <Link href="/customer/login" className="primaryBtn">Customer Login</Link>
            <Link href="/customer/signup" className="secondaryBtn">Create Free Account</Link>
            <Link href="/discover" className="textBtn">Browse Food</Link>
          </div>
        </section>
        <style jsx>{`
          .guestPage{min-height:100vh;background:radial-gradient(circle at 20% 20%,rgba(255,45,149,.22),transparent 30%),radial-gradient(circle at 80% 90%,rgba(255,122,0,.14),transparent 30%),#050507;color:#fff;display:grid;place-items:center;padding:18px}
          .guestCard{width:min(720px,100%);border:1px solid rgba(255,45,149,.18);background:rgba(10,10,12,.86);border-radius:34px;padding:34px;box-shadow:0 30px 100px rgba(0,0,0,.52),0 0 38px rgba(255,45,149,.16)}
          .guestBrand{color:#ff58c9;text-decoration:none;font-size:34px;font-weight:1000}.guestCopy{margin:46px 0 28px}.guestCopy span{display:inline-flex;padding:9px 14px;border-radius:999px;background:rgba(255,45,149,.16);color:#ff74d0;font-size:12px;font-weight:1000;letter-spacing:.1em}h1{margin:18px 0 14px;font-size:54px;line-height:.95;letter-spacing:-3px}p{max-width:560px;color:rgba(255,255,255,.72);line-height:1.7;font-size:16px}.guestActions{display:grid;gap:12px}.primaryBtn,.secondaryBtn,.textBtn{min-height:58px;border-radius:999px;display:flex;align-items:center;justify-content:center;text-decoration:none;font-weight:1000}.primaryBtn{color:#fff;background:linear-gradient(135deg,#ff2d95,#e93dba);box-shadow:0 0 28px rgba(255,45,149,.45)}.secondaryBtn{color:#fff;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06)}.textBtn{color:rgba(255,255,255,.7)}@media(max-width:560px){.guestCard{padding:24px;border-radius:28px}h1{font-size:40px}}
        `}</style>
      </main>
    );
  }

  return (
    <main className="customerPage">
      <aside className="sidebar">
        <Link href="/discover" className="sideBrand"><b>ORDA</b><span>DIRECT</span></Link>
        <div className="profileBadge">
          <button type="button" className="profilePhotoButton" onClick={() => avatarFileRef.current?.click()} aria-label="Upload profile photo">
            {profile?.avatar_url ? <img src={resolveAvatarUrl(profile.avatar_url)} alt={displayName} /> : <span>{initials(displayName)}</span>}
            <b>{avatarUploading ? '...' : '＋'}</b>
          </button>
          <input ref={avatarFileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          <div><strong>Hi, {displayName}</strong><small>Welcome back!</small></div>
        </div>
        <div className="levelCard"><div><span>Live Account</span><b>{orders.length} orders · {myPostCount} posts</b></div><i /></div>
        <nav className="sideNav">
          <a href="#home" className="active">⌂ Home</a>
          <a href="#order-again">▤ Orders</a>
          <a href="#customer-orders">▣ Customer Orders</a>
          <a href="#favorites">♡ Favorites</a>
          <a href="#rewards">✦ Rewards</a>
          <a href="#community">◉ Community</a>
          <a href="#my-posts">✎ My Posts</a>
        </nav>
        <Link href="/auth/signup" className="sellerCard"><span>▣</span><strong>Become a Seller</strong><small>Start selling your food on ORDA</small><b>→</b></Link>
      </aside>

      <section className="mainArea" id="home">
        <header className="topBar">
          <div className="searchBox"><span>⌕</span><input placeholder="Search food, people, restaurants..." aria-label="Search" /></div>
          <div className="topActions">
            <button type="button" className="iconBtn">🔔<i>{activeOrder ? 1 : 0}</i></button>
            <button type="button" className="uploadBtn" onClick={() => fileRef.current?.click()}>＋ Upload</button>
            <Link href="/auth/signup" className="becomeBtn">▣ Become Seller</Link>
            <button type="button" className="profileMini" onClick={signOut}>{profile?.avatar_url ? <img src={resolveAvatarUrl(profile.avatar_url)} alt={displayName} /> : <span>{initials(displayName)}</span>}<b>Sign out</b></button>
          </div>
        </header>

        <section className="hero">
          <div className="heroCopy">
            <span>Good Food. Real People.</span>
            <h1>Real Reviews.</h1>
            <p>Share your food. Inspire others. Order. Upload. Connect.</p>
            <div className="heroButtons">
              <Link href="/discover">▣ Order Food</Link>
              <button type="button" onClick={() => fileRef.current?.click()}>▣ Upload Post</button>
              <Link href="/auth/signup">▣ Become Seller</Link>
            </div>
          </div>
        </section>

        <section className="mobileStats">
          <div><strong>{orders.length}</strong><span>Orders</span></div>
          <div><strong>{favorites.length}</strong><span>Favorites</span></div>
          <div><strong>{customerPosts.length}</strong><span>Posts</span></div>
          <div><strong>Live</strong><span>Alerts</span></div>
        </section>

        <section className="contentGrid">
          <section className="feedColumn" id="community">
            <form className="composer" onSubmit={submitPost}>
              <div className="composerTop"><div className="profileAvatar small">{initials(displayName)}</div><div><strong>Create a food post</strong><span>No prices. No personal info. No direct contact.</span></div></div>
              <textarea value={caption} onChange={(event) => { setCaption(event.target.value); setPostMessage(''); setUploadState('idle'); }} placeholder="Share a review, homemade food, or food video..." rows={3} />
              {previewUrl ? <div className="previewBox">{selectedFile?.type.startsWith('video/') ? <video src={previewUrl} muted controls playsInline /> : <img src={previewUrl} alt="Post preview" />}<button type="button" onClick={() => { setSelectedFile(null); if (fileRef.current) fileRef.current.value = ''; }}>Remove</button></div> : null}
              {postMessage ? <div className={`postMessage ${uploadState === 'error' ? 'error' : 'success'}`}>{postMessage}</div> : null}
              <div className="composerActions"><input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={handleFileChange} /><button type="button" className="mediaBtn" onClick={() => fileRef.current?.click()}>▣ Photo / Video</button><button type="submit" className="postBtn" disabled={uploadState === 'uploading'}>{uploadState === 'uploading' ? 'Posting...' : 'Post'}</button></div>
            </form>

            <div className="feedTabs">
              {['Your Posts', 'For You', 'Following', 'Popular', 'Nearby'].map((tab) => <button key={tab} type="button" className={activeFeed === tab ? 'active' : ''} onClick={() => setActiveFeed(tab)}>{tab}</button>)}
              <button type="button" className="filterBtn">⚙</button>
            </div>

            <section className="postGrid" id="my-posts">
              {filteredFeed.length ? filteredFeed.map((post) => (
                <FeedCard
                  key={post.id}
                  post={post}
                  liked={likedIds.has(`${post.sourceTable}:${post.rawId}`)}
                  canDelete={post.sourceTable === 'customer_posts' && (post.customerId === profile?.id || activeFeed === 'Your Posts')}
                  deleting={deletingPostId === post.rawId}
                  onLike={handleLike}
                  onView={handleView}
                  onDelete={deleteCustomerPost}
                />
              )) : (
                <div className="emptyFeed">
                  <strong>No live posts yet.</strong>
                  <span>Posts from Discovery, restaurants, and customers will show here when they are uploaded.</span>
                  <Link href="/discover">Open Discovery</Link>
                </div>
              )}
            </section>
          </section>

          <aside className="rightRail">
            <article className="railCard customerOrdersCard" id="customer-orders">
              <div className="railHead"><h3>Customer Orders</h3><Link href="#order-again">View all</Link></div>
              {activeOrder ? (
                <>
                  <div className="activeOrder">
                    <div className="foodThumb" style={{ backgroundImage: `url(${activeOrder.restaurants?.hero_image || fallbackImage('food', activeOrder.restaurants?.name)})` }} />
                    <div>
                      <strong>{activeOrder.restaurants?.name || 'ORDA Store'}</strong>
                      <span>{statusText(activeOrder.status)} · {activeOrder.total ? money.format(Number(activeOrder.total)) : 'Order placed'}</span>
                      <i><b /></i>
                      <small>{String(activeOrder.status || '').toLowerCase() === 'ready' ? 'Ready for pickup / delivery' : 'Tracking your order live'}</small>
                    </div>
                  </div>
                  <Link href="#track-order" className="trackOrderButton">Track Order</Link>
                </>
              ) : <div className="emptyRail"><strong>No active orders</strong><span>Your live order tracking will show here.</span></div>}
            </article>

            <article className="railCard orderTracker" id="track-order">
              <div className="railHead"><h3>Track Your Order</h3><span>{activeOrder ? `Order #${activeOrder.id.slice(0, 6)}` : 'No order'}</span></div>
              <div className="timeline">
                <div className={activeOrderSteps.placed ? 'done' : ''}><b>✓</b><strong>Order Placed</strong><span>Your order has been placed successfully.</span></div>
                <div className={activeOrderSteps.preparing ? 'done' : ''}><b>🍳</b><strong>Being Prepared</strong><span>The restaurant is preparing your order.</span></div>
                <div className={activeOrderSteps.ready ? 'done' : ''}><b>🏠</b><strong>Order Ready</strong><span>Your order is ready and waiting.</span></div>
                <div className={activeOrderSteps.pickup ? 'done' : ''}><b>🚗</b><strong>Ready for Pickup / Delivery</strong><span>Pickup or delivery is ready to go.</span></div>
                <div className={activeOrderSteps.delivered ? 'done' : ''}><b>✓</b><strong>Delivered / Completed</strong><span>Enjoy your food.</span></div>
              </div>
            </article>

            <article className="railCard" id="rewards"><h3>Rewards Balance</h3><div className="rewardBig"><strong>{compactNumber(orders.length * 125)} <span>pts</span></strong><p>Rewards update from your real orders.</p></div></article>

            <article className="railCard" id="favorites">
              <div className="railHead"><h3>Your Favorite Stores</h3><Link href="/discover">View all</Link></div>
              {favorites.length ? (
                <div className="favoriteCircles">
                  {favorites.slice(0, 4).map((favorite) => <Link href={favorite.restaurants?.slug ? `/store/${favorite.restaurants.slug}` : '/discover'} key={favorite.id}><span>{initials(favorite.restaurants?.name)}</span><small>{favorite.restaurants?.name || 'Store'}</small></Link>)}
                </div>
              ) : (
                <div className="emptyRail"><strong>No favorite stores yet.</strong><span>Favorite stores will appear here.</span><Link href="/discover" className="miniLink">Browse Stores</Link></div>
              )}
            </article>

            <article className="railCard trending">
              <div className="railHead"><h3>Trending This Week 🔥</h3><Link href="#community">View all</Link></div>
              {trendingPosts.length ? trendingPosts.map((post) => <div className="trendItem" key={`trend-${post.id}`}>{post.mediaUrl ? <img src={post.mediaType === 'video' ? post.posterUrl : post.mediaUrl} alt="" /> : <span>{initials(post.name)}</span>}<div><strong>{post.caption || post.name}</strong><small>{compactNumber(post.likes + post.views)} activity</small></div></div>) : <div className="emptyRail"><strong>No trending posts yet.</strong><span>Trending updates as likes and views grow.</span></div>}
            </article>
          </aside>
        </section>

        <section className="classicGrid">
          <article className="panel large" id="order-again">
            <div className="panelHead"><div><span>FAST REORDER</span><h2>Order Again</h2></div><Link href="/discover">Find food</Link></div>
            {orders.length ? <div className="list">{orders.slice(0, 4).map((order) => {
              const slug = order.restaurants?.slug;
              return <div className="orderCard" key={order.id}><div><strong>{order.restaurants?.name || 'ORDA Store'}</strong><span>{statusText(order.status)} · {order.total ? money.format(Number(order.total)) : 'Saved order'}</span></div>{slug ? <Link href={`/store/${slug}`}>Order Again</Link> : <Link href="/discover">Order Again</Link>}</div>;
            })}</div> : <div className="emptyState"><strong>No saved orders yet.</strong><span>After your first ORDA order, it will appear here for fast reorder.</span><Link href="/discover">Browse Food</Link></div>}
          </article>

          <article className="panel"><div className="panelHead"><div><span>ACCOUNT</span><h2>Profile</h2></div></div><div className="profileRows"><div><span>Name</span><strong>{displayName}</strong></div><div><span>Email</span><strong>{profile?.email || 'Not added'}</strong></div><div><span>Phone</span><strong>{profile?.phone || 'Not added'}</strong></div></div></article>
        </section>

        <section className="guidelines"><strong>COMMUNITY GUIDELINES</strong><span>⊘ No prices allowed</span><span>⊘ No personal information</span><span>⊘ No direct contacting</span><span>⊘ No explicit content</span><span>♡ Be kind. Be respectful.</span></section>
      </section>

      <nav className="bottomNav"><a href="#home">⌂<span>Home</span></a><a href="/discover">⌕<span>Search</span></a><button type="button" onClick={() => fileRef.current?.click()}>＋</button><a href="#community">🔔<span>Alerts</span></a><button type="button" onClick={signOut}>♙<span>Profile</span></button></nav>

      <style jsx global>{`
        html,body,body>div{margin:0!important;padding:0!important;background:#050507!important;color:#fff;min-height:100%;overflow-x:hidden;scroll-behavior:smooth}*{box-sizing:border-box}input,textarea,button{font:inherit}a{color:inherit}

/* ORDA FINAL ACTION SECTION RED FIX */
:global(.postActions),
:global(.postActions *),
:global(.postActions button),
:global(.postActions button *),
:global(.postActions span),
:global(.postActions svg),
:global(.postActions path),
:global(.likeAction),
:global(.likeAction *),
:global(.heartSymbol),
:global(.heartNumber),
:global(.viewAction),
:global(.shareAction){
  color:#ff174f !important;
  fill:#ff174f !important;
  stroke:#ff174f !important;
  opacity:1 !important;
  visibility:visible !important;
  text-shadow:0 0 12px rgba(255,23,79,.45) !important;
}

:global(.postActions){
  display:flex !important;
  align-items:center !important;
  justify-content:flex-start !important;
  gap:14px !important;
  flex-wrap:wrap !important;
}

:global(.postActions button){
  background:transparent !important;
  border:0 !important;
}

:global(.deletePostButton){
  display:none !important;
}

:global(.deletePostTextButton),
:global(.deletePostTextButton *),
:global(button.deletePostTextButton){
  color:#ff174f !important;
  fill:#ff174f !important;
  stroke:#ff174f !important;
  opacity:1 !important;
  visibility:visible !important;
  background:transparent !important;
  border:0 !important;
  text-shadow:0 0 14px rgba(255,23,79,.55) !important;
  font-weight:1000 !important;
}

      `}</style>
      <style jsx>{`
        .customerPage{min-height:100vh;background:radial-gradient(circle at 16% 12%,rgba(255,45,149,.18),transparent 28%),radial-gradient(circle at 82% 84%,rgba(128,0,255,.12),transparent 30%),#050507;color:#fff;display:grid;grid-template-columns:280px minmax(0,1fr);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.sidebar{position:sticky;top:0;height:100vh;border-right:1px solid rgba(255,255,255,.08);background:rgba(4,4,7,.88);backdrop-filter:blur(20px);padding:28px 18px;display:flex;flex-direction:column;gap:22px;z-index:40}.sideBrand{text-decoration:none;display:grid;line-height:.9;padding:0 6px}.sideBrand b{color:#ff2d95;font-size:34px;letter-spacing:-.05em;font-weight:1000}.sideBrand span{font-size:12px;letter-spacing:.45em;font-weight:1000}.profileBadge{display:flex;align-items:center;gap:13px;padding:8px 6px}.profilePhotoButton{position:relative;width:76px;height:76px;border-radius:999px;border:2px solid #ff2d95;background:linear-gradient(135deg,#ff2d95,#7c2dff);display:grid;place-items:center;overflow:hidden;cursor:pointer;box-shadow:0 0 28px rgba(255,45,149,.45);padding:0;color:#fff;font-size:28px;font-weight:1000}.profilePhotoButton img{width:100%;height:100%;object-fit:cover;display:block}.profilePhotoButton span{display:grid;place-items:center;width:100%;height:100%}.profilePhotoButton b{position:absolute;right:2px;bottom:2px;width:24px;height:24px;border-radius:999px;background:#ff2d95;color:#fff;border:2px solid #08080b;display:grid;place-items:center;font-size:14px;line-height:1}.profileAvatar{width:56px;height:56px;border-radius:999px;background:linear-gradient(135deg,#ff2d95,#7c2dff);border:2px solid rgba(255,255,255,.18);display:grid;place-items:center;color:#fff;font-weight:1000;box-shadow:0 0 28px rgba(255,45,149,.35);flex:0 0 auto}.profileAvatar.small{width:44px;height:44px}.profileAvatar.tiny{width:34px;height:34px;font-size:13px}.profileImage.tiny{width:34px;height:34px;border-radius:999px;object-fit:cover;border:2px solid rgba(255,255,255,.18)}.profileBadge strong,.composerTop strong{display:block;font-size:15px}.profileBadge small,.composerTop span{display:block;color:rgba(255,255,255,.64);font-size:12px;margin-top:4px}.levelCard{border:1px solid rgba(255,45,149,.18);background:rgba(255,255,255,.035);border-radius:16px;padding:14px}.levelCard span{display:block;color:#ff75d2;font-size:13px;font-weight:1000}.levelCard b{display:block;color:rgba(255,255,255,.72);font-size:12px;margin-top:8px}.levelCard i{display:block;margin-top:12px;height:5px;border-radius:999px;background:linear-gradient(90deg,#ff2d95 58%,rgba(255,255,255,.12) 58%)}.sideNav{display:grid;gap:8px}.sideNav a{min-height:48px;border-radius:14px;padding:0 14px;display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;font-weight:850;font-size:15px}.sideNav a.active,.sideNav a:hover{background:linear-gradient(135deg,rgba(255,45,149,.38),rgba(255,45,149,.12));box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}.sellerCard{margin-top:auto;position:relative;display:grid;gap:5px;min-height:130px;border-radius:18px;padding:18px;text-decoration:none;background:linear-gradient(135deg,rgba(255,45,149,.5),rgba(170,28,122,.45));border:1px solid rgba(255,255,255,.1);overflow:hidden;box-shadow:0 18px 60px rgba(255,45,149,.15)}.sellerCard span{color:#ff9dde}.sellerCard strong{font-size:15px}.sellerCard small{color:rgba(255,255,255,.78);line-height:1.35}.sellerCard b{position:absolute;right:14px;bottom:14px;width:34px;height:34px;border-radius:999px;background:#ff2d95;display:grid;place-items:center}.mainArea{min-width:0;padding:22px;max-width:1500px;width:100%;margin:0 auto}.topBar{position:sticky;top:0;z-index:30;min-height:74px;border:1px solid rgba(255,255,255,.08);background:rgba(6,6,10,.72);backdrop-filter:blur(20px);border-radius:22px;padding:12px 16px;display:grid;grid-template-columns:minmax(240px,520px) 1fr;gap:16px;align-items:center;margin-bottom:18px}.searchBox{height:50px;border-radius:18px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:12px;padding:0 16px}.searchBox span{color:rgba(255,255,255,.72)}.searchBox input{width:100%;height:100%;border:0;outline:0;background:transparent;color:#fff;font-size:14px}.topActions{display:flex;justify-content:flex-end;align-items:center;gap:10px;flex-wrap:wrap}.iconBtn,.uploadBtn,.becomeBtn,.profileMini{min-height:46px;border-radius:14px;border:1px solid rgba(255,255,255,.1);color:#fff;text-decoration:none;background:rgba(255,255,255,.055);display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:1000;cursor:pointer;padding:0 16px;position:relative}.iconBtn{width:46px;padding:0;border-radius:999px}.iconBtn i{position:absolute;top:-4px;right:-2px;min-width:19px;height:19px;border-radius:999px;background:#ff2d95;font-size:11px;font-style:normal;display:grid;place-items:center}.uploadBtn{background:linear-gradient(135deg,#ff2d95,#e93dba);border:0;box-shadow:0 0 24px rgba(255,45,149,.35)}.becomeBtn{border-color:rgba(255,45,149,.32)}.profileMini span,.profileMini img{width:35px;height:35px;border-radius:999px;background:linear-gradient(135deg,#ff2d95,#7c2dff);display:grid;place-items:center;object-fit:cover}.profileMini b{display:none}.hero{min-height:330px;border-radius:22px;padding:54px 60px;position:relative;overflow:hidden;background:linear-gradient(90deg,rgba(12,9,16,.9),rgba(19,6,18,.52)),url('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=90&w=1600&auto=format&fit=crop');background-size:cover;background-position:right center;border:1px solid rgba(255,255,255,.08);box-shadow:0 25px 80px rgba(0,0,0,.38);margin-bottom:18px}.hero:after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 70% 44%,rgba(255,45,149,.28),transparent 30%);pointer-events:none}.heroCopy{position:relative;z-index:2;max-width:620px}.heroCopy span{color:#ff74d0;font-size:28px;font-weight:900}.heroCopy h1{margin:8px 0 12px;font-size:clamp(44px,5vw,66px);line-height:.92;letter-spacing:-3px}.heroCopy p{margin:0;color:rgba(255,255,255,.82);font-size:18px;line-height:1.55}.heroButtons{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.heroButtons a,.heroButtons button{min-height:54px;border-radius:13px;border:1px solid rgba(255,255,255,.12);display:inline-flex;align-items:center;justify-content:center;padding:0 24px;color:#fff;text-decoration:none;font-weight:1000;cursor:pointer}.heroButtons a:first-child,.heroButtons button{background:linear-gradient(135deg,#ff2d95,#e93dba);border:0}.heroButtons a:last-child{background:rgba(0,0,0,.46);backdrop-filter:blur(12px)}.mobileStats{display:none}.contentGrid{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:18px;align-items:start}.feedColumn{min-width:0}.composer,.railCard,.panel,.guidelines{border:1px solid rgba(255,255,255,.08);background:rgba(12,12,16,.78);border-radius:22px;box-shadow:0 18px 70px rgba(0,0,0,.25);backdrop-filter:blur(18px)}.composer{padding:18px;margin-bottom:14px}.composerTop{display:flex;align-items:center;gap:12px;margin-bottom:14px}textarea{width:100%;resize:vertical;min-height:92px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.055);border-radius:16px;color:#fff;outline:none;padding:14px;font-size:15px;line-height:1.45}textarea:focus{border-color:rgba(255,45,149,.55);box-shadow:0 0 0 4px rgba(255,45,149,.1)}.previewBox{position:relative;margin-top:12px;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.4)}.previewBox img,.previewBox video{width:100%;max-height:360px;object-fit:cover;display:block}.previewBox button{position:absolute;top:12px;right:12px;min-height:36px;border:0;border-radius:999px;padding:0 14px;background:rgba(0,0,0,.7);color:#fff;font-weight:900;cursor:pointer}.composerActions{display:flex;justify-content:space-between;gap:12px;margin-top:12px}.mediaBtn,.postBtn{min-height:44px;border-radius:999px;border:1px solid rgba(255,255,255,.1);color:#fff;background:rgba(255,255,255,.06);padding:0 16px;font-weight:1000;cursor:pointer}.postBtn{background:linear-gradient(135deg,#ff2d95,#e93dba);border:0;min-width:120px}.postBtn:disabled{opacity:.65;cursor:not-allowed}.postMessage{border-radius:13px;padding:11px 12px;margin-top:12px;font-size:13px;font-weight:900;text-align:center}.postMessage.error{background:rgba(255,59,48,.14);color:#ffd8d8;border:1px solid rgba(255,59,48,.22)}.postMessage.success{background:rgba(52,199,89,.14);color:#d9ffe8;border:1px solid rgba(52,199,89,.22)}.feedTabs{min-height:68px;border:1px solid rgba(255,255,255,.08);background:rgba(12,12,16,.78);border-radius:22px 22px 0 0;display:flex;align-items:center;gap:8px;padding:0 18px;overflow-x:auto;scrollbar-width:none}.feedTabs::-webkit-scrollbar{display:none}.feedTabs button{height:42px;border:0;border-bottom:2px solid transparent;background:transparent;color:rgba(255,255,255,.68);font-weight:850;cursor:pointer;padding:0 14px;white-space:nowrap}.feedTabs button.active{color:#fff;border-bottom-color:#ff2d95}.feedTabs .filterBtn{margin-left:auto;width:42px;border-radius:12px;background:rgba(255,255,255,.07);border-bottom:0;color:#fff}.postGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding-top:12px}.postCard{min-width:0;border:1px solid rgba(255,255,255,.08);background:rgba(12,12,16,.82);border-radius:18px;overflow:hidden;color:#fff;text-decoration:none;box-shadow:0 18px 60px rgba(0,0,0,.28)}.linkedPost{display:block}.postHead{min-height:62px;display:flex;align-items:center;gap:9px;padding:10px}.postHead strong{display:block;font-size:13px}.postHead span{display:block;color:rgba(255,255,255,.58);font-size:11px;margin-top:3px}.postHead button{margin-left:auto;border:0;background:transparent;color:#fff;cursor:pointer;font-size:20px}.mediaShell{position:relative;aspect-ratio:1/1.04;background:#111;overflow:hidden;border-radius:0}.postMedia{width:100%;height:100%;object-fit:cover;display:block;transition:transform .25s ease}.postCard:hover .postMedia{transform:scale(1.04)}.playBadge{position:absolute;inset:0;margin:auto;width:66px;height:66px;border-radius:999px;background:rgba(0,0,0,.48);display:grid;place-items:center;backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.14);font-size:22px}.timeChip{position:absolute;top:10px;left:10px;border-radius:10px;background:rgba(0,0,0,.66);color:#fff;font-size:12px;font-weight:900;padding:7px 9px;backdrop-filter:blur(12px)}.deletePostButton{position:absolute;top:10px;right:10px;z-index:9;min-height:42px;border:2px solid rgba(255,255,255,.9);border-radius:999px;background:linear-gradient(135deg,#ff174f,#ff2d95);color:#fff;font-size:14px;font-weight:1000;padding:0 18px;cursor:pointer;box-shadow:0 0 24px rgba(255,45,85,.55),0 12px 30px rgba(0,0,0,.45);backdrop-filter:blur(12px);text-shadow:0 1px 8px rgba(0,0,0,.4)}.deletePostButton:disabled{opacity:.8;cursor:not-allowed}.deletePostButton:hover{transform:translateY(-1px);box-shadow:0 0 34px rgba(255,45,85,.75),0 14px 34px rgba(0,0,0,.5)}.ownerBadge{position:absolute;top:10px;left:10px;border-radius:999px;background:rgba(0,0,0,.7);color:#fff;font-size:10px;font-weight:1000;letter-spacing:.08em;padding:6px 8px;backdrop-filter:blur(12px)}.ownerBadge.customer{background:rgba(255,45,149,.82)}.postBody{padding:12px 12px 4px;background:linear-gradient(180deg,rgba(12,12,16,.98),rgba(8,8,11,.98))}.postBody strong{display:block;font-size:17px;line-height:1.2;font-weight:1000;letter-spacing:-.04em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.postBody p{margin:6px 0 0;color:rgba(255,255,255,.72);font-size:13px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.postActions{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:10px 12px 13px;background:rgba(8,8,11,.98)}.postActions button,.postActions span{border:0;background:transparent;color:#fff;cursor:pointer;font-weight:850;text-decoration:none}.postActions button:first-child{color:#ff2d95}.postActions button.liked{color:#ff2d95;text-shadow:0 0 14px rgba(255,45,149,.7)}.emptyFeed{grid-column:1/-1;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.05);border-radius:18px;padding:24px;display:grid;gap:8px}.emptyFeed strong{font-size:18px}.emptyFeed span{color:rgba(255,255,255,.65)}.emptyFeed a,.miniLink{width:fit-content;margin-top:8px;border-radius:999px;background:#ff2d95;color:#fff;text-decoration:none;padding:10px 14px;font-size:13px;font-weight:1000}.rightRail{display:grid;gap:14px}.railCard{padding:18px}.railHead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.railHead h3,.railCard h3{margin:0;font-size:16px}.railHead a{color:rgba(255,255,255,.58);text-decoration:none;font-size:13px;font-weight:800}.activeOrder{display:grid;grid-template-columns:72px 1fr;gap:12px;align-items:center}.foodThumb{width:72px;height:72px;border-radius:14px;background:center/cover}.activeOrder strong,.emptyRail strong{display:block;font-size:14px}.activeOrder span,.emptyRail span{display:block;margin-top:4px;color:rgba(255,255,255,.62);font-size:12px}.activeOrder i{display:block;height:5px;border-radius:999px;background:rgba(255,255,255,.12);margin-top:10px;overflow:hidden}.activeOrder i b{display:block;height:100%;width:72%;background:#ff2d95}.activeOrder small{display:block;margin-top:8px;color:rgba(255,255,255,.7);font-weight:850}.trackOrderButton{margin-top:14px;min-height:48px;border-radius:12px;background:linear-gradient(135deg,#ff2d95,#e93dba);color:#fff;text-decoration:none;display:flex;align-items:center;justify-content:center;font-weight:1000;box-shadow:0 0 24px rgba(255,45,149,.28)}.orderTracker .railHead span{color:#ff58c9;font-size:13px;font-weight:900}.timeline{position:relative;display:grid;gap:0;padding-left:4px}.timeline:before{content:'';position:absolute;left:18px;top:20px;bottom:22px;width:2px;background:rgba(255,255,255,.16)}.timeline div{position:relative;display:grid;grid-template-columns:38px 1fr;column-gap:10px;padding:0 0 18px}.timeline div:last-child{padding-bottom:0}.timeline b{position:relative;z-index:2;width:36px;height:36px;border-radius:999px;background:#555;color:#fff;display:grid;place-items:center;font-size:14px;border:2px solid rgba(255,255,255,.12)}.timeline .done b{background:#ff2d95;box-shadow:0 0 22px rgba(255,45,149,.42)}.timeline strong{display:block;font-size:13px;align-self:end}.timeline span{grid-column:2;color:rgba(255,255,255,.62);font-size:12px;line-height:1.35;margin-top:4px}.emptyRail{border-radius:16px;background:rgba(255,255,255,.055);padding:14px}.rewardBig strong{display:block;color:#ff58c9;font-size:34px;line-height:1;margin-top:18px}.rewardBig span{font-size:16px}.rewardBig p{margin:10px 0 0;color:rgba(255,255,255,.62)}.favoriteCircles{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.favoriteCircles a{min-width:0;color:#fff;text-decoration:none;text-align:center;display:grid;gap:8px;justify-items:center}.favoriteCircles span{width:52px;height:52px;border-radius:999px;background:linear-gradient(135deg,rgba(255,45,149,.42),rgba(255,180,0,.28));border:2px solid rgba(255,45,149,.58);display:grid;place-items:center;color:#ffd15b;font-weight:1000}.favoriteCircles small{width:100%;color:rgba(255,255,255,.72);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.trending{display:grid;gap:12px}.trendItem{display:grid;grid-template-columns:54px 1fr;align-items:center;gap:10px;color:#fff;text-decoration:none}.trendItem img,.trendItem>span{width:54px;height:54px;border-radius:12px;object-fit:cover;background:linear-gradient(135deg,#ff2d95,#7c2dff);display:grid;place-items:center;font-weight:1000}.trendItem strong{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.trendItem small{display:block;color:rgba(255,255,255,.58);font-size:12px;margin-top:3px}.classicGrid{display:grid;grid-template-columns:1fr 360px;gap:14px;margin-top:18px}.panel{padding:22px;min-height:220px}.panel.large{grid-row:span 2}.panelHead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:18px}.panelHead span{color:#ff70ce;font-size:12px;font-weight:1000;letter-spacing:.12em}.panelHead h2{margin:6px 0 0;font-size:28px;letter-spacing:-1px}.panelHead a{color:#ff8bdc;text-decoration:none;font-size:13px;font-weight:1000}.list,.profileRows{display:grid;gap:12px}.orderCard,.profileRows div,.emptyState{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.05);border-radius:20px;padding:16px}.orderCard{display:flex;justify-content:space-between;gap:12px;align-items:center}.orderCard strong,.emptyState strong{display:block;font-size:16px}.orderCard span,.emptyState span{display:block;margin-top:5px;color:rgba(255,255,255,.62);font-size:13px;line-height:1.45}.orderCard a,.emptyState a{min-height:42px;border-radius:999px;background:#ff2d95;color:#fff;text-decoration:none;display:flex;align-items:center;justify-content:center;padding:0 16px;font-size:13px;font-weight:1000;white-space:nowrap}.profileRows div{display:grid;gap:5px}.profileRows span{color:rgba(255,255,255,.55);font-size:12px;font-weight:900}.profileRows strong{font-size:14px;overflow-wrap:anywhere}.guidelines{margin-top:18px;min-height:74px;display:flex;align-items:center;gap:18px;flex-wrap:wrap;padding:18px}.guidelines strong{color:#ff58c9;letter-spacing:.08em;font-size:13px}.guidelines span{color:rgba(255,255,255,.72);font-size:13px;font-weight:800}.deletePostButton{position:absolute!important;top:10px!important;right:10px!important;z-index:50!important;min-height:42px!important;border:2px solid #fff!important;border-radius:999px!important;background:linear-gradient(135deg,#ff174f,#ff2d95)!important;color:#fff!important;font-size:14px!important;font-weight:1000!important;padding:0 18px!important;cursor:pointer!important;box-shadow:0 0 28px rgba(255,45,85,.75),0 14px 34px rgba(0,0,0,.65)!important;text-shadow:0 1px 8px rgba(0,0,0,.5)!important;opacity:1!important}.deletePostButton:disabled{opacity:.8!important;cursor:not-allowed!important}.deletePostTextButton{color:#ff2d55!important;width:100%;min-height:38px;border:1px solid rgba(255,255,255,.7);border-radius:999px;background:linear-gradient(135deg,#ff174f,#ff2d95);color:#fff!important;font-size:13px;font-weight:1000;cursor:pointer;box-shadow:0 0 22px rgba(255,45,85,.42);opacity:1!important}.deletePostTextButton:disabled{opacity:.72!important;cursor:not-allowed}

.bottomNav{display:none}@media(max-width:1180px){.customerPage{grid-template-columns:1fr}.sidebar{display:none}.mainArea{padding:12px 12px 92px}.topBar{grid-template-columns:1fr;position:relative}.topActions{justify-content:flex-start}.contentGrid,.classicGrid{grid-template-columns:1fr}.rightRail{grid-template-columns:repeat(2,minmax(0,1fr))}.postGrid{grid-template-columns:repeat(2,minmax(0,1fr))}.bottomNav{position:fixed;z-index:80;left:12px;right:12px;bottom:12px;min-height:72px;border-radius:24px;background:rgba(5,5,7,.9);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(18px);display:grid;grid-template-columns:repeat(5,1fr);align-items:center;box-shadow:0 20px 60px rgba(0,0,0,.42)}.bottomNav a,.bottomNav button{border:0;background:transparent;color:#fff;text-decoration:none;display:grid;place-items:center;gap:3px;font-size:19px;cursor:pointer}.bottomNav span{font-size:10px;color:rgba(255,255,255,.68)}.bottomNav button:nth-child(3){width:52px;height:52px;border-radius:999px;background:linear-gradient(135deg,#ff2d95,#e93dba);margin:0 auto;font-size:28px;box-shadow:0 0 24px rgba(255,45,149,.42)}}@media(max-width:760px){.hero{min-height:410px;padding:34px 22px;background-position:center}.heroCopy h1{font-size:48px}.heroCopy span{font-size:21px}.heroButtons{display:grid;grid-template-columns:1fr}.mobileStats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}.mobileStats div{border-radius:16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);padding:12px 8px;text-align:center}.mobileStats strong{display:block;color:#ff80d5;font-size:18px}.mobileStats span{display:block;color:rgba(255,255,255,.6);font-size:11px;margin-top:4px}.rightRail{grid-template-columns:1fr}.postGrid{grid-template-columns:1fr}.mediaShell{aspect-ratio:1/.92}.composerActions{flex-direction:column}.postBtn,.mediaBtn{width:100%}.orderCard{align-items:flex-start;flex-direction:column}.orderCard a{width:100%}.guidelines{display:grid;gap:10px}}@media(max-width:520px){.mainArea{padding:10px 10px 92px}.topActions{display:grid;grid-template-columns:1fr 1fr;width:100%}.iconBtn,.profileMini{width:100%;border-radius:14px}.profileMini b{display:inline;font-size:12px}.hero{border-radius:20px}.favoriteCircles{grid-template-columns:repeat(2,1fr)}}

`}</style>
    </main>
  );
}
