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
      <article className="sf-pro-card sf-about-card">
        <div className="sf-about-art">
          <Image src="/assets/solidfind-icon.svg" alt="" width={92} height={92} />
        </div>
        <div className="sf-pro-body">
          <h3 className="sf-about-title">SolidFind<span>.id</span></h3>
          <p className="sf-pro-desc">{description}</p>
          <div className="sf-pro-foot">
            <span>About</span>
            <span>{"About ->"}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
