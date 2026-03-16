import React from "react";
import { useAuth } from "../../context/AuthContext";
import useContentBrowserData from "../../components/content/hooks/useContentBrowserData";
import AdminContentPageScaffold from "../../components/content/admin/AdminContentPageScaffold";
import BlogCreateForm from "../../components/content/admin/BlogCreateForm";
import BlogEditForm from "../../components/content/admin/BlogEditForm";
import useAdminBlogEditor from "../../components/content/admin/hooks/useAdminBlogEditor";
import { buildAdminContentPageProps } from "../../components/content/admin/models/AdminContentPageViewModel";
import { buildBlogAdminFormProps } from "../../components/content/admin/models/AdminEditorFormViewModels";

const AdminBlog: React.FC = () => {
  const { isAdmin } = useAuth();
  const browser = useContentBrowserData({
    type: "BLOG",
    allCategoriesLabel: "All Blog Categories",
  });

  const editor = useAdminBlogEditor({
    isAdmin,
    refreshAll: browser.refresh.all,
    onUpdatedContent: browser.modal.updateItem,
  });
  const { createFormProps, editFormProps } = buildBlogAdminFormProps(browser.category.categories, editor);

  const pageProps = buildAdminContentPageProps({
    title: "Blog Admin",
    subtitle: "Create and edit blog content.",
    userViewPath: "/blog",
    filterTitle: "Blog",
    emptyMessage: "No blog posts found for this category yet.",
    browser,
    onEditItem: editor.edit.begin,
  });

  return (
    <AdminContentPageScaffold
      {...pageProps}
      createSection={
        <BlogCreateForm {...createFormProps} />
      }
      editSection={
        editFormProps ? <BlogEditForm {...editFormProps} /> : null
      }
    />
  );
};

export default AdminBlog;
