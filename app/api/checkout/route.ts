import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type CartItem = {
  id?: string;
  itemId?: string;
  itemName?: string;
  name?: string;
  image?: string;
  imageUrl?: string;
  image_url?: string;
  itemImage?: string;
  item_image?: string;
  videoUrl?: string;
  video_url?: string;
  itemVideo?: string;
  item_video?: string;
  mediaType?: string;
  quantity?: number;
  total?: number;
  unitTotal?: number;
  selections?: unknown;
};

type RestaurantPaymentRow = {
  id: string;
  stripe_account_id?: string | null;
  platform_fee_percent?: number | string | null;
  plan_key?: string | null;
  plan_name?: string | null;
};

function safeText(value: unknown, fallback = '') {
  const clean = String(value || '').trim();
  return clean || fallback;
}

function safeNumber(value: unknown, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toCents(value: unknown) {
  return Math.max(50, Math.round(safeNumber(value, 1) * 100));
}

function safeStripeImage(value: unknown) {
  const url = safeText(value);
  if (!url) return '';
  if (!/^https:\/\//i.test(url)) return '';
  return url;
}

function getPlatformFeePercent(store: RestaurantPaymentRow | null) {
  const feeFromDatabase = safeNumber(store?.platform_fee_percent, 0);

  if (feeFromDatabase > 0) {
    return feeFromDatabase;
  }

  const planKey = safeText(store?.plan_key || store?.plan_name, 'starter').toLowerCase();

  if (planKey.includes('premium') || planKey.includes('platinum')) return 5;
  if (planKey.includes('growth')) return 7;

  return 10;
}

function getApplicationFeeAmount(totalCents: number, platformFeePercent: number) {
  const fee = Math.round(totalCents * (platformFeePercent / 100));
  return Math.max(1, Math.min(fee, totalCents));
}

export async function POST(req: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_')) {
      return NextResponse.json(
        { error: 'Missing or invalid STRIPE_SECRET_KEY' },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing Supabase server keys' },
        { status: 500 }
      );
    }

    const body = await req.json();

    const cart: CartItem[] = Array.isArray(body.cart) ? body.cart : [];

    if (!cart.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const restaurantId = safeText(body.restaurantId);
    const slug = safeText(body.slug, 'store');
    const orderType = safeText(body.orderType, 'pickup');

    if (!restaurantId) {
      return NextResponse.json({ error: 'Missing restaurantId' }, { status: 400 });
    }

    const subtotal = safeNumber(body.subtotal);
    const deliveryFee = safeNumber(body.deliveryFee);
    const discount = safeNumber(body.discount);
    const total = safeNumber(body.total);

    const stripe = new Stripe(stripeSecretKey);

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, stripe_account_id, platform_fee_percent, plan_key, plan_name')
      .eq('id', restaurantId)
      .maybeSingle();

    if (restaurantError) {
      return NextResponse.json(
        { error: restaurantError.message || 'Could not load restaurant payment settings' },
        { status: 500 }
      );
    }

    const store = restaurant as RestaurantPaymentRow | null;

    if (!store?.id) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const connectedStripeAccountId = safeText(store.stripe_account_id);

    if (!connectedStripeAccountId) {
      return NextResponse.json(
        { error: 'This store has not connected Stripe yet.' },
        { status: 400 }
      );
    }

    const platformFeePercent = getPlatformFeePercent(store);

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : new URL(req.url).origin);

    const cleanedCart = cart.map((item) => {
      const quantity = Math.max(1, safeNumber(item.quantity, 1));
      const unitTotal = safeNumber(item.unitTotal, safeNumber(item.total, 1) / quantity);

      const imageUrl = safeText(
        item.imageUrl ||
          item.image_url ||
          item.itemImage ||
          item.item_image ||
          item.image
      );

      const videoUrl = safeText(
        item.videoUrl ||
          item.video_url ||
          item.itemVideo ||
          item.item_video
      );

      return {
        id: item.id || null,
        item_id: safeText(item.itemId),
        item_name: safeText(item.itemName || item.name, 'Menu Item'),
        name: safeText(item.itemName || item.name, 'Menu Item'),
        image_url: imageUrl,
        imageUrl,
        item_image: imageUrl,
        video_url: videoUrl,
        media_type: safeText(item.mediaType, imageUrl ? 'image' : 'video'),
        quantity,
        unit_total: unitTotal,
        unitTotal,
        total: unitTotal * quantity,
        selections: item.selections || [],
      };
    });

    const orderPayload: Record<string, unknown> = {
      restaurant_id: restaurantId,
      status: 'pending',
      payment_status: 'unpaid',
      order_type: orderType,
      subtotal,
      delivery_fee: deliveryFee,
      discount,
      total,
      items: cleanedCart,
      items_summary: safeText(body.items_summary),
      owner_items_summary: safeText(body.owner_items_summary || body.items_summary),
      customer_items_summary: safeText(body.customer_items_summary || body.items_summary),
      promo: body.promo || null,
      created_at: new Date().toISOString(),
    };

    let orderId = '';

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select('id')
      .single();

    if (!orderError && order?.id) {
      orderId = String(order.id);
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      cleanedCart.map((item) => {
        const stripeImage = safeStripeImage(item.image_url);

        return {
          quantity: item.quantity,
          price_data: {
            currency: 'usd',
            unit_amount: toCents(item.unit_total),
            product_data: {
              name: item.item_name,
              images: stripeImage ? [stripeImage] : [],
              metadata: {
                item_id: item.item_id,
                image_url: item.image_url,
              },
            },
          },
        };
      });

    if (deliveryFee > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: toCents(deliveryFee),
          product_data: {
            name: 'Delivery Fee',
          },
        },
      });
    }

    const checkoutTotalCents = lineItems.reduce((sum, item) => {
      const quantity = Number(item.quantity || 1);
      const unitAmount = Number(item.price_data?.unit_amount || 0);
      return sum + quantity * unitAmount;
    }, 0);

    const applicationFeeAmount = getApplicationFeeAmount(
      checkoutTotalCents,
      platformFeePercent
    );

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${origin}/store/${slug}?checkout=success${orderId ? `&order=${orderId}` : ''}`,
      cancel_url: `${origin}/store/${slug}?checkout=cancelled${orderId ? `&order=${orderId}` : ''}`,
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: connectedStripeAccountId,
        },
        metadata: {
          order_id: orderId,
          restaurant_id: restaurantId,
          slug,
          order_type: orderType,
          platform_fee_percent: String(platformFeePercent),
          platform_fee_amount: String(applicationFeeAmount / 100),
          connected_account_id: connectedStripeAccountId,
        },
      },
      metadata: {
        order_id: orderId,
        restaurant_id: restaurantId,
        slug,
        order_type: orderType,
        platform_fee_percent: String(platformFeePercent),
        platform_fee_amount: String(applicationFeeAmount / 100),
        connected_account_id: connectedStripeAccountId,
      },
    });

    if (orderId) {
      await supabase
        .from('orders')
        .update({
          stripe_session_id: session.id,
          stripe_checkout_url: session.url,
        })
        .eq('id', orderId);
    }

    return NextResponse.json({
      success: true,
      url: session.url,
      orderId,
      platformFeePercent,
      platformFeeAmount: applicationFeeAmount / 100,
      connectedAccountId: connectedStripeAccountId,
    });
  } catch (error: any) {
    console.error('CHECKOUT ERROR:', error);

    return NextResponse.json(
      { error: error?.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}
