"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { resolveMediaSetting } from "@/lib/platform-settings.mjs";

interface AdBannerProps {
  imageSrc?: string;
  alt?: string;
}

const MOBILE_VIDEO_FALLBACK_IMAGE = "/images/ad-kini-resort.png";

/**
 * Horizontal ad banner — 700×150px at full size.
 * On narrower viewports the banner scales down proportionally
 * (aspect-ratio: 700/150 keeps height relative to width).
 * Only shows if an ad image is uploaded via admin panel.
 */
export function AdBanner({ imageSrc: propImageSrc, alt = "Advertisement" }: AdBannerProps) {
  // Fetch ad media from platform settings
  const horizontalAdValue = useQuery(api.platformSettings.get, { key: "adHorizontal" });
  const horizontalAdState = resolveMediaSetting(horizontalAdValue, { url: "", type: "image" });
  const displayUrl = horizontalAdState.media.url || propImageSrc;
  const displayType = propImageSrc && !horizontalAdState.media.url ? "image" : horizontalAdState.media.type;

  // Don't show ad space if no ad media is uploaded
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
      {displayType === "video" ? (
        <>
          <Image
            src={MOBILE_VIDEO_FALLBACK_IMAGE}
            alt={alt}
            fill
            sizes="100vw"
            className="object-cover sm:hidden"
          />
          <div className="hidden h-full w-full sm:block">
            <AutoplayBannerVideo src={displayUrl} />
          </div>
        </>
      ) : (
        <Image
          src={displayUrl}
          alt={alt}
          fill
          sizes="(max-width: 700px) 100vw, 700px"
          style={{ objectFit: "cover" }}
          unoptimized={displayUrl.startsWith("data:")}
        />
      )}
    </div>
  );
}

function AutoplayBannerVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const playVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Mobile browsers may still block autoplay in battery/data saver modes.
      });
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.load();
    playVideo();

    const handleVisibilityChange = () => {
      if (!document.hidden) playVideo();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) playVideo();
      }, { threshold: 0.15 })
      : null;

    observer?.observe(video);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer?.disconnect();
    };
  }, [playVideo, src]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      className="h-full w-full object-cover"
      onCanPlay={playVideo}
      onLoadedData={playVideo}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
