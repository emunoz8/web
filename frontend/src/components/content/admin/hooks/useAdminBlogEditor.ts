import { FormEvent, useState } from "react";
import { ContentItem } from "../../../../lib/api";
import { contentPlatformService } from "../../../../lib/services/ContentPlatformService";
import { BlogDraftModel, CategorySelectionModel } from "../models/AdminEditorModels";

type UseAdminBlogEditorParams = {
  isAdmin: boolean;
  refreshAll: () => Promise<void>;
  onUpdatedContent?: (updated: ContentItem) => void;
};

type BlogCreateEditorState = {
  title: string;
  setTitle: (value: string) => void;
  slug: string;
  setSlug: (value: string) => void;
  bodyMd: string;
  setBodyMd: (value: string) => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  newCategoryLabel: string;
  setNewCategoryLabel: (value: string) => void;
  newCategorySlug: string;
  setNewCategorySlug: (value: string) => void;
  loading: boolean;
  error: string | null;
  success: string | null;
  submit: (event: FormEvent) => Promise<void>;
};

type BlogEditEditorState = {
  id: number | null;
  title: string;
  setTitle: (value: string) => void;
  slug: string;
  setSlug: (value: string) => void;
  bodyMd: string;
  setBodyMd: (value: string) => void;
  loading: boolean;
  deleteLoading: boolean;
  error: string | null;
  success: string | null;
  begin: (post: ContentItem) => Promise<void>;
  cancel: () => void;
  submit: (event: FormEvent) => Promise<void>;
  delete: () => Promise<void>;
};

export type UseAdminBlogEditorResult = {
  create: BlogCreateEditorState;
  edit: BlogEditEditorState;
};

const useAdminBlogEditor = ({
  isAdmin,
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
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const createBlogPost = async (event: FormEvent) => {
    event.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    const draft = new BlogDraftModel(createTitle, createSlug, createBodyMd);
    const validationError = draft.validateForCreate(isAdmin);
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    setCreateLoading(true);

    try {
      const categorySelection = new CategorySelectionModel(createCategoryId, newCategoryLabel, newCategorySlug);
      const created = await contentPlatformService.createBlog(draft.toCreateInput());

      let categoryId = categorySelection.resolveExistingCategoryId();
      const newCategoryInput = categorySelection.buildCreateCategoryInput("BLOG");
      if (categoryId === null && newCategoryInput) {
        categoryId = await contentPlatformService.createCategory({
          ...newCategoryInput,
        });
      }

      if (categoryId !== null) {
        await contentPlatformService.attachCategory(created.id, categoryId);
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
    const initialDraft = BlogDraftModel.fromContentItem(post);
    setEditTitleState(initialDraft.title);
    setEditSlugState(initialDraft.slug);
    setEditBodyMdState(initialDraft.bodyMd);

    try {
      const body = await contentPlatformService.getContentById(post.id);
      const loadedDraft = BlogDraftModel.fromContentItem(body);
      setEditTitleState(loadedDraft.title);
      setEditSlugState(loadedDraft.slug);
      setEditBodyMdState(loadedDraft.bodyMd);
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

  const deleteBlogPost = async () => {
    setEditError(null);
    setEditSuccess(null);

    if (!isAdmin || editId == null) {
      setEditError("Admin login required.");
      return;
    }

    setDeleteLoading(true);

    try {
      await contentPlatformService.deleteContent(editId);
      await refreshAll();
      cancelEdit();
    } catch (err) {
      setEditError((err as Error).message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const submitEditBlogPost = async (event: FormEvent) => {
    event.preventDefault();
    setEditError(null);
    setEditSuccess(null);

    const draft = new BlogDraftModel(editTitle, editSlug, editBodyMd);
    const validationError = draft.validateForEdit(isAdmin, editId);
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setEditLoading(true);

    try {
      const updated = await contentPlatformService.updateBlog(editId!, draft.toUpdateInput());

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
    create: {
      title: createTitle,
      setTitle: setCreateTitleState,
      slug: createSlug,
      setSlug: setCreateSlugState,
      bodyMd: createBodyMd,
      setBodyMd: setCreateBodyMdState,
      categoryId: createCategoryId,
      setCategoryId: setCreateCategoryIdState,
      newCategoryLabel,
      setNewCategoryLabel: setNewCategoryLabelState,
      newCategorySlug,
      setNewCategorySlug: setNewCategorySlugState,
      loading: createLoading,
      error: createError,
      success: createSuccess,
      submit: createBlogPost,
    },
    edit: {
      id: editId,
      title: editTitle,
      setTitle: setEditTitleState,
      slug: editSlug,
      setSlug: setEditSlugState,
      bodyMd: editBodyMd,
      setBodyMd: setEditBodyMdState,
      loading: editLoading,
      deleteLoading,
      error: editError,
      success: editSuccess,
      begin: beginEdit,
      cancel: cancelEdit,
      submit: submitEditBlogPost,
      delete: deleteBlogPost,
    },
  };
};

export default useAdminBlogEditor;
