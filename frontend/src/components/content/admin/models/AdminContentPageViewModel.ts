import type { ContentItem } from "../../../../lib/api";
import type { ContentModalProps } from "../../../common/ContentModal";
import type { ContentCategoryFilterProps } from "../../ContentCategoryFilter";
import type { ContentFeedProps } from "../../ContentFeed";
import type { UseContentBrowserDataResult } from "../../hooks/useContentBrowserData";
import type { AdminPageHeaderProps } from "../AdminPageHeader";

type BuildAdminContentPagePropsParams = {
  title: string;
  subtitle: string;
  userViewPath: string;
  filterTitle: string;
  emptyMessage: string;
  browser: UseContentBrowserDataResult;
  onEditItem: (item: ContentItem) => void | Promise<void>;
};

export type AdminContentPageProps = {
  headerProps: AdminPageHeaderProps;
  categoryFilterProps: ContentCategoryFilterProps;
  feedProps: ContentFeedProps;
  modalProps: ContentModalProps;
};

export function buildAdminContentPageProps(
  params: BuildAdminContentPagePropsParams,
): AdminContentPageProps {
  return {
    headerProps: {
      title: params.title,
      subtitle: params.subtitle,
      userViewPath: params.userViewPath,
    },
    categoryFilterProps: {
      title: params.filterTitle,
      categories: params.browser.category.categories,
      selectedCategory: params.browser.category.selected,
      categoryLoading: params.browser.category.loading,
      categoryError: params.browser.category.error,
      onSelectCategory: params.browser.category.setSelected,
    },
    feedProps: {
      selectedCategoryLabel: params.browser.category.selectedLabel,
      contentLoading: params.browser.feed.loading,
      loadingMore: params.browser.feed.loadingMore,
      hasNextPage: params.browser.feed.hasNextPage,
      contentError: params.browser.feed.error,
      items: params.browser.feed.items,
      engagementById: params.browser.feed.engagementById,
      emptyMessage: params.emptyMessage,
      onOpenItem: params.browser.modal.openItem,
      onLoadMore: params.browser.feed.loadMore,
      showEdit: true,
      onEditItem: params.onEditItem,
    },
    modalProps: {
      open: params.browser.modal.open,
      item: params.browser.modal.item,
      loading: params.browser.modal.loading,
      error: params.browser.modal.error,
      onClose: params.browser.modal.close,
      onEngagementChanged: () => {
        void params.browser.refresh.engagement();
      },
    },
  };
}
