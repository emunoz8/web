import type { CategoryItem, ContentItem } from "../../../../lib/api";
import type { EngagementSummary } from "../../../../lib/services/ContentPlatformService";
import type { UseContentBrowserDataResult } from "../../hooks/useContentBrowserData";
import { buildAdminContentPageProps } from "./AdminContentPageViewModel";

const categoryItems: CategoryItem[] = [
  {
    id: 1,
    domain: "BLOG",
    slug: "java",
    label: "Java",
    createdAt: "2026-03-10T00:00:00Z",
  },
];

const contentItems: ContentItem[] = [
  {
    id: 20,
    title: "Post",
    slug: "post",
    createdAt: "2026-03-10T00:00:00Z",
    type: "BLOG",
  },
];

const engagementById: Record<number, EngagementSummary> = {
  20: {
    likes: 2,
    comments: 1,
    likedByMe: false,
  },
};

function createBrowserStub(): UseContentBrowserDataResult {
  return {
    viewer: {
      isAdmin: true,
    },
    category: {
      categories: categoryItems,
      selected: "java",
      selectedLabel: "Java",
      loading: false,
      error: null,
      setSelected: jest.fn(),
    },
    feed: {
      items: contentItems,
      engagementById,
      loading: false,
      loadingMore: false,
      hasNextPage: true,
      error: null,
      loadMore: jest.fn(async () => undefined),
    },
    modal: {
      open: true,
      item: contentItems[0],
      loading: false,
      error: null,
      openItem: jest.fn(async () => undefined),
      close: jest.fn(),
      updateItem: jest.fn(),
    },
    refresh: {
      categories: jest.fn(async () => undefined),
      items: jest.fn(async () => undefined),
      all: jest.fn(async () => undefined),
      engagement: jest.fn(async () => undefined),
    },
  };
}

describe("buildAdminContentPageProps", () => {
  it("maps shared admin page props from the browser state", () => {
    const browser = createBrowserStub();
    const onEditItem = jest.fn();
    const pageProps = buildAdminContentPageProps({
      title: "Blog Admin",
      subtitle: "Create and edit blog content.",
      userViewPath: "/blog",
      filterTitle: "Blog",
      emptyMessage: "No blog posts found for this category yet.",
      browser,
      onEditItem,
    });

    expect(pageProps.headerProps).toEqual({
      title: "Blog Admin",
      subtitle: "Create and edit blog content.",
      userViewPath: "/blog",
    });
    expect(pageProps.categoryFilterProps).toEqual({
      title: "Blog",
      categories: categoryItems,
      selectedCategory: "java",
      categoryLoading: false,
      categoryError: null,
      onSelectCategory: browser.category.setSelected,
    });
    expect(pageProps.feedProps).toEqual({
      selectedCategoryLabel: "Java",
      contentLoading: false,
      loadingMore: false,
      hasNextPage: true,
      contentError: null,
      items: contentItems,
      engagementById,
      emptyMessage: "No blog posts found for this category yet.",
      onOpenItem: browser.modal.openItem,
      onLoadMore: browser.feed.loadMore,
      showEdit: true,
      onEditItem,
    });
  });

  it("delegates engagement refresh from modal props", () => {
    const browser = createBrowserStub();
    const pageProps = buildAdminContentPageProps({
      title: "Projects Admin",
      subtitle: "Create and edit project content.",
      userViewPath: "/projects",
      filterTitle: "Projects",
      emptyMessage: "No projects found for this category yet.",
      browser,
      onEditItem: jest.fn(),
    });

    pageProps.modalProps.onEngagementChanged?.();

    expect(browser.refresh.engagement).toHaveBeenCalledTimes(1);
  });
});
