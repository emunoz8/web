import type { CategoryItem } from "../../../../lib/api";
import type { UseAdminBlogEditorResult } from "../hooks/useAdminBlogEditor";
import type { UseAdminProjectEditorResult } from "../hooks/useAdminProjectEditor";
import { buildBlogAdminFormProps, buildProjectAdminFormProps } from "./AdminEditorFormViewModels";

const categories: CategoryItem[] = [
  {
    id: 1,
    domain: "BLOG",
    slug: "java",
    label: "Java",
    createdAt: "2026-03-10T00:00:00Z",
  },
];

function createBlogEditorStub(overrides: Partial<UseAdminBlogEditorResult> = {}): UseAdminBlogEditorResult {
  return {
    create: {
      title: "Blog title",
      setTitle: vi.fn(),
      slug: "blog-title",
      setSlug: vi.fn(),
      bodyMd: "## body",
      setBodyMd: vi.fn(),
      categoryId: "1",
      setCategoryId: vi.fn(),
      newCategoryLabel: "",
      setNewCategoryLabel: vi.fn(),
      newCategorySlug: "",
      setNewCategorySlug: vi.fn(),
      loading: false,
      error: null,
      success: null,
      submit: vi.fn(async () => undefined),
    },
    edit: {
      id: null,
      title: "",
      setTitle: vi.fn(),
      slug: "",
      setSlug: vi.fn(),
      bodyMd: "",
      setBodyMd: vi.fn(),
      loading: false,
      error: null,
      success: null,
      begin: vi.fn(async () => undefined),
      cancel: vi.fn(),
      submit: vi.fn(async () => undefined),
    },
    ...overrides,
  };
}

function createProjectEditorStub(overrides: Partial<UseAdminProjectEditorResult> = {}): UseAdminProjectEditorResult {
  return {
    create: {
      title: "Project title",
      setTitle: vi.fn(),
      slug: "project-title",
      setSlug: vi.fn(),
      description: "project description",
      setDescription: vi.fn(),
      projectUrl: "/demo",
      setProjectUrl: vi.fn(),
      categoryId: "1",
      setCategoryId: vi.fn(),
      newCategoryLabel: "",
      setNewCategoryLabel: vi.fn(),
      newCategorySlug: "",
      setNewCategorySlug: vi.fn(),
      loading: false,
      error: null,
      success: null,
      submit: vi.fn(async () => undefined),
    },
    edit: {
      id: null,
      title: "",
      setTitle: vi.fn(),
      slug: "",
      setSlug: vi.fn(),
      description: "",
      setDescription: vi.fn(),
      projectUrl: "",
      setProjectUrl: vi.fn(),
      loading: false,
      deleteLoading: false,
      error: null,
      success: null,
      begin: vi.fn(async () => undefined),
      cancel: vi.fn(),
      submit: vi.fn(async () => undefined),
      delete: vi.fn(async () => undefined),
    },
    ...overrides,
  };
}

describe("buildBlogAdminFormProps", () => {
  it("maps create form props from the editor state", () => {
    const editor = createBlogEditorStub();
    const formProps = buildBlogAdminFormProps(categories, editor);

    expect(formProps.createFormProps).toEqual({
      categories,
      createTitle: "Blog title",
      setCreateTitle: editor.create.setTitle,
      createSlug: "blog-title",
      setCreateSlug: editor.create.setSlug,
      createBodyMd: "## body",
      setCreateBodyMd: editor.create.setBodyMd,
      createCategoryId: "1",
      setCreateCategoryId: editor.create.setCategoryId,
      newCategoryLabel: "",
      setNewCategoryLabel: editor.create.setNewCategoryLabel,
      newCategorySlug: "",
      setNewCategorySlug: editor.create.setNewCategorySlug,
      createLoading: false,
      createError: null,
      createSuccess: null,
      onSubmit: editor.create.submit,
    });
  });

  it("returns edit form props only when an edit session exists", () => {
    const editor = createBlogEditorStub({
      edit: {
        ...createBlogEditorStub().edit,
        id: 9,
        title: "Updated title",
        slug: "updated-title",
        bodyMd: "updated body",
      },
    });
    const formProps = buildBlogAdminFormProps(categories, editor);

    expect(formProps.editFormProps).toEqual({
      editId: 9,
      editTitle: "Updated title",
      setEditTitle: editor.edit.setTitle,
      editSlug: "updated-title",
      setEditSlug: editor.edit.setSlug,
      editBodyMd: "updated body",
      setEditBodyMd: editor.edit.setBodyMd,
      editLoading: false,
      editError: null,
      editSuccess: null,
      onSubmit: editor.edit.submit,
      onCancel: editor.edit.cancel,
    });
  });
});

describe("buildProjectAdminFormProps", () => {
  it("maps create form props from the project editor state", () => {
    const editor = createProjectEditorStub();
    const formProps = buildProjectAdminFormProps(categories, editor);

    expect(formProps.createFormProps).toEqual({
      categories,
      createTitle: "Project title",
      setCreateTitle: editor.create.setTitle,
      createSlug: "project-title",
      setCreateSlug: editor.create.setSlug,
      createDescription: "project description",
      setCreateDescription: editor.create.setDescription,
      createProjectUrl: "/demo",
      setCreateProjectUrl: editor.create.setProjectUrl,
      createCategoryId: "1",
      setCreateCategoryId: editor.create.setCategoryId,
      newCategoryLabel: "",
      setNewCategoryLabel: editor.create.setNewCategoryLabel,
      newCategorySlug: "",
      setNewCategorySlug: editor.create.setNewCategorySlug,
      createLoading: false,
      createError: null,
      createSuccess: null,
      onSubmit: editor.create.submit,
    });
  });

  it("includes delete controls in edit form props when editing a project", () => {
    const editor = createProjectEditorStub({
      edit: {
        ...createProjectEditorStub().edit,
        id: 12,
        title: "Updated project",
        slug: "updated-project",
        description: "updated description",
        projectUrl: "/updated",
        deleteLoading: true,
      },
    });
    const formProps = buildProjectAdminFormProps(categories, editor);

    expect(formProps.editFormProps).toEqual({
      editId: 12,
      editTitle: "Updated project",
      setEditTitle: editor.edit.setTitle,
      editSlug: "updated-project",
      setEditSlug: editor.edit.setSlug,
      editDescription: "updated description",
      setEditDescription: editor.edit.setDescription,
      editProjectUrl: "/updated",
      setEditProjectUrl: editor.edit.setProjectUrl,
      editLoading: false,
      deleteLoading: true,
      editError: null,
      editSuccess: null,
      onSubmit: editor.edit.submit,
      onCancel: editor.edit.cancel,
      onDelete: editor.edit.delete,
    });
  });
});
