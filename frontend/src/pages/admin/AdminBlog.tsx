import React from "react";
import { useAuth } from "../../context/AuthContext";
import ContentModal from "../../components/common/ContentModal";
import ContentCategoryFilter from "../../components/content/ContentCategoryFilter";
import ContentFeed from "../../components/content/ContentFeed";
import useContentBrowserData from "../../components/content/hooks/useContentBrowserData";
import AdminPageHeader from "../../components/content/admin/AdminPageHeader";
import BlogCreateForm from "../../components/content/admin/BlogCreateForm";
import BlogEditForm from "../../components/content/admin/BlogEditForm";
import useAdminBlogEditor from "../../components/content/admin/hooks/useAdminBlogEditor";

const AdminBlog: React.FC = () => {
  const { isAdmin, token } = useAuth();
  const browser = useContentBrowserData({
    type: "BLOG",
    allCategoriesLabel: "All Blog Categories",
  });

  const editor = useAdminBlogEditor({
    isAdmin,
    token,
    refreshAll: browser.refreshAll,
    onUpdatedContent: browser.updateModalItem,
  });

  return (
    <section className="p-3 sm:p-4 md:p-8 space-y-4 sm:space-y-5">
      <AdminPageHeader title="Blog Admin" subtitle="Create and edit blog content." userViewPath="/blog" />

      <BlogCreateForm
        categories={browser.categories}
        createTitle={editor.createTitle}
        setCreateTitle={editor.setCreateTitle}
        createSlug={editor.createSlug}
        setCreateSlug={editor.setCreateSlug}
        createBodyMd={editor.createBodyMd}
        setCreateBodyMd={editor.setCreateBodyMd}
        createCategoryId={editor.createCategoryId}
        setCreateCategoryId={editor.setCreateCategoryId}
        newCategoryLabel={editor.newCategoryLabel}
        setNewCategoryLabel={editor.setNewCategoryLabel}
        newCategorySlug={editor.newCategorySlug}
        setNewCategorySlug={editor.setNewCategorySlug}
        createLoading={editor.createLoading}
        createError={editor.createError}
        createSuccess={editor.createSuccess}
        onSubmit={editor.createBlogPost}
      />

      {editor.editId !== null && (
        <BlogEditForm
          editId={editor.editId}
          editTitle={editor.editTitle}
          setEditTitle={editor.setEditTitle}
          editSlug={editor.editSlug}
          setEditSlug={editor.setEditSlug}
          editBodyMd={editor.editBodyMd}
          setEditBodyMd={editor.setEditBodyMd}
          editLoading={editor.editLoading}
          editError={editor.editError}
          editSuccess={editor.editSuccess}
          onSubmit={editor.submitEditBlogPost}
          onCancel={editor.cancelEdit}
        />
      )}

      <ContentCategoryFilter
        title="Blog"
        categories={browser.categories}
        selectedCategory={browser.selectedCategory}
        categoryLoading={browser.categoryLoading}
        categoryError={browser.categoryError}
        onSelectCategory={browser.setSelectedCategory}
      />

      <ContentFeed
        selectedCategoryLabel={browser.selectedCategoryLabel}
        contentLoading={browser.contentLoading}
        loadingMore={browser.loadingMore}
        hasNextPage={browser.hasNextPage}
        contentError={browser.contentError}
        items={browser.items}
        engagementById={browser.engagementById}
        emptyMessage="No blog posts found for this category yet."
        onOpenItem={browser.openModal}
        onLoadMore={browser.loadMore}
        showEdit
        onEditItem={editor.beginEdit}
      />

      <ContentModal
        open={browser.isModalOpen}
        item={browser.modalItem}
        loading={browser.modalLoading}
        error={browser.modalError}
        onClose={browser.closeModal}
        onEngagementChanged={() => {
          void browser.refreshEngagement();
        }}
      />
    </section>
  );
};

export default AdminBlog;
