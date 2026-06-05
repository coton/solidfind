import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-[#f8f8f8] px-6 pb-16 text-[#231f20]">
      <div className="mb-12 flex w-full max-w-[1200px] items-center border-b border-[#e4e4e4] py-[18px]">
        <Link href="/" className="inline-flex items-baseline gap-[3px] no-underline" aria-label="SolidFind home">
          <span className="text-[18px] font-bold tracking-[-0.02em] text-[#231f20]">SolidFind</span>
          <span className="font-mono text-[11px] font-medium tracking-[0.02em] text-[#8c8c8c]">.id</span>
        </Link>
      </div>

      <section className="w-full max-w-[560px] text-center">
        <div className="mb-[-8px] select-none text-[clamp(100px,22vw,176px)] font-extralight leading-none tracking-[-0.05em] text-[#e4e4e4]" aria-hidden="true">
          4<span className="text-[#f14110]">0</span>4
        </div>
        <p className="mb-5 flex items-center justify-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-[#8c8c8c] before:block before:h-px before:w-7 before:bg-[#d8d8d8] after:block after:h-px after:w-7 after:bg-[#d8d8d8]">
          Page not found
        </p>
        <h1 className="mb-4 text-[clamp(26px,5vw,38px)] font-light leading-[1.15] tracking-[-0.02em] text-[#231f20]">
          Nothing here -<br />not even <strong className="font-bold text-[#f14110]">a blueprint.</strong>
        </h1>
        <p className="mx-auto mb-10 max-w-[400px] text-[14px] leading-[1.65] text-[#333]">
          The link might be broken, or this page has moved on to better things. Either way, let&apos;s get you back on solid ground.
        </p>

        <div className="flex flex-wrap justify-center gap-2.5 max-[480px]:flex-col">
          <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#f14110] px-[22px] py-[11px] text-[14px] font-semibold tracking-[0.01em] text-white shadow-[0_2px_8px_rgba(241,65,16,0.18)] transition hover:bg-[#ec3300]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
              <polyline points="9 21 9 12 15 12 15 21" />
            </svg>
            Take me home
          </Link>
          <a
            href="mailto:support@solidfind.id?subject=Report%20Issue%20-%20404%20Page"
            className="inline-flex items-center justify-center rounded-[6px] border border-[#d8d8d8] bg-transparent px-[22px] py-[11px] text-[14px] font-semibold tracking-[0.01em] text-[#231f20] transition hover:border-[#f14110] hover:text-[#f14110]"
          >
            Report this link
          </a>
        </div>

        <p className="mt-7 text-[13px] leading-[1.5] text-[#8c8c8c]">
          Or <Link href="/" className="font-semibold text-[#f14110] hover:underline">browse from the homepage</Link> - we&apos;ll find it together.
          </p>
      </section>
    </main>
  );
}
