import type { ContentItem } from "../../../../lib/api";
import { BlogDraftModel, CategorySelectionModel, ProjectDraftModel } from "./AdminEditorModels";

const baseContentItem: ContentItem = {
  id: 7,
  title: "Example Title",
  slug: "example-title",
  createdAt: "2026-03-10T00:00:00Z",
  type: "BLOG",
};

describe("BlogDraftModel", () => {
  it("requires admin access before create", () => {
    const draft = new BlogDraftModel("Hello World", "hello-world", "## body");

    expect(draft.validateForCreate(false)).toBe("Admin login required.");
  });

  it("builds a trimmed mutation payload", () => {
    const draft = new BlogDraftModel("  Hello World  ", " hello-world  ", "## body");

    expect(draft.toCreateInput()).toEqual({
      title: "Hello World",
      slug: "hello-world",
      bodyMd: "## body",
    });
  });

  it("hydrates missing markdown from content items as an empty string", () => {
    const draft = BlogDraftModel.fromContentItem(baseContentItem);

    expect(draft.bodyMd).toBe("");
  });
});

describe("ProjectDraftModel", () => {
  it("requires description text before save", () => {
    const draft = new ProjectDraftModel("Project", "project", "   ", "");

    expect(draft.validateForCreate(true)).toBe("Title and description are required.");
  });

  it("normalizes description and project url in mutation payloads", () => {
    const draft = new ProjectDraftModel(" Project ", " project ", "  markdown body  ", " /demo ");

    expect(draft.toUpdateInput()).toEqual({
      title: "Project",
      slug: "project",
      description: "markdown body",
      projectUrl: "/demo",
    });
  });
});

describe("CategorySelectionModel", () => {
  it("parses an existing category id", () => {
    const selection = new CategorySelectionModel(" 12 ", "", "");

    expect(selection.resolveExistingCategoryId()).toBe(12);
  });

  it("rejects invalid category ids", () => {
    const selection = new CategorySelectionModel("abc", "", "");

    expect(() => selection.resolveExistingCategoryId()).toThrow("Selected category is invalid.");
  });

  it("requires a label when creating a new category", () => {
    const selection = new CategorySelectionModel("", "", "new-category");

    expect(() => selection.buildCreateCategoryInput("BLOG")).toThrow("New category label is required.");
  });

  it("builds a new category payload with trimmed values", () => {
    const selection = new CategorySelectionModel("", " Java ", " java ");

    expect(selection.buildCreateCategoryInput("PROJECT")).toEqual({
      domain: "PROJECT",
      label: "Java",
      slug: "java",
    });
  });
});
