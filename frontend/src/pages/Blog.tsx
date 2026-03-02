import React from "react";
import ContentBrowserPage from "../components/content/ContentBrowserPage";

const Blog: React.FC = () => {
  return (
    <ContentBrowserPage
      title="Blog"
      subtitle="Browse top posts and filter by blog subcategories."
      type="BLOG"
      allCategoriesLabel="All Blog Categories"
      emptyMessage="No blog posts found for this category yet."
      adminPath="/admin/blog"
    />
  );
};

export default Blog;

