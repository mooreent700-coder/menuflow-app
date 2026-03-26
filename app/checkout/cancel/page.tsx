"use client";

import { useRouter } from "next/navigation";

export default function CancelPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">
      
      {/* Title */}
      <h1 className="text-4xl font-bold mb-4">
        ❌ Payment Cancelled
      </h1>

      {/* Message */}
      <p className="text-center text-gray-300 mb-8 max-w-md">
        Your payment was not completed.
        <br />
        You can go back and try again.
      </p>

      {/* Buttons */}
      <div className="flex gap-4">
        
        <button
          onClick={() => router.back()}
          className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
        >
          Try Again
        </button>

        <button
          onClick={() => router.push("/")}
          className="border border-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-black transition"
        >
          Home
        </button>

      </div>

    </main>
  );
}