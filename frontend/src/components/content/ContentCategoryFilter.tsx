import React from "react";
import { CategoryItem } from "../../lib/api";

export type ContentCategoryFilterProps = {
  title: string;
  categories: CategoryItem[];
  selectedCategory: string;
  categoryLoading: boolean;
  categoryError: string | null;
  onSelectCategory: (categorySlug: string) => void;
};

const ContentCategoryFilter: React.FC<ContentCategoryFilterProps> = ({
  title,
  categories,
  selectedCategory,
  categoryLoading,
  categoryError,
  onSelectCategory,
}) => {
  return (
    <div className="border rounded-lg p-3 sm:p-4 space-y-3">
      <h2 className="font-semibold text-sm sm:text-base">{title} Subcategories</h2>
      {categoryLoading && <p>Loading categories...</p>}
      {categoryError && <p className="text-red-500">Could not load categories: {categoryError}</p>}

      {!categoryLoading && !categoryError && (
        <ul className="flex flex-wrap gap-2 sm:gap-3">
          <li>
            <button
              className={
                selectedCategory === ""
                  ? "btn"
                  : "border rounded-md min-h-11 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              }
              onClick={() => onSelectCategory("")}
            >
              All
            </button>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <button
                className={
                  selectedCategory === category.slug
                    ? "btn"
                    : "border rounded-md min-h-11 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                }
                onClick={() => onSelectCategory(category.slug)}
              >
                {category.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ContentCategoryFilter;
