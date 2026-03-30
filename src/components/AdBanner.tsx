import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface AdBannerProps {
  imageSrc?: string;
  alt?: string;
}

/**
 * Horizontal ad banner — 700×150px at full size.
 * On narrower viewports the banner scales down proportionally
 * (aspect-ratio: 700/150 keeps height relative to width).
 * Only shows if an ad image is uploaded via admin panel.
 */
export function AdBanner({ imageSrc: propImageSrc, alt = "Advertisement" }: AdBannerProps) {
  // Fetch ad image from platform settings
  const horizontalAdValue = useQuery(api.platformSettings.get, { key: "adHorizontal" });
  const horizontalAdData = horizontalAdValue ? JSON.parse(horizontalAdValue) : null;
  const displayUrl = horizontalAdData?.url || propImageSrc;

  // Don't show ad space if no ad is uploaded
  if (!displayUrl) return null;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "700px",
        aspectRatio: "700 / 150",
        margin: "0 auto",
        borderRadius: "10px",
        overflow: "hidden",
        backgroundColor: "#d8d8d8",
      }}
    >
      <Image
        src={displayUrl}
        alt={alt}
        fill
        sizes="(max-width: 700px) 100vw, 700px"
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}
