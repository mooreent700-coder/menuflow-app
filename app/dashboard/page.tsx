"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        color: "#111111",
        fontFamily: "Arial, sans-serif",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 42, margin: 0 }}>MenuFlow Dashboard</h1>
        <p style={{ marginTop: 12, color: "#555", fontSize: 18 }}>
          Manage your restaurant, menu, and storefront.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginTop: 32,
          }}
        >
          <Link
            href="/dashboard/owner"
            style={{
              textDecoration: "none",
              color: "#111111",
              border: "1px solid #e5e5e5",
              borderRadius: 18,
              padding: 24,
              background: "#ffffff",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
              Owner Dashboard
            </div>
            <div style={{ color: "#666", lineHeight: 1.5 }}>
              Update business information, manage your store settings, and view
              your restaurant profile.
            </div>
          </Link>

          <Link
            href="/dashboard/owner/builder"
            style={{
              textDecoration: "none",
              color: "#111111",
              border: "1px solid #e5e5e5",
              borderRadius: 18,
              padding: 24,
              background: "#ffffff",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
              Menu Builder
            </div>
            <div style={{ color: "#666", lineHeight: 1.5 }}>
              Add menu items, upload food photos, edit prices, and remove items
              when needed.
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}