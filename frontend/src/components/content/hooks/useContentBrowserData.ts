import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CategoryDomain, CategoryItem, ContentItem } from "../../../lib/api";
import { contentPlatformService, EngagementSummary } from "../../../lib/services/ContentPlatformService";
import { useAuth } from "../../../context/AuthContext";
import { publishTerminalTelemetry } from "../../../features/terminalUI/lib/terminalTelemetry";
import {
  ContentCategorySelectionModel,
  ContentFeedCollectionModel,
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

function buildContentListEndpoint(type: CategoryDomain, page: number, size: number, category?: string) {
  const query = new URLSearchParams({
    type,
    page: String(page),
    size: String(size),
  });

  if (category && category.trim() !== "") {
    query.set("category", category.trim());
  }

  return `/api/contents?${query.toString()}`;
}

const useContentBrowserData = ({
  type,
  allCategoriesLabel,
}: UseContentBrowserDataParams): UseContentBrowserDataResult => {
  const { authLoading, isAuthenticated, isAdmin } = useAuth();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [engagementById, setEngagementById] = useState<Record<number, EngagementSummary>>({});
  const [selectedCategory, setSelectedCategory] = useState("");

  const [categoryLoading, setCategoryLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<ContentItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const loadMoreLockRef = useRef(false);

  const loadCategories = useCallback(async (signal?: AbortSignal): Promise<void> => {
    try {
      setCategoryLoading(true);
      setCategoryError(null);
      const body = await contentPlatformService.listCategories(type, signal);
      setCategories(body);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setCategoryError((err as Error).message);
      }
    } finally {
      setCategoryLoading(false);
    }
  }, [type]);

  const hydrateEngagement = useCallback(
    async (targetItems: ContentItem[], replace: boolean, signal?: AbortSignal): Promise<void> => {
      if (targetItems.length === 0) {
        if (replace) {
          setEngagementById({});
        }
        return;
      }

      const next: Record<number, EngagementSummary> = {};
      try {
        await Promise.all(
          targetItems.map(async (item) => {
            try {
              next[item.id] = await contentPlatformService.getEngagementSummary(
                item.id,
                isAuthenticated,
                signal
              );
            } catch (err) {
              if ((err as Error).name === "AbortError") {
                throw err;
              }
              next[item.id] = {
                likes: 0,
                comments: 0,
                likedByMe: false,
              };
            }
          })
        );

        setEngagementById((current) => (replace ? next : { ...current, ...next }));
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          if (replace) {
            setEngagementById(next);
          } else {
            setEngagementById((current) => ({ ...current, ...next }));
          }
        }
      }
    },
    [isAuthenticated]
  );

  const loadFirstPage = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      try {
        setContentLoading(true);
        setContentError(null);
        setLoadingMore(false);
        loadMoreLockRef.current = false;

        const endpoint = buildContentListEndpoint(type, 0, PAGE_SIZE, selectedCategory || undefined);
        publishTerminalTelemetry({
          tone: "info",
          lines: [`backend :: GET ${endpoint}`],
        });

        const page = await contentPlatformService.listContentsPage({
          type,
          category: selectedCategory || undefined,
          page: 0,
          size: PAGE_SIZE,
          signal,
        });

        setItems(page.content);
        setCurrentPage(page.number);
        setHasNextPage(!page.last);
        setEngagementById(page.engagementById);
        publishTerminalTelemetry({
          tone: "success",
          lines: [
            `backend :: loaded ${page.numberOfElements} ${type.toLowerCase()} entr${page.numberOfElements === 1 ? "y" : "ies"} on page 1`,
            `backend :: total published ${type.toLowerCase()} entr${page.totalElements === 1 ? "y" : "ies"} :: ${page.totalElements}`,
          ],
        });
        const missingEngagementItems = new ContentFeedCollectionModel(page.content, page.engagementById).findItemsMissingEngagement();
        if (missingEngagementItems.length > 0) {
          await hydrateEngagement(missingEngagementItems, false, signal);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setContentError((err as Error).message);
          publishTerminalTelemetry({
            tone: "error",
            lines: [`backend :: content load failed :: ${(err as Error).message}`],
          });
          setItems([]);
          setEngagementById({});
          setCurrentPage(0);
          setHasNextPage(false);
        }
      } finally {
        setContentLoading(false);
      }
    },
    [selectedCategory, type, hydrateEngagement]
  );

  const loadMore = useCallback(async (): Promise<void> => {
    if (contentLoading || loadingMore || !hasNextPage) {
      return;
    }
    if (loadMoreLockRef.current) {
      return;
    }

    loadMoreLockRef.current = true;
    setLoadingMore(true);

    try {
      const nextPage = currentPage + 1;
      const page = await contentPlatformService.listContentsPage({
        type,
        category: selectedCategory || undefined,
        page: nextPage,
        size: PAGE_SIZE,
      });

      setItems((current) => ContentFeedCollectionModel.mergeUniqueById(current, page.content));
      setCurrentPage(page.number);
      setHasNextPage(!page.last);
      setEngagementById((current) => ({ ...current, ...page.engagementById }));
      const missingEngagementItems = new ContentFeedCollectionModel(page.content, page.engagementById).findItemsMissingEngagement();
      if (missingEngagementItems.length > 0) {
        await hydrateEngagement(missingEngagementItems, false);
      }
    } catch (err) {
      setContentError((err as Error).message);
    } finally {
      setLoadingMore(false);
      loadMoreLockRef.current = false;
    }
  }, [contentLoading, loadingMore, hasNextPage, currentPage, type, selectedCategory, hydrateEngagement]);

  useEffect(() => {
    const controller = new AbortController();
    loadCategories(controller.signal);
    return () => controller.abort();
  }, [loadCategories]);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    const controller = new AbortController();
    loadFirstPage(controller.signal);
    return () => controller.abort();
  }, [authLoading, loadFirstPage]);

  const selectedCategoryLabel = useMemo(() => {
    return new ContentCategorySelectionModel(allCategoriesLabel, categories, selectedCategory).selectedCategoryLabel;
  }, [allCategoriesLabel, categories, selectedCategory]);

  const openModal = async (item: ContentItem) => {
    setIsModalOpen(true);
    setModalItem(item);
    setModalLoading(true);
    setModalError(null);

    try {
      const body = await contentPlatformService.getContentById(item.id);
      setModalItem(body);
    } catch (err) {
      setModalError((err as Error).message);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalLoading(false);
    setModalError(null);
  };

  const updateModalItem = (updated: ContentItem) => {
    setModalItem((current) => new ContentModalItemModel(current).withUpdatedContent(updated));
  };

  return {
    viewer: {
      isAdmin,
    },
    category: {
      categories,
      selected: selectedCategory,
      selectedLabel: selectedCategoryLabel,
      loading: categoryLoading,
      error: categoryError,
      setSelected: setSelectedCategory,
    },
    feed: {
      items,
      engagementById,
      loading: contentLoading,
      loadingMore,
      hasNextPage,
      error: contentError,
      loadMore,
    },
    modal: {
      open: isModalOpen,
      item: modalItem,
      loading: modalLoading,
      error: modalError,
      openItem: openModal,
      close: closeModal,
      updateItem: updateModalItem,
    },
    refresh: {
      categories: async () => {
        await loadCategories();
      },
      items: async () => {
        await loadFirstPage();
      },
      all: async () => {
        await Promise.all([loadCategories(), loadFirstPage()]);
      },
      engagement: async () => {
        await hydrateEngagement(items, true);
      },
    },
  };
};

export default useContentBrowserData;
