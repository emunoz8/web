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
  editError: string | null;
  editSuccess: string | null;
  onSubmit: (event: FormEvent) => Promise<void>;
  onCancel: () => void;
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
  editError,
  editSuccess,
  onSubmit,
  onCancel,
}) => {
  return (
    <div className="border rounded-lg p-3 sm:p-4 space-y-3">
      <h2 className="font-semibold">Edit Blog Post #{editId}</h2>
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
        {editError && <p className="text-sm text-red-500">{editError}</p>}
        {editSuccess && <p className="text-sm text-green-500">{editSuccess}</p>}
        <div className="flex flex-wrap gap-2">
          <button className="btn" type="submit" disabled={editLoading}>
            {editLoading ? "Saving..." : "Save Changes"}
          </button>
          <button className="btn" type="button" onClick={onCancel}>
            Cancel Edit
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogEditForm;
