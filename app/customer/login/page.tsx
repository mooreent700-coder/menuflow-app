'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type AuthState = 'idle' | 'loading' | 'error' | 'success';

const SHAKE_IMAGE =
  'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=90&w=1400&auto=format&fit=crop';

const BACKDROP_IMAGE =
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=90&w=1800&auto=format&fit=crop';

function CustomerLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [message, setMessage] = useState('');

  const nextUrl = useMemo(() => {
    const next = searchParams.get('next');
    return next && next.startsWith('/') ? next : '/customer';
  }, [searchParams]);

  async function resolveCustomerEmail(value: string) {
    const cleanValue = value.trim().toLowerCase();

    if (cleanValue.includes('@')) {
      return cleanValue;
    }

    const { data } = await supabase
      .from('customers')
      .select('email')
      .ilike('name', cleanValue)
      .maybeSingle();

    return data?.email?.trim().toLowerCase() || '';
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanLogin = loginId.trim();

    if (!cleanLogin || !password) {
      setAuthState('error');
      setMessage('Enter your email or username and password.');
      return;
    }

    setAuthState('loading');
    setMessage('');

    const loginEmail = await resolveCustomerEmail(cleanLogin);

    if (!loginEmail) {
      setAuthState('error');
      setMessage('Use the email address connected to your customer account.');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (error) {
      setAuthState('error');
      setMessage(error.message || 'Login failed.');
      return;
    }

    if (rememberMe) {
      window.localStorage.setItem('orda_customer_remember', 'yes');
    } else {
      window.localStorage.removeItem('orda_customer_remember');
    }

    setAuthState('success');
    router.replace(nextUrl);
    router.refresh();
  }

  async function handleGoogleLogin() {
    setAuthState('loading');
    setMessage('');

    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}${nextUrl}`,
      },
    });

    if (error) {
      setAuthState('error');
      setMessage(error.message || 'Google login failed.');
    }
  }

  return (
    <main className="page">
      <section className="shell">
        <div className="bgGlow" aria-hidden="true" />

        <section className="leftPanel">
          <Link href="/discover" className="brand" aria-label="Go to ORDA Direct Discover">
            <strong>ORDA</strong>
            <span>DIRECT</span>
          </Link>

          <div className="headline">
            <h1>
              Login to
              <br />
              your
              <br />
              <span>account</span>
            </h1>

            <p>
              Welcome back! Access your orders, rewards, and exclusive offers all in one place.
            </p>
          </div>

          <div className="shakeWrap" aria-hidden="true">
            <img src={SHAKE_IMAGE} alt="" />
            <b>ORDA</b>
          </div>
        </section>

        <section className="cardWrap">
          <div className="freeBadge">✦ 100% FREE</div>

          <form className="loginCard" onSubmit={handleLogin}>
            <div className="avatar" aria-hidden="true">
              <span />
            </div>

            <div className="cardHead">
              <h2>
                Welcome <span>back!</span>
              </h2>
              <p>Please enter your details to login to your account.</p>
            </div>

            <label className="fieldBlock">
              <span>Username or Email</span>
              <div className="inputShell">
                <i aria-hidden="true">♙</i>
                <input
                  type="text"
                  autoComplete="username email"
                  placeholder="Enter your username or email"
                  value={loginId}
                  onChange={(event) => setLoginId(event.target.value)}
                />
              </div>
            </label>

            <label className="fieldBlock">
              <span>Password</span>
              <div className="inputShell">
                <i aria-hidden="true">▣</i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="showBtn"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <div className="rowActions">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <Link href="/customer/forgot-password" className="forgot">
                Forgot Password?
              </Link>
            </div>

            {message ? (
              <div className={`message ${authState === 'error' ? 'error' : 'success'}`}>
                {message}
              </div>
            ) : null}

            <button type="submit" className="loginBtn" disabled={authState === 'loading'}>
              {authState === 'loading' ? 'Logging In...' : 'Login'}
            </button>

            <div className="divider">
              <span />
              <b>or</b>
              <span />
            </div>

            <button
              type="button"
              className="googleBtn"
              onClick={handleGoogleLogin}
              disabled={authState === 'loading'}
            >
              <b>G</b>
              Continue with Google
            </button>

            <p className="signupLine">
              Don&apos;t have an account? <Link href="/customer/signup">Sign up</Link>
            </p>
          </form>
        </section>
      </section>

      <style jsx global>{`
        html,
        body,
        body > div {
          margin: 0 !important;
          padding: 0 !important;
          min-width: 100% !important;
          min-height: 100% !important;
          background: #020205 !important;
          background-color: #020205 !important;
          overflow-x: hidden !important;
        }

        * {
          box-sizing: border-box;
        }

        input,
        button {
          font: inherit;
        }

        a {
          color: inherit;
        }
      `}</style>

      <style jsx>{`
        .page {
          min-height: 100vh;
          width: 100%;
          background: #020205;
          color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px;
          overflow-x: hidden;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .shell {
          position: relative;
          width: min(1536px, 100%);
          min-height: min(864px, calc(100vh - 48px));
          border-radius: 26px;
          overflow: hidden;
          border: 1px solid rgba(255, 45, 149, 0.2);
          background:
            radial-gradient(circle at 12% 78%, rgba(255, 45, 149, 0.3), transparent 28%),
            radial-gradient(circle at 94% 88%, rgba(136, 255, 0, 0.14), transparent 26%),
            linear-gradient(90deg, rgba(0, 0, 0, 0.86), rgba(0, 0, 0, 0.7)),
            url(${BACKDROP_IMAGE});
          background-size: cover;
          background-position: center;
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.58);
          display: grid;
          grid-template-columns: 1fr 0.92fr;
          gap: 42px;
          padding: 48px;
          isolation: isolate;
        }

        .shell::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          background:
            linear-gradient(90deg, rgba(0, 0, 0, 0.26), rgba(0, 0, 0, 0.42)),
            radial-gradient(circle at 78% 44%, rgba(255, 45, 149, 0.12), transparent 30%);
          pointer-events: none;
        }

        .bgGlow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 7% 49%, rgba(255, 45, 149, 0.34), transparent 8%),
            radial-gradient(circle at 78% 7%, rgba(122, 255, 0, 0.18), transparent 10%),
            linear-gradient(90deg, rgba(0, 0, 0, 0.16), rgba(255, 45, 149, 0.05), rgba(0, 0, 0, 0.18));
          z-index: 0;
        }

        .leftPanel,
        .cardWrap {
          position: relative;
          z-index: 2;
        }

        .leftPanel {
          display: flex;
          flex-direction: column;
          min-height: 760px;
        }

        .brand {
          width: fit-content;
          text-decoration: none;
          display: grid;
          gap: 8px;
          line-height: 0.9;
        }

        .brand strong {
          color: #ff2d95;
          font-size: clamp(42px, 4.7vw, 72px);
          font-weight: 1000;
          letter-spacing: -0.09em;
          text-shadow:
            0 0 16px rgba(255, 45, 149, 0.66),
            0 0 34px rgba(255, 45, 149, 0.34);
        }

        .brand span {
          color: rgba(255, 255, 255, 0.86);
          font-size: clamp(11px, 1vw, 15px);
          font-weight: 1000;
          letter-spacing: 0.32em;
          padding-left: 3px;
        }

        .headline {
          margin-top: 72px;
          max-width: 590px;
        }

        h1 {
          margin: 0;
          font-size: clamp(60px, 6.6vw, 102px);
          line-height: 0.96;
          letter-spacing: -0.07em;
          font-weight: 1000;
          text-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
        }

        h1 span {
          color: #ff2d95;
          text-shadow:
            0 0 18px rgba(255, 45, 149, 0.46),
            0 10px 40px rgba(0, 0, 0, 0.45);
        }

        .headline p {
          position: relative;
          margin: 28px 0 0;
          max-width: 460px;
          padding-left: 28px;
          color: rgba(255, 255, 255, 0.94);
          font-size: clamp(20px, 1.65vw, 27px);
          line-height: 1.38;
          font-weight: 600;
          text-shadow: 0 7px 24px rgba(0, 0, 0, 0.8);
        }

        .headline p::before {
          content: '';
          position: absolute;
          left: 0;
          top: 4px;
          bottom: 4px;
          width: 3px;
          border-radius: 999px;
          background: #ff2d95;
          box-shadow: 0 0 20px rgba(255, 45, 149, 0.72);
        }

        .shakeWrap {
          position: absolute;
          left: 8%;
          bottom: -1.5%;
          width: min(530px, 84%);
          height: 425px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          border-radius: 36px 36px 0 0;
          overflow: hidden;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.36);
        }

        .shakeWrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          filter: saturate(1.18) contrast(1.05);
          opacity: 0.96;
        }

        .shakeWrap::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(0, 0, 0, 0.08), transparent 34%, rgba(2, 2, 5, 0.8)),
            radial-gradient(circle at 52% 48%, transparent 0, rgba(255, 45, 149, 0.06) 55%, rgba(0, 0, 0, 0.5) 100%);
          pointer-events: none;
          z-index: 1;
        }

        .shakeWrap b {
          position: absolute;
          bottom: 56px;
          z-index: 2;
          color: rgba(0, 0, 0, 0.66);
          font-size: 58px;
          line-height: 1;
          font-weight: 1000;
          letter-spacing: -0.08em;
        }

        .cardWrap {
          display: flex;
          justify-content: center;
          align-items: center;
          padding-top: 38px;
        }

        .freeBadge {
          position: absolute;
          top: 0;
          right: 0;
          min-height: 58px;
          padding: 0 26px;
          border-radius: 999px;
          border: 1px solid rgba(255, 45, 149, 0.78);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 1000;
          background: rgba(0, 0, 0, 0.5);
          box-shadow:
            0 0 20px rgba(255, 45, 149, 0.34),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(12px);
        }

        .loginCard {
          width: min(610px, 100%);
          border-radius: 34px;
          border: 1.5px solid rgba(255, 45, 149, 0.82);
          background:
            linear-gradient(180deg, rgba(10, 10, 18, 0.86), rgba(3, 3, 7, 0.8));
          box-shadow:
            0 0 16px rgba(255, 45, 149, 0.6),
            0 0 62px rgba(255, 45, 149, 0.22),
            0 36px 90px rgba(0, 0, 0, 0.48),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
          padding: 42px 38px 30px;
          display: grid;
          gap: 22px;
          backdrop-filter: blur(22px);
        }

        .avatar {
          width: 104px;
          height: 104px;
          margin: -6px auto 0;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: radial-gradient(circle at 40% 35%, #ff74cf, #ff0f87 62%, #830047);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow:
            0 0 20px rgba(255, 45, 149, 0.84),
            0 0 48px rgba(255, 45, 149, 0.42);
        }

        .avatar span {
          width: 44px;
          height: 44px;
          position: relative;
          display: block;
        }

        .avatar span::before {
          content: '';
          position: absolute;
          top: 2px;
          left: 50%;
          width: 16px;
          height: 16px;
          transform: translateX(-50%);
          border-radius: 999px;
          border: 5px solid #fff;
        }

        .avatar span::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: 0;
          width: 38px;
          height: 22px;
          transform: translateX(-50%);
          border: 5px solid #fff;
          border-radius: 22px 22px 8px 8px;
          border-bottom-width: 5px;
        }

        .cardHead {
          text-align: center;
          margin-bottom: 8px;
        }

        h2 {
          margin: 0;
          font-size: clamp(36px, 3.1vw, 48px);
          line-height: 1;
          letter-spacing: -0.055em;
          font-weight: 1000;
          text-shadow: 0 8px 26px rgba(0, 0, 0, 0.55);
        }

        h2 span {
          color: #ff2d95;
        }

        .cardHead p {
          margin: 11px 0 0;
          color: rgba(255, 255, 255, 0.86);
          font-size: 18px;
          line-height: 1.35;
        }

        .fieldBlock {
          display: grid;
          gap: 10px;
        }

        .fieldBlock > span {
          color: #fff;
          font-size: 17px;
          font-weight: 1000;
        }

        .inputShell {
          height: 66px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: rgba(3, 4, 9, 0.78);
          display: grid;
          grid-template-columns: 46px 1fr auto;
          align-items: center;
          padding: 0 16px;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            0 18px 40px rgba(0, 0, 0, 0.16);
        }

        .inputShell:focus-within {
          border-color: rgba(255, 45, 149, 0.9);
          box-shadow:
            0 0 0 4px rgba(255, 45, 149, 0.12),
            0 0 26px rgba(255, 45, 149, 0.2);
        }

        .inputShell i {
          color: rgba(255, 255, 255, 0.72);
          font-style: normal;
          font-size: 24px;
          line-height: 1;
        }

        input[type='text'],
        input[type='email'],
        input[type='password'] {
          width: 100%;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #fff;
          font-size: 18px;
          font-weight: 600;
          min-width: 0;
        }

        input::placeholder {
          color: rgba(255, 255, 255, 0.68);
        }

        .showBtn {
          border: 0;
          background: transparent;
          color: #ff2d95;
          font-size: 16px;
          font-weight: 1000;
          cursor: pointer;
          padding: 0 2px 0 14px;
        }

        .rowActions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .remember {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: #fff;
          font-size: 17px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .remember input {
          width: 24px;
          height: 24px;
          accent-color: #ff2d95;
          cursor: pointer;
        }

        .forgot {
          color: #ff2d95;
          text-decoration: none;
          font-size: 16px;
          font-weight: 1000;
          white-space: nowrap;
        }

        .loginBtn {
          height: 70px;
          border: 0;
          border-radius: 999px;
          background: linear-gradient(135deg, #ff44aa, #ff0f87 55%, #df007a);
          color: #fff;
          font-size: 24px;
          font-weight: 1000;
          cursor: pointer;
          box-shadow:
            0 0 24px rgba(255, 45, 149, 0.68),
            0 0 55px rgba(255, 45, 149, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.24);
        }

        .loginBtn:disabled,
        .googleBtn:disabled {
          opacity: 0.72;
          cursor: not-allowed;
        }

        .divider {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 14px;
          color: rgba(255, 255, 255, 0.45);
          font-size: 15px;
        }

        .divider span {
          height: 1px;
          background: rgba(255, 255, 255, 0.16);
        }

        .googleBtn {
          height: 64px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.42);
          background: rgba(0, 0, 0, 0.38);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          font-size: 18px;
          font-weight: 1000;
          cursor: pointer;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .googleBtn b {
          color: #4285f4;
          font-size: 26px;
          font-weight: 1000;
        }

        .signupLine {
          margin: 0;
          text-align: center;
          color: #fff;
          font-size: 20px;
          line-height: 1.35;
        }

        .signupLine a {
          color: #ff2d95;
          font-weight: 1000;
          text-decoration: none;
          margin-left: 6px;
        }

        .message {
          border-radius: 14px;
          padding: 12px 13px;
          font-size: 13px;
          font-weight: 900;
          text-align: center;
        }

        .message.error {
          color: #ffd7d7;
          background: rgba(255, 59, 48, 0.16);
          border: 1px solid rgba(255, 59, 48, 0.26);
        }

        .message.success {
          color: #d8ffe7;
          background: rgba(52, 199, 89, 0.14);
          border: 1px solid rgba(52, 199, 89, 0.22);
        }

        @media (max-width: 1180px) {
          .page {
            align-items: flex-start;
            padding: 0;
          }

          .shell {
            min-height: 100vh;
            width: 100%;
            border-radius: 0;
            grid-template-columns: 1fr;
            gap: 28px;
            padding: 28px 18px 36px;
          }

          .leftPanel {
            min-height: auto;
          }

          .brand strong {
            font-size: 46px;
          }

          .headline {
            margin-top: 46px;
          }

          h1 {
            font-size: clamp(62px, 14vw, 92px);
          }

          .headline p {
            font-size: 20px;
            max-width: 440px;
          }

          .shakeWrap {
            position: relative;
            left: auto;
            bottom: auto;
            width: min(480px, 100%);
            height: 330px;
            margin: 28px auto -20px;
          }

          .cardWrap {
            padding-top: 0;
            align-items: flex-start;
          }

          .freeBadge {
            top: 24px;
            right: 18px;
            min-height: 46px;
            font-size: 15px;
            padding: 0 18px;
          }

          .loginCard {
            width: min(620px, 100%);
            padding: 34px 20px 24px;
            border-radius: 28px;
          }
        }

        @media (max-width: 560px) {
          .shell {
            padding: 22px 14px 30px;
          }

          .brand strong {
            font-size: 42px;
          }

          .headline {
            margin-top: 34px;
          }

          h1 {
            font-size: 58px;
          }

          .headline p {
            font-size: 18px;
          }

          .shakeWrap {
            height: 270px;
          }

          .avatar {
            width: 82px;
            height: 82px;
          }

          .avatar span {
            transform: scale(0.8);
          }

          h2 {
            font-size: 34px;
          }

          .cardHead p {
            font-size: 15px;
          }

          .fieldBlock > span {
            font-size: 15px;
          }

          .inputShell {
            height: 60px;
            grid-template-columns: 38px 1fr auto;
            padding: 0 13px;
          }

          input[type='text'],
          input[type='email'],
          input[type='password'] {
            font-size: 15px;
          }

          .showBtn {
            font-size: 14px;
            padding-left: 8px;
          }

          .rowActions {
            align-items: flex-start;
            flex-direction: column;
            gap: 10px;
          }

          .remember,
          .forgot {
            font-size: 15px;
          }

          .loginBtn {
            height: 62px;
            font-size: 20px;
          }

          .googleBtn {
            height: 60px;
            font-size: 16px;
          }

          .signupLine {
            font-size: 17px;
          }
        }
      `}</style>
    </main>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={null}>
      <CustomerLoginContent />
    </Suspense>
  );
}
