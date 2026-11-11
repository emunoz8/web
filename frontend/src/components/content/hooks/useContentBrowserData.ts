import { useCallback, useMemo, useState } from "react";
import { CategoryDomain, CategoryItem, ContentItem } from "../../../lib/api";
import { EngagementSummary } from "../../../lib/services/ContentPlatformService";
import {
  getLocalContentById,
  listLocalCategories,
  listLocalContentsPage,
} from "../../../features/portfolio/data/localContent";
import {
  ContentCategorySelectionModel,
  ContentModalItemModel,
} from "../models/ContentBrowserModels";

type UseContentBrowserDataParams = {
  type: CategoryDomain;
  allCategoriesLabel: string;
};

type ContentBrowserViewerState = {
  isAdmin: boolean;
};

type ContentBrowserCategoryState = {
  categories: CategoryItem[];
  selected: string;
  selectedLabel: string;
  loading: boolean;
  error: string | null;
  setSelected: (value: string) => void;
};

type ContentBrowserFeedState = {
  items: ContentItem[];
  engagementById: Record<number, EngagementSummary>;
  loading: boolean;
  loadingMore: boolean;
  hasNextPage: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
};

type ContentBrowserModalState = {
  open: boolean;
  item: ContentItem | null;
  loading: boolean;
  error: string | null;
  openItem: (item: ContentItem) => Promise<void>;
  close: () => void;
  updateItem: (updated: ContentItem) => void;
};

type ContentBrowserRefreshActions = {
  categories: () => Promise<void>;
  items: () => Promise<void>;
  all: () => Promise<void>;
  engagement: () => Promise<void>;
};

export type UseContentBrowserDataResult = {
  viewer: ContentBrowserViewerState;
  category: ContentBrowserCategoryState;
  feed: ContentBrowserFeedState;
  modal: ContentBrowserModalState;
  refresh: ContentBrowserRefreshActions;
};

const PAGE_SIZE = 20;

const useContentBrowserData = ({
  type,
  allCategoriesLabel,
}: UseContentBrowserDataParams): UseContentBrowserDataResult => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<ContentItem | null>(null);

  const categories = useMemo(() => listLocalCategories(type), [type]);

  const pageData = useMemo(
    () =>
      listLocalContentsPage({
        type,
        category: selectedCategory || undefined,
        page: 0,
        size: PAGE_SIZE,
      }),
    [type, selectedCategory],
  );

  const selectedCategoryLabel = useMemo(() => {
    return new ContentCategorySelectionModel(allCategoriesLabel, categories, selectedCategory).selectedCategoryLabel;
  }, [allCategoriesLabel, categories, selectedCategory]);

  const openModal = useCallback(async (item: ContentItem) => {
    const resolved = getLocalContentById(item.id) ?? item;
    setModalItem(resolved);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const updateModalItem = useCallback((updated: ContentItem) => {
    setModalItem((current) => new ContentModalItemModel(current).withUpdatedContent(updated));
  }, []);

  const noopAsync = useCallback(async () => undefined, []);

  return {
    viewer: {
      isAdmin: false,
    },
    category: {
      categories,
      selected: selectedCategory,
      selectedLabel: selectedCategoryLabel,
      loading: false,
      error: null,
      setSelected: setSelectedCategory,
    },
    feed: {
      items: pageData.content,
      engagementById: {},
      loading: false,
      loadingMore: false,
      hasNextPage: false,
      error: null,
      loadMore: noopAsync,
    },
    modal: {
      open: isModalOpen,
      item: modalItem,
      loading: false,
      error: null,
      openItem: openModal,
      close: closeModal,
      updateItem: updateModalItem,
    },
    refresh: {
      categories: noopAsync,
      items: noopAsync,
      all: noopAsync,
      engagement: noopAsync,
    },
  };
};

export default useContentBrowserData;
