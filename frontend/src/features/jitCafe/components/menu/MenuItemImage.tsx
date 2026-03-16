import { useEffect, useState } from "react";
import { getJitCafeAssetPath } from "../../lib/paths";
import { cn } from "../../utils/cn";
import { menuImageSlugs } from "./menuImageSlugs";

export type MenuImageVariant =
  | "hotDog"
  | "sausage"
  | "burger"
  | "sandwich"
  | "beef"
  | "fries"
  | "snacks"
  | "drinks"
  | "shakes";

type MenuItemImageProps = {
  itemName: string;
  sectionName: string;
  variant: MenuImageVariant;
  featured?: boolean;
  imageUrl?: string;
  imageAlt?: string;
  className?: string;
  compact?: boolean;
};

const imageThemes: Record<
  MenuImageVariant,
  {
    backgroundClass: string;
  }
> = {
  hotDog: {
    backgroundClass: "brand-image-hotdog",
  },
  sausage: {
    backgroundClass: "brand-image-sausage",
  },
  burger: {
    backgroundClass: "brand-image-burger",
  },
  sandwich: {
    backgroundClass: "brand-image-sandwich",
  },
  beef: {
    backgroundClass: "brand-image-beef",
  },
  fries: {
    backgroundClass: "brand-image-fries",
  },
  snacks: {
    backgroundClass: "brand-image-snacks",
  },
  drinks: {
    backgroundClass: "brand-image-drinks",
  },
  shakes: {
    backgroundClass: "brand-image-shakes",
  },
};

function toAssetSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toFallbackImageCandidates(itemName: string) {
  const directSlug = toAssetSlug(itemName);
  const compactSlug = toAssetSlug(
    itemName.replace(/\b(and|with|the|a|an|of)\b/gi, " "),
  );
  const candidates = [directSlug, compactSlug].filter(
    (slug): slug is string => Boolean(slug) && menuImageSlugs.has(slug),
  );
  return [...new Set(candidates)].map((slug) => getJitCafeAssetPath(`${slug}.svg`));
}

export function MenuItemImage({
  itemName,
  sectionName,
  variant,
  featured = false,
  imageUrl,
  imageAlt,
  className,
  compact = false,
}: MenuItemImageProps) {
  const theme = imageThemes[variant];
  const imageCandidates = imageUrl
    ? [imageUrl, ...toFallbackImageCandidates(itemName)]
    : toFallbackImageCandidates(itemName);
  const [imageCandidateIndex, setImageCandidateIndex] = useState(0);
  const activeImageSrc = imageCandidates[imageCandidateIndex];

  useEffect(() => {
    setImageCandidateIndex(0);
  }, [itemName, imageUrl]);

  function handleImageError() {
    setImageCandidateIndex((current) => {
      if (current < imageCandidates.length - 1) {
        return current + 1;
      }

      return imageCandidates.length;
    });
  }

  return (
    <div
      className={cn(
        "menu-item-image",
        compact ? undefined : "menu-item-image-full",
        className,
      )}
    >
      <div className="menu-item-image-ambient" />
      {activeImageSrc ? (
        <img
          src={activeImageSrc}
          alt={imageAlt ?? `${itemName} from ${sectionName}`}
          className="menu-item-image-media"
          decoding="async"
          loading={compact ? "eager" : "lazy"}
          onError={handleImageError}
        />
      ) : (
        <div aria-hidden="true" className={cn("menu-item-image-fallback", theme.backgroundClass)} />
      )}
      <div className="menu-item-image-overlay" />
      {!compact && featured ? (
        <>
          <div className="menu-item-image-featured">
            Featured item
          </div>
        </>
      ) : null}
    </div>
  );
}
