import Link from "next/link";

export function AccountGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export function AccountIconLink({
  href,
  label = "Account",
  className = "sf-icon-btn",
  title,
}: {
  href: string;
  label?: string;
  className?: string;
  title?: string;
}) {
  return (
    <Link className={className} aria-label={label} href={href} title={title}>
      <AccountGlyph />
    </Link>
  );
}
