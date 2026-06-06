"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { resolveTextSetting } from "@/lib/platform-settings.mjs";
import { useSiteLanguage } from "../LanguageProvider";

const DEFAULT_TEXT = "We help you find trusted professionals to build, renovate, design and shape the places you live in.";

export function WelcomeCard() {
  const { language } = useSiteLanguage();
  const aboutTitle = useQuery(api.platformSettings.get, { key: "aboutCardTitle" });
  const aboutTitleId = useQuery(api.platformSettings.get, { key: "aboutCardTitleId" });
  const aboutText = useQuery(api.platformSettings.get, { key: "aboutCardDescription" });
  const aboutTextId = useQuery(api.platformSettings.get, { key: "aboutCardDescriptionId" });
  const aboutImage = useQuery(api.platformSettings.get, { key: "aboutCardImageUrl" });
  const aboutTitleState = resolveTextSetting(aboutTitle, "SolidFind.id");
  const aboutTitleIdState = resolveTextSetting(aboutTitleId, aboutTitleState.value);
  const aboutTextState = resolveTextSetting(aboutText, DEFAULT_TEXT);
  const aboutTextIdState = resolveTextSetting(aboutTextId, aboutTextState.value);
  const title = language === "id" && aboutTitleIdState.value ? aboutTitleIdState.value : aboutTitleState.value;
  const description = language === "id" && aboutTextIdState.value ? aboutTextIdState.value : aboutTextState.value;
  const [titleMain, titleIdSuffix] = title.includes(".id") ? [title.replace(/\.id$/i, ""), ".id"] : [title, ""];
  const imageUrl = aboutImage || "";

  return (
    <Link href="/about" className="block">
      <article className="sf-pro-card sf-desktop-card sf-welcome-card">
        <div
          className="sf-pro-photo sf-about-art"
          style={imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
          {!imageUrl && (
            <Image src="/assets/solidfind-icon.svg" alt="" width={92} height={92} />
          )}
        </div>
        <div className="sf-pro-body">
          <h3 className="sf-pro-name sf-about-title">{titleMain}<span>{titleIdSuffix}</span></h3>
          <p className="sf-pro-desc">{description}</p>
          <div className="sf-pro-foot">
            <span className="sf-tag-mono">About</span>
            <span className="sf-pri-link">About →</span>
          </div>
        </div>
      </article>
      <article className="m-card-h m-card-feature sf-mobile-card">
        <div className="m-card-h-top">
          {imageUrl ? <div className="thumb m-feature-art" style={{ backgroundImage: `url(${imageUrl})` }} /> : <div className="thumb m-feature-art" />}
          <div className="body">
            <div className="m-card-head">
              <h3 className="m-card-name">{titleMain}<span style={{ color: "var(--sf-orange)" }}>{titleIdSuffix}</span></h3>
            </div>
            <div className="m-card-meta">About the platform</div>
            <p className="m-card-desc">{description}</p>
          </div>
        </div>
        <div className="m-card-foot">
          <span className="m-card-tag">About</span>
          <span className="m-card-view">Read →</span>
        </div>
      </article>
    </Link>
  );
}
