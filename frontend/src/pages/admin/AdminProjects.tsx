import React from "react";
import { useAuth } from "../../context/AuthContext";
import ContentModal from "../../components/common/ContentModal";
import ContentCategoryFilter from "../../components/content/ContentCategoryFilter";
import ContentFeed from "../../components/content/ContentFeed";
import useContentBrowserData from "../../components/content/hooks/useContentBrowserData";
import AdminPageHeader from "../../components/content/admin/AdminPageHeader";
import ProjectCreateForm from "../../components/content/admin/ProjectCreateForm";
import ProjectEditForm from "../../components/content/admin/ProjectEditForm";
import useAdminProjectEditor from "../../components/content/admin/hooks/useAdminProjectEditor";

const AdminProjects: React.FC = () => {
  const { isAdmin, token } = useAuth();
  const browser = useContentBrowserData({
    type: "PROJECT",
    allCategoriesLabel: "All Project Categories",
  });

  const editor = useAdminProjectEditor({
    isAdmin,
    token,
    refreshAll: browser.refreshAll,
    onUpdatedContent: browser.updateModalItem,
  });

  return (
    <section className="p-3 sm:p-4 md:p-8 space-y-4 sm:space-y-5">
      <AdminPageHeader title="Projects Admin" subtitle="Create and edit project content." userViewPath="/projects" />

      <ProjectCreateForm
        categories={browser.categories}
        createTitle={editor.createTitle}
        setCreateTitle={editor.setCreateTitle}
        createSlug={editor.createSlug}
        setCreateSlug={editor.setCreateSlug}
        createDescription={editor.createDescription}
        setCreateDescription={editor.setCreateDescription}
        createProjectUrl={editor.createProjectUrl}
        setCreateProjectUrl={editor.setCreateProjectUrl}
        createCategoryId={editor.createCategoryId}
        setCreateCategoryId={editor.setCreateCategoryId}
        newCategoryLabel={editor.newCategoryLabel}
        setNewCategoryLabel={editor.setNewCategoryLabel}
        newCategorySlug={editor.newCategorySlug}
        setNewCategorySlug={editor.setNewCategorySlug}
        createLoading={editor.createLoading}
        createError={editor.createError}
        createSuccess={editor.createSuccess}
        onSubmit={editor.createProject}
      />

      {editor.editId !== null && (
        <ProjectEditForm
          editId={editor.editId}
          editTitle={editor.editTitle}
          setEditTitle={editor.setEditTitle}
          editSlug={editor.editSlug}
          setEditSlug={editor.setEditSlug}
          editDescription={editor.editDescription}
          setEditDescription={editor.setEditDescription}
          editProjectUrl={editor.editProjectUrl}
          setEditProjectUrl={editor.setEditProjectUrl}
          editLoading={editor.editLoading}
          editError={editor.editError}
          editSuccess={editor.editSuccess}
          onSubmit={editor.submitEditProject}
          onCancel={editor.cancelEdit}
        />
      )}

      <ContentCategoryFilter
        title="Projects"
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
        emptyMessage="No projects found for this category yet."
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

export default AdminProjects;
