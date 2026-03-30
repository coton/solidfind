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
 */
export function AdBanner({ imageSrc: propImageSrc, alt = "Advertisement" }: AdBannerProps) {
  // Fetch ad image from platform settings
  const horizontalAdValue = useQuery(api.platformSettings.get, { key: "adHorizontal" });
  const horizontalAdData = horizontalAdValue ? JSON.parse(horizontalAdValue) : null;
  const defaultValue = propImageSrc || "/images/ad-kini-resort.png";
  const displayUrl = horizontalAdData?.url || propImageSrc || defaultValue;

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
      {displayUrl ? (
        <Image
          src={displayUrl}
          alt={alt}
          fill
          sizes="(max-width: 700px) 100vw, 700px"
          style={{ objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
            fontSize: "13px",
          }}
        >
          Ad Space — 700 × 150 px
        </div>
      )}
    </div>
  );
}
