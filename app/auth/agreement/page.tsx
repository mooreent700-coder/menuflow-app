'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type OwnerStore = {
  id: string;
  owner_id?: string | null;
  user_id?: string | null;
  orda_owner_agreement_accepted?: boolean | null;
  orda_owner_agreement_accepted_at?: string | null;
  orda_owner_agreement_version?: string | null;
};

const AGREEMENT_VERSION = 'orda-direct-owner-v2';


function hasAccepted(store: OwnerStore | null) {
  if (!store) return false;

  return Boolean(
    store.orda_owner_agreement_accepted &&
      store.orda_owner_agreement_accepted_at &&
      store.orda_owner_agreement_version === AGREEMENT_VERSION
  );
}

async function waitForOwnerSession() {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const { data } = await supabase.auth.getSession();

    if (data.session?.user?.id) {
      return data.session;
    }

    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  const { data } = await supabase.auth.getSession();
  return data.session;
}

function AgreementInner() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pageMessage, setPageMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadOwnerAgreement() {
      setLoading(true);
      setPageMessage('');

      const session = await waitForOwnerSession();

      if (!active) return;

      if (!session?.user?.id) {
        setPageMessage('Your login session was not found. Please go back and log in again.');
        setLoading(false);
        return;
      }

      setUserId(session.user.id);

      const { data, error } = await supabase
        .from('restaurants')
        .select(
          'id, owner_id, user_id, orda_owner_agreement_accepted, orda_owner_agreement_accepted_at, orda_owner_agreement_version'
        )
        .or(`owner_id.eq.${session.user.id},user_id.eq.${session.user.id}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!active) return;

      if (error) {
        console.error('ORDA agreement load error:', error);
        setPageMessage(error.message || 'Could not load your owner account agreement.');
        setLoading(false);
        return;
      }

      const stores = Array.isArray(data) ? (data as OwnerStore[]) : [];
      const acceptedStore = stores.find((item) => hasAccepted(item));

      if (acceptedStore) {
        router.replace('/dashboard/owner');
        return;
      }

      setStoreId(stores[0]?.id || null);
      setLoading(false);
    }

    void loadOwnerAgreement();

    return () => {
      active = false;
    };
  }, [router]);

  async function acceptAgreement() {
    if (saving) return;

    if (!checked) {
      alert('Please check the agreement box first.');
      return;
    }

    if (!userId) {
      alert('Your login session was not found. Please go back and log in again.');
      return;
    }

    try {
      setSaving(true);

      const now = new Date().toISOString();

     const updatePayload = {
  orda_owner_agreement_accepted: true,
  orda_owner_agreement_accepted_at: now,
  orda_owner_agreement_version: AGREEMENT_VERSION,
};

      let saveError: any = null;

      const ownerSave = await supabase
        .from('restaurants')
        .update(updatePayload)
        .or(`owner_id.eq.${userId},user_id.eq.${userId}`);

      saveError = ownerSave.error || null;

      if (saveError && storeId) {
        const fallbackSave = await supabase
          .from('restaurants')
          .update(updatePayload)
          .eq('id', storeId);

        saveError = fallbackSave.error || null;
      }

      if (saveError) {
        throw saveError;
      }

      router.replace('/dashboard/owner');
      router.refresh();
    } catch (error: any) {
      alert(error?.message || 'Could not save ORDA Direct owner agreement.');
    } finally {
      setSaving(false);
    }
  }

  if (pageMessage) {
    return (
      <main className="page">
        <section className="card loadingCard">
          <p className="eyebrow">ORDA DIRECT</p>
          <h1>Owner Agreement</h1>
          <p className="sub">{pageMessage}</p>
          <button
            type="button"
            className="agreeButton"
            onClick={() => router.replace('/auth/login')}
          >
            Back to Owner Login
          </button>
        </section>

        <style jsx>{styles}</style>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="page">
        <section className="card loadingCard">
          <p className="eyebrow">ORDA DIRECT</p>
          <h1>Loading Agreement...</h1>
        </section>

        <style jsx>{styles}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="card">
        <div className="top">
          <p className="eyebrow">ORDA DIRECT OWNER ACCESS</p>
          <h1>Owner Terms & Agreement</h1>
          <p className="sub">
            Before entering your owner dashboard, you must review and accept this agreement.
            This protects ORDA Direct and clearly explains what every food business owner is responsible for.
          </p>
        </div>

        <div className="agreementBox">
          <h2>ORDA Direct Owner Agreement</h2>

          <p>
            This ORDA Direct Owner Agreement applies to restaurants, food trucks, pop-up food vendors,
            caterers, mobile food businesses, home-based food businesses where legally permitted,
            dessert shops, coffee shops, smoothie shops, seafood businesses, BBQ businesses, taco stands,
            food creators, and any business using ORDA Direct to display menus, receive orders, accept payments,
            communicate with customers, or operate a digital storefront.
          </p>

          <h3>1. ORDA Direct Is a Technology Platform Only</h3>
          <p>
            ORDA Direct provides software tools that help food businesses build storefronts, show menus,
            receive customer orders, connect payments, share store links, create promotions, and manage
            business activity. ORDA Direct does not own, operate, manage, inspect, control, cook, prepare,
            package, store, deliver, or fulfill any food, drink, product, service, or order sold by a business
            on the platform.
          </p>

          <h3>2. Independent Business Responsibility</h3>
          <p>
            Every owner is an independent business operator. You are fully responsible for your own business,
            staff, menu, prices, fees, taxes, hours, availability, photos, descriptions, pickup settings,
            delivery settings, refund decisions, order fulfillment, customer service, customer disputes,
            and all activity connected to your store.
          </p>

          <h3>3. Food Safety, Permits, Licenses, and Legal Compliance</h3>
          <p>
            You are responsible for following all health department rules, food safety laws, food handling
            requirements, sanitation rules, business license requirements, seller permits, tax requirements,
            insurance requirements, delivery rules, local laws, state laws, and federal laws that apply to your
            food business. ORDA Direct does not verify, guarantee, approve, or certify your legal compliance,
            permits, inspections, licenses, kitchen status, food handling practices, or right to operate.
          </p>

          <h3>4. Customer Orders, Pickup, Delivery, and Fulfillment</h3>
          <p>
            You are responsible for preparing accurate orders, honoring menu availability, meeting promised
            pickup or delivery times, communicating with customers, handling missing items, correcting wrong
            orders, and resolving delivery or pickup issues. ORDA Direct is not responsible for late orders,
            incorrect orders, missing items, poor food quality, damaged items, delivery problems, driver issues,
            or customer dissatisfaction.
          </p>

          <h3>5. Payments, Stripe, Chargebacks, and Payouts</h3>
          <p>
            ORDA Direct may use Stripe or other payment processors to support payments and payouts.
            You are responsible for completing payment onboarding, keeping your payment information accurate,
            maintaining an eligible payout account, understanding processor rules, paying any applicable
            processor fees, handling chargebacks, responding to payment disputes, and complying with all payment
            provider requirements. Card payments may not work until your payment setup is fully completed.
          </p>

          <h3>6. Refunds, Cancellations, Customer Complaints, and Disputes</h3>
          <p>
            You are responsible for setting and honoring your refund, cancellation, delivery, pickup, and customer
            service policies. ORDA Direct is not responsible for disputes between owners and customers, including
            refund requests, chargebacks, delivery complaints, product quality complaints, allergic reactions,
            food-related illness claims, late fulfillment, customer dissatisfaction, order mistakes, or legal claims.
          </p>

          <h3>7. Prohibited Products and Prohibited Conduct</h3>
          <p>
            You may not use ORDA Direct to sell illegal items, unsafe food, prohibited products, stolen goods,
            misleading offers, unauthorized brand content, fraudulent products, harmful content, explicit content,
            or anything that violates law, customer safety, payment processor rules, or ORDA Direct platform rules.
            ORDA Direct may suspend, restrict, remove, or permanently disable accounts that create risk for customers,
            violate rules, misuse the platform, or expose ORDA Direct to legal, payment, safety, or reputation risk.
          </p>

          <h3>8. Owner Content, Photos, Videos, Menus, and Branding</h3>
          <p>
            You are responsible for all content uploaded or displayed through your account, including menu names,
            prices, descriptions, food photos, videos, logos, business names, promotional images, social links,
            customer-facing messages, and campaign materials. You confirm you own or have permission to use the
            content you upload and that your content does not violate another person’s rights.
          </p>

          <h3>9. Platform Fees, Plans, and Account Status</h3>
          <p>
            ORDA Direct may charge monthly fees, setup fees, usage fees, transaction-based platform fees,
            premium feature fees, or other clearly displayed fees tied to your selected plan or account activity.
            Failure to pay required fees, complete onboarding, follow platform rules, or maintain account compliance
            may result in limited access, paused features, account restrictions, or removal from the platform.
          </p>

          <h3>10. No Guarantee of Sales, Orders, Customers, or Results</h3>
          <p>
            ORDA Direct does not guarantee sales, orders, customers, revenue, profits, traffic, ranking, promotion
            performance, customer retention, business growth, payment approval, delivery volume, or any business result.
            Your results depend on your business, marketing, pricing, food quality, operations, customer service,
            and other factors outside ORDA Direct’s control.
          </p>

          <h3>11. No Legal Partnership, Employment, Franchise, or Agency Relationship</h3>
          <p>
            Using ORDA Direct does not create a partnership, joint venture, franchise, employment relationship,
            agency relationship, ownership relationship, or legal representation between ORDA Direct and any owner,
            restaurant, food truck, vendor, worker, contractor, driver, customer, or third party.
          </p>

          <h3>12. Limitation of Liability</h3>
          <p>
            To the maximum extent allowed by law, ORDA Direct is not liable for business losses, lost revenue,
            lost profits, customer claims, lawsuits, food safety claims, allergic reactions, food illness claims,
            chargebacks, payment delays, account interruptions, third-party service issues, platform downtime,
            owner misconduct, employee misconduct, driver issues, illegal seller activity, or damages connected
            to the use of the platform.
          </p>

          <h3>13. Indemnification</h3>
          <p>
            You agree to protect, defend, and hold ORDA Direct harmless from claims, losses, disputes, damages,
            chargebacks, legal actions, penalties, fees, or expenses caused by your business, your products,
            your employees, your contractors, your customers, your content, your operations, your legal compliance,
            your food safety practices, your misuse of the platform, or your violation of this agreement.
          </p>

          <h3>14. Agreement Updates</h3>
          <p>
            ORDA Direct may update this agreement when platform rules, payment systems, legal requirements,
            safety policies, owner tools, or business features change. If this agreement is updated, you may be
            required to accept the updated version before continuing to access the owner dashboard.
          </p>

          <h3>15. Acceptance</h3>
          <p>
            By checking the box and clicking the agreement button, you confirm that you have read, understand,
            and agree to this ORDA Direct Owner Agreement. You also confirm that you are authorized to accept
            this agreement on behalf of your business.
          </p>
        </div>

        <label className="agreeRow">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => setChecked(event.currentTarget.checked)}
          />
          <span>
            I have read, understand, and agree to the ORDA Direct Owner Terms & Agreement.
          </span>
        </label>

        <button
          type="button"
          className="agreeButton"
          disabled={saving}
          onClick={acceptAgreement}
        >
          {saving ? 'Saving Agreement...' : 'I Have Read and Agree'}
        </button>
      </section>

      <style jsx>{styles}</style>
    </main>
  );
}

export default function AgreementPage() {
  return (
    <Suspense fallback={<div />}>
      <AgreementInner />
    </Suspense>
  );
}

const styles = `
  .page{
    min-height:100vh;
    background:
      radial-gradient(circle at top left, rgba(255,47,146,.12), transparent 26%),
      radial-gradient(circle at bottom right, rgba(59,130,246,.12), transparent 28%),
      #050505;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:28px;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .card{
    width:min(960px,100%);
    max-height:calc(100vh - 56px);
    overflow:auto;
    background:rgba(15,15,16,.96);
    border:1px solid rgba(255,255,255,.1);
    border-radius:30px;
    padding:34px;
    color:#fff;
    box-shadow:0 24px 90px rgba(0,0,0,.52);
  }

  .loadingCard{
    max-height:none;
    overflow:visible;
  }

  .eyebrow{
    margin:0 0 10px;
    color:#ff2f92;
    font-size:12px;
    font-weight:1000;
    letter-spacing:.18em;
  }

  h1{
    margin:0;
    font-size:clamp(34px,5vw,58px);
    line-height:.96;
    font-weight:1000;
    letter-spacing:-.06em;
  }

  .sub{
    margin:16px 0 0;
    max-width:760px;
    color:rgba(255,255,255,.76);
    font-size:16px;
    line-height:1.65;
    font-weight:750;
  }

  .agreementBox{
    margin-top:28px;
    border:1px solid rgba(255,255,255,.1);
    background:linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.025));
    border-radius:26px;
    padding:28px;
  }

  .agreementBox h2{
    margin:0 0 18px;
    font-size:30px;
    line-height:1.1;
    font-weight:1000;
    letter-spacing:-.03em;
  }

  .agreementBox h3{
    margin:26px 0 8px;
    font-size:18px;
    line-height:1.25;
    font-weight:1000;
    color:#fff;
  }

  .agreementBox p{
    margin:0;
    color:rgba(255,255,255,.78);
    line-height:1.8;
    font-size:15px;
    font-weight:700;
  }

  .agreeRow{
    display:flex;
    align-items:flex-start;
    gap:14px;
    margin-top:26px;
    padding:18px;
    border-radius:18px;
    background:rgba(255,255,255,.055);
    color:#fff;
    font-size:15px;
    line-height:1.45;
    font-weight:1000;
  }

  .agreeRow input{
    width:20px;
    height:20px;
    margin-top:1px;
    accent-color:#ff2f92;
    flex:0 0 auto;
  }

  .agreeButton{
    margin-top:22px;
    width:100%;
    min-height:62px;
    border:none;
    border-radius:999px;
    background:linear-gradient(90deg,#ff2f92,#ff4d6d);
    color:white;
    font-size:18px;
    font-weight:1000;
    cursor:pointer;
    box-shadow:0 18px 38px rgba(255,47,146,.18);
  }

  .agreeButton:disabled{
    opacity:.52;
    cursor:not-allowed;
    box-shadow:none;
  }

  @media (max-width:640px){
    .page{
      padding:14px;
      align-items:flex-start;
    }

    .card{
      max-height:none;
      padding:22px;
      border-radius:24px;
    }

    .agreementBox{
      padding:20px;
      border-radius:22px;
    }

    .agreementBox p{
      font-size:14px;
    }
  }
`;
