import Link from "next/link";
import Image from "next/image";
import { Id } from "../../../convex/_generated/dataModel";

interface FeaturedCardProps {
  id?: string;
  href?: string;
  image?: string;
  title?: string;
  description?: string;
  fromCategory?: string;
  article?: { _id: Id<"featuredArticles">; title: string; subtitle?: string; coverImageId?: Id<"_storage">; coverImageUrl?: string; category?: string };
}

export function FeaturedCard({
  id,
  href,
  image,
  title,
  description = "Here goes the description of this first article, re-directing to a special page.",
  fromCategory,
  article,
}: FeaturedCardProps) {
  const articleId = article?._id || id;
  const articleTitle = article?.title || title || "FEATURED ARTICLE";
  const articleDescription = article?.subtitle || description;
  const linkHref = href ?? (articleId ? `/article/${articleId}${fromCategory ? `?from=${fromCategory}` : ''}` : "/about");
  const coverUrl = article?.coverImageUrl || image;

  return (
    <Link href={linkHref} className="block">
      <article className="relative h-[320px] w-[210px] overflow-hidden rounded-[var(--sf-radius-lg)] border border-[var(--sf-border-1)] bg-[var(--sf-bg-surface)] shadow-[var(--sf-shadow-1)] transition duration-[var(--sf-dur-base)] ease-[var(--sf-ease-out)] hover:-translate-y-0.5 hover:shadow-[var(--sf-shadow-2)]">
        <div className="relative h-[156px] p-4 flex items-end">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={articleTitle}
              fill
              sizes="210px"
              loading="eager"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[var(--sf-grad-hero)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          <p className="sf-tag-light absolute left-4 top-4">Editorial</p>
          <h3 className="relative z-10 line-clamp-3 text-[18px] font-semibold leading-[var(--sf-lh-heading)] text-white">
            {articleTitle}
          </h3>
        </div>
        <div className="p-4">
          <p className="mb-3 sf-tag-mono">Read next</p>
          <p className="line-clamp-5 text-[13px] leading-[var(--sf-lh-body)] text-[var(--sf-fg-2)]">
            {articleDescription}
          </p>
        </div>
      </article>
    </Link>
  );
}
