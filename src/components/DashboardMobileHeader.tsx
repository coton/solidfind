"use client";

import Image from "next/image";
import Link from "next/link";
import { AccountIconLink } from "@/components/AccountIcon";

interface DashboardMobileHeaderProps {
  dashboardHref: string;
  onSignOut: () => void | Promise<void>;
  logoutLabel?: string;
}

export function DashboardMobileHeader({
  dashboardHref,
  onSignOut,
  logoutLabel = "Log out",
}: DashboardMobileHeaderProps) {
  return (
    <div className="sf-mobile-webkit-head sm:hidden">
      <div className="sf-mini-header sf-mini-header-dashboard is-visible">
        <Link href="/" className="sf-mini-brand">
          <Image
            src="/assets/solidfind-logo.svg"
            alt="SolidFind"
            width={136}
            height={20}
            className="h-[20px] w-auto"
          />
          <span className="sf-brand-id">.id</span>
        </Link>
        <div className="sf-mini-actions">
          <AccountIconLink
            href={dashboardHref}
            label="Dashboard"
            title="Dashboard"
            className="sf-icon-btn"
          />
          <button type="button" className="sf-btn sf-btn-pri sf-mini-logout" onClick={onSignOut}>
            {logoutLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
