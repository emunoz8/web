import { useEffect, useRef, useState } from "react";
import { EmptyState } from "../components/feedback/EmptyState";
import {
  staticMenuSnapshot,
  type StaticMenuSnapshotSection,
} from "../data/staticMenuSnapshot";
import { MenuItemImage, type MenuImageVariant } from "../components/menu/MenuItemImage";
import { cn } from "../utils/cn";

const variantKeywords: Array<{ keywords: string[]; variant: MenuImageVariant }> = [
  { keywords: ["hot dog", "dog"], variant: "hotDog" },
  { keywords: ["sausage", "polish", "maxwell", "brat"], variant: "sausage" },
  { keywords: ["burger", "patty melt"], variant: "burger" },
  { keywords: ["chicken", "sandwich", "fish", "blt"], variant: "sandwich" },
  { keywords: ["beef", "combo"], variant: "beef" },
  { keywords: ["fries", "rings"], variant: "fries" },
  { keywords: ["shake", "malt", "float"], variant: "shakes" },
  {
    keywords: [
      "drink",
      "lemonade",
      "soda",
      "tea",
      "water",
      "beer",
      "lager",
      "ipa",
      "ale",
      "stout",
      "porter",
      "pilsner",
      "coffee",
      "espresso",
      "americano",
      "latte",
      "cappuccino",
      "mocha",
      "cold brew",
    ],
    variant: "drinks",
  },
];

function getMenuImageVariant(itemName: string, category: string, sectionName: string) {
  const haystack = `${category} ${sectionName} ${itemName}`.toLowerCase();
  const match = variantKeywords.find((entry) =>
    entry.keywords.some((keyword) => haystack.includes(keyword)),
  );

  return match?.variant ?? "snacks";
}

function sortSections(sections: StaticMenuSnapshotSection[]) {
  return [...sections]
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map((section) => ({
      ...section,
      items: [...section.items].sort((left, right) => left.name.localeCompare(right.name)),
    }));
}

type CategoryMenuItem = StaticMenuSnapshotSection["items"][number] & {
  category: string;
  key: string;
  sectionName: string;
};

type CategoryMenuGroup = {
  category: string;
  items: CategoryMenuItem[];
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

function formatPrice(amount: number) {
  return currencyFormatter.format(amount);
}

export function MenuPage() {
  const sectionsRef = useRef(sortSections(staticMenuSnapshot));
  const sections = sectionsRef.current;
  const [categoryClickOffset, setCategoryClickOffset] = useState(84);
  const [sectionScrollOffset, setSectionScrollOffset] = useState(132);
  const categoryLabelsRef = useRef<string[]>([]);
  const categoryHeaderRefs = useRef<Record<string, HTMLElement | null>>({});
  const scrollSnapTimeoutRef = useRef<number | null>(null);
  const autoSnapReleaseTimeoutRef = useRef<number | null>(null);
  const isAutoSnappingRef = useRef(false);
  const isTouchScrollingRef = useRef(false);
  const carouselRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    function updateScrollOffsets() {
      const navbarHeight =
        document.querySelector<HTMLElement>(".public-navbar")?.getBoundingClientRect().height ?? 0;
      const isSmallViewport = window.innerWidth < 640;
      const nextSectionOffset = Math.ceil(navbarHeight + (isSmallViewport ? 0 : 8));

      setSectionScrollOffset(nextSectionOffset);
      setCategoryClickOffset(Math.ceil(navbarHeight + (isSmallViewport ? 0 : 12)));
    }

    updateScrollOffsets();
    window.addEventListener("resize", updateScrollOffsets);

    return () => {
      window.removeEventListener("resize", updateScrollOffsets);
    };
  }, []);

  const categories = sections.reduce<string[]>((list, section) => {
    if (!list.includes(section.category)) {
      list.push(section.category);
    }

    return list;
  }, []);
  const featuredItems = sections.flatMap((section) =>
    section.items
      .filter((item) => item.featured)
      .map((item, itemIndex) => ({
        ...item,
        category: section.category,
        key: `${section.category}:${section.name}:${item.name}:${itemIndex}`,
        sectionName: section.name,
      })),
  );
  const realCategoryGroups: CategoryMenuGroup[] = categories.map((category) => {
    const sectionsInCategory = sections.filter((section) => section.category === category);
    const items = sectionsInCategory.flatMap((section) =>
      section.items.map((item, itemIndex) => ({
        ...item,
        category: section.category,
        key: `${section.category}:${section.name}:${item.name}:${itemIndex}`,
        sectionName: section.name,
      })),
    );

    return {
      category,
      items,
    };
  });
  const categoryGroups: CategoryMenuGroup[] =
    featuredItems.length > 0
      ? [
          {
            category: "Featured",
            items: featuredItems,
          },
          ...realCategoryGroups,
        ]
      : realCategoryGroups;
  const categoryLabels = categoryGroups.map((group) => group.category);
  const categoryLabelsKey = categoryLabels.join("|");
  categoryLabelsRef.current = categoryLabels;

  function getCategoryScrollTop(category: string, offset: number) {
    const target = categoryHeaderRefs.current[category];
    if (!target) {
      return null;
    }

    return Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
  }

  useEffect(() => {
    function snapToNearestCategory() {
      scrollSnapTimeoutRef.current = null;

      if (window.innerWidth >= 768 || isAutoSnappingRef.current || isTouchScrollingRef.current) {
        return;
      }

      const currentScrollTop = window.scrollY;
      const nearest = categoryLabelsRef.current.reduce<{
        category: string;
        distance: number;
        targetTop: number;
      } | null>((closest, category) => {
        const targetTop = getCategoryScrollTop(category, categoryClickOffset);
        if (targetTop === null) {
          return closest;
        }

        const distance = Math.abs(targetTop - currentScrollTop);
        if (!closest || distance < closest.distance) {
          return { category, distance, targetTop };
        }

        return closest;
      }, null);

      if (!nearest || nearest.distance < 44) {
        return;
      }

      isAutoSnappingRef.current = true;
      window.scrollTo({
        behavior: "smooth",
        top: nearest.targetTop,
      });

      if (autoSnapReleaseTimeoutRef.current !== null) {
        window.clearTimeout(autoSnapReleaseTimeoutRef.current);
      }

      autoSnapReleaseTimeoutRef.current = window.setTimeout(() => {
        isAutoSnappingRef.current = false;
        autoSnapReleaseTimeoutRef.current = null;
      }, 420);
    }

    function scheduleSnap(delay = 260) {
      if (scrollSnapTimeoutRef.current !== null) {
        window.clearTimeout(scrollSnapTimeoutRef.current);
      }

      scrollSnapTimeoutRef.current = window.setTimeout(snapToNearestCategory, delay);
    }

    function handleTouchStart() {
      isTouchScrollingRef.current = true;

      if (scrollSnapTimeoutRef.current !== null) {
        window.clearTimeout(scrollSnapTimeoutRef.current);
        scrollSnapTimeoutRef.current = null;
      }
    }

    function handleTouchEnd() {
      isTouchScrollingRef.current = false;
      scheduleSnap(280);
    }

    function handleScroll() {
      if (!isAutoSnappingRef.current) {
        scheduleSnap();
      }
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);

      if (scrollSnapTimeoutRef.current !== null) {
        window.clearTimeout(scrollSnapTimeoutRef.current);
        scrollSnapTimeoutRef.current = null;
      }

      if (autoSnapReleaseTimeoutRef.current !== null) {
        window.clearTimeout(autoSnapReleaseTimeoutRef.current);
        autoSnapReleaseTimeoutRef.current = null;
      }
    };
  }, [categoryClickOffset, categoryLabelsKey]);

  if (sections.length === 0) {
    return (
      <div className="menu-surface-state">
        <EmptyState
          title="Food menu is empty"
          description="No items are currently published for guests."
        />
      </div>
    );
  }

  function scrollTrack(track: HTMLDivElement | null, direction: -1 | 1) {
    if (!track) {
      return;
    }

    const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-menu-card='true']"));

    if (cards.length === 0) {
      return;
    }

    const currentScrollLeft = track.scrollLeft;
    const currentIndex = cards.reduce((closestIndex, card, index) => {
      const closestOffset = cards[closestIndex].offsetLeft;

      return Math.abs(card.offsetLeft - currentScrollLeft) < Math.abs(closestOffset - currentScrollLeft)
        ? index
        : closestIndex;
    }, 0);
    const targetIndex = Math.max(0, Math.min(cards.length - 1, currentIndex + direction));
    const targetCard = cards[targetIndex];
    const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
    const targetLeft = Math.max(0, Math.min(maxScrollLeft, targetCard.offsetLeft));

    track.scrollTo({
      behavior: "smooth",
      left: targetLeft,
    });
  }

  function scrollCategoryTrack(category: string, direction: -1 | 1) {
    const track = carouselRefs.current[category];

    scrollTrack(track, direction);
  }

  function renderMenuCard(item: CategoryMenuItem, keyPrefix = "", extraClassName = "") {
    return (
      <article
        key={`${keyPrefix}${item.key}`}
        data-menu-card="true"
        className={cn("menu-card", extraClassName)}
      >
        <MenuItemImage
          itemName={item.name}
          sectionName={item.sectionName}
          variant={getMenuImageVariant(item.name, item.category, item.sectionName)}
          featured={item.featured}
          imageAlt={item.imageAlt ?? undefined}
          imageUrl={item.imageUrl ?? undefined}
          className="menu-page-card-media"
        />
        <div className="menu-card-body">
          <div className="menu-card-copy">
            <div>
              <p className="menu-card-section-label">{item.sectionName}</p>
              <div className="menu-card-heading-row">
                <h4 className="menu-card-title">{item.name}</h4>
                <p className="menu-card-price-note">
                  From {formatPrice(item.basePrice)}
                </p>
              </div>
            </div>
            <p className="menu-card-description">{item.description}</p>
          </div>

          {item.featured ? (
            <div className="menu-card-meta">
              
            </div>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <div className="menu-page-shell">
      <div className="menu-page-group-list">
        {categoryGroups.map((group, groupIndex) => {
          return (
            <section
              key={group.category}
              className={cn(
                "menu-page-group",
                groupIndex > 0 ? "menu-page-group-separated" : undefined,
              )}
            >
              <div
                ref={(node) => {
                  categoryHeaderRefs.current[group.category] = node;
                }}
                style={{ scrollMarginTop: `${sectionScrollOffset}px` }}
                className="menu-page-group-header"
              >
                <div>
                  <p className="menu-page-group-eyebrow">Category</p>
                  <h2 className="menu-page-group-title">{group.category}</h2>
                </div>
              </div>

              <div className="menu-page-group-content">
                <div className="menu-page-section-meta">
                  <div className="menu-carousel-control-row">
                    <button
                      type="button"
                      onClick={() => scrollCategoryTrack(group.category, -1)}
                      className="menu-carousel-control"
                      aria-label={`Scroll ${group.category} carousel left`}
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollCategoryTrack(group.category, 1)}
                      className="menu-carousel-control"
                      aria-label={`Scroll ${group.category} carousel right`}
                    >
                      Next
                    </button>
                  </div>
                </div>

                <div className="menu-page-carousel-shell">
                  <div
                    ref={(node) => {
                      carouselRefs.current[group.category] = node;
                    }}
                    className="menu-carousel-viewport"
                  >
                    <div className="menu-carousel-track">
                      {group.items.map((item) =>
                        renderMenuCard(
                          item,
                          group.category === "Featured" ? "featured-" : "",
                          item.featured ? "menu-card-featured" : "",
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
