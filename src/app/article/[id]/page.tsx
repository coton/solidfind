"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";
import { MobileMenuButton } from "@/components/MobileMenuDrawer";
import Image from "next/image";
import Link from "next/link";

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const fromCategory = searchParams?.get("from");

  const article = useQuery(
    api.featuredArticles.getById,
    id ? { id: id as Id<"featuredArticles"> } : "skip"
  );

  if (article === undefined) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
        <main className="flex-grow flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#333] border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (article === null) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-[14px] text-[#333]/50 mb-4">Article not found.</p>
            <button onClick={() => router.push("/")} className="text-[12px] text-[#333] underline">Back to home</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: article.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <main className="sf-about sf-article" data-screen-label="Article">
        <ArticleHero article={article} />
        <div className="sf-article-wrap">
          <Link className="sf-about-back" href={fromCategory ? `/dashboard/${fromCategory}` : "/"}>← Back</Link>
          <div className="sf-article-grid">
            <aside className="sf-article-meta">
              <div className="sf-article-meta-block">
                <span className="sf-tag-mono">Filed under</span>
                <div className="sf-article-cats">
                  {["Journal"].map((category) => <span key={category}>{category}</span>)}
                </div>
              </div>
              <div className="sf-article-meta-block">
                <span className="sf-tag-mono">Reading time</span>
                <p className="sf-article-meta-val">{Math.max(2, Math.ceil((article.contentBlocks?.length ?? 1) * 0.8))} min read</p>
              </div>
              <div className="sf-article-meta-block">
                <span className="sf-tag-mono">Share this story</span>
                <button type="button" className="sf-social-btn" onClick={handleShare} aria-label="Share article">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
                </button>
              </div>
            </aside>
            <div className="sf-article-col">
              {article.contentBlocks
              .filter((block) => {
                if (block.type === "heading" && block.heading) {
                  const headingNorm = block.heading.toLowerCase().replace(/[^a-z0-9]/g, "");
                  const titleNorm = article.title.toLowerCase().replace(/[^a-z0-9]/g, "");
                  // Also check with "focus on:" prefix removed
                  const headingClean = headingNorm.replace(/^focuson/, "");
                  const titleClean = titleNorm.replace(/^focuson/, "");
                  if (headingNorm === titleNorm || headingClean === titleClean || headingNorm === titleClean || headingClean === titleNorm) {
                    return false;
                  }
                }
                return true;
              })
              .map((block, index) => (
              <ContentBlockRenderer key={index} block={block} isIntro={index === 0 && block.type === "text"} />
            ))}
              <button className="sf-about-back sf-legal-totop" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑ Back to top</button>
            </div>
          </div>
          <div className="sf-ad sf-ad-banner">
            <AdBanner alt="Advertisement" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ArticleHero({ article }: { article: { title: string; subtitle?: string; coverImageId?: Id<"_storage">; coverImageUrl?: string } }) {
  const url = useQuery(api.files.getUrl, article.coverImageId ? { storageId: article.coverImageId } : "skip");
  const displayUrl = url ?? article.coverImageUrl ?? "/assets/company-cover-fallback.jpg";

  return (
    <div className="sf-article-hero" style={{ backgroundImage: `url(${displayUrl})` }}>
      <div className="sf-article-hero-shade" aria-hidden="true" />
      <div className="sf-about-hero-bar">
        <Link className="sf-shell-brand" href="/">
          <Image src="/assets/solidfind-logo.svg" alt="SolidFind" width={136} height={20} />
          <span className="sf-brand-id sf-about-hero-id">.id</span>
        </Link>
        <div className="sf-shell-actions">
          <Link className="sf-icon-btn" aria-label="Account" href="/dashboard">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </Link>
          <Link className="sf-btn sf-btn-pri sf-static-list-btn" href="/register-business">List your services</Link>
          <MobileMenuButton />
        </div>
      </div>
      <div className="sf-article-hero-copy">
        <span className="sf-tag-light">Journal</span>
        <h1>{article.title}</h1>
        {article.subtitle && <p>{article.subtitle}</p>}
      </div>
    </div>
  );
}

function ArticleCoverImage({ coverImageId, coverImageUrl, title }: { coverImageId?: Id<"_storage">; coverImageUrl?: string; title: string }) {
  const url = useQuery(api.files.getUrl, coverImageId ? { storageId: coverImageId } : "skip");
  const displayUrl = url ?? coverImageUrl;

  if (!displayUrl) return null;
  return (
    <div className="max-w-[900px] mx-auto px-5 sm:px-0">
      <div className="rounded-[8px] overflow-hidden aspect-[21/9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={displayUrl} alt={title} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

function ContentBlockRenderer({ block, isIntro = false }: { block: { type: string; text?: string; heading?: string; imageId?: Id<"_storage">; imageUrl?: string; imageCaption?: string; quote?: string; quoteAuthor?: string; videoUrl?: string; videoStorageId?: Id<"_storage"> }; isIntro?: boolean }) {
  if (block.type === "heading") {
    return (
      <h2 className="sf-article-h2">
        {block.heading}
      </h2>
    );
  }

  if (block.type === "text") {
    return (
      <p className={`sf-article-p ${isIntro ? "sf-article-intro" : ""}`}>
        {block.text}
      </p>
    );
  }

  if (block.type === "image") {
    return <BlockImage imageId={block.imageId} imageUrl={block.imageUrl} caption={block.imageCaption} />;
  }

  if (block.type === "quote") {
    return (
      <blockquote className="sf-article-quote">
        <p>
          &ldquo;{block.quote}&rdquo;
        </p>
        {block.quoteAuthor && (
          <p className="sf-article-caption">
            — {block.quoteAuthor}
          </p>
        )}
      </blockquote>
    );
  }

  if (block.type === "video") {
    return <BlockVideo videoStorageId={block.videoStorageId} videoUrl={block.videoUrl} />;
  }

  return null;
}

function BlockImage({ imageId, imageUrl, caption }: { imageId?: Id<"_storage">; imageUrl?: string; caption?: string }) {
  const url = useQuery(api.files.getUrl, imageId ? { storageId: imageId } : "skip");
  const displayUrl = url ?? imageUrl;

  if (!displayUrl) return null;
  return (
    <figure className="sf-article-fig">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={displayUrl} alt={caption || ""} className="w-full h-auto" />
      </div>
      {caption && (
        <figcaption>{caption}</figcaption>
      )}
    </figure>
  );
}

function BlockVideo({ videoStorageId, videoUrl }: { videoStorageId?: Id<"_storage">; videoUrl?: string }) {
  const url = useQuery(api.files.getUrl, videoStorageId ? { storageId: videoStorageId } : "skip");
  const displayUrl = url ?? videoUrl;

  if (!displayUrl) return null;
  return (
    <div className="sf-article-fig">
      <video src={displayUrl} controls className="w-full" />
    </div>
  );
}
