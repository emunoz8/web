import React from "react";
import ContentBrowserPage from "../components/content/ContentBrowserPage";

const Projects: React.FC = () => {
  return (
    <ContentBrowserPage
      title="Projects"
      subtitle="Browse top projects and filter by project subcategories."
      type="PROJECT"
      allCategoriesLabel="All Project Categories"
      emptyMessage="No projects found for this category yet."
      adminPath="/admin/projects"
    />
  );
};

export default Projects;

