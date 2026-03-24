import React, { FormEvent } from "react";

export type BlogEditFormProps = {
  editId: number;
  editTitle: string;
  setEditTitle: (value: string) => void;
  editSlug: string;
  setEditSlug: (value: string) => void;
  editBodyMd: string;
  setEditBodyMd: (value: string) => void;
  editLoading: boolean;
  deleteLoading: boolean;
  editError: string | null;
  editSuccess: string | null;
  onSubmit: (event: FormEvent) => Promise<void>;
  onCancel: () => void;
  onDelete: () => Promise<void>;
};

const BlogEditForm: React.FC<BlogEditFormProps> = ({
  editId,
  editTitle,
  setEditTitle,
  editSlug,
  setEditSlug,
  editBodyMd,
  setEditBodyMd,
  editLoading,
  deleteLoading,
  editError,
  editSuccess,
  onSubmit,
  onCancel,
  onDelete,
}) => {
  const isBusy = editLoading || deleteLoading;

  return (
    <div className="brand-panel p-4 sm:p-5 space-y-3">
      <p className="portfolio-kicker">Edit Blog Post #{editId}</p>
      <form className="space-y-2" onSubmit={onSubmit}>
        <div className="grid md:grid-cols-2 gap-2">
          <input
            className="form-input"
            placeholder="title"
            value={editTitle}
            onChange={(event) => setEditTitle(event.target.value)}
          />
          <input
            className="form-input"
            placeholder="slug (optional)"
            value={editSlug}
            onChange={(event) => setEditSlug(event.target.value)}
          />
        </div>
        <textarea
          className="form-textarea min-h-32"
          placeholder="markdown body"
          value={editBodyMd}
          onChange={(event) => setEditBodyMd(event.target.value)}
        />
        {editError && <p className="text-sm text-brand-danger-ink">{editError}</p>}
        {editSuccess && <p className="text-sm text-brand-accent">{editSuccess}</p>}
        <div className="flex flex-wrap gap-2">
          <button className="portfolio-button-primary" type="submit" disabled={isBusy}>
            {editLoading ? "Saving..." : "Save Changes"}
          </button>
          <button className="portfolio-button-secondary" type="button" onClick={onCancel} disabled={isBusy}>
            Cancel Edit
          </button>
          <button
            className="inline-flex min-h-[40px] items-center rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
            type="button"
            disabled={isBusy}
            onClick={() => {
              if (!window.confirm("Delete this blog post? This cannot be undone.")) {
                return;
              }
              void onDelete();
            }}
          >
            {deleteLoading ? "Deleting..." : "Delete Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogEditForm;
