"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { LayoutDashboard, Building2, Flag } from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/companies", label: "Companies", icon: Building2 },
  { href: "/admin/reports", label: "Reports", icon: Flag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#333] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = userEmail && adminEmail && userEmail === adminEmail;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-[24px] font-bold text-[#333] mb-2">Access Denied</h1>
          <p className="text-[13px] text-[#333]/60 mb-6">
            You do not have permission to access the admin panel.
          </p>
          <Link
            href="/"
            className="inline-flex items-center h-10 px-6 rounded-full bg-[#333] text-white text-[12px] font-medium hover:bg-[#555] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      {/* Sidebar */}
      <aside className="w-[220px] bg-white border-r border-[#e4e4e4] flex flex-col">
        <div className="p-5 border-b border-[#e4e4e4]">
          <Link href="/" className="text-[16px] font-bold text-[#333] tracking-[0.32px]">
            SolidFind
          </Link>
          <p className="text-[10px] text-[#333]/50 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-[12px] font-medium transition-colors mb-1 ${
                  isActive
                    ? "bg-[#333] text-white"
                    : "text-[#333]/70 hover:bg-[#f5f5f5] hover:text-[#333]"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#e4e4e4]">
          <p className="text-[9px] text-[#333]/40 truncate">{userEmail}</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
