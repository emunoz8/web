import { FormEvent, useState } from "react";
import { ContentItem } from "../../../../lib/api";
import { contentPlatformService } from "../../../../lib/services/ContentPlatformService";

type UseAdminBlogEditorParams = {
  isAdmin: boolean;
  token: string | null;
  refreshAll: () => Promise<void>;
  onUpdatedContent?: (updated: ContentItem) => void;
};

type UseAdminBlogEditorResult = {
  createTitle: string;
  setCreateTitle: (value: string) => void;
  createSlug: string;
  setCreateSlug: (value: string) => void;
  createBodyMd: string;
  setCreateBodyMd: (value: string) => void;
  createCategoryId: string;
  setCreateCategoryId: (value: string) => void;
  newCategoryLabel: string;
  setNewCategoryLabel: (value: string) => void;
  newCategorySlug: string;
  setNewCategorySlug: (value: string) => void;
  createLoading: boolean;
  createError: string | null;
  createSuccess: string | null;
  createBlogPost: (event: FormEvent) => Promise<void>;
  editId: number | null;
  editTitle: string;
  setEditTitle: (value: string) => void;
  editSlug: string;
  setEditSlug: (value: string) => void;
  editBodyMd: string;
  setEditBodyMd: (value: string) => void;
  editLoading: boolean;
  editError: string | null;
  editSuccess: string | null;
  beginEdit: (post: ContentItem) => Promise<void>;
  cancelEdit: () => void;
  submitEditBlogPost: (event: FormEvent) => Promise<void>;
};

const useAdminBlogEditor = ({
  isAdmin,
  token,
  refreshAll,
  onUpdatedContent,
}: UseAdminBlogEditorParams): UseAdminBlogEditorResult => {
  const [createTitle, setCreateTitleState] = useState("");
  const [createSlug, setCreateSlugState] = useState("");
  const [createBodyMd, setCreateBodyMdState] = useState("");
  const [createCategoryId, setCreateCategoryIdState] = useState("");
  const [newCategoryLabel, setNewCategoryLabelState] = useState("");
  const [newCategorySlug, setNewCategorySlugState] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitleState] = useState("");
  const [editSlug, setEditSlugState] = useState("");
  const [editBodyMd, setEditBodyMdState] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const createBlogPost = async (event: FormEvent) => {
    event.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    if (!isAdmin || !token) {
      setCreateError("Admin login required.");
      return;
    }

    if (!createTitle.trim() || !createBodyMd.trim()) {
      setCreateError("Title and body are required.");
      return;
    }

    setCreateLoading(true);

    try {
      const created = await contentPlatformService.createBlog(token, {
        title: createTitle.trim(),
        slug: createSlug.trim(),
        bodyMd: createBodyMd,
      });

      let categoryId: number | null = null;

      if (createCategoryId.trim()) {
        const parsed = Number(createCategoryId.trim());
        if (!Number.isFinite(parsed)) {
          throw new Error("Selected category is invalid.");
        }
        categoryId = parsed;
      } else if (newCategoryLabel.trim() || newCategorySlug.trim()) {
        if (!newCategoryLabel.trim()) {
          throw new Error("New category label is required.");
        }
        categoryId = await contentPlatformService.createCategory(token, {
          domain: "BLOG",
          label: newCategoryLabel.trim(),
          slug: newCategorySlug.trim(),
        });
      }

      if (categoryId !== null) {
        await contentPlatformService.attachCategory(token, created.id, categoryId);
      }

      setCreateSuccess("Blog post created.");
      setCreateTitleState("");
      setCreateSlugState("");
      setCreateBodyMdState("");
      setCreateCategoryIdState("");
      setNewCategoryLabelState("");
      setNewCategorySlugState("");

      await refreshAll();
    } catch (err) {
      setCreateError((err as Error).message);
    } finally {
      setCreateLoading(false);
    }
  };

  const beginEdit = async (post: ContentItem) => {
    setEditError(null);
    setEditSuccess(null);
    setEditId(post.id);
    setEditTitleState(post.title);
    setEditSlugState(post.slug);
    setEditBodyMdState(post.bodyMd ?? "");

    try {
      const body = await contentPlatformService.getContentById(post.id);
      setEditTitleState(body.title ?? post.title);
      setEditSlugState(body.slug ?? post.slug);
      setEditBodyMdState(body.bodyMd ?? "");
    } catch (err) {
      setEditError((err as Error).message);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditTitleState("");
    setEditSlugState("");
    setEditBodyMdState("");
    setEditError(null);
    setEditSuccess(null);
  };

  const submitEditBlogPost = async (event: FormEvent) => {
    event.preventDefault();
    setEditError(null);
    setEditSuccess(null);

    if (!isAdmin || !token || editId == null) {
      setEditError("Admin login required.");
      return;
    }

    if (!editTitle.trim() || !editBodyMd.trim()) {
      setEditError("Title and body are required.");
      return;
    }

    setEditLoading(true);

    try {
      const updated = await contentPlatformService.updateBlog(token, editId, {
        title: editTitle.trim(),
        slug: editSlug.trim(),
        bodyMd: editBodyMd,
      });

      setEditSuccess("Blog post updated.");
      onUpdatedContent?.(updated);
      await refreshAll();
    } catch (err) {
      setEditError((err as Error).message);
    } finally {
      setEditLoading(false);
    }
  };

  return {
    createTitle,
    setCreateTitle: setCreateTitleState,
    createSlug,
    setCreateSlug: setCreateSlugState,
    createBodyMd,
    setCreateBodyMd: setCreateBodyMdState,
    createCategoryId,
    setCreateCategoryId: setCreateCategoryIdState,
    newCategoryLabel,
    setNewCategoryLabel: setNewCategoryLabelState,
    newCategorySlug,
    setNewCategorySlug: setNewCategorySlugState,
    createLoading,
    createError,
    createSuccess,
    createBlogPost,
    editId,
    editTitle,
    setEditTitle: setEditTitleState,
    editSlug,
    setEditSlug: setEditSlugState,
    editBodyMd,
    setEditBodyMd: setEditBodyMdState,
    editLoading,
    editError,
    editSuccess,
    beginEdit,
    cancelEdit,
    submitEditBlogPost,
  };
};

export default useAdminBlogEditor;

