"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";
import { AuthModal } from "@/components/AuthModal";
import { MobileMenuButton } from "@/components/MobileMenuDrawer";
import { useSiteLanguage } from "@/components/LanguageProvider";
import { AccountIconLink } from "@/components/AccountIcon";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type ArticleLanguage = "en" | "id";

type ArticleBlock = {
  type: string;
  text?: string;
  textId?: string;
  heading?: string;
  headingId?: string;
  imageId?: Id<"_storage">;
  imageUrl?: string;
  imageCaption?: string;
  imageCaptionId?: string;
  quote?: string;
  quoteId?: string;
  quoteAuthor?: string;
  quoteAuthorId?: string;
  videoUrl?: string;
  videoStorageId?: Id<"_storage">;
};

function localizedText(language: ArticleLanguage, enValue?: string, idValue?: string) {
  if (language === "id" && idValue?.trim()) return idValue;
  return enValue ?? "";
}

function localizedBlock(block: ArticleBlock, language: ArticleLanguage): ArticleBlock {
  return {
    ...block,
    text: localizedText(language, block.text, block.textId),
    heading: localizedText(language, block.heading, block.headingId),
    imageCaption: localizedText(language, block.imageCaption, block.imageCaptionId),
    quote: localizedText(language, block.quote, block.quoteId),
    quoteAuthor: localizedText(language, block.quoteAuthor, block.quoteAuthorId),
  };
}

function hasIndonesianArticleCopy(article: { titleId?: string; subtitleId?: string; contentBlocks?: ArticleBlock[] }) {
  if (article.titleId?.trim() || article.subtitleId?.trim()) return true;
  return (article.contentBlocks ?? []).some((block) => (
    block.textId?.trim() ||
    block.headingId?.trim() ||
    block.imageCaptionId?.trim() ||
    block.quoteId?.trim() ||
    block.quoteAuthorId?.trim()
  ));
}

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, setLanguage } = useSiteLanguage();
  const [authModalOpen, setAuthModalOpen] = useState(false);
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
    const articleHasIndonesianCopy = hasIndonesianArticleCopy(article as any);
    const articleLanguage = articleHasIndonesianCopy ? language : "en";
    const shareTitle = localizedText(articleLanguage, article.title, (article as any).titleId);
    const shareUrl = window.location.href;
    const shouldUseNativeShare =
      window.matchMedia("(max-width: 767px)").matches ||
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (shouldUseNativeShare && navigator.share) {
      await navigator.share({ title: shareTitle, url: shareUrl });
      return;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      return;
    }

    const input = document.createElement("input");
    input.value = shareUrl;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
  };

  const articleHasIndonesianCopy = hasIndonesianArticleCopy(article as any);
  const articleLanguage = articleHasIndonesianCopy ? language : "en";
  const displayArticle = {
    title: localizedText(articleLanguage, article.title, (article as any).titleId),
    subtitle: localizedText(articleLanguage, article.subtitle, (article as any).subtitleId),
    coverImageId: article.coverImageId,
    coverImageUrl: article.coverImageUrl,
  };
  const localizedBlocks = (article.contentBlocks as ArticleBlock[]).map((block) => localizedBlock(block, articleLanguage));
  const handleListServices = () => setAuthModalOpen(true);

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <main className="sf-about sf-article" data-screen-label="Article">
        <ArticleHero
          article={displayArticle}
          language={articleLanguage}
          showLanguageToggle={articleHasIndonesianCopy}
          onToggleLanguage={() => setLanguage(articleLanguage === "en" ? "id" : "en")}
          onListServices={handleListServices}
        />
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
                <p className="sf-article-meta-val">{Math.max(2, Math.ceil((localizedBlocks.length || 1) * 0.8))} min read</p>
              </div>
              <div className="sf-article-meta-block">
                <span className="sf-tag-mono">Share this story</span>
                <button type="button" className="sf-social-btn" onClick={handleShare} aria-label="Share article">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
                </button>
              </div>
            </aside>
            <div className="sf-article-col">
              {localizedBlocks
              .filter((block) => {
                if (block.type === "heading" && block.heading) {
                  const headingNorm = block.heading.toLowerCase().replace(/[^a-z0-9]/g, "");
                  const titleNorm = displayArticle.title.toLowerCase().replace(/[^a-z0-9]/g, "");
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
            <AdBanner alt="Advertisement" mobilePlaceholder placeholderWhenEmpty />
          </div>
        </div>
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="register"
        initialAccountType="company"
      />
      <Footer />
    </div>
  );
}

function ArticleHero({
  article,
  language,
  showLanguageToggle,
  onToggleLanguage,
  onListServices,
}: {
  article: { title: string; subtitle?: string; coverImageId?: Id<"_storage">; coverImageUrl?: string };
  language: ArticleLanguage;
  showLanguageToggle: boolean;
  onToggleLanguage: () => void;
  onListServices: () => void;
}) {
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
          {showLanguageToggle && (
            <button type="button" className="sf-lang" onClick={onToggleLanguage} aria-label={`Switch language to ${language === "en" ? "Indonesian" : "English"}`}>
              <span className={language === "en" ? "on" : ""}>EN</span>
              <span className={language === "id" ? "on" : ""}>ID</span>
            </button>
          )}
          <AccountIconLink href="/dashboard" />
          <button type="button" className="sf-btn sf-btn-pri sf-static-list-btn" onClick={onListServices}>List your services</button>
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

function ContentBlockRenderer({ block, isIntro = false }: { block: ArticleBlock; isIntro?: boolean }) {
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
