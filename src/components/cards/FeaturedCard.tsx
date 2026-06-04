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
      <article className="sf-pro-card sf-feature-card">
        <div className="sf-pro-photo">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={articleTitle}
              fill
              sizes="(max-width: 640px) 78vw, 260px"
              loading="eager"
              className="object-cover"
            />
          ) : (
            <div className="sf-feature-fallback" />
          )}
        </div>
        <div className="sf-pro-body">
          <h3 className="sf-pro-name">{articleTitle}</h3>
          <p className="sf-pro-desc">{articleDescription}</p>
          <div className="sf-pro-foot">
            <span className="sf-tag-mono">Article</span>
            <span className="sf-pri-link">Read →</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
