eof'use client';

export default function SignupPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f8f5',
        color: '#142132',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '24px',
      }}
    >
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>
          Signup Page Working
        </h1>
        <p style={{ fontSize: '18px', color: '#526171' }}>
          The real signup route is now connected.
        </p>
      </div>
    </main>
  );
}
