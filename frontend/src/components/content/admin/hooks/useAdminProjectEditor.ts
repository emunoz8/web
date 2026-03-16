import { FormEvent, useState } from "react";
import { ContentItem } from "../../../../lib/api";
import { contentPlatformService } from "../../../../lib/services/ContentPlatformService";
import { CategorySelectionModel, ProjectDraftModel } from "../models/AdminEditorModels";

type UseAdminProjectEditorParams = {
  isAdmin: boolean;
  refreshAll: () => Promise<void>;
  onUpdatedContent?: (updated: ContentItem) => void;
};

type ProjectCreateEditorState = {
  title: string;
  setTitle: (value: string) => void;
  slug: string;
  setSlug: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  projectUrl: string;
  setProjectUrl: (value: string) => void;
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

type ProjectEditEditorState = {
  id: number | null;
  title: string;
  setTitle: (value: string) => void;
  slug: string;
  setSlug: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  projectUrl: string;
  setProjectUrl: (value: string) => void;
  loading: boolean;
  deleteLoading: boolean;
  error: string | null;
  success: string | null;
  begin: (item: ContentItem) => Promise<void>;
  cancel: () => void;
  submit: (event: FormEvent) => Promise<void>;
  delete: () => Promise<void>;
};

export type UseAdminProjectEditorResult = {
  create: ProjectCreateEditorState;
  edit: ProjectEditEditorState;
};

const useAdminProjectEditor = ({
  isAdmin,
  refreshAll,
  onUpdatedContent,
}: UseAdminProjectEditorParams): UseAdminProjectEditorResult => {
  const [createTitle, setCreateTitleState] = useState("");
  const [createSlug, setCreateSlugState] = useState("");
  const [createDescription, setCreateDescriptionState] = useState("");
  const [createProjectUrl, setCreateProjectUrlState] = useState("");
  const [createCategoryId, setCreateCategoryIdState] = useState("");
  const [newCategoryLabel, setNewCategoryLabelState] = useState("");
  const [newCategorySlug, setNewCategorySlugState] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitleState] = useState("");
  const [editSlug, setEditSlugState] = useState("");
  const [editDescription, setEditDescriptionState] = useState("");
  const [editProjectUrl, setEditProjectUrlState] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const createProject = async (event: FormEvent) => {
    event.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    const draft = new ProjectDraftModel(createTitle, createSlug, createDescription, createProjectUrl);
    const validationError = draft.validateForCreate(isAdmin);
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    setCreateLoading(true);

    try {
      const categorySelection = new CategorySelectionModel(createCategoryId, newCategoryLabel, newCategorySlug);
      const created = await contentPlatformService.createProject(draft.toCreateInput());

      let categoryId = categorySelection.resolveExistingCategoryId();
      const newCategoryInput = categorySelection.buildCreateCategoryInput("PROJECT");
      if (categoryId === null && newCategoryInput) {
        categoryId = await contentPlatformService.createCategory({
          ...newCategoryInput,
        });
      }

      if (categoryId !== null) {
        await contentPlatformService.attachCategory(created.id, categoryId);
      }

      setCreateSuccess("Project created.");
      setCreateTitleState("");
      setCreateSlugState("");
      setCreateDescriptionState("");
      setCreateProjectUrlState("");
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

  const beginEdit = async (item: ContentItem) => {
    setEditError(null);
    setEditSuccess(null);
    setEditId(item.id);
    const initialDraft = ProjectDraftModel.fromContentItem(item);
    setEditTitleState(initialDraft.title);
    setEditSlugState(initialDraft.slug);
    setEditDescriptionState(initialDraft.description);
    setEditProjectUrlState(initialDraft.projectUrl);

    try {
      const body = await contentPlatformService.getContentById(item.id);
      const loadedDraft = ProjectDraftModel.fromContentItem(body);
      setEditTitleState(loadedDraft.title);
      setEditSlugState(loadedDraft.slug);
      setEditDescriptionState(loadedDraft.description);
      setEditProjectUrlState(loadedDraft.projectUrl);
    } catch (err) {
      setEditError((err as Error).message);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditTitleState("");
    setEditSlugState("");
    setEditDescriptionState("");
    setEditProjectUrlState("");
    setEditError(null);
    setEditSuccess(null);
  };

  const submitEditProject = async (event: FormEvent) => {
    event.preventDefault();
    setEditError(null);
    setEditSuccess(null);

    const draft = new ProjectDraftModel(editTitle, editSlug, editDescription, editProjectUrl);
    const validationError = draft.validateForEdit(isAdmin, editId);
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setEditLoading(true);

    try {
      const updated = await contentPlatformService.updateProject(editId!, draft.toUpdateInput());

      setEditSuccess("Project updated.");
      onUpdatedContent?.(updated);
      await refreshAll();
    } catch (err) {
      setEditError((err as Error).message);
    } finally {
      setEditLoading(false);
    }
  };

  const deleteProject = async () => {
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

  return {
    create: {
      title: createTitle,
      setTitle: setCreateTitleState,
      slug: createSlug,
      setSlug: setCreateSlugState,
      description: createDescription,
      setDescription: setCreateDescriptionState,
      projectUrl: createProjectUrl,
      setProjectUrl: setCreateProjectUrlState,
      categoryId: createCategoryId,
      setCategoryId: setCreateCategoryIdState,
      newCategoryLabel,
      setNewCategoryLabel: setNewCategoryLabelState,
      newCategorySlug,
      setNewCategorySlug: setNewCategorySlugState,
      loading: createLoading,
      error: createError,
      success: createSuccess,
      submit: createProject,
    },
    edit: {
      id: editId,
      title: editTitle,
      setTitle: setEditTitleState,
      slug: editSlug,
      setSlug: setEditSlugState,
      description: editDescription,
      setDescription: setEditDescriptionState,
      projectUrl: editProjectUrl,
      setProjectUrl: setEditProjectUrlState,
      loading: editLoading,
      deleteLoading,
      error: editError,
      success: editSuccess,
      begin: beginEdit,
      cancel: cancelEdit,
      submit: submitEditProject,
      delete: deleteProject,
    },
  };
};

export default useAdminProjectEditor;
