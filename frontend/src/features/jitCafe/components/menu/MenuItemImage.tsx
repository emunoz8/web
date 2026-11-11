import { useEffect, useState } from "react";
import { getJitCafeAssetPath } from "../../lib/paths";
import { cn } from "../../utils/cn";

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
    fallbackAsset: string;
  }
> = {
  hotDog: {
    backgroundClass: "brand-image-hotdog",
    fallbackAsset: "foodiesfeed-hot-dog.webp",
  },
  sausage: {
    backgroundClass: "brand-image-sausage",
    fallbackAsset: "foodiesfeed-sausage.webp",
  },
  burger: {
    backgroundClass: "brand-image-burger",
    fallbackAsset: "foodiesfeed-burger.webp",
  },
  sandwich: {
    backgroundClass: "brand-image-sandwich",
    fallbackAsset: "foodiesfeed-sandwich.webp",
  },
  beef: {
    backgroundClass: "brand-image-beef",
    fallbackAsset: "foodiesfeed-sandwich.webp",
  },
  fries: {
    backgroundClass: "brand-image-fries",
    fallbackAsset: "foodiesfeed-fries.webp",
  },
  snacks: {
    backgroundClass: "brand-image-snacks",
    fallbackAsset: "foodiesfeed-churros.webp",
  },
  drinks: {
    backgroundClass: "brand-image-drinks",
    fallbackAsset: "foodiesfeed-soda.webp",
  },
  shakes: {
    backgroundClass: "brand-image-shakes",
    fallbackAsset: "foodiesfeed-shake.webp",
  },
};

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
  const variantFallbackUrl = getJitCafeAssetPath(theme.fallbackAsset);
  const imageCandidates = [
    ...(imageUrl ? [imageUrl] : []),
    ...(imageUrl !== variantFallbackUrl ? [variantFallbackUrl] : []),
  ];
  const [imageCandidateIndex, setImageCandidateIndex] = useState(0);
  const activeImageSrc = imageCandidates[imageCandidateIndex];
  const accessibleLabel = imageAlt ?? `${itemName} from ${sectionName}`;

  useEffect(() => {
    setImageCandidateIndex(0);
  }, [itemName, imageUrl, variant]);

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
          alt={accessibleLabel}
          className="menu-item-image-media"
          decoding="async"
          loading={compact ? "eager" : "lazy"}
          onError={handleImageError}
        />
      ) : (
        <div
          role="img"
          aria-label={accessibleLabel}
          className={cn("menu-item-image-fallback", theme.backgroundClass)}
        />
      )}
      <div className="menu-item-image-overlay" />
      {!compact && featured ? (
        <div className="menu-item-image-featured">
          Featured item
        </div>
      ) : null}
    </div>
  );
}
