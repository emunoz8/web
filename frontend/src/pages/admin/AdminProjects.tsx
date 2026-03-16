import React from "react";
import { useAuth } from "../../context/AuthContext";
import useContentBrowserData from "../../components/content/hooks/useContentBrowserData";
import AdminContentPageScaffold from "../../components/content/admin/AdminContentPageScaffold";
import ProjectCreateForm from "../../components/content/admin/ProjectCreateForm";
import ProjectEditForm from "../../components/content/admin/ProjectEditForm";
import useAdminProjectEditor from "../../components/content/admin/hooks/useAdminProjectEditor";
import { buildAdminContentPageProps } from "../../components/content/admin/models/AdminContentPageViewModel";
import { buildProjectAdminFormProps } from "../../components/content/admin/models/AdminEditorFormViewModels";

const AdminProjects: React.FC = () => {
  const { isAdmin } = useAuth();
  const browser = useContentBrowserData({
    type: "PROJECT",
    allCategoriesLabel: "All Project Categories",
  });

  const editor = useAdminProjectEditor({
    isAdmin,
    refreshAll: browser.refresh.all,
    onUpdatedContent: browser.modal.updateItem,
  });
  const { createFormProps, editFormProps } = buildProjectAdminFormProps(browser.category.categories, editor);

  const pageProps = buildAdminContentPageProps({
    title: "Projects Admin",
    subtitle: "Create and edit project content.",
    userViewPath: "/projects",
    filterTitle: "Projects",
    emptyMessage: "No projects found for this category yet.",
    browser,
    onEditItem: editor.edit.begin,
  });

  return (
    <AdminContentPageScaffold
      {...pageProps}
      createSection={
        <ProjectCreateForm {...createFormProps} />
      }
      editSection={
        editFormProps ? <ProjectEditForm {...editFormProps} /> : null
      }
    />
  );
};

export default AdminProjects;
