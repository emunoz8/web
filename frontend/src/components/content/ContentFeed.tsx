import React, { useEffect, useRef } from "react";
import { ContentItem } from "../../lib/api";
import { EngagementSummary } from "../../lib/services/ContentPlatformService";
import ContentCard from "./ContentCard";

type ContentFeedProps = {
  selectedCategoryLabel: string;
  contentLoading: boolean;
  loadingMore: boolean;
  hasNextPage: boolean;
  contentError: string | null;
  items: ContentItem[];
  engagementById: Record<number, EngagementSummary>;
  emptyMessage: string;
  onOpenItem: (item: ContentItem) => void;
  onLoadMore: () => Promise<void>;
  showEdit?: boolean;
  onEditItem?: (item: ContentItem) => void;
};

const ContentFeed: React.FC<ContentFeedProps> = ({
  selectedCategoryLabel,
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
}) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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
      { rootMargin: "300px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, loadingMore, contentLoading, onLoadMore]);

  return (
    <div className="border rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
      <h2 className="font-semibold text-sm sm:text-base">{selectedCategoryLabel}</h2>

      {contentLoading && <p>Loading content...</p>}
      {contentError && <p className="text-red-500">Could not load content: {contentError}</p>}

      {!contentLoading && !contentError && items.length === 0 && <p>{emptyMessage}</p>}

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

      {loadingMore && <p className="text-sm opacity-80">Loading more...</p>}

      {!contentLoading && hasNextPage && (
        <div className="pt-2">
          <div ref={sentinelRef} className="h-2 w-full" aria-hidden="true" />
          <button className="btn text-sm" onClick={() => void onLoadMore()} disabled={loadingMore}>
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ContentFeed;
