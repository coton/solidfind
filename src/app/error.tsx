"use client";

import { useEffect } from "react";
import Link from "next/link";

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
    <main className="flex min-h-screen flex-col items-center bg-[#f8f8f8] px-6 pb-16 text-[#231f20]">
      <div className="mb-12 flex w-full max-w-[1200px] items-center border-b border-[#e4e4e4] py-[18px]">
        <Link href="/" className="inline-flex items-baseline gap-[3px] no-underline" aria-label="SolidFind home">
          <span className="text-[18px] font-bold tracking-[-0.02em] text-[#231f20]">SolidFind</span>
          <span className="font-mono text-[11px] font-medium tracking-[0.02em] text-[#8c8c8c]">.id</span>
        </Link>
      </div>

      <section className="w-full max-w-[560px] text-center">
        <div className="mb-[-8px] select-none text-[clamp(96px,20vw,168px)] font-extralight leading-none tracking-[-0.05em] text-[#e4e4e4]" aria-hidden="true">
          E<span className="text-[#f14110]">R</span>R
        </div>
        <p className="mb-5 flex items-center justify-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-[#8c8c8c] before:block before:h-px before:w-7 before:bg-[#d8d8d8] after:block after:h-px after:w-7 after:bg-[#d8d8d8]">
          Runtime error
        </p>
        <h1 className="mb-4 text-[clamp(26px,5vw,38px)] font-light leading-[1.15] tracking-[-0.02em] text-[#231f20]">
          Something slipped -<br />but the site is still <strong className="font-bold text-[#f14110]">on solid ground.</strong>
        </h1>
        <p className="mx-auto mb-6 max-w-[400px] text-[14px] leading-[1.65] text-[#333]">
          We hit an unexpected error. Try again, or return home and continue browsing.
        </p>
        {error.digest && (
          <p className="mx-auto mb-8 max-w-[400px] font-mono text-[11px] uppercase tracking-[0.08em] text-[#8c8c8c]">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-2.5 max-[480px]:flex-col">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-[6px] bg-[#f14110] px-[22px] py-[11px] text-[14px] font-semibold tracking-[0.01em] text-white shadow-[0_2px_8px_rgba(241,65,16,0.18)] transition hover:bg-[#ec3300]"
          >
            Try again
          </button>
          <Link href="/" className="inline-flex items-center justify-center rounded-[6px] border border-[#d8d8d8] bg-transparent px-[22px] py-[11px] text-[14px] font-semibold tracking-[0.01em] text-[#231f20] transition hover:border-[#f14110] hover:text-[#f14110]">
            Take me home
          </Link>
        </div>

        <p className="mt-7 text-[13px] leading-[1.5] text-[#8c8c8c]">
          Still seeing this?{" "}
          <a
            href={`mailto:support@solidfind.id?subject=Error%20Report&body=Error%20ID:%20${error.digest || "N/A"}%0A%0AError%20Message:%20${encodeURIComponent(error.message)}`}
            className="font-semibold text-[#f14110] hover:underline"
          >
            Report it to us
          </a>.
        </p>
      </section>
    </main>
  );
}
