"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Share2 } from "lucide-react";

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
        {/* Article Header Bar */}
        <div className="max-w-[900px] mx-auto px-5 sm:px-0 pt-6 pb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-[#e4e4e4] bg-white hover:border-[#333] transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-[#333]" />
            </button>
            <h1 className="flex-1 text-[16px] sm:text-[20px] font-bold text-[#333] tracking-[0.32px] uppercase" style={{ fontFamily: "'Sora', sans-serif" }}>
              {categoryLabel}
            </h1>
            <button
              onClick={handleShare}
              className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-[#e4e4e4] bg-white hover:border-[#333] transition-colors flex-shrink-0"
            >
              <Share2 className="w-4 h-4 text-[#333]" />
            </button>
          </div>
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
