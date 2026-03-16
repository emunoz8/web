import React, { useEffect, useRef } from "react";
import { ContentItem } from "../../lib/api";
import { EngagementSummary } from "../../lib/services/ContentPlatformService";
import ContentCard from "./ContentCard";

export type ContentFeedProps = {
  selectedCategoryLabel: string;
  scrollResetKey?: string;
  contentLoading: boolean;
  loadingMore: boolean;
  hasNextPage: boolean;
  contentError: string | null;
  items: ContentItem[];
  engagementById: Record<number, EngagementSummary>;
  emptyMessage: string;
  onOpenItem: (item: ContentItem) => void | Promise<void>;
  onLoadMore: () => Promise<void>;
  showEdit?: boolean;
  onEditItem?: (item: ContentItem) => void | Promise<void>;
  scrollWindow?: boolean;
};

const ContentFeed: React.FC<ContentFeedProps> = ({
  selectedCategoryLabel,
  scrollResetKey,
  contentLoading,
  loadingMore,
  hasNextPage,
  contentError,
  items,
  engagementById,
  emptyMessage,
  onOpenItem,
  onLoadMore,
  showEdit = false,
  onEditItem,
  scrollWindow = false,
}) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || loadingMore || contentLoading) {
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const node = sentinelRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);
        if (isVisible) {
          void onLoadMore();
        }
      },
      {
        root: scrollWindow ? scrollContainerRef.current : null,
        rootMargin: scrollWindow ? "160px 0px" : "300px 0px",
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, loadingMore, contentLoading, onLoadMore, scrollWindow]);

  useEffect(() => {
    if (!scrollWindow) {
      return;
    }

    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [scrollResetKey, scrollWindow]);

  const listRegionClassName = scrollWindow
    ? "min-h-0 flex-1 overflow-y-auto pr-1 overscroll-contain touch-pan-y"
    : "";
  const containerClassName = scrollWindow
    ? "border rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3 flex flex-col h-[56vh] sm:h-[58vh] md:h-[60vh] lg:h-[62vh]"
    : "border rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3";

  return (
    <div className={containerClassName}>
      <h2 className="font-semibold text-sm sm:text-base">{selectedCategoryLabel}</h2>

      {contentLoading && <p>Loading content...</p>}
      {contentError && <p className="text-red-500">Could not load content: {contentError}</p>}

      {!contentLoading && !contentError && items.length === 0 && <p>{emptyMessage}</p>}

      {(items.length > 0 || loadingMore || hasNextPage) && (
        <div ref={scrollWindow ? scrollContainerRef : undefined} className={listRegionClassName}>
          <ul className="space-y-2 sm:space-y-3">
            {items.map((item) => {
              const engagement = engagementById[item.id];
              return (
                <ContentCard
                  key={item.id}
                  item={item}
                  likesDisplay={engagement ? String(engagement.likes) : "..."}
                  commentsDisplay={engagement ? String(engagement.comments) : "..."}
                  liked={engagement?.likedByMe === true}
                  showEdit={showEdit}
                  onOpen={onOpenItem}
                  onEdit={onEditItem}
                />
              );
            })}
          </ul>

          {loadingMore && <p className="pt-2 text-sm opacity-80">Loading more...</p>}

          {!contentLoading && hasNextPage && (
            <div className="pt-2">
              <div ref={sentinelRef} className="h-2 w-full" aria-hidden="true" />
              <button className="btn text-sm" onClick={() => void onLoadMore()} disabled={loadingMore}>
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentFeed;
