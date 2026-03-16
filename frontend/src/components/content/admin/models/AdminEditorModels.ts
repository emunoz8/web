import type { CategoryDomain, ContentItem } from "../../../../lib/api";

type CategoryCreateInput = {
  domain: CategoryDomain;
  label: string;
  slug: string;
};

type BlogMutationInput = {
  title: string;
  slug: string;
  bodyMd: string;
};

type ProjectMutationInput = {
  title: string;
  slug: string;
  description: string;
  projectUrl: string;
};

abstract class ContentDraftModel {
  constructor(
    public readonly title: string,
    public readonly slug: string,
  ) {}

  protected get normalizedTitle(): string {
    return this.title.trim();
  }

  protected get normalizedSlug(): string {
    return this.slug.trim();
  }

  protected validateAdminAccess(isAdmin: boolean): string | null {
    return isAdmin ? null : "Admin login required.";
  }

  protected validateEditAccess(isAdmin: boolean, editId: number | null): string | null {
    return !isAdmin || editId == null ? "Admin login required." : null;
  }
}

export class CategorySelectionModel {
  constructor(
    public readonly categoryId: string,
    public readonly newCategoryLabel: string,
    public readonly newCategorySlug: string,
  ) {}

  resolveExistingCategoryId(): number | null {
    const selectedId = this.categoryId.trim();
    if (!selectedId) {
      return null;
    }

    const parsedCategoryId = Number(selectedId);
    if (!Number.isFinite(parsedCategoryId)) {
      throw new Error("Selected category is invalid.");
    }

    return parsedCategoryId;
  }

  buildCreateCategoryInput(domain: CategoryDomain): CategoryCreateInput | null {
    const label = this.newCategoryLabel.trim();
    const slug = this.newCategorySlug.trim();
    if (!label && !slug) {
      return null;
    }

    if (!label) {
      throw new Error("New category label is required.");
    }

    return {
      domain,
      label,
      slug,
    };
  }
}

export class BlogDraftModel extends ContentDraftModel {
  constructor(
    title: string,
    slug: string,
    public readonly bodyMd: string,
  ) {
    super(title, slug);
  }

  static fromContentItem(item: ContentItem): BlogDraftModel {
    return new BlogDraftModel(item.title, item.slug, item.bodyMd ?? "");
  }

  validateForCreate(isAdmin: boolean): string | null {
    const accessError = this.validateAdminAccess(isAdmin);
    if (accessError) {
      return accessError;
    }

    return this.validateRequiredFields();
  }

  validateForEdit(isAdmin: boolean, editId: number | null): string | null {
    const accessError = this.validateEditAccess(isAdmin, editId);
    if (accessError) {
      return accessError;
    }

    return this.validateRequiredFields();
  }

  toCreateInput(): BlogMutationInput {
    return {
      title: this.normalizedTitle,
      slug: this.normalizedSlug,
      bodyMd: this.bodyMd,
    };
  }

  toUpdateInput(): BlogMutationInput {
    return this.toCreateInput();
  }

  private validateRequiredFields(): string | null {
    return !this.normalizedTitle || !this.bodyMd.trim() ? "Title and body are required." : null;
  }
}

export class ProjectDraftModel extends ContentDraftModel {
  constructor(
    title: string,
    slug: string,
    public readonly description: string,
    public readonly projectUrl: string,
  ) {
    super(title, slug);
  }

  static fromContentItem(item: ContentItem): ProjectDraftModel {
    return new ProjectDraftModel(item.title, item.slug, item.description ?? "", item.projectUrl ?? "");
  }

  validateForCreate(isAdmin: boolean): string | null {
    const accessError = this.validateAdminAccess(isAdmin);
    if (accessError) {
      return accessError;
    }

    return this.validateRequiredFields();
  }

  validateForEdit(isAdmin: boolean, editId: number | null): string | null {
    const accessError = this.validateEditAccess(isAdmin, editId);
    if (accessError) {
      return accessError;
    }

    return this.validateRequiredFields();
  }

  toCreateInput(): ProjectMutationInput {
    return {
      title: this.normalizedTitle,
      slug: this.normalizedSlug,
      description: this.description.trim(),
      projectUrl: this.projectUrl.trim(),
    };
  }

  toUpdateInput(): ProjectMutationInput {
    return this.toCreateInput();
  }

  private validateRequiredFields(): string | null {
    return !this.normalizedTitle || !this.description.trim() ? "Title and description are required." : null;
  }
}
