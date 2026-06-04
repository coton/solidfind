"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { resolveTextSetting } from "@/lib/platform-settings.mjs";

const DEFAULT_TEXT = "We help you find trusted professionals to build, renovate, design and shape the places you live in.";

export function WelcomeCard() {
  const aboutText = useQuery(api.platformSettings.get, { key: "aboutCardDescription" });
  const aboutTextState = resolveTextSetting(aboutText, DEFAULT_TEXT);
  const description = aboutTextState.value;

  return (
    <Link href="/about" className="block">
      <article className="relative h-[320px] w-[210px] overflow-hidden rounded-[var(--sf-radius-lg)] border border-[var(--sf-border-1)] bg-[var(--sf-bg-surface)] shadow-[var(--sf-shadow-1)] transition duration-[var(--sf-dur-base)] ease-[var(--sf-ease-out)] hover:-translate-y-0.5 hover:shadow-[var(--sf-shadow-2)]">
        <div
          className="relative flex h-[156px] items-end p-4"
          style={{ background: "var(--sf-grad-hero)" }}
        >
          <div className="flex flex-col gap-4">
            <Image src="/images/logo-full-white.svg" alt="SolidFind.id" width={130} height={14} className="h-[14px] w-auto" />
            <p className="sf-tag-light">About SolidFind</p>
          </div>
        </div>
        <div className="p-4">
          <h3 className="mb-3 text-[18px] font-semibold leading-[var(--sf-lh-heading)] text-[var(--sf-fg-1)]">Find with context</h3>
          <p className="line-clamp-6 text-[13px] leading-[var(--sf-lh-body)] text-[var(--sf-fg-2)]">
            {description}
          </p>
        </div>
      </article>
    </Link>
  );
}
