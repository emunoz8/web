import React, { useEffect, useState } from "react";
import { CategoryDomain } from "../../lib/api";
import ContentModal from "../common/ContentModal";
import ContentBrowserHeader from "./ContentBrowserHeader";
import ContentCategoryFilter from "./ContentCategoryFilter";
import ContentFeed from "./ContentFeed";
import RetroBootLoader from "./RetroBootLoader";
import useContentBrowserData from "./hooks/useContentBrowserData";

type ContentBrowserPageProps = {
  title: string;
  subtitle: string;
  type: CategoryDomain;
  allCategoriesLabel: string;
  emptyMessage: string;
  adminPath?: string;
};

const BOOT_LOADER_DELAY_MS = 300;

const ContentBrowserPage: React.FC<ContentBrowserPageProps> = ({
  title,
  subtitle,
  type,
  allCategoriesLabel,
  emptyMessage,
  adminPath,
}) => {
  const browser = useContentBrowserData({ type, allCategoriesLabel });
  const [bootLoaderVisible, setBootLoaderVisible] = useState(false);

  const isInitialContentPending =
    browser.feed.items.length === 0 &&
    (browser.category.loading || browser.feed.loading) &&
    !browser.category.error &&
    !browser.feed.error;

  useEffect(() => {
    if (!isInitialContentPending) {
      setBootLoaderVisible(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setBootLoaderVisible(true);
    }, BOOT_LOADER_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [isInitialContentPending]);

  const showInitialLoader = isInitialContentPending && bootLoaderVisible;

  if (showInitialLoader) {
    return (
      <section className="p-3 sm:p-4 md:p-8">
        <RetroBootLoader title={title} />
      </section>
    );
  }

  return (
    <section className="p-3 sm:p-4 md:p-8 space-y-4 sm:space-y-5">
      <ContentBrowserHeader title={title} subtitle={subtitle} isAdmin={browser.viewer.isAdmin} adminPath={adminPath} />

      <ContentCategoryFilter
        title={title}
        categories={browser.category.categories}
        selectedCategory={browser.category.selected}
        categoryLoading={browser.category.loading}
        categoryError={browser.category.error}
        onSelectCategory={browser.category.setSelected}
      />

      <ContentFeed
        selectedCategoryLabel={browser.category.selectedLabel}
        scrollResetKey={browser.category.selected}
        contentLoading={browser.feed.loading}
        loadingMore={browser.feed.loadingMore}
        hasNextPage={browser.feed.hasNextPage}
        contentError={browser.feed.error}
        items={browser.feed.items}
        engagementById={browser.feed.engagementById}
        emptyMessage={emptyMessage}
        onOpenItem={browser.modal.openItem}
        onLoadMore={browser.feed.loadMore}
        scrollWindow
      />

      <ContentModal
        open={browser.modal.open}
        item={browser.modal.item}
        loading={browser.modal.loading}
        error={browser.modal.error}
        onClose={browser.modal.close}
        onEngagementChanged={() => {
          void browser.refresh.engagement();
        }}
      />
    </section>
  );
};

export default ContentBrowserPage;
