"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Building2, Flag, MessageSquare, Users, Menu, X, LogOut, ScrollText, Settings, Mail } from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/companies", label: "Companies", icon: Building2 },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/waitlist", label: "Waitlist", icon: Mail },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Skip auth check for the login page itself
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setAuthChecked(true);
      setIsAdmin(true); // Let login page render
      return;
    }

    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.isAdmin) {
          router.replace("/admin/login");
        } else {
          setIsAdmin(true);
        }
        setAuthChecked(true);
      })
      .catch(() => {
        router.replace("/admin/login");
        setAuthChecked(true);
      });
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  // Loading state
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#333] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Login page renders without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Not admin
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#e4e4e4] flex items-center justify-between px-4 z-40">
        <Link href="/" className="text-[16px] font-bold text-[#333] tracking-[0.32px]">
          SolidFind
        </Link>
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-[6px] hover:bg-[#f5f5f5] transition-colors"
        >
          <Menu className="w-5 h-5 text-[#333]" />
        </button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen w-[220px] bg-white border-r border-[#e4e4e4] flex flex-col z-50
          transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="p-5 border-b border-[#e4e4e4] flex items-center justify-between">
          <div>
            <Link href="/" className="text-[16px] font-bold text-[#333] tracking-[0.32px]">
              SolidFind
            </Link>
            <p className="text-[10px] text-[#333]/50 mt-1">Admin Panel</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden w-7 h-7 flex items-center justify-center rounded-[4px] hover:bg-[#f5f5f5]"
          >
            <X className="w-4 h-4 text-[#333]" />
          </button>
        </div>

        <nav className="flex-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
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
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[11px] text-[#333]/50 hover:text-red-500 transition-colors w-full"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto pt-18 md:pt-8">
        {children}
      </main>
    </div>
  );
}
