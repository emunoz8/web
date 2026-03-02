import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CategoryDomain, CategoryItem, ContentItem } from "../../../lib/api";
import { contentPlatformService, EngagementSummary } from "../../../lib/services/ContentPlatformService";
import { useAuth } from "../../../context/AuthContext";

type UseContentBrowserDataParams = {
  type: CategoryDomain;
  allCategoriesLabel: string;
};

type UseContentBrowserDataResult = {
  isAdmin: boolean;
  categories: CategoryItem[];
  items: ContentItem[];
  engagementById: Record<number, EngagementSummary>;
  selectedCategory: string;
  selectedCategoryLabel: string;
  categoryLoading: boolean;
  contentLoading: boolean;
  loadingMore: boolean;
  hasNextPage: boolean;
  categoryError: string | null;
  contentError: string | null;
  isModalOpen: boolean;
  modalItem: ContentItem | null;
  modalLoading: boolean;
  modalError: string | null;
  setSelectedCategory: (value: string) => void;
  openModal: (item: ContentItem) => Promise<void>;
  closeModal: () => void;
  updateModalItem: (updated: ContentItem) => void;
  refreshCategories: () => Promise<void>;
  refreshItems: () => Promise<void>;
  refreshAll: () => Promise<void>;
  refreshEngagement: () => Promise<void>;
  loadMore: () => Promise<void>;
};

const PAGE_SIZE = 20;

const useContentBrowserData = ({
  type,
  allCategoriesLabel,
}: UseContentBrowserDataParams): UseContentBrowserDataResult => {
  const { isAuthenticated, isAdmin, token } = useAuth();

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
  const itemsRef = useRef<ContentItem[]>([]);

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
                isAuthenticated ? token : null,
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
    [isAuthenticated, token]
  );

  const loadFirstPage = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      try {
        setContentLoading(true);
        setContentError(null);
        setLoadingMore(false);
        loadMoreLockRef.current = false;

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
        await hydrateEngagement(page.content, true, signal);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setContentError((err as Error).message);
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

      setItems((current) => {
        if (page.content.length === 0) {
          return current;
        }

        const byId = new Map<number, ContentItem>();
        current.forEach((item) => byId.set(item.id, item));
        page.content.forEach((item) => byId.set(item.id, item));
        return Array.from(byId.values());
      });
      setCurrentPage(page.number);
      setHasNextPage(!page.last);
      await hydrateEngagement(page.content, false);
    } catch (err) {
      setContentError((err as Error).message);
    } finally {
      setLoadingMore(false);
      loadMoreLockRef.current = false;
    }
  }, [contentLoading, loadingMore, hasNextPage, currentPage, type, selectedCategory, hydrateEngagement]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    const controller = new AbortController();
    loadCategories(controller.signal);
    return () => controller.abort();
  }, [loadCategories]);

  useEffect(() => {
    const controller = new AbortController();
    loadFirstPage(controller.signal);
    return () => controller.abort();
  }, [loadFirstPage]);

  useEffect(() => {
    const currentItems = itemsRef.current;
    if (currentItems.length === 0) {
      return;
    }
    const controller = new AbortController();
    hydrateEngagement(currentItems, true, controller.signal);
    return () => controller.abort();
  }, [isAuthenticated, token, hydrateEngagement]); // refresh like state when auth state changes

  const selectedCategoryLabel = useMemo(() => {
    if (!selectedCategory) {
      return allCategoriesLabel;
    }
    const category = categories.find((item) => item.slug === selectedCategory);
    return category ? category.label : selectedCategory;
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
    setModalItem((current) => {
      if (!current || current.id !== updated.id) {
        return current;
      }
      return updated;
    });
  };

  return {
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
    updateModalItem,
    refreshCategories: async () => {
      await loadCategories();
    },
    refreshItems: async () => {
      await loadFirstPage();
    },
    refreshAll: async () => {
      await Promise.all([loadCategories(), loadFirstPage()]);
    },
    refreshEngagement: async () => {
      await hydrateEngagement(items, true);
    },
    loadMore,
  };
};

export default useContentBrowserData;
