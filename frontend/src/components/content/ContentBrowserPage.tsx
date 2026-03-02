import React from "react";
import { CategoryDomain } from "../../lib/api";
import ContentModal from "../common/ContentModal";
import ContentBrowserHeader from "./ContentBrowserHeader";
import ContentCategoryFilter from "./ContentCategoryFilter";
import ContentFeed from "./ContentFeed";
import useContentBrowserData from "./hooks/useContentBrowserData";

type ContentBrowserPageProps = {
  title: string;
  subtitle: string;
  type: CategoryDomain;
  allCategoriesLabel: string;
  emptyMessage: string;
  adminPath?: string;
};

const ContentBrowserPage: React.FC<ContentBrowserPageProps> = ({
  title,
  subtitle,
  type,
  allCategoriesLabel,
  emptyMessage,
  adminPath,
}) => {
  const {
    isAdmin,
    categories,
    items,
    engagementById,
    selectedCategory,
    selectedCategoryLabel,
    categoryLoading,
    contentLoading,
    loadingMore,
    hasNextPage,
    categoryError,
    contentError,
    isModalOpen,
    modalItem,
    modalLoading,
    modalError,
    setSelectedCategory,
    openModal,
    closeModal,
    refreshEngagement,
    loadMore,
  } = useContentBrowserData({ type, allCategoriesLabel });

  return (
    <section className="p-3 sm:p-4 md:p-8 space-y-4 sm:space-y-5">
      <ContentBrowserHeader title={title} subtitle={subtitle} isAdmin={isAdmin} adminPath={adminPath} />

      <ContentCategoryFilter
        title={title}
        categories={categories}
        selectedCategory={selectedCategory}
        categoryLoading={categoryLoading}
        categoryError={categoryError}
        onSelectCategory={setSelectedCategory}
      />

      <ContentFeed
        selectedCategoryLabel={selectedCategoryLabel}
        contentLoading={contentLoading}
        loadingMore={loadingMore}
        hasNextPage={hasNextPage}
        contentError={contentError}
        items={items}
        engagementById={engagementById}
        emptyMessage={emptyMessage}
        onOpenItem={openModal}
        onLoadMore={loadMore}
      />

      <ContentModal
        open={isModalOpen}
        item={modalItem}
        loading={modalLoading}
        error={modalError}
        onClose={closeModal}
        onEngagementChanged={() => {
          void refreshEngagement();
        }}
      />
    </section>
  );
};

export default ContentBrowserPage;
