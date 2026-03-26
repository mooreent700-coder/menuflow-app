"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // 🔥 Clear cart after successful payment
    localStorage.removeItem("cart");
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">
      
      {/* Title */}
      <h1 className="text-4xl font-bold mb-4">
        ✅ Order Confirmed
      </h1>

      {/* Message */}
      <p className="text-center text-gray-300 mb-8 max-w-md">
        Your payment was successful.
        <br />
        Your order is now being prepared.
      </p>

      {/* Button */}
      <button
        onClick={() => router.push("/")}
        className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
      >
        Back to Home
      </button>

    </main>
  );
}