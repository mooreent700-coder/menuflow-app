import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-10">
      <div className="w-full rounded-[2rem] border border-white/10 bg-panel p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">Login</p>
        <h1 className="mt-3 text-3xl font-semibold">Welcome back.</h1>
        <p className="mt-2 text-white/60">Connect Supabase auth here to turn this into the real app.</p>
        <form className="mt-8 space-y-4">
          <input className="w-full rounded-xl bg-white px-4 py-3" placeholder="Email" />
          <input className="w-full rounded-xl bg-white px-4 py-3" placeholder="Password" type="password" />
          <button type="button" className="w-full rounded-full bg-gold px-5 py-3 font-semibold text-black">Log in</button>
        </form>
        <p className="mt-5 text-sm text-white/60">Need an account? <Link href="/auth/signup" className="text-gold">Sign up</Link></p>
      </div>
    </main>
  );
}
