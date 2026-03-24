import type { CategoryItem } from "../../../../lib/api";
import type { BlogCreateFormProps } from "../BlogCreateForm";
import type { BlogEditFormProps } from "../BlogEditForm";
import type { ProjectCreateFormProps } from "../ProjectCreateForm";
import type { ProjectEditFormProps } from "../ProjectEditForm";
import type { UseAdminBlogEditorResult } from "../hooks/useAdminBlogEditor";
import type { UseAdminProjectEditorResult } from "../hooks/useAdminProjectEditor";

export type BlogAdminFormProps = {
  createFormProps: BlogCreateFormProps;
  editFormProps: BlogEditFormProps | null;
};

export type ProjectAdminFormProps = {
  createFormProps: ProjectCreateFormProps;
  editFormProps: ProjectEditFormProps | null;
};

export function buildBlogAdminFormProps(
  categories: CategoryItem[],
  editor: UseAdminBlogEditorResult,
): BlogAdminFormProps {
  return {
    createFormProps: {
      categories,
      createTitle: editor.create.title,
      setCreateTitle: editor.create.setTitle,
      createSlug: editor.create.slug,
      setCreateSlug: editor.create.setSlug,
      createBodyMd: editor.create.bodyMd,
      setCreateBodyMd: editor.create.setBodyMd,
      createCategoryId: editor.create.categoryId,
      setCreateCategoryId: editor.create.setCategoryId,
      newCategoryLabel: editor.create.newCategoryLabel,
      setNewCategoryLabel: editor.create.setNewCategoryLabel,
      newCategorySlug: editor.create.newCategorySlug,
      setNewCategorySlug: editor.create.setNewCategorySlug,
      createLoading: editor.create.loading,
      createError: editor.create.error,
      createSuccess: editor.create.success,
      onSubmit: editor.create.submit,
    },
    editFormProps: editor.edit.id === null
      ? null
      : {
          editId: editor.edit.id,
          editTitle: editor.edit.title,
          setEditTitle: editor.edit.setTitle,
          editSlug: editor.edit.slug,
          setEditSlug: editor.edit.setSlug,
          editBodyMd: editor.edit.bodyMd,
          setEditBodyMd: editor.edit.setBodyMd,
          editLoading: editor.edit.loading,
          deleteLoading: editor.edit.deleteLoading,
          editError: editor.edit.error,
          editSuccess: editor.edit.success,
          onSubmit: editor.edit.submit,
          onCancel: editor.edit.cancel,
          onDelete: editor.edit.delete,
        },
  };
}

export function buildProjectAdminFormProps(
  categories: CategoryItem[],
  editor: UseAdminProjectEditorResult,
): ProjectAdminFormProps {
  return {
    createFormProps: {
      categories,
      createTitle: editor.create.title,
      setCreateTitle: editor.create.setTitle,
      createSlug: editor.create.slug,
      setCreateSlug: editor.create.setSlug,
      createDescription: editor.create.description,
      setCreateDescription: editor.create.setDescription,
      createProjectUrl: editor.create.projectUrl,
      setCreateProjectUrl: editor.create.setProjectUrl,
      createCategoryId: editor.create.categoryId,
      setCreateCategoryId: editor.create.setCategoryId,
      newCategoryLabel: editor.create.newCategoryLabel,
      setNewCategoryLabel: editor.create.setNewCategoryLabel,
      newCategorySlug: editor.create.newCategorySlug,
      setNewCategorySlug: editor.create.setNewCategorySlug,
      createLoading: editor.create.loading,
      createError: editor.create.error,
      createSuccess: editor.create.success,
      onSubmit: editor.create.submit,
    },
    editFormProps: editor.edit.id === null
      ? null
      : {
          editId: editor.edit.id,
          editTitle: editor.edit.title,
          setEditTitle: editor.edit.setTitle,
          editSlug: editor.edit.slug,
          setEditSlug: editor.edit.setSlug,
          editDescription: editor.edit.description,
          setEditDescription: editor.edit.setDescription,
          editProjectUrl: editor.edit.projectUrl,
          setEditProjectUrl: editor.edit.setProjectUrl,
          editLoading: editor.edit.loading,
          deleteLoading: editor.edit.deleteLoading,
          editError: editor.edit.error,
          editSuccess: editor.edit.success,
          onSubmit: editor.edit.submit,
          onCancel: editor.edit.cancel,
          onDelete: editor.edit.delete,
        },
  };
}
