"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const article = useQuery(
    api.featuredArticles.getById,
    id ? { id: id as Id<"featuredArticles"> } : "skip"
  );

  if (article === undefined) {
    return (
      <div className="min-h-screen bg-[#ececec] flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#333] border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (article === null) {
    return (
      <div className="min-h-screen bg-[#ececec] flex flex-col">
        <Header />
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

  const categoryLabel = article.category ? `FOCUS ON: ${article.category.toUpperCase()}` : article.title.toUpperCase();

  return (
    <div className="min-h-screen bg-[#ececec] flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Back + Share Row — consistent with profile page */}
        <div className="max-w-[900px] mx-auto px-4 sm:px-0">
          <div className="flex items-center justify-between mb-3 py-2 border-b border-[#333]/10">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors"
            >
              <svg width="8" height="5" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <path d="M1 5H15M1 5L5 1M1 5L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>BACK</span>
            </Link>

            <button onClick={handleShare} className="group flex items-center gap-2 text-[#333]/35 transition-colors relative">
              <span className="font-bam text-[9px]">Share</span>
              <svg width="15" height="20" viewBox="0 0 15.2353 20" fill="none" xmlns="http://www.w3.org/2000/svg"
                className="stroke-[#D8D8D8] group-hover:stroke-[#f14110] transition-colors"
                style={{ strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }}
              >
                <path d="M11.3071 8H12.7712C13.1595 8 13.5319 8.15444 13.8065 8.42936C14.081 8.70427 14.2353 9.07713 14.2353 9.46592V17.5341C14.2353 17.9229 14.081 18.2957 13.8065 18.5706C13.5319 18.8456 13.1595 19 12.7712 19H2.46408C2.07578 19 1.70339 18.8456 1.42882 18.5706C1.15425 18.2957 1 17.9229 1 17.5341V9.46592C1 9.07713 1.15425 8.70427 1.42882 8.42936C1.70339 8.15444 2.07578 8 2.46408 8H3.92816M10.5458 3.93183L7.61765 1M7.61765 1L4.68948 3.93183M7.61765 1V13.4682" />
              </svg>
            </button>
          </div>

          {/* Article Title */}
          <h1 className="text-[16px] sm:text-[20px] font-bold text-[#333] tracking-[0.32px] uppercase mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
            {categoryLabel}
          </h1>
        </div>

        {/* Cover Image */}
        <ArticleCoverImage coverImageId={article.coverImageId} coverImageUrl={article.coverImageUrl} title={article.title} />

        {/* Article Content */}
        <div className="max-w-[700px] mx-auto px-5 sm:px-0 py-8">
          {/* Intro: subtitle */}
          {article.subtitle && (
            <p className="text-[14px] leading-[22px] text-[#333]/70 mb-8" style={{ fontFamily: "'Sora', sans-serif" }}>
              {article.subtitle}
            </p>
          )}

          {/* Content Blocks */}
          <div className="space-y-8">
            {article.contentBlocks.map((block, index) => (
              <ContentBlockRenderer key={index} block={block} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
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

function ContentBlockRenderer({ block }: { block: { type: string; text?: string; heading?: string; imageId?: Id<"_storage">; imageUrl?: string; imageCaption?: string; quote?: string; quoteAuthor?: string } }) {
  if (block.type === "heading") {
    return (
      <h2 className="text-[20px] sm:text-[24px] font-bold text-[#333] leading-[28px] sm:leading-[32px]" style={{ fontFamily: "'Sora', sans-serif" }}>
        {block.heading}
      </h2>
    );
  }

  if (block.type === "text") {
    return (
      <p className="text-[13px] leading-[22px] text-[#333]/80" style={{ fontFamily: "'Sora', sans-serif", whiteSpace: "pre-wrap" }}>
        {block.text}
      </p>
    );
  }

  if (block.type === "image") {
    return <BlockImage imageId={block.imageId} imageUrl={block.imageUrl} caption={block.imageCaption} />;
  }

  if (block.type === "quote") {
    return (
      <blockquote className="border-l-[3px] border-[#f14110] pl-5 py-2">
        <p className="text-[15px] leading-[24px] text-[#333] italic" style={{ fontFamily: "'Sora', sans-serif" }}>
          &ldquo;{block.quote}&rdquo;
        </p>
        {block.quoteAuthor && (
          <p className="text-[12px] text-[#333]/50 mt-2 font-medium">
            — {block.quoteAuthor}
          </p>
        )}
      </blockquote>
    );
  }

  return null;
}

function BlockImage({ imageId, imageUrl, caption }: { imageId?: Id<"_storage">; imageUrl?: string; caption?: string }) {
  const url = useQuery(api.files.getUrl, imageId ? { storageId: imageId } : "skip");
  const displayUrl = url ?? imageUrl;

  if (!displayUrl) return null;
  return (
    <figure>
      <div className="rounded-[8px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={displayUrl} alt={caption || ""} className="w-full h-auto" />
      </div>
      {caption && (
        <figcaption className="text-[11px] text-[#333]/50 mt-2 italic">{caption}</figcaption>
      )}
    </figure>
  );
}
