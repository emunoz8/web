import React, { FormEvent } from "react";
import { CategoryItem } from "../../../lib/api";

export type BlogCreateFormProps = {
  categories: CategoryItem[];
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
  onSubmit: (event: FormEvent) => Promise<void>;
};

const BlogCreateForm: React.FC<BlogCreateFormProps> = ({
  categories,
  createTitle,
  setCreateTitle,
  createSlug,
  setCreateSlug,
  createBodyMd,
  setCreateBodyMd,
  createCategoryId,
  setCreateCategoryId,
  newCategoryLabel,
  setNewCategoryLabel,
  newCategorySlug,
  setNewCategorySlug,
  createLoading,
  createError,
  createSuccess,
  onSubmit,
}) => {
  return (
    <div className="brand-panel p-4 sm:p-5 space-y-3">
      <p className="portfolio-kicker">Create Blog Post</p>
      <form className="space-y-2" onSubmit={onSubmit}>
        <div className="grid md:grid-cols-2 gap-2">
          <input
            className="form-input"
            placeholder="title"
            value={createTitle}
            onChange={(event) => setCreateTitle(event.target.value)}
          />
          <input
            className="form-input"
            placeholder="slug (optional)"
            value={createSlug}
            onChange={(event) => setCreateSlug(event.target.value)}
          />
        </div>

        <textarea
          className="form-textarea min-h-32"
          placeholder="markdown body"
          value={createBodyMd}
          onChange={(event) => setCreateBodyMd(event.target.value)}
        />

        <div className="grid md:grid-cols-3 gap-2">
          <select
            className="form-input"
            value={createCategoryId}
            onChange={(event) => setCreateCategoryId(event.target.value)}
          >
            <option value="">(select existing category)</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.label} ({category.slug})
              </option>
            ))}
          </select>
          <input
            className="form-input"
            placeholder="new category label"
            value={newCategoryLabel}
            onChange={(event) => setNewCategoryLabel(event.target.value)}
          />
          <input
            className="form-input"
            placeholder="new category slug (optional)"
            value={newCategorySlug}
            onChange={(event) => setNewCategorySlug(event.target.value)}
          />
        </div>

        {createError && <p className="text-sm text-brand-danger-ink">{createError}</p>}
        {createSuccess && <p className="text-sm text-brand-accent">{createSuccess}</p>}

        <button className="portfolio-button-primary" type="submit" disabled={createLoading}>
          {createLoading ? "Creating..." : "Create Blog Post"}
        </button>
      </form>
    </div>
  );
};

export default BlogCreateForm;
