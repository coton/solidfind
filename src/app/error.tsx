"use client";

import { useEffect } from "react";

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
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#333] mb-4">Something went wrong!</h2>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-[#f14110] text-white rounded-md hover:bg-[#d83a0e] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
