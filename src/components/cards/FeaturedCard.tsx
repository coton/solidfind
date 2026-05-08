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
      <div className="relative w-[210px] h-[220px] bg-[#f8f8f8] rounded-[6px] overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
        {/* Background image with title overlay */}
        <div className="absolute top-0 left-0 right-0 h-[120px] rounded-t-[6px] flex items-end p-[10px]">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={articleTitle}
              fill
              sizes="210px"
              loading="eager"
              className="object-cover rounded-t-[6px]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#f14110] to-[#e9a28e]" />
          )}
          {/* Title overlaid on image */}
          <h3 className="relative z-10 font-semibold text-[16px] leading-[16px] tracking-[0.32px] text-white uppercase">
            {articleTitle}
          </h3>
        </div>

        {/* Description - same styling as WelcomeCard */}
        <div className="absolute top-[140px] left-[10px] right-[10px] bottom-[20px]">
          <p className="text-[11px] leading-[15px] tracking-[0.22px] text-[#333] font-bold line-clamp-4" style={{ fontFamily: "'Sora', sans-serif" }}>
            {articleDescription}
          </p>
        </div>
      </div>
    </Link>
  );
}
