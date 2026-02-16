"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#ececec] flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <div className="text-[80px] mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-[#333] mb-3">
            Oops! Something Went Wrong
          </h2>
          <p className="text-[#333]/70 mb-2 text-[15px]">
            We encountered an unexpected error. Please try again.
          </p>
          {error.digest && (
            <p className="text-[#333]/50 mb-8 text-[13px] font-mono">
              Error ID: {error.digest}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-[#f14110] text-white rounded-full font-medium hover:bg-[#d83a0e] transition-all cursor-pointer"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-white text-[#333] rounded-full font-medium hover:bg-[#f5f5f5] transition-all cursor-pointer text-center border border-[#e4e4e4]"
            >
              Return to Home
            </Link>
          </div>
          
          <div className="mt-6">
            <a
              href={`mailto:support@solidfind.id?subject=Error%20Report&body=Error%20ID:%20${error.digest || 'N/A'}%0A%0AError%20Message:%20${encodeURIComponent(error.message)}`}
              className="text-[#f14110] text-[14px] hover:underline cursor-pointer"
            >
              Report this issue to our team
            </a>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
