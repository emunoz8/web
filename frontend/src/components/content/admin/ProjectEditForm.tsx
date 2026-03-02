import React, { FormEvent } from "react";

type ProjectEditFormProps = {
  editId: number;
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
  onSubmit: (event: FormEvent) => Promise<void>;
  onCancel: () => void;
};

const ProjectEditForm: React.FC<ProjectEditFormProps> = ({
  editId,
  editTitle,
  setEditTitle,
  editSlug,
  setEditSlug,
  editDescription,
  setEditDescription,
  editProjectUrl,
  setEditProjectUrl,
  editLoading,
  editError,
  editSuccess,
  onSubmit,
  onCancel,
}) => {
  return (
    <div className="border rounded-lg p-3 sm:p-4 space-y-3">
      <h2 className="font-semibold">Edit Project #{editId}</h2>
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
          className="form-textarea"
          placeholder="project description (markdown supported)"
          value={editDescription}
          onChange={(event) => setEditDescription(event.target.value)}
        />
        <p className="text-xs opacity-80">
          Markdown renders in the project modal. Example: <code>[Open AddToTheAUX](/add-to-the-aux)</code>
        </p>
        <input
          className="form-input"
          placeholder="project URL (optional, e.g. /add-to-the-aux)"
          value={editProjectUrl}
          onChange={(event) => setEditProjectUrl(event.target.value)}
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

export default ProjectEditForm;
