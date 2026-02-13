import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-[#333] mb-4">404</h2>
        <p className="text-[#333]/70 mb-6">Page not found</p>
        <Link
          href="/"
          className="px-6 py-3 bg-[#f14110] text-white rounded-full hover:bg-[#d83a0e] transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
