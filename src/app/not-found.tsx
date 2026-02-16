import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#ececec] flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <div className="text-[120px] font-bold text-[#f14110] leading-none mb-4">
            404
          </div>
          <h2 className="text-2xl font-semibold text-[#333] mb-3">
            Page Not Found
          </h2>
          <p className="text-[#333]/70 mb-8 text-[15px]">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-[#f14110] text-white rounded-full font-medium hover:bg-[#d83a0e] transition-all cursor-pointer text-center"
            >
              Return to Home
            </Link>
            <a
              href="mailto:support@solidfind.id?subject=Report%20Issue%20-%20404%20Page"
              className="px-6 py-3 bg-white text-[#333] rounded-full font-medium hover:bg-[#f5f5f5] transition-all cursor-pointer text-center border border-[#e4e4e4]"
            >
              Report Issue
            </a>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
