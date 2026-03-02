import { FormEvent, useState } from "react";
import { ContentItem } from "../../../../lib/api";
import { contentPlatformService } from "../../../../lib/services/ContentPlatformService";

type UseAdminProjectEditorParams = {
  isAdmin: boolean;
  token: string | null;
  refreshAll: () => Promise<void>;
  onUpdatedContent?: (updated: ContentItem) => void;
};

type UseAdminProjectEditorResult = {
  createTitle: string;
  setCreateTitle: (value: string) => void;
  createSlug: string;
  setCreateSlug: (value: string) => void;
  createDescription: string;
  setCreateDescription: (value: string) => void;
  createProjectUrl: string;
  setCreateProjectUrl: (value: string) => void;
  createCategoryId: string;
  setCreateCategoryId: (value: string) => void;
  newCategoryLabel: string;
  setNewCategoryLabel: (value: string) => void;
  newCategorySlug: string;
  setNewCategorySlug: (value: string) => void;
  createLoading: boolean;
  createError: string | null;
  createSuccess: string | null;
  createProject: (event: FormEvent) => Promise<void>;
  editId: number | null;
  editTitle: string;
  setEditTitle: (value: string) => void;
  editSlug: string;
  setEditSlug: (value: string) => void;
  editDescription: string;
  setEditDescription: (value: string) => void;
  editProjectUrl: string;
  setEditProjectUrl: (value: string) => void;
  editLoading: boolean;
  editError: string | null;
  editSuccess: string | null;
  beginEdit: (item: ContentItem) => Promise<void>;
  cancelEdit: () => void;
  submitEditProject: (event: FormEvent) => Promise<void>;
};

const useAdminProjectEditor = ({
  isAdmin,
  token,
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
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const createProject = async (event: FormEvent) => {
    event.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    if (!isAdmin || !token) {
      setCreateError("Admin login required.");
      return;
    }

    if (!createTitle.trim() || !createDescription.trim()) {
      setCreateError("Title and description are required.");
      return;
    }

    setCreateLoading(true);

    try {
      const created = await contentPlatformService.createProject(token, {
        title: createTitle.trim(),
        slug: createSlug.trim(),
        description: createDescription.trim(),
        projectUrl: createProjectUrl.trim(),
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
          domain: "PROJECT",
          label: newCategoryLabel.trim(),
          slug: newCategorySlug.trim(),
        });
      }

      if (categoryId !== null) {
        await contentPlatformService.attachCategory(token, created.id, categoryId);
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
    setEditTitleState(item.title);
    setEditSlugState(item.slug);
    setEditDescriptionState(item.description ?? "");
    setEditProjectUrlState(item.projectUrl ?? "");

    try {
      const body = await contentPlatformService.getContentById(item.id);
      setEditTitleState(body.title ?? item.title);
      setEditSlugState(body.slug ?? item.slug);
      setEditDescriptionState(body.description ?? "");
      setEditProjectUrlState(body.projectUrl ?? "");
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

    if (!isAdmin || !token || editId == null) {
      setEditError("Admin login required.");
      return;
    }

    if (!editTitle.trim() || !editDescription.trim()) {
      setEditError("Title and description are required.");
      return;
    }

    setEditLoading(true);

    try {
      const updated = await contentPlatformService.updateProject(token, editId, {
        title: editTitle.trim(),
        slug: editSlug.trim(),
        description: editDescription.trim(),
        projectUrl: editProjectUrl.trim(),
      });

      setEditSuccess("Project updated.");
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
    createDescription,
    setCreateDescription: setCreateDescriptionState,
    createProjectUrl,
    setCreateProjectUrl: setCreateProjectUrlState,
    createCategoryId,
    setCreateCategoryId: setCreateCategoryIdState,
    newCategoryLabel,
    setNewCategoryLabel: setNewCategoryLabelState,
    newCategorySlug,
    setNewCategorySlug: setNewCategorySlugState,
    createLoading,
    createError,
    createSuccess,
    createProject,
    editId,
    editTitle,
    setEditTitle: setEditTitleState,
    editSlug,
    setEditSlug: setEditSlugState,
    editDescription,
    setEditDescription: setEditDescriptionState,
    editProjectUrl,
    setEditProjectUrl: setEditProjectUrlState,
    editLoading,
    editError,
    editSuccess,
    beginEdit,
    cancelEdit,
    submitEditProject,
  };
};

export default useAdminProjectEditor;
